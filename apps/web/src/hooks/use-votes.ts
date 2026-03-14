"use client";

import { useState, useEffect, useCallback } from "react";
import * as Y from "yjs";
import type { VoteSession } from "@/components/voting/vote-widget";

export function useVotes(doc: Y.Doc | null, currentUserId: string) {
  const [sessions, setSessions] = useState<VoteSession[]>([]);

  useEffect(() => {
    if (!doc) return;
    const yVotes = doc.getArray<VoteSession>("vote-sessions");

    function update() {
      setSessions(yVotes.toArray());
    }

    yVotes.observe(update);
    update();
    return () => yVotes.unobserve(update);
  }, [doc]);

  const createVote = useCallback(
    (data: Omit<VoteSession, "id" | "createdAt" | "votes" | "status">) => {
      if (!doc) return;
      const yVotes = doc.getArray<VoteSession>("vote-sessions");
      const session: VoteSession = {
        ...data,
        id: Math.random().toString(36).slice(2),
        createdAt: Date.now(),
        votes: {},
        status: "active",
      };
      yVotes.push([session]);

      // Auto-close after duration
      if (data.duration && data.duration > 0) {
        setTimeout(() => closeVote(session.id), data.duration * 1000);
      }
    },
    [doc]
  );

  const castVote = useCallback(
    (sessionId: string, optionIndex: number) => {
      if (!doc) return;
      const yVotes = doc.getArray<VoteSession>("vote-sessions");
      const sessions = yVotes.toArray();
      const idx = sessions.findIndex((s) => s.id === sessionId);
      if (idx === -1) return;

      const session = { ...sessions[idx] };
      if (session.status === "closed" || session.votes[currentUserId] !== undefined) return;

      session.votes = { ...session.votes, [currentUserId]: optionIndex };
      yVotes.delete(idx, 1);
      yVotes.insert(idx, [session]);
    },
    [doc, currentUserId]
  );

  const closeVote = useCallback(
    (sessionId: string) => {
      if (!doc) return;
      const yVotes = doc.getArray<VoteSession>("vote-sessions");
      const sessions = yVotes.toArray();
      const idx = sessions.findIndex((s) => s.id === sessionId);
      if (idx === -1) return;

      const session = { ...sessions[idx] };
      const tally: Record<string, number> = {};

      session.options.forEach((opt, i) => {
        tally[opt] = Object.values(session.votes).filter((v) => v === i).length;
      });

      const winner = Object.entries(tally).sort(([, a], [, b]) => b - a)[0]?.[0] ?? "";
      session.status = "closed";
      session.result = { winner, tally };

      yVotes.delete(idx, 1);
      yVotes.insert(idx, [session]);

      // Add to decision log
      const yDecisions = doc.getArray("decisions");
      yDecisions.push([{
        id: session.id,
        topic: session.topic,
        outcome: winner,
        tally,
        closedAt: Date.now(),
      }]);
    },
    [doc]
  );

  return { sessions, createVote, castVote, closeVote };
}
