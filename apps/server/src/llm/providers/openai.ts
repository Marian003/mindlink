import OpenAI from "openai";
import type { LLMProvider, LLMRequest } from "../types";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const DEFAULT_MODEL = "gpt-4o";

export const openaiProvider: LLMProvider = {
  async *stream(params: LLMRequest): AsyncIterable<string> {
    const messages: OpenAI.ChatCompletionMessageParam[] = [
      { role: "system", content: params.systemPrompt },
      ...params.messages.map((m) => ({
        role: m.role as "user" | "assistant" | "system",
        content: m.content,
      })),
    ];

    const stream = await client.chat.completions.create({
      model: params.model ?? DEFAULT_MODEL,
      messages,
      temperature: params.temperature ?? 0.7,
      max_tokens: params.maxTokens ?? 2048,
      stream: true,
    });

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content;
      if (delta) yield delta;
    }
  },

  async complete(params: LLMRequest): Promise<string> {
    const messages: OpenAI.ChatCompletionMessageParam[] = [
      { role: "system", content: params.systemPrompt },
      ...params.messages.map((m) => ({
        role: m.role as "user" | "assistant" | "system",
        content: m.content,
      })),
    ];

    const response = await client.chat.completions.create({
      model: params.model ?? DEFAULT_MODEL,
      messages,
      temperature: params.temperature ?? 0.7,
      max_tokens: params.maxTokens ?? 2048,
    });

    return response.choices[0]?.message?.content ?? "";
  },
};
