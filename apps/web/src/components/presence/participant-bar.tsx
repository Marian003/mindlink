"use client";

import { useEffect, useState } from "react";
import type { Awareness } from "y-protocols/awareness";

interface Participant {
  clientId: number;
  userId: string;
  name: string;
  color: string;
  mode?: string;
  status?: string;
  isAgent?: boolean;
}

interface ParticipantBarProps {
  awareness: Awareness | null;
  currentClientId?: number;
}

export function ParticipantBar({ awareness, currentClientId }: ParticipantBarProps) {
  const [participants, setParticipants] = useState<Participant[]>([]);

  useEffect(() => {
    if (!awareness) return;

    function update() {
      const states = awareness!.getStates();
      const list: Participant[] = [];

      states.forEach((state, clientId) => {
        if (!state.userId) return;
        list.push({
          clientId,
          userId: state.userId,
          name: state.name ?? "Anonymous",
          color: state.color ?? "#3b82f6",
          mode: state.mode,
          status: state.status,
          isAgent: state.isAgent ?? false,
        });
      });

      setParticipants(list);
    }

    awareness.on("change", update);
    update();
    return () => awareness.off("change", update);
  }, [awareness]);

  const MAX_SHOWN = 5;
  const shown = participants.slice(0, MAX_SHOWN);
  const overflow = participants.length - MAX_SHOWN;

  return (
    <div className="flex items-center gap-1.5">
      {shown.map((p, i) => (
        <div
          key={p.clientId}
          title={`${p.name} · ${p.mode ?? "document"}`}
          className="relative group"
          style={{ zIndex: MAX_SHOWN - i }}
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold text-white ring-2 ring-[#0a0a0b] transition-transform group-hover:scale-110"
            style={{ backgroundColor: p.color }}
          >
            {p.name[0]?.toUpperCase()}
            {p.isAgent && (
              <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-[#0a0a0b] rounded-full flex items-center justify-center text-[8px]">
                🤖
              </span>
            )}
          </div>
          {/* Tooltip */}
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-[#1a1a1d] border border-white/10 rounded-lg text-xs text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            {p.name}
            {p.clientId === currentClientId && " (you)"}
          </div>
        </div>
      ))}
      {overflow > 0 && (
        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs text-white/60 font-medium ring-2 ring-[#0a0a0b]">
          +{overflow}
        </div>
      )}
    </div>
  );
}
