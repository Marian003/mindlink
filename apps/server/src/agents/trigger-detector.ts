import type { AgentTrigger, AgentConfig } from "./types";

const MENTION_REGEX = /@(\w+)/g;

export function detectMentions(content: string, agents: AgentConfig[]): AgentTrigger[] {
  const triggers: AgentTrigger[] = [];
  const matches = content.matchAll(MENTION_REGEX);

  for (const match of matches) {
    const mentionedName = match[1].toLowerCase();
    const agent = agents.find(
      (a) => a.name.toLowerCase() === mentionedName || a.slug === mentionedName
    );

    if (agent) {
      triggers.push({
        type: "MENTION",
        targetAgentId: agent.id,
        targetAgentSlug: agent.slug,
        context: content,
      });
    }
  }

  return triggers;
}

export function detectCodePaste(content: string): boolean {
  // Detect large code blocks appearing in document
  const codeBlockRegex = /```[\s\S]{100,}```/;
  return codeBlockRegex.test(content);
}

export function detectVoteProposal(content: string): boolean {
  return content.includes("[VOTE]") || content.toLowerCase().includes("let's vote");
}

export function detectAgentMentions(
  messageContent: string,
  agents: AgentConfig[],
  authorAgentId: string
): AgentTrigger[] {
  const triggers: AgentTrigger[] = [];
  const matches = messageContent.matchAll(MENTION_REGEX);

  for (const match of matches) {
    const mentionedName = match[1].toLowerCase();
    const agent = agents.find(
      (a) =>
        (a.name.toLowerCase() === mentionedName || a.slug === mentionedName) &&
        a.id !== authorAgentId
    );

    if (agent) {
      triggers.push({
        type: "AGENT_MENTION",
        targetAgentId: agent.id,
        targetAgentSlug: agent.slug,
        context: messageContent,
      });
    }
  }

  return triggers;
}
