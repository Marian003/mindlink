"use client";

import { useState } from "react";
import { motion } from "framer-motion";

interface AgentData {
  id: string;
  name: string;
  color: string;
  role: string;
}

interface DebateControlsProps {
  agents: AgentData[];
  onStart: (topic: string, agentIds: string[], rounds: number) => void;
  onStop: () => void;
  debateActive: boolean;
  currentRound?: number;
  maxRounds?: number;
}

export function DebateControls({
  agents,
  onStart,
  onStop,
  debateActive,
  currentRound,
  maxRounds,
}: DebateControlsProps) {
  const [topic, setTopic] = useState("");
  const [selectedAgents, setSelectedAgents] = useState<string[]>([]);
  const [rounds, setRounds] = useState(3);
  const [open, setOpen] = useState(false);

  function toggleAgent(id: string) {
    setSelectedAgents((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  }

  function handleStart() {
    if (!topic.trim() || selectedAgents.length < 2) return;
    onStart(topic.trim(), selectedAgents, rounds);
    setOpen(false);
  }

  return (
    <div className="border-t border-white/10 p-3">
      {debateActive ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
              <span className="text-xs text-white/60 font-medium">
                Debate Round {currentRound}/{maxRounds}
              </span>
            </div>
            <button
              onClick={onStop}
              className="text-xs text-red-400 hover:text-red-300 transition-colors"
            >
              Stop
            </button>
          </div>
          <div className="h-1 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-orange-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${((currentRound ?? 1) / (maxRounds ?? 3)) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      ) : (
        <>
          <button
            onClick={() => setOpen(!open)}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg border border-white/10 text-xs text-white/50 hover:text-white hover:border-white/20 transition-colors"
          >
            ⚔️ Start Debate
          </button>

          {open && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mt-3 space-y-3"
            >
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Debate topic…"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-white/25 focus:outline-none focus:border-white/30"
              />

              <div>
                <p className="text-xs text-white/40 mb-1.5">Select agents (min 2):</p>
                <div className="flex flex-wrap gap-1.5">
                  {agents.map((agent) => (
                    <button
                      key={agent.id}
                      onClick={() => toggleAgent(agent.id)}
                      className={`px-2 py-1 rounded-md text-xs font-medium transition-all ${
                        selectedAgents.includes(agent.id)
                          ? "text-white"
                          : "bg-white/5 text-white/40 hover:text-white/70"
                      }`}
                      style={
                        selectedAgents.includes(agent.id)
                          ? { backgroundColor: agent.color }
                          : {}
                      }
                    >
                      {agent.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-white/40">Rounds:</span>
                {[1, 2, 3, 4, 5].map((r) => (
                  <button
                    key={r}
                    onClick={() => setRounds(r)}
                    className={`w-7 h-7 rounded-md text-xs font-medium transition-colors ${
                      rounds === r
                        ? "bg-blue-600 text-white"
                        : "bg-white/5 text-white/40 hover:bg-white/10"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setOpen(false)}
                  className="flex-1 py-1.5 text-xs text-white/40 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleStart}
                  disabled={!topic.trim() || selectedAgents.length < 2}
                  className="flex-1 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 disabled:opacity-40 text-xs text-white font-medium transition-colors"
                >
                  Start
                </button>
              </div>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
}
