import type * as Y from "yjs";
import type { AgentConfig, AgentMessage, AgentTrigger } from "./types";
import { AgentRuntime } from "./agent-runtime";
import { detectMentions, detectAgentMentions, detectCodePaste } from "./trigger-detector";

const AGENT_COOLDOWN_MS = 10_000;
const AGENT_CHAIN_COOLDOWN_MS = 15_000;
const MAX_CHAIN_DEPTH = 4;
const CONTENT_DEBOUNCE_MS = 3_000;
const STAGGER_DELAY_MS = 2_000;

interface DebateConfig {
  active: boolean;
  topic: string;
  sides: { agentId: string; position: "for" | "against" }[];
  maxRounds: number;
  currentRound: number;
  moderatorAgentId?: string;
}

export class AgentOrchestrator {
  private runtimes: Map<string, AgentRuntime> = new Map();
  private cooldowns: Map<string, number> = new Map();
  private processingQueue: AgentTrigger[] = [];
  private isProcessing = false;
  private contentDebounceTimer: ReturnType<typeof setTimeout> | null = null;
  private lastDocContent = "";
  private debate: DebateConfig | null = null;

  constructor(
    private roomId: string,
    private agents: AgentConfig[],
    private doc: Y.Doc,
    private messagesArray: Y.Array<AgentMessage>
  ) {
    for (const agent of agents) {
      this.runtimes.set(agent.id, new AgentRuntime(agent, messagesArray));
    }

    this.doc.on("update", () => this.onDocumentUpdate());
    this.messagesArray.observe(() => this.onNewMessage());

    // Listen for debate commands written by the client
    const commandMap = this.doc.getMap<any>("debate-command");
    commandMap.observe(() => {
      const cmd = commandMap.get("cmd");
      if (!cmd) return;
      if (cmd.action === "start") {
        this.startDebate(cmd.topic, cmd.agentIds, cmd.maxRounds);
      } else if (cmd.action === "stop") {
        this.stopDebate();
        this.updateDebateState();
      }
    });

    // Listen for code review trigger written by the client when entering Review mode
    const reviewTriggerMap = this.doc.getMap<any>("review-trigger");
    let lastReviewTs = 0;
    reviewTriggerMap.observe(() => {
      const t = reviewTriggerMap.get("ts") as number | undefined;
      if (!t || t === lastReviewTs) return;
      lastReviewTs = t;

      const lens = this.agents.find((a) => a.slug === "lens");
      const ghost = this.agents.find((a) => a.slug === "ghost");

      if (lens) {
        this.cooldowns.delete(lens.id);
        this.queueTrigger({
          type: "MANUAL",
          targetAgentId: lens.id,
          targetAgentSlug: lens.slug,
          context: "[CODE REVIEW] Review the code in this room for bugs, code quality issues, naming, and best practices.",
        });
      }
      if (ghost) {
        this.cooldowns.delete(ghost.id);
        setTimeout(() => {
          if (ghost) this.queueTrigger({
            type: "MANUAL",
            targetAgentId: ghost.id,
            targetAgentSlug: ghost.slug,
            context: "[CODE REVIEW] Review the code in this room for security vulnerabilities, injection risks, and unsafe patterns.",
          });
        }, STAGGER_DELAY_MS);
      }
    });
  }

  // ── Document watching ──────────────────────────────────────────────

  private onDocumentUpdate() {
    const xmlFragment = this.doc.getXmlFragment("default");
    const content = xmlFragment.toString();
    if (content === this.lastDocContent) return;
    this.lastDocContent = content;

    if (this.contentDebounceTimer) clearTimeout(this.contentDebounceTimer);
    this.contentDebounceTimer = setTimeout(() => {
      this.handleContentChange(content);
    }, CONTENT_DEBOUNCE_MS);

    const mentions = detectMentions(content, this.agents);
    for (const trigger of mentions) this.queueTrigger(trigger);
  }

  private handleContentChange(content: string) {
    if (detectCodePaste(content)) {
      const lens = this.agents.find((a) => a.slug === "lens");
      if (lens) {
        this.queueTrigger({
          type: "CONTENT_CHANGE",
          targetAgentId: lens.id,
          targetAgentSlug: lens.slug,
          context: content,
        });
      }
    }
  }

  private onNewMessage() {
    const messages = this.messagesArray.toArray();
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage) return;
    // Skip typing indicator — wait for the real content
    if (lastMessage.content === "…") return;
    if ((lastMessage.chainDepth ?? 0) >= MAX_CHAIN_DEPTH) return;

    const authorAgent = this.agents.find((a) => a.id === lastMessage.agentId);
    if (!authorAgent) return;

    // Agent-to-agent mentions
    const agentMentions = detectAgentMentions(
      lastMessage.content,
      this.agents,
      lastMessage.agentId
    );
    for (const trigger of agentMentions) {
      const cooldownMs =
        (lastMessage.chainDepth ?? 0) > 0 ? AGENT_CHAIN_COOLDOWN_MS : AGENT_COOLDOWN_MS;
      this.queueTrigger(
        {
          ...trigger,
          replyToMessageId: lastMessage.id,
          chainDepth: (lastMessage.chainDepth ?? 0) + 1,
        },
        cooldownMs
      );
    }

