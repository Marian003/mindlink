"use client";

import { useState } from "react";
import { AgentPreview } from "./agent-preview";

const AVATAR_OPTIONS = ["🤖", "🧠", "⚡", "🔍", "🌊", "🔥", "🌿", "🎯", "💎", "🚀"];

const PERSONALITY_SLIDERS = [
  { key: "aggression", leftLabel: "Passive", rightLabel: "Aggressive" },
  { key: "creativity", leftLabel: "Analytical", rightLabel: "Creative" },
  { key: "verbosity", leftLabel: "Concise", rightLabel: "Verbose" },
  { key: "formality", leftLabel: "Casual", rightLabel: "Formal" },
  { key: "boldness", leftLabel: "Cautious", rightLabel: "Bold" },
];

const PRESET_TRIGGERS = [
  "Speak when someone mentions specific keywords",
  "Always respond to @mentions",
  "Auto-review when new code is pasted",
  "Challenge the first idea proposed",
  "Wait until asked before speaking",
];

const MODELS = [
  { id: "ollama", label: "Ollama — local LLM (default, llama3.1:8b, no API key needed)", provider: "ollama" },
  { id: "claude", label: "Claude — deep reasoning (requires ANTHROPIC_API_KEY)", provider: "anthropic" },
  { id: "gpt4o", label: "GPT-4o — creative & fast (requires OPENAI_API_KEY)", provider: "openai" },
  { id: "groq", label: "Groq — fastest inference (requires GROQ_API_KEY)", provider: "groq" },
];

interface AgentBuilderProps {
  userId: string;
}

interface AgentFormState {
  name: string;
  role: string;
  avatar: string;
  color: string;
  personality: string;
  sliders: Record<string, number>;
  triggers: string[];
  customTrigger: string;
  modelId: string;
  temperature: number;
  systemPromptOverride: string;
  showAdvanced: boolean;
}

