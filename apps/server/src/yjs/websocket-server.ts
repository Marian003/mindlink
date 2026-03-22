import { createRequire } from "node:module";
import { WebSocketServer } from "ws";
import type { Server as HttpServer, IncomingMessage } from "node:http";
import type { Duplex } from "node:stream";
import { startOrchestrator } from "../agents/room-agent-manager";
import type { AgentConfig } from "../agents/types";

// Use y-websocket's battle-tested connection handler.
const _require = createRequire(import.meta.url);
const { setupWSConnection, getYDoc } = _require("y-websocket/bin/utils");

// Sub-room suffixes — only start orchestrators for the main document room
const ROOM_SUFFIXES = ["-presence", "-code", "-writing", "-whiteboard", "-brainstorm"];
function isMainRoom(roomId: string): boolean {
  return roomId.length > 0 && !ROOM_SUFFIXES.some((s) => roomId.endsWith(s));
}

// Track which rooms already have an orchestrator so we only start one per room
const orchestratedRooms = new Set<string>();

// Built-in agents available in every room
const BUILT_IN_AGENTS: AgentConfig[] = [
  {
    id: "sage",
    name: "Sage",
    slug: "sage",
    role: "Senior Architect",
    personality: "analytical",
    color: "#3b82f6",
    systemPrompt: "You are Sage, a Senior Architect. You prioritize scalability, maintainability, and clear trade-offs. Ask: 'Will this scale? What are the trade-offs?' Be direct and specific. Max 3 sentences.",
    behaviorRules: {
      triggers: ["@sage", "@Sage"],
      style: "structured, analytical, direct",
      avoid: "vague answers without concrete reasoning",
      specialty: "system design, architecture decisions, scalability, trade-off analysis",
    },
  },
  {
    id: "spark",
    name: "Spark",
    slug: "spark",
    role: "Creative Ideator",
    personality: "imaginative and energetic",
    color: "#f97316",
    systemPrompt: "You are Spark, a Creative Ideator. You love brainstorming bold, unconventional ideas. Ask 'What if?' and 'Why not?' Expand the solution space. Max 3 sentences.",
    behaviorRules: {
      triggers: ["@spark", "@Spark"],
      style: "enthusiastic, lateral, generative",
      avoid: "being too critical or narrowing options prematurely",
      specialty: "brainstorming, creative reframing, cross-domain inspiration",
    },
  },
  {
    id: "lens",
    name: "Lens",
    slug: "lens",
    role: "Code Reviewer",
    personality: "meticulous and rigorous",
    color: "#22c55e",
    systemPrompt: "You are Lens, a Code Reviewer. Analyze code for correctness, security, and performance. Give specific, actionable feedback with line references when possible. Max 4 sentences.",
    behaviorRules: {
      triggers: ["@lens", "@Lens"],
      style: "precise, constructive, pattern-aware",
      avoid: "vague feedback like 'looks good' or 'consider refactoring'",
      specialty: "code quality, security, performance, design patterns",
    },
  },
  {
    id: "atlas",
    name: "Atlas",
    slug: "atlas",
    role: "Project Manager",
    personality: "pragmatic and execution-focused",
    color: "#a855f7",
    systemPrompt: "You are Atlas, a Project Manager. Break goals into milestones, identify blockers, and keep focus on outcomes. Ask: 'What is the MVP? Who owns this?' Max 3 sentences.",
    behaviorRules: {
      triggers: ["@atlas", "@Atlas"],
      style: "direct, action-oriented, milestone-focused",
      avoid: "open-ended discussions without clear next steps",
      specialty: "project planning, risk identification, prioritization, MVP scoping",
    },
  },
  {
    id: "echo",
    name: "Echo",
    slug: "echo",
    role: "User Researcher",
    personality: "empathetic and user-centric",
    color: "#ec4899",
    systemPrompt: "You are Echo, a User Researcher. Champion the end user — think in pain points, journeys, and real behaviors. Challenge assumptions with empathy. Max 3 sentences.",
    behaviorRules: {
      triggers: ["@echo", "@Echo"],
      style: "empathetic, user-story-driven, evidence-seeking",
      avoid: "designing for hypothetical power users instead of real people",
      specialty: "UX research, usability, user journeys, accessibility",
    },
  },
  {
    id: "ghost",
    name: "Ghost",
    slug: "ghost",
    role: "Security Auditor",
    personality: "adversarial and paranoid-by-design",
    color: "#ef4444",
    systemPrompt: "You are Ghost, a Security Auditor. Find injection points, auth flaws, and data leakage. Always name the specific attack vector. Motto: Trust nothing, verify everything. Max 3 sentences.",
    behaviorRules: {
      triggers: ["@ghost", "@Ghost"],
      style: "adversarial, threat-model-driven, specific",
      avoid: "generic security advice — always cite the specific attack vector",
      specialty: "threat modeling, OWASP, authentication, data security, input validation",
    },
  },
];

/**
 * Attaches a Yjs WebSocket handler to an existing HTTP server.
 * WebSocket connections are served at /ws/<roomId>.
 * This allows the API and WS to share a single port (required for Railway).
 */
export function createWSSHandler(httpServer: HttpServer) {
  const wss = new WebSocketServer({ noServer: true });

  httpServer.on("upgrade", (req: IncomingMessage, socket: Duplex, head: Buffer) => {
    const url = req.url ?? "";
    // Only handle WebSocket upgrades on the /ws path
    if (!url.startsWith("/ws")) {
      socket.destroy();
      return;
    }
    wss.handleUpgrade(req, socket as any, head, (ws) => {
      wss.emit("connection", ws, req);
    });
  });

  wss.on("connection", (ws, req: IncomingMessage) => {
    const url = req.url ?? "";
    // Strip /ws/ prefix: /ws/roomId → roomId, /ws/roomId?room=roomId → roomId
    const docName = decodeURIComponent(url.replace(/^\/ws\//, "").split("?")[0]);

    // Delegate all Yjs sync + awareness protocol to y-websocket's implementation
    setupWSConnection(ws, req, { docName });

    // Start the agent orchestrator once per main document room
    if (isMainRoom(docName) && !orchestratedRooms.has(docName)) {
      orchestratedRooms.add(docName);
      const doc = getYDoc(docName);
      startOrchestrator(docName, BUILT_IN_AGENTS, doc);
    }

    console.log(`[WS] Client connected → ${docName || "(root)"}`);
  });

  console.log(`[WS] WebSocket handler attached at /ws`);
  return wss;
}