    // Debate mode: auto-advance rounds
    if (this.debate?.active) {
      this.advanceDebate(lastMessage);
    }
  }

  // ── Debate Mode ────────────────────────────────────────────────────

  startDebate(topic: string, agentIds: string[], maxRounds = 3) {
    if (agentIds.length < 2) return;

    const sides = agentIds.map((id, i) => ({
      agentId: id,
      position: (i % 2 === 0 ? "for" : "against") as "for" | "against",
    }));

    const sage = this.agents.find((a) => a.slug === "sage");
    this.debate = {
      active: true,
      topic,
      sides,
      maxRounds,
      currentRound: 1,
      moderatorAgentId: sage?.id,
    };

    this.updateDebateState();

    // Kick off first agent — bypass cooldown so debate starts immediately
    const firstAgentId = sides[0].agentId;
    const firstAgent = this.agents.find((a) => a.id === firstAgentId);
    if (firstAgent) {
      this.cooldowns.delete(firstAgentId);
      this.queueTrigger({
        type: "MANUAL",
        targetAgentId: firstAgentId,
        targetAgentSlug: firstAgent.slug,
        context: `[DEBATE ROUND 1] Topic: "${topic}". Your position: ${sides[0].position}. Present your opening argument.`,
      });
    }
  }

  stopDebate() {
    this.debate = null;
    this.processingQueue.length = 0;
  }

  private updateDebateState() {
    const stateMap = this.doc.getMap<any>("debate-state");
    if (this.debate) {
      stateMap.set("active", this.debate.active);
      stateMap.set("currentRound", this.debate.currentRound);
      stateMap.set("maxRounds", this.debate.maxRounds);
    } else {
      stateMap.set("active", false);
      stateMap.set("currentRound", 1);
      stateMap.set("maxRounds", 3);
    }
  }

  private async advanceDebate(lastMessage: AgentMessage) {
    if (!this.debate) return;

    // Only advance when a debate participant finishes speaking
    const isDebater = this.debate.sides.some((s) => s.agentId === lastMessage.agentId);
    if (!isDebater) return;

    const { sides, maxRounds, moderatorAgentId } = this.debate;
    const lastSideIndex = sides.findIndex((s) => s.agentId === lastMessage.agentId);
    const nextSideIndex = (lastSideIndex + 1) % sides.length;
    const nextSide = sides[nextSideIndex];

    // Completed a full round when we wrap back to the first speaker
    if (nextSideIndex === 0) {
      this.debate.currentRound++;
      this.updateDebateState();
    }

    if (this.debate.currentRound > maxRounds) {
      // Debate over — ask moderator to summarize
      if (moderatorAgentId) {
        const mod = this.agents.find((a) => a.id === moderatorAgentId);
        if (mod) {
          this.cooldowns.delete(moderatorAgentId);
          this.queueTrigger({
            type: "MANUAL",
            targetAgentId: moderatorAgentId,
            targetAgentSlug: mod.slug,
            context: `[DEBATE SUMMARY] The debate on "${this.debate.topic}" has concluded after ${maxRounds} rounds. Please provide a balanced summary of both positions and key takeaways.`,
          });
        }
      }
      this.debate.active = false;
      this.updateDebateState();
      return;
    }

    const nextAgent = this.agents.find((a) => a.id === nextSide.agentId);
    if (!nextAgent) return;

    // Bypass cooldown so debate advances without waiting 10 seconds between turns
    this.cooldowns.delete(nextSide.agentId);
    this.queueTrigger({
      type: "AGENT_MENTION",
      targetAgentId: nextSide.agentId,
      targetAgentSlug: nextAgent.slug,
      context: `[DEBATE ROUND ${this.debate.currentRound}] Respond to ${lastMessage.agentName}'s argument. Your position: ${nextSide.position}.`,
      replyToMessageId: lastMessage.id,
      chainDepth: lastMessage.chainDepth ?? 0,
    });
  }

  getDebateState() {
    return this.debate;
  }

  // ── Queue management ───────────────────────────────────────────────

  queueTrigger(trigger: AgentTrigger, cooldownMs = AGENT_COOLDOWN_MS) {
    const lastUsed = this.cooldowns.get(trigger.targetAgentId) ?? 0;
    if (Date.now() - lastUsed < cooldownMs) return;

    const alreadyQueued = this.processingQueue.some(
      (t) => t.targetAgentId === trigger.targetAgentId && t.type === trigger.type
    );
    if (alreadyQueued) return;

    this.processingQueue.push(trigger);
    this.processQueue();
  }

  private async processQueue() {
    if (this.isProcessing || this.processingQueue.length === 0) return;
    this.isProcessing = true;

    while (this.processingQueue.length > 0) {
      const trigger = this.processingQueue.shift()!;
      const runtime = this.runtimes.get(trigger.targetAgentId);
      if (!runtime) continue;

      this.cooldowns.set(trigger.targetAgentId, Date.now());

      try {
        const recentMessages = this.messagesArray.toArray().slice(-20);
        const replyToMessage = trigger.replyToMessageId
          ? recentMessages.find((m) => m.id === trigger.replyToMessageId)
          : undefined;

        const xmlFragment = this.doc.getXmlFragment("default");
        await runtime.respond(trigger, {
          documentContent: xmlFragment.toString().slice(-4000),
          recentMessages,
          roomName: this.roomId,
          participants: [],
          mode: "document",
          replyToMessage,
        });
      } catch (err) {
        console.error(`[Orchestrator] Agent ${trigger.targetAgentSlug} failed:`, err);
      }

      if (this.processingQueue.length > 0) {
        await new Promise((r) => setTimeout(r, STAGGER_DELAY_MS));
      }
    }

    this.isProcessing = false;
  }

  destroy() {
    if (this.contentDebounceTimer) clearTimeout(this.contentDebounceTimer);
    this.processingQueue.length = 0;
    this.debate = null;
  }
}
