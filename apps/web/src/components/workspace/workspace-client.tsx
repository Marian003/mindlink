"use client";

import { useState, useEffect, useRef } from "react";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { CollaborativeEditor } from "@/components/editor/collaborative-editor";
import { CollaborativeCodeEditor } from "@/components/code-editor/collaborative-code-editor";
import { CollaborativeWhiteboard } from "@/components/whiteboard/collaborative-whiteboard";
import { ReviewMode } from "@/components/code-review/review-mode";
import { WritingMode } from "@/components/writing/writing-mode";
import { ArchitectureMode } from "@/components/architecture/architecture-mode";
import { ModeSelector, type WorkspaceMode } from "./mode-selector";
import { ParticipantBar } from "@/components/presence/participant-bar";
import { CursorOverlay } from "@/components/presence/cursor-overlay";
import { AgentPanel } from "@/components/agents/agent-panel";
import { ConnectionStatus } from "@/components/workspace/connection-status";
import { OnboardingFlow } from "@/components/onboarding/onboarding-flow";
import { ExportModal } from "@/components/workspace/export-modal";
import { useAwareness } from "@/hooks/use-awareness";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:4444";

const DEFAULT_AGENTS = [
  { id: "sage", name: "Sage", slug: "sage", role: "Senior Architect", color: "#3b82f6" },
  { id: "spark", name: "Spark", slug: "spark", role: "Creative Ideator", color: "#f97316" },
  { id: "lens", name: "Lens", slug: "lens", role: "Code Reviewer", color: "#22c55e" },
  { id: "atlas", name: "Atlas", slug: "atlas", role: "Project Manager", color: "#a855f7" },
  { id: "echo", name: "Echo", slug: "echo", role: "User Researcher", color: "#ec4899" },
  { id: "ghost", name: "Ghost", slug: "ghost", role: "Security Auditor", color: "#ef4444" },
];

interface WorkspaceClientProps {
  roomId: string;
  userName: string;
  userId?: string;
}

function hashColor(str: string): string {
  const colors = ["#3b82f6","#f97316","#22c55e","#a855f7","#ec4899","#ef4444","#eab308","#14b8a6"];
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = (hash * 31 + str.charCodeAt(i)) | 0;
  return colors[Math.abs(hash) % colors.length];
}

export function WorkspaceClient({ roomId, userName, userId = "anonymous" }: WorkspaceClientProps) {
  const [mode, setMode] = useState<WorkspaceMode>("document");
  const userColor = hashColor(userName);
  const [connected, setConnected] = useState(true);
  const [reconnecting, setReconnecting] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showExport, setShowExport] = useState(false);

  // ── Main doc ─────────────────────────────────────────────────────────
  const [mainYdoc, setMainYdoc] = useState<Y.Doc | null>(null);
  const [mainProvider, setMainProvider] = useState<WebsocketProvider | null>(null);

  useEffect(() => {
    const doc = new Y.Doc();
    const provider = new WebsocketProvider(WS_URL, roomId, doc, {
      params: { room: roomId },
    });

    provider.on("status", ({ status }: { status: string }) => {
      setConnected(status === "connected");
      setReconnecting(status === "connecting");
    });

    setMainYdoc(doc);
    setMainProvider(provider);
    return () => {
      provider.destroy();
      doc.destroy();
    };
  }, [roomId]);

  // ── Presence doc ─────────────────────────────────────────────────────
  const [awareness, setAwareness] = useState<any>(null);
  const [clientId, setClientId] = useState<number | undefined>(undefined);

  useEffect(() => {
    const doc = new Y.Doc();
    const provider = new WebsocketProvider(WS_URL, `${roomId}-presence`, doc, {
      params: { room: `${roomId}-presence` },
    });
    setAwareness(provider.awareness);
    setClientId(doc.clientID);
    return () => {
      provider.destroy();
      doc.destroy();
    };
  }, [roomId]);

  useAwareness({ awareness, userId, name: userName, color: userColor, mode: mode as any });

  // ── Onboarding ───────────────────────────────────────────────────────
  useEffect(() => {
    const key = `onboarding-done-${userId}`;
    if (!localStorage.getItem(key)) {
      setShowOnboarding(true);
    }
  }, [userId]);

  function completeOnboarding() {
    localStorage.setItem(`onboarding-done-${userId}`, "1");
    setShowOnboarding(false);
  }

  // ── Mode change side-effects ──────────────────────────────────────────
  const prevMode = useRef<WorkspaceMode>("document");
  useEffect(() => {
    if (mode === "review" && prevMode.current !== "review" && mainYdoc) {
      mainYdoc.getMap("review-trigger").set("ts", Date.now());
    }
    prevMode.current = mode;
  }, [mode, mainYdoc]);

  // ── Debate handlers ───────────────────────────────────────────────────
  function handleMention(agentName: string) {
    console.log(`Mention: @${agentName}`);
  }

  function handleStartDebate(topic: string, agentIds: string[], rounds: number) {
    if (!mainYdoc) return;
    mainYdoc.getMap("debate-command").set("cmd", {
      action: "start",
      topic,
      agentIds,
      maxRounds: rounds,
      ts: Date.now(),
    });
  }

  function handleStopDebate() {
    if (!mainYdoc) return;
    mainYdoc.getMap("debate-command").set("cmd", { action: "stop", ts: Date.now() });
  }

  return (
    <div className="flex flex-col h-full relative">
      <ConnectionStatus connected={connected} reconnecting={reconnecting} />

      {/* Mode selector bar */}
      <div className="flex items-center gap-4 px-4 py-2 border-b border-white/10 bg-[#0d0d0f] flex-shrink-0">
        <ModeSelector mode={mode} onChange={setMode} />
        <div className="flex-1" />
        <ParticipantBar awareness={awareness} currentClientId={clientId} />
        <button
          onClick={() => setShowExport(true)}
          className="text-xs text-white/40 hover:text-white transition-colors px-2 py-1 rounded-lg hover:bg-white/10"
          title="Export room"
        >
          ↓ Export
        </button>
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-hidden">
          {mode === "document" && mainYdoc && mainProvider && (
            <CollaborativeEditor
              roomId={roomId}
              userName={userName}
              userColor={userColor}
              doc={mainYdoc}
              provider={mainProvider}
            />
          )}
          {mode === "code" && (
            <CollaborativeCodeEditor roomId={roomId} userName={userName} userColor={userColor} />
          )}
          {mode === "brainstorm" && (
            <CollaborativeWhiteboard roomId={roomId} />
          )}
          {mode === "review" && (
            <ReviewMode doc={mainYdoc} />
          )}
          {mode === "writing" && (
            <WritingMode roomId={roomId} userName={userName} userColor={userColor} />
          )}
          {mode === "architecture" && (
            <ArchitectureMode roomId={roomId} />
          )}
        </div>

        <AgentPanel
          doc={mainYdoc}
          agents={DEFAULT_AGENTS}
          onMention={handleMention}
          onStartDebate={handleStartDebate}
          onStopDebate={handleStopDebate}
        />
      </div>

      <CursorOverlay awareness={awareness} currentClientId={clientId} />

      {showOnboarding && <OnboardingFlow onComplete={completeOnboarding} />}

      {showExport && (
        <ExportModal doc={mainYdoc} roomId={roomId} onClose={() => setShowExport(false)} />
      )}
    </div>
  );
}
