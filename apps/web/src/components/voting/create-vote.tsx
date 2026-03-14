"use client";

import { useState } from "react";
import type { VoteSession } from "./vote-widget";

interface CreateVoteProps {
  onCreate: (session: Omit<VoteSession, "id" | "createdAt" | "votes" | "status">) => void;
  onCancel: () => void;
  currentUserId: string;
}

const DURATIONS = [
  { label: "30s", value: 30 },
  { label: "1 min", value: 60 },
  { label: "5 min", value: 300 },
  { label: "No limit", value: 0 },
];

export function CreateVote({ onCreate, onCancel, currentUserId }: CreateVoteProps) {
  const [topic, setTopic] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [duration, setDuration] = useState(60);

  function addOption() {
    if (options.length < 6) setOptions([...options, ""]);
  }

  function updateOption(i: number, val: string) {
    const updated = [...options];
    updated[i] = val;
    setOptions(updated);
  }

  function removeOption(i: number) {
    if (options.length <= 2) return;
    setOptions(options.filter((_, idx) => idx !== i));
  }

  function handleCreate() {
    const validOptions = options.filter((o) => o.trim());
    if (!topic.trim() || validOptions.length < 2) return;
    onCreate({ topic: topic.trim(), options: validOptions, createdBy: currentUserId, duration });
  }

  return (
    <div className="bg-[#1a1a1d] border border-white/10 rounded-xl p-4 space-y-4">
      <h3 className="text-sm font-semibold text-white">Create a Vote</h3>

      <div>
        <label className="text-xs text-white/50 mb-1 block">Topic / Question</label>
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="What should we decide?"
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/25 focus:outline-none focus:border-blue-500"
          autoFocus
        />
      </div>

      <div className="space-y-2">
        <label className="text-xs text-white/50 block">Options</label>
        {options.map((opt, i) => (
          <div key={i} className="flex gap-2">
            <input
              type="text"
              value={opt}
              onChange={(e) => updateOption(i, e.target.value)}
              placeholder={`Option ${i + 1}`}
              className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white placeholder-white/25 focus:outline-none focus:border-blue-500"
            />
            {options.length > 2 && (
              <button
                onClick={() => removeOption(i)}
                className="text-white/25 hover:text-red-400 transition-colors text-lg leading-none"
              >
                ×
              </button>
            )}
          </div>
        ))}
        {options.length < 6 && (
          <button
            onClick={addOption}
            className="text-xs text-white/30 hover:text-white transition-colors"
          >
            + Add option
          </button>
        )}
      </div>

      <div>
        <label className="text-xs text-white/50 mb-2 block">Duration</label>
        <div className="flex gap-2">
          {DURATIONS.map((d) => (
            <button
              key={d.value}
              onClick={() => setDuration(d.value)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                duration === d.value
                  ? "bg-blue-600 text-white"
                  : "bg-white/5 text-white/40 hover:bg-white/10"
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-2 pt-1">
        <button onClick={onCancel} className="flex-1 py-2 text-sm text-white/40 hover:text-white">
          Cancel
        </button>
        <button
          onClick={handleCreate}
          disabled={!topic.trim() || options.filter((o) => o.trim()).length < 2}
          className="flex-1 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-sm text-white font-medium transition-colors"
        >
          Start Vote
        </button>
      </div>
    </div>
  );
}
