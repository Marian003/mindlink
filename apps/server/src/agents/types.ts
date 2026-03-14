export interface AgentMessage {
  id: string;
  agentId: string;
  agentName: string;
  agentColor: string;
  content: string;
  timestamp: number;
  replyTo?: string; // message id this is replying to
  chainDepth?: number;
}

export interface AgentConfig {
  id: string;
  name: string;
  slug: string;
  role: string;
  personality: string;
  behaviorRules: {
    triggers: string[];
    style: string;
    avoid: string;
    specialty: string;
  };
  color: string;
  systemPrompt?: string; // overrides the structured prompt from behaviorRules when set
  model?: string;
  temperature?: number;
}

export type TriggerType = "MENTION" | "CONTENT_CHANGE" | "AGENT_MENTION" | "MANUAL";

export interface AgentTrigger {
  type: TriggerType;
  targetAgentId: string;
  targetAgentSlug: string;
  context: string;
  replyToMessageId?: string;
  chainDepth?: number;
}
