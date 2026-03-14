import type * as Y from "yjs";
import { AgentOrchestrator } from "./orchestrator";
import type { AgentConfig } from "./types";

// Maps roomId -> orchestrator instance
const orchestrators = new Map<string, AgentOrchestrator>();

export function startOrchestrator(
  roomId: string,
  agents: AgentConfig[],
  doc: Y.Doc
) {
  if (orchestrators.has(roomId)) return;
  if (agents.length === 0) return;

  const messagesArray = doc.getArray("agent-messages");
  const orchestrator = new AgentOrchestrator(roomId, agents, doc, messagesArray as any);
  orchestrators.set(roomId, orchestrator);
  console.log(`[Agents] Orchestrator started for room ${roomId} with ${agents.length} agents`);
}

export function stopOrchestrator(roomId: string) {
  const orchestrator = orchestrators.get(roomId);
  if (orchestrator) {
    orchestrator.destroy();
    orchestrators.delete(roomId);
    console.log(`[Agents] Orchestrator stopped for room ${roomId}`);
  }
}

export function triggerAgent(
  roomId: string,
  agentSlug: string,
  context: string
) {
  const orchestrator = orchestrators.get(roomId);
  if (!orchestrator) return;

  // Find agent from orchestrator's agents
  // This is a simplified manual trigger
  console.log(`[Agents] Manual trigger: ${agentSlug} in ${roomId}`);
}
