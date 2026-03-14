import type { LLMProvider, LLMRequest } from "../types";

const OLLAMA_URL = process.env.OLLAMA_URL ?? "http://localhost:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL ?? "llama3.1:8b";

function buildMessages(params: LLMRequest) {
  const msgs: { role: string; content: string }[] = [];
  if (params.systemPrompt) {
    msgs.push({ role: "system", content: params.systemPrompt });
  }
  for (const m of params.messages) {
    msgs.push({ role: m.role, content: m.content });
  }
  return msgs;
}

export const ollamaProvider: LLMProvider = {
  async *stream(params: LLMRequest): AsyncIterable<string> {
    let res: Response;
    try {
      res = await fetch(`${OLLAMA_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: params.model ?? OLLAMA_MODEL,
          messages: buildMessages(params),
          stream: true,
          options: {
            temperature: params.temperature ?? 0.7,
            num_predict: params.maxTokens ?? 512,
          },
        }),
      });
    } catch (err: any) {
      throw new Error(
        `Ollama not reachable at ${OLLAMA_URL} — start it with: ollama serve\n(${err.message})`
      );
    }

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Ollama HTTP ${res.status}: ${text}`);
    }

    const reader = res.body?.getReader();
    if (!reader) throw new Error("Ollama stream body is null");

    const decoder = new TextDecoder();
    let buf = "";

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      buf += decoder.decode(value, { stream: true });
      const lines = buf.split("\n");
      buf = lines.pop() ?? "";

      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const chunk = JSON.parse(line);
          const token = chunk?.message?.content;
          if (token) yield token;
          if (chunk?.done) return;
        } catch {
          // skip malformed JSON lines
        }
      }
    }
  },

  async complete(params: LLMRequest): Promise<string> {
    let res: Response;
    try {
      res = await fetch(`${OLLAMA_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: params.model ?? OLLAMA_MODEL,
          messages: buildMessages(params),
          stream: false,
          options: {
            temperature: params.temperature ?? 0.7,
            num_predict: params.maxTokens ?? 512,
          },
        }),
      });
    } catch (err: any) {
      throw new Error(
        `Ollama not reachable at ${OLLAMA_URL} — start it with: ollama serve\n(${err.message})`
      );
    }

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Ollama HTTP ${res.status}: ${text}`);
    }

    const data = await res.json();
    return data?.message?.content ?? "";
  },
};
