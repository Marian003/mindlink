import { groqProvider } from "./providers/groq";
import { ollamaProvider } from "./providers/ollama";
import { mockProvider } from "./providers/mock";
import type { LLMRequest } from "./types";

// Priority: Groq (cloud, fast) → Ollama (local) → mock (offline fallback)

export async function* streamWithFallback(
  _agentSlug: string,
  params: LLMRequest
): AsyncIterable<string> {
  // 1. Try Groq (primary — fastest, requires GROQ_API_KEY)
  if (process.env.GROQ_API_KEY?.startsWith("gsk_")) {
    try {
      yield* groqProvider.stream(params);
      return;
    } catch (err: any) {
      console.warn(`[LLM] Groq unavailable: ${err.message}`);
    }
  }

  // 2. Try Ollama (local — requires ollama serve)
  try {
    yield* ollamaProvider.stream(params);
    return;
  } catch (err: any) {
    console.warn(`[LLM] Ollama unavailable: ${err.message}`);
  }

  // 3. Final fallback: mock responses
  console.warn("[LLM] All providers unavailable — using mock response");
  yield* mockProvider.stream(params);
}

export async function routeWithFallback(
  _agentSlug: string,
  params: LLMRequest
): Promise<string> {
  if (process.env.GROQ_API_KEY?.startsWith("gsk_")) {
    try {
      return await groqProvider.complete(params);
    } catch { /* ignore */ }
  }

  try {
    return await ollamaProvider.complete(params);
  } catch { /* ignore */ }

  return mockProvider.complete(params);
}
