import { createRequire } from "node:module";
import { WebSocketServer } from "ws";
import { startOrchestrator } from "../agents/room-agent-manager";
import type { AgentConfig } from "../agents/types";

// Use y-websocket's battle-tested connection handler.
// It handles all Yjs sync + awareness protocol correctly for the installed y-protocols version.
const _require = createRequire(import.meta.url);
const { setupWSConnection, getYDoc } = _require("y-websocket/bin/utils");

const WS_PORT = parseInt(process.env.WS_PORT ?? "4444", 10);

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

const wss = new WebSocketServer({ port: WS_PORT });

wss.on("connection", (ws, req) => {
  // Delegate all Yjs sync + awareness protocol to y-websocket's implementation
  setupWSConnection(ws, req);

  // Extract doc/room name — same logic setupWSConnection uses internally:
  // URL is /<roomId>?room=<roomId>, path gives the doc name
  const docName = decodeURIComponent((req.url ?? "").slice(1).split("?")[0]);

  // Start the agent orchestrator once per main document room
  if (isMainRoom(docName) && !orchestratedRooms.has(docName)) {
    orchestratedRooms.add(docName);
    // getYDoc retrieves the same WSSharedDoc that setupWSConnection just created
    const doc = getYDoc(docName);
    startOrchestrator(docName, BUILT_IN_AGENTS, doc);
  }

  console.log(`[WS] Client connected → ${docName || "(root)"}`);
});

wss.on("listening", () => {
  console.log(`[WS] MindLink WebSocket server running on ws://localhost:${WS_PORT}`);
});

wss.on("error", (err: NodeJS.ErrnoException) => {
  if (err.code === "EADDRINUSE") {
    console.error(`[WS] Port ${WS_PORT} already in use — stop the old process and restart`);
    process.exit(1);
  } else {
    console.error("[WS] WebSocket server error:", err);
  }
});

export { wss };
