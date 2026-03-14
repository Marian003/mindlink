export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
  name?: string;
}

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
}

export interface LLMRequest {
  model?: string;
  systemPrompt: string;
  messages: ChatMessage[];
  temperature?: number;
  maxTokens?: number;
  tools?: ToolDefinition[];
}

export interface LLMProvider {
  stream(params: LLMRequest): AsyncIterable<string>;
  complete(params: LLMRequest): Promise<string>;
}
