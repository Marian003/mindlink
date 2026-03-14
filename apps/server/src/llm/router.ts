import { ollamaProvider } from "./providers/ollama";
import { anthropicProvider } from "./providers/anthropic";
import { openaiProvider } from "./providers/openai";
import { groqProvider } from "./providers/groq";
import { mockProvider } from "./providers/mock";
import type { LLMProvider, LLMRequest } from "./types";

// Real providers gated on actual keys (not the placeholder "sk-ant-..." defaults)
function realProviders(): LLMProvider[] {
  const providers: LLMProvider[] = [];
  if (process.env.ANTHROPIC_API_KEY?.startsWith("sk-ant-api")) providers.push(anthropicProvider);
  if (process.env.OPENAI_API_KEY?.startsWith("sk-") && !process.env.OPENAI_API_KEY?.includes("...")) providers.push(openaiProvider);
  if (process.env.GROQ_API_KEY?.startsWith("gsk_")) providers.push(groqProvider);
  return providers;
}

// Fallback chain: Ollama → real providers (if keys set) → mock
async function tryProviders(providers: LLMProvider[], params: LLMRequest): Promise<string> {
  let lastErr: unknown;
  for (const provider of providers) {
    try {
      return await provider.complete(params);
    } catch (err) {
      lastErr = err;
    }
  }
  throw lastErr;
}

export async function* streamWithFallback(
  _agentSlug: string,
  params: LLMRequest
): AsyncIterable<string> {
  // 1. Try Ollama (primary)
  try {
    yield* ollamaProvider.stream(params);
    return;
  } catch (err: any) {
    console.warn(`[LLM] Ollama unavailable: ${err.message}`);
  }

  // 2. Try real API providers if keys are configured
  const real = realProviders();
  for (const provider of real) {
    try {
      const result = await provider.complete(params);
      yield result;
      return;
    } catch (err: any) {
      console.warn(`[LLM] Real provider failed: ${err.message}`);
    }
  }

  // 3. Final fallback: mock responses
  console.warn("[LLM] All providers unavailable — using mock response");
  yield* mockProvider.stream(params);
}

export async function routeWithFallback(
  _agentSlug: string,
  params: LLMRequest
): Promise<string> {
  try {
    return await ollamaProvider.complete(params);
  } catch {
    // ignore
  }

  try {
    return await tryProviders(realProviders(), params);
  } catch {
    // ignore
  }

  return mockProvider.complete(params);
}
