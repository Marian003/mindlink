import { randomUUID } from "crypto";
import type * as Y from "yjs";
import type { AgentConfig, AgentMessage, AgentTrigger } from "./types";
import { buildSystemPrompt, buildContextMessages } from "./context-builder";
import { streamWithFallback } from "../llm/router";

const TYPING_SPEED_MS_PER_CHAR = 25; // ~40 chars/second

export class AgentRuntime {
  constructor(
    private config: AgentConfig,
    private messagesArray: Y.Array<AgentMessage>
  ) {}

  async respond(
    trigger: AgentTrigger,
    context: {
      documentContent: string;
      recentMessages: AgentMessage[];
      roomName: string;
      participants: string[];
      mode: string;
      replyToMessage?: AgentMessage;
    }
  ): Promise<AgentMessage> {
    const systemPrompt = buildSystemPrompt(this.config);
    const messages = buildContextMessages({
      agentConfig: this.config,
      ...context,
    });

    const messageId = randomUUID();
    let fullContent = "";

    // Start with empty message (typing indicator via empty content)
    const initialMessage: AgentMessage = {
      id: messageId,
      agentId: this.config.id,
      agentName: this.config.name,
      agentColor: this.config.color,
      content: "…",
      timestamp: Date.now(),
      replyTo: trigger.replyToMessageId,
      chainDepth: trigger.chainDepth ?? 0,
    };

    this.messagesArray.push([initialMessage]);

    // Stream the response
    const stream = streamWithFallback(this.config.slug, {
      systemPrompt,
      messages,
      temperature: this.config.temperature ?? 0.7,
      maxTokens: 1024,
    });

    let buffer = "";
    let lastFlush = Date.now();

    for await (const chunk of stream) {
      fullContent += chunk;
      buffer += chunk;

      // Flush buffer at typing speed (every ~40 chars or 1 second)
      const now = Date.now();
      if (buffer.length >= 40 || now - lastFlush > 1000) {
        // Update the last message in the Y.Array with current content
        const idx = this.findMessageIndex(messageId);
        if (idx !== -1) {
          this.messagesArray.delete(idx, 1);
          this.messagesArray.insert(idx, [
            { ...initialMessage, content: fullContent, timestamp: Date.now() },
          ]);
        }
        buffer = "";
        lastFlush = now;

        // Simulate typing delay
        await new Promise((r) => setTimeout(r, buffer.length * TYPING_SPEED_MS_PER_CHAR));
      }
    }

    // Final update with complete content
    const finalMessage: AgentMessage = {
      ...initialMessage,
      content: fullContent || "I don't have anything to add right now.",
      timestamp: Date.now(),
    };

    const idx = this.findMessageIndex(messageId);
    if (idx !== -1) {
      this.messagesArray.delete(idx, 1);
      this.messagesArray.insert(idx, [finalMessage]);
    }

    return finalMessage;
  }

  private findMessageIndex(messageId: string): number {
    const arr = this.messagesArray.toArray();
    return arr.findIndex((m) => m.id === messageId);
  }
}
