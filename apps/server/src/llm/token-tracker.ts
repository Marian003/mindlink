interface TokenUsage {
  roomId: string;
  inputTokens: number;
  outputTokens: number;
  lastUpdated: Date;
}

// In-memory token tracking (could be persisted to Redis/DB later)
const usageMap = new Map<string, TokenUsage>();

export function trackTokens(
  roomId: string,
  inputTokens: number,
  outputTokens: number
) {
  const existing = usageMap.get(roomId) ?? {
    roomId,
    inputTokens: 0,
    outputTokens: 0,
    lastUpdated: new Date(),
  };

  usageMap.set(roomId, {
    roomId,
    inputTokens: existing.inputTokens + inputTokens,
    outputTokens: existing.outputTokens + outputTokens,
    lastUpdated: new Date(),
  });
}

export function getUsage(roomId: string): TokenUsage {
  return (
    usageMap.get(roomId) ?? {
      roomId,
      inputTokens: 0,
      outputTokens: 0,
      lastUpdated: new Date(),
    }
  );
}

export function getAllUsage(): TokenUsage[] {
  return Array.from(usageMap.values());
}
