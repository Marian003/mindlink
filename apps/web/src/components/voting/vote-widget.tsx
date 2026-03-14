"use client";

import { useState } from "react";
import { motion } from "framer-motion";

export interface VoteSession {
  id: string;
  topic: string;
  createdBy: string;
  createdAt: number;
  options: string[];
  votes: Record<string, number>; // participantId -> optionIndex
  status: "active" | "closed";
  result?: { winner: string; tally: Record<string, number> };
  duration?: number; // seconds, 0 = no limit
}

interface VoteWidgetProps {
  session: VoteSession;
  currentUserId: string;
  onVote: (sessionId: string, optionIndex: number) => void;
  onClose?: (sessionId: string) => void;
}

export function VoteWidget({ session, currentUserId, onVote, onClose }: VoteWidgetProps) {
  const totalVotes = Object.keys(session.votes).length;
  const userVote = session.votes[currentUserId];
  const hasVoted = userVote !== undefined;

  // Tally counts per option
  const tally: number[] = session.options.map((_, i) =>
    Object.values(session.votes).filter((v) => v === i).length
  );

  const winner = session.result?.winner;

  return (
    <div className="bg-[#1a1a1d] border border-white/10 rounded-xl p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <span className="text-xs text-white/30 uppercase tracking-wider font-semibold">Vote</span>
          <p className="text-sm font-medium text-white mt-0.5">{session.topic}</p>
        </div>
        {session.status === "active" && onClose && (
          <button
            onClick={() => onClose(session.id)}
            className="text-xs text-white/30 hover:text-white transition-colors flex-shrink-0"
          >
            Close
          </button>
        )}
        {session.status === "closed" && (
          <span className="text-xs bg-white/10 text-white/40 rounded-full px-2 py-0.5">Closed</span>
        )}
      </div>

      <div className="space-y-2">
        {session.options.map((option, i) => {
          const count = tally[i];
          const pct = totalVotes > 0 ? (count / totalVotes) * 100 : 0;
          const isWinner = winner === option;
          const isSelected = userVote === i;

          return (
            <div key={i}>
              <button
                onClick={() => session.status === "active" && !hasVoted && onVote(session.id, i)}
                disabled={hasVoted || session.status === "closed"}
                className={`w-full text-left px-3 py-2 rounded-lg border text-sm transition-all ${
                  isSelected
                    ? "border-blue-500 bg-blue-600/20 text-white"
                    : isWinner
                    ? "border-green-500/50 bg-green-600/10 text-white"
                    : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10 disabled:cursor-default"
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span>{option}</span>
                  <span className="text-xs text-white/40">
                    {count} {count === 1 ? "vote" : "votes"}
                  </span>
                </div>
                {(hasVoted || session.status === "closed") && (
                  <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full ${isWinner ? "bg-green-500" : "bg-blue-500"}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                    />
                  </div>
                )}
              </button>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-white/25">
        {totalVotes} {totalVotes === 1 ? "vote" : "votes"} total
        {!hasVoted && session.status === "active" && " · Vote to see results"}
      </p>
    </div>
  );
}
