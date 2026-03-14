"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AgentAvatar } from "./agent-avatar";

interface AgentData {
  id: string;
  name: string;
  slug: string;
  role: string;
  color: string;
}

interface MentionInputProps {
  agents: AgentData[];
  onSelect: (agentName: string) => void;
  trigger: string; // the current @-word being typed
  position?: { top: number; left: number };
}

export function MentionInput({ agents, onSelect, trigger, position }: MentionInputProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const query = trigger.slice(1).toLowerCase();

  const filtered = agents.filter(
    (a) =>
      a.name.toLowerCase().includes(query) || a.slug.toLowerCase().includes(query)
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [trigger]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((i) => (i + 1) % filtered.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((i) => (i - 1 + filtered.length) % filtered.length);
      } else if (e.key === "Enter" && filtered[selectedIndex]) {
        e.preventDefault();
        onSelect(filtered[selectedIndex].name);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [filtered, selectedIndex, onSelect]);

  if (filtered.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 4 }}
        className="absolute z-50 bg-[#1a1a1d] border border-white/15 rounded-xl shadow-2xl overflow-hidden min-w-[200px]"
        style={position ? { top: position.top, left: position.left } : { bottom: "100%", left: 0 }}
      >
        {filtered.map((agent, i) => (
          <button
            key={agent.id}
            onClick={() => onSelect(agent.name)}
            className={`w-full flex items-center gap-2.5 px-3 py-2 text-left transition-colors ${
              i === selectedIndex ? "bg-white/10" : "hover:bg-white/5"
            }`}
          >
            <AgentAvatar name={agent.name} color={agent.color} size="sm" />
            <div>
              <p className="text-sm text-white font-medium">{agent.name}</p>
              <p className="text-xs text-white/40">{agent.role}</p>
            </div>
          </button>
        ))}
      </motion.div>
    </AnimatePresence>
  );
}
