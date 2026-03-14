"use client";

import { motion } from "framer-motion";
import { AgentAvatar } from "./agent-avatar";

interface AgentMessageData {
  id: string;
  agentId: string;
  agentName: string;
  agentColor: string;
  content: string;
  timestamp: number;
  replyTo?: string;
  chainDepth?: number;
}

interface AgentMessageProps {
  message: AgentMessageData;
  onReply?: (agentName: string) => void;
  isStreaming?: boolean;
}

function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function renderContent(content: string, agentColor: string) {
  // Basic markdown-like rendering
  const lines = content.split("\n");
  return lines.map((line, i) => {
    // Code blocks are handled inline for simplicity
    if (line.startsWith("```") || line.startsWith("    ")) {
      return (
        <code key={i} className="block font-mono text-xs bg-white/5 rounded px-2 py-1 my-1 text-green-300 whitespace-pre-wrap">
          {line.replace(/^```\w*/, "").replace(/```$/, "")}
        </code>
      );
    }
    // @mentions highlighted
    const withMentions = line.split(/(@\w+)/g).map((part, j) =>
      part.startsWith("@") ? (
        <span key={j} style={{ color: agentColor }} className="font-semibold">
          {part}
        </span>
      ) : (
        part
      )
    );
    return <p key={i} className="text-sm text-white/80 leading-relaxed">{withMentions}</p>;
  });
}

export function AgentMessage({ message, onReply, isStreaming }: AgentMessageProps) {
  const indent = Math.min((message.chainDepth ?? 0) * 16, 48);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="group"
      style={{ paddingLeft: indent }}
    >
      {/* Thread indicator */}
      {(message.chainDepth ?? 0) > 0 && (
        <div
          className="absolute left-0 top-0 bottom-0 w-0.5 rounded-full"
          style={{ backgroundColor: message.agentColor + "40", marginLeft: indent - 8 }}
        />
      )}

      <div className="flex gap-2.5 py-3 px-4 hover:bg-white/[0.02] rounded-xl transition-colors relative">
        <AgentAvatar
          name={message.agentName}
          color={message.agentColor}
          thinking={isStreaming && message.content === "…"}
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-semibold" style={{ color: message.agentColor }}>
              {message.agentName}
            </span>
            <span className="text-xs text-white/25">{formatTime(message.timestamp)}</span>
            {isStreaming && message.content !== "…" && (
              <span className="text-xs text-white/25 animate-pulse">typing…</span>
            )}
          </div>

          <div className="space-y-1">
            {message.content === "…" ? (
              <div className="flex gap-1 items-center h-5">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-white/30"
                    animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
                    transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
                  />
                ))}
              </div>
            ) : (
              renderContent(message.content, message.agentColor)
            )}
          </div>

          {/* Reply button */}
          {onReply && message.content !== "…" && (
            <button
              onClick={() => onReply(message.agentName)}
              className="mt-1 text-xs text-white/25 hover:text-white/60 transition-colors opacity-0 group-hover:opacity-100"
            >
              ↩ Reply
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
