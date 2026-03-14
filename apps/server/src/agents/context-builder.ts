import type { AgentConfig, AgentMessage } from "./types";

interface ContextParams {
  agentConfig: AgentConfig;
  documentContent: string;
  recentMessages: AgentMessage[];
  roomName: string;
  participants: string[];
  mode: string;
  replyToMessage?: AgentMessage;
}

export function buildSystemPrompt(agent: AgentConfig): string {
  if (agent.systemPrompt) return agent.systemPrompt;

  return `${agent.personality}

Your role: ${agent.role}
Your specialty: ${agent.behaviorRules.specialty}
Your communication style: ${agent.behaviorRules.style}
Avoid: ${agent.behaviorRules.avoid}

You are participating in a collaborative workspace called MindLink. You are one of several AI agents working alongside human collaborators in real-time. Be concise and direct. Respond in plain text without markdown headers unless structuring a long response.`;
}

export function buildContextMessages(params: ContextParams) {
  const { agentConfig, documentContent, recentMessages, roomName, participants, mode, replyToMessage } = params;

  const messages = [];

  // Document context
  const truncatedDoc = documentContent.slice(-4000);
  if (truncatedDoc.trim()) {
    messages.push({
      role: "user" as const,
      content: `Current workspace document content (${mode} mode, room: "${roomName}"):

${truncatedDoc}

Participants: ${participants.join(", ")}`,
    });
    messages.push({
      role: "assistant" as const,
      content: "I've reviewed the current document content and context.",
    });
  }

  // Recent agent conversation
  if (recentMessages.length > 0) {
    const conversationHistory = recentMessages
      .slice(-20)
      .map((m) => `[${m.agentName}]: ${m.content}`)
      .join("\n\n");

    messages.push({
      role: "user" as const,
      content: `Recent agent conversation:\n\n${conversationHistory}`,
    });
    messages.push({
      role: "assistant" as const,
      content: "I've reviewed the recent conversation.",
    });
  }

  // If replying to a specific message
  if (replyToMessage) {
    messages.push({
      role: "user" as const,
      content: `You are responding to ${replyToMessage.agentName}'s message: "${replyToMessage.content}"\n\nEngage with their specific points and contribute your perspective as ${agentConfig.name}.`,
    });
  } else {
    messages.push({
      role: "user" as const,
      content: `Please contribute your perspective as ${agentConfig.name} (${agentConfig.role}) on the current topic.`,
    });
  }

  return messages;
}

export function serializeWhiteboardContent(elements: unknown[]): string {
  if (!elements?.length) return "(empty whiteboard)";
  return elements
    .map((el: any) => el.text ?? el.label ?? `[${el.type}]`)
    .filter(Boolean)
    .join(", ");
}