export function AgentBuilder({ userId }: AgentBuilderProps) {
  const [form, setForm] = useState<AgentFormState>({
    name: "",
    role: "",
    avatar: "🤖",
    color: "#3b82f6",
    personality: "",
    sliders: { aggression: 50, creativity: 50, verbosity: 50, formality: 50, boldness: 50 },
    triggers: [],
    customTrigger: "",
    modelId: "ollama",
    temperature: 0.7,
    systemPromptOverride: "",
    showAdvanced: false,
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function update(patch: Partial<AgentFormState>) {
    setForm((f) => ({ ...f, ...patch }));
  }

  function toggleTrigger(trigger: string) {
    update({
      triggers: form.triggers.includes(trigger)
        ? form.triggers.filter((t) => t !== trigger)
        : [...form.triggers, trigger],
    });
  }

  async function handleSave() {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      await fetch("/api/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          role: form.role,
          avatar: form.avatar,
          color: form.color,
          personality: form.personality,
          behaviorRules: {
            triggers: form.triggers,
            style: Object.entries(form.sliders)
              .map(([k, v]) => `${k}:${v}`)
              .join(","),
          },
          modelId: form.modelId,
          temperature: form.temperature,
          systemPromptOverride: form.systemPromptOverride || undefined,
          createdById: userId,
        }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex gap-0 h-[calc(100vh-65px)]">
      {/* Builder form */}
      <div className="flex-1 overflow-y-auto px-8 py-8 max-w-2xl">
        <div className="space-y-8">
          {/* Section 1 — Identity */}
          <section>
            <h2 className="text-lg font-semibold text-white mb-4">Identity</h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-white/50 mb-1.5 block">Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => update({ name: e.target.value })}
                  placeholder="e.g. Catalyst"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/25 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-xs text-white/50 mb-1.5 block">Role / Title</label>
                <input
                  type="text"
                  value={form.role}
                  onChange={(e) => update({ role: e.target.value })}
                  placeholder="e.g. Performance Engineer"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/25 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-xs text-white/50 mb-1.5 block">Avatar</label>
                <div className="flex flex-wrap gap-2">
                  {AVATAR_OPTIONS.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => update({ avatar: emoji })}
                      className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all ${
                        form.avatar === emoji
                          ? "bg-blue-600/30 ring-2 ring-blue-500"
                          : "bg-white/5 hover:bg-white/10"
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs text-white/50 mb-1.5 block">Theme Color</label>
                <div className="flex gap-2">
                  {["#3b82f6","#f97316","#22c55e","#a855f7","#ec4899","#ef4444","#eab308","#14b8a6"].map((c) => (
                    <button
                      key={c}
                      onClick={() => update({ color: c })}
                      className={`w-8 h-8 rounded-lg transition-transform ${form.color === c ? "scale-110 ring-2 ring-white/50" : "hover:scale-105"}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Section 2 — Personality */}
          <section>
            <h2 className="text-lg font-semibold text-white mb-4">Personality</h2>
            <div className="space-y-4">
              {PERSONALITY_SLIDERS.map((s) => (
                <div key={s.key}>
                  <div className="flex justify-between text-xs text-white/40 mb-1">
                    <span>{s.leftLabel}</span>
                    <span>{s.rightLabel}</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={form.sliders[s.key]}
                    onChange={(e) =>
                      update({ sliders: { ...form.sliders, [s.key]: Number(e.target.value) } })
                    }
                    className="w-full accent-blue-500"
                  />
                </div>
              ))}
              <div>
                <label className="text-xs text-white/50 mb-1.5 block">Description (max 500 chars)</label>
                <textarea
                  value={form.personality}
                  onChange={(e) => update({ personality: e.target.value.slice(0, 500) })}
                  placeholder="Describe this agent's personality and communication style…"
                  rows={4}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/25 focus:outline-none focus:border-blue-500 resize-none text-sm"
                />
                <p className="text-xs text-white/20 text-right mt-1">{form.personality.length}/500</p>
              </div>
            </div>
          </section>

          {/* Section 3 — Behavior Rules */}
          <section>
            <h2 className="text-lg font-semibold text-white mb-4">Behavior Rules</h2>
            <div className="space-y-3">
              {PRESET_TRIGGERS.map((trigger) => (
                <button
                  key={trigger}
                  onClick={() => toggleTrigger(trigger)}
                  className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all ${
                    form.triggers.includes(trigger)
                      ? "border-blue-500 bg-blue-600/20 text-white"
                      : "border-white/10 bg-white/5 text-white/50 hover:text-white hover:border-white/20"
                  }`}
                >
                  {form.triggers.includes(trigger) ? "✓ " : ""}{trigger}
                </button>
              ))}
            </div>
          </section>

          {/* Section 4 — LLM Config */}
          <section>
            <h2 className="text-lg font-semibold text-white mb-4">LLM Configuration</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                {MODELS.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => update({ modelId: m.id })}
                    className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all ${
                      form.modelId === m.id
                        ? "border-blue-500 bg-blue-600/20 text-white"
                        : "border-white/10 bg-white/5 text-white/50 hover:text-white/80"
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-white/50">Temperature (creativity)</span>
                  <span className="text-white/50">{form.temperature.toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={10}
                  value={Math.round(form.temperature * 10)}
                  onChange={(e) => update({ temperature: Number(e.target.value) / 10 })}
                  className="w-full accent-blue-500"
                />
              </div>
              <button
                onClick={() => update({ showAdvanced: !form.showAdvanced })}
                className="text-xs text-white/30 hover:text-white transition-colors"
              >
                {form.showAdvanced ? "▲" : "▼"} Advanced: System Prompt Override
              </button>
              {form.showAdvanced && (
                <textarea
                  value={form.systemPromptOverride}
                  onChange={(e) => update({ systemPromptOverride: e.target.value })}
                  placeholder="Override the auto-generated system prompt…"
                  rows={6}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/25 focus:outline-none focus:border-blue-500 resize-none text-sm font-mono"
                />
              )}
            </div>
          </section>

          {/* Save */}
          <button
            onClick={handleSave}
            disabled={saving || !form.name.trim()}
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-medium transition-colors"
          >
            {saving ? "Saving…" : saved ? "✓ Saved!" : "Save Agent"}
          </button>
        </div>
      </div>

      {/* Live preview */}
      <div className="w-96 border-l border-white/10 flex-shrink-0">
        <AgentPreview agent={form} />
      </div>
    </div>
  );
}
