import Groq from "groq-sdk";
import type { LLMProvider, LLMRequest } from "../types";

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

const DEFAULT_MODEL = "llama-3.3-70b-versatile";

export const groqProvider: LLMProvider = {
  async *stream(params: LLMRequest): AsyncIterable<string> {
    const stream = await client.chat.completions.create({
      model: params.model ?? DEFAULT_MODEL,
      messages: [
        { role: "system", content: params.systemPrompt },
        ...params.messages.map((m) => ({
          role: m.role as "user" | "assistant" | "system",
          content: m.content,
        })),
      ],
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
    const response = await client.chat.completions.create({
      model: params.model ?? DEFAULT_MODEL,
      messages: [
        { role: "system", content: params.systemPrompt },
        ...params.messages.map((m) => ({
          role: m.role as "user" | "assistant" | "system",
          content: m.content,
        })),
      ],
      temperature: params.temperature ?? 0.7,
      max_tokens: params.maxTokens ?? 2048,
    });

    return response.choices[0]?.message?.content ?? "";
  },
};
