import Anthropic from "@anthropic-ai/sdk";
import type { LLMProvider, LLMRequest } from "../types";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const DEFAULT_MODEL = "claude-sonnet-4-20250514";

async function withRetry<T>(fn: () => Promise<T>, attempts = 3): Promise<T> {
  let lastError: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (i < attempts - 1) {
        await new Promise((r) => setTimeout(r, Math.pow(2, i) * 500));
      }
    }
  }
  throw lastError;
}

export const anthropicProvider: LLMProvider = {
  async *stream(params: LLMRequest): AsyncIterable<string> {
    const stream = await withRetry(() =>
      client.messages.stream({
        model: params.model ?? DEFAULT_MODEL,
        max_tokens: params.maxTokens ?? 2048,
        temperature: params.temperature ?? 0.7,
        system: params.systemPrompt,
        messages: params.messages.map((m) => ({
          role: m.role === "system" ? "user" : m.role,
          content: m.content,
        })),
      })
    );

    for await (const event of stream) {
      if (
        event.type === "content_block_delta" &&
        event.delta.type === "text_delta"
      ) {
        yield event.delta.text;
      }
    }
  },

  async complete(params: LLMRequest): Promise<string> {
    const response = await withRetry(() =>
      client.messages.create({
        model: params.model ?? DEFAULT_MODEL,
        max_tokens: params.maxTokens ?? 2048,
        temperature: params.temperature ?? 0.7,
        system: params.systemPrompt,
        messages: params.messages.map((m) => ({
          role: m.role === "system" ? "user" : m.role,
          content: m.content,
        })),
      })
    );

    const block = response.content[0];
    return block.type === "text" ? block.text : "";
  },
};
