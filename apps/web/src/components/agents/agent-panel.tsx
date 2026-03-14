"use client";

import { useEffect, useRef, useState } from "react";
import * as Y from "yjs";
import { AgentMessage } from "./agent-message";
import { AgentRoster } from "./agent-roster";
import { DebateControls } from "./debate-controls";
import { VoteWidget, type VoteSession } from "@/components/voting/vote-widget";
import { CreateVote } from "@/components/voting/create-vote";
import { DecisionLog } from "@/components/decisions/decision-log";

interface AgentData {
  id: string;
  name: string;
  slug: string;
  role: string;
  color: string;
}

interface AgentMessageData {
  id: string;
  agentId: string;
  agentName: string;
  agentColor: string;
  content: string;
  timestamp: number;
  replyTo?: string;
  chainDepth?: number;
}

interface DecisionEntry {
  id: string;
  topic: string;
  outcome: string;
  tally: Record<string, number>;
  closedAt: number;
}

interface AgentPanelProps {
  doc: Y.Doc | null;
  agents: AgentData[];
  onMention: (agentName: string) => void;
  onStartDebate: (topic: string, agentIds: string[], rounds: number) => void;
  onStopDebate: () => void;
}

type PanelTab = "agents" | "votes" | "decisions";

export function AgentPanel({ doc, agents, onMention, onStartDebate, onStopDebate }: AgentPanelProps) {
  const [messages, setMessages] = useState<AgentMessageData[]>([]);
  const [collapsed, setCollapsed] = useState(false);
  const [tab, setTab] = useState<PanelTab>("agents");
  const [debateActive, setDebateActive] = useState(false);
  const [debateRound, setDebateRound] = useState(1);
  const [debateMaxRounds, setDebateMaxRounds] = useState(3);
  const [votes, setVotes] = useState<VoteSession[]>([]);
  const [showCreateVote, setShowCreateVote] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Subscribe to agent messages
  useEffect(() => {
    if (!doc) return;
    const messagesArray = doc.getArray<AgentMessageData>("agent-messages");

    function update() {
      setMessages(messagesArray.toArray());
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    }

    messagesArray.observe(update);
    update();
    return () => messagesArray.unobserve(update);
  }, [doc]);

  // Subscribe to debate-state written by the server orchestrator
  useEffect(() => {
    if (!doc) return;
    const stateMap = doc.getMap<any>("debate-state");

    function syncState() {
      setDebateActive(!!stateMap.get("active"));
      setDebateRound((stateMap.get("currentRound") as number) ?? 1);
      setDebateMaxRounds((stateMap.get("maxRounds") as number) ?? 3);
    }

    stateMap.observe(syncState);
    syncState();
    return () => stateMap.unobserve(syncState);
  }, [doc]);

  // Subscribe to vote sessions
  useEffect(() => {
    if (!doc) return;
    const yVotes = doc.getArray<VoteSession>("votes");

    function update() {
      setVotes(yVotes.toArray());
    }

    yVotes.observe(update);
    update();
    return () => yVotes.unobserve(update);
  }, [doc]);

  function handleCreateVote(session: Omit<VoteSession, "id" | "createdAt" | "votes" | "status">) {
    if (!doc) return;
    const yVotes = doc.getArray<VoteSession>("votes");
    const newSession: VoteSession = {
      ...session,
      id: Math.random().toString(36).slice(2),
      createdAt: Date.now(),
      votes: {},
      status: "active",
    };
    yVotes.push([newSession]);
    setShowCreateVote(false);
  }

  function handleVote(sessionId: string, optionIndex: number) {
    if (!doc) return;
    const yVotes = doc.getArray<VoteSession>("votes");
    const arr = yVotes.toArray();
    const idx = arr.findIndex((s) => s.id === sessionId);
    if (idx === -1) return;
    const session = { ...arr[idx], votes: { ...arr[idx].votes, [doc.clientID.toString()]: optionIndex } };
    yVotes.delete(idx, 1);
    yVotes.insert(idx, [session]);
  }

  function handleCloseVote(sessionId: string) {
    if (!doc) return;
    const yVotes = doc.getArray<VoteSession>("votes");
    const arr = yVotes.toArray();
    const idx = arr.findIndex((s) => s.id === sessionId);
    if (idx === -1) return;
    const session = arr[idx];

    // Tally
    const tally: Record<string, number> = {};
    for (const opt of session.options) tally[opt] = 0;
    for (const v of Object.values(session.votes)) {
      const opt = session.options[v as number];
      if (opt !== undefined) tally[opt] = (tally[opt] ?? 0) + 1;
    }
    const winner = Object.entries(tally).sort(([, a], [, b]) => b - a)[0]?.[0] ?? "No winner";

    const closed: VoteSession = { ...session, status: "closed", result: { winner, tally } };
    yVotes.delete(idx, 1);
    yVotes.insert(idx, [closed]);

    // Write to decisions
    const yDecisions = doc.getArray<DecisionEntry>("decisions");
    yDecisions.push([{
      id: session.id,
      topic: session.topic,
      outcome: winner,
      tally,
      closedAt: Date.now(),
    }]);
  }

  const streamingIds = new Set(
    messages
      .filter((m) => m.content === "…" || (Date.now() - m.timestamp < 500 && m.content.length < 50))
      .map((m) => m.id)
  );

  const activeVotes = votes.filter((v) => v.status === "active");
  const closedVotes = votes.filter((v) => v.status === "closed");

  return (
    <div className={`flex flex-col border-l border-white/10 bg-[#0d0d0f] transition-all ${collapsed ? "w-12" : "w-80"}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/10 flex-shrink-0">
        {!collapsed && (
          <div className="flex items-center gap-1">
            {(["agents", "votes", "decisions"] as PanelTab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors capitalize ${
                  tab === t
                    ? "bg-white/10 text-white"
                    : "text-white/40 hover:text-white"
                }`}
              >
                {t === "agents" && agents.length > 0 ? `Agents ${agents.length}` : t.charAt(0).toUpperCase() + t.slice(1)}
                {t === "votes" && activeVotes.length > 0 && (
                  <span className="ml-1 bg-blue-600 text-white rounded-full px-1 text-[10px]">
                    {activeVotes.length}
                  </span>
                )}
              </button>
            ))}
            {debateActive && tab === "agents" && (
              <span className="text-xs bg-orange-600/20 text-orange-400 rounded-full px-2 py-0.5 animate-pulse ml-1">
                Debate
              </span>
            )}
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-white/40 hover:text-white transition-colors text-sm ml-auto"
        >
          {collapsed ? "›" : "‹"}
        </button>
      </div>

      {!collapsed && tab === "agents" && (
        <>
          <div className="border-b border-white/10 flex-shrink-0">
            <AgentRoster agents={agents} />
          </div>

          <div className="flex-1 overflow-y-auto">
            {messages.length === 0 ? (
              <div className="text-center py-12 px-4">
                <p className="text-white/25 text-sm">No agent activity yet.</p>
                <p className="text-white/15 text-xs mt-1">Type @AgentName to get started.</p>
              </div>
            ) : (
              <div className="py-2 relative">
                {messages.map((msg) => (
                  <AgentMessage
                    key={msg.id}
                    message={msg}
                    onReply={onMention}
                    isStreaming={streamingIds.has(msg.id)}
                  />
                ))}
                <div ref={bottomRef} />
              </div>
            )}
          </div>

          <DebateControls
            agents={agents}
            onStart={(topic, agentIds, rounds) => onStartDebate(topic, agentIds, rounds)}
            onStop={() => onStopDebate()}
            debateActive={debateActive}
            currentRound={debateRound}
            maxRounds={debateMaxRounds}
          />
        </>
      )}

      {!collapsed && tab === "votes" && (
        <div className="flex flex-col flex-1 overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2 border-b border-white/10">
            <span className="text-xs text-white/40">
              {activeVotes.length} active · {closedVotes.length} closed
            </span>
            <button
              onClick={() => setShowCreateVote(!showCreateVote)}
              className="text-xs bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 px-2.5 py-1 rounded-md transition-colors"
            >
              + New vote
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {showCreateVote && (
              <CreateVote
                currentUserId={doc?.clientID.toString() ?? "anon"}
                onCreate={handleCreateVote}
                onCancel={() => setShowCreateVote(false)}
              />
            )}

            {votes.length === 0 && !showCreateVote && (
              <p className="text-center text-white/25 text-xs py-8">No votes yet.</p>
            )}

            {votes.map((session) => (
              <VoteWidget
                key={session.id}
                session={session}
                currentUserId={doc?.clientID.toString() ?? "anon"}
                onVote={handleVote}
                onClose={handleCloseVote}
              />
            ))}
          </div>
        </div>
      )}

      {!collapsed && tab === "decisions" && (
        <div className="flex-1 overflow-hidden">
          <DecisionLog doc={doc} />
        </div>
      )}
    </div>
  );
}
