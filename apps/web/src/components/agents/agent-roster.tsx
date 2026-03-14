"use client";

import { useState } from "react";
import { AgentAvatar } from "./agent-avatar";

interface AgentData {
  id: string;
  name: string;
  slug: string;
  role: string;
  color: string;
}

interface AgentRosterProps {
  agents: AgentData[];
}

export function AgentRoster({ agents }: AgentRosterProps) {
  const [expanded, setExpanded] = useState(false);

  if (agents.length === 0) {
    return (
      <div className="px-4 py-3 text-xs text-white/25">
        No agents in this room.
      </div>
    );
  }

  return (
    <div className="px-4 py-3">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between w-full text-xs text-white/40 hover:text-white/70 transition-colors mb-2"
      >
        <span className="uppercase tracking-wider font-semibold">In this room</span>
        <span>{expanded ? "▲" : "▼"}</span>
      </button>

      <div className={`space-y-2 ${expanded ? "" : "max-h-0 overflow-hidden"}`}>
        {agents.map((agent) => (
          <div key={agent.id} className="flex items-center gap-2.5">
            <AgentAvatar name={agent.name} color={agent.color} role={agent.role} size="sm" />
            <div>
              <p className="text-sm text-white font-medium">{agent.name}</p>
              <p className="text-xs text-white/40">{agent.role}</p>
            </div>
            <div className="ml-auto w-1.5 h-1.5 rounded-full bg-green-500" title="Active" />
          </div>
        ))}
      </div>

      {!expanded && (
        <div className="flex gap-1">
          {agents.slice(0, 6).map((agent) => (
            <div
              key={agent.id}
              className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold text-white"
              style={{ backgroundColor: agent.color }}
              title={agent.name}
            >
              {agent.name[0]}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
