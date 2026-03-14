"use client";

import { useState } from "react";

interface AgentPreviewProps {
  agent: {
    name: string;
    role: string;
    avatar: string;
    color: string;
    personality: string;
    modelId: string;
    temperature: number;
  };
}

export function AgentPreview({ agent }: AgentPreviewProps) {
  const [testPrompt, setTestPrompt] = useState("What's your take on microservices vs monolith?");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleTest() {
    if (!agent.name || loading) return;
    setLoading(true);
    setResponse("");
    try {
      const res = await fetch("/api/agents/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: testPrompt, agent }),
      });
      const text = await res.text();
      setResponse(text);
    } catch {
      setResponse("Error: Could not reach the server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-full bg-[#0d0d0f] p-6">
      <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-6">Preview</h3>

      {/* Agent card */}
      <div className="bg-[#1a1a1d] border border-white/10 rounded-2xl p-4 mb-6">
        <div className="flex items-center gap-3 mb-3">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
            style={{ backgroundColor: agent.color + "30", border: `2px solid ${agent.color}50` }}
          >
            {agent.avatar}
          </div>
          <div>
            <p className="font-semibold text-white">{agent.name || "Unnamed Agent"}</p>
            <p className="text-xs text-white/40">{agent.role || "No role set"}</p>
          </div>
        </div>
        {agent.personality && (
          <p className="text-xs text-white/50 leading-relaxed">{agent.personality.slice(0, 200)}{agent.personality.length > 200 ? "…" : ""}</p>
        )}
        <div className="flex gap-2 mt-3">
          <span className="text-xs bg-white/10 text-white/40 rounded-full px-2 py-0.5">{agent.modelId}</span>
          <span className="text-xs bg-white/10 text-white/40 rounded-full px-2 py-0.5">temp: {agent.temperature.toFixed(1)}</span>
        </div>
      </div>

      {/* Test chat */}
      <div className="flex-1 flex flex-col">
        <label className="text-xs text-white/40 mb-2">Test prompt</label>
        <textarea
          value={testPrompt}
          onChange={(e) => setTestPrompt(e.target.value)}
          rows={3}
          className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-white/25 focus:outline-none focus:border-blue-500 resize-none mb-3"
        />
        <button
          onClick={handleTest}
          disabled={loading || !agent.name}
          className="py-2 rounded-xl bg-white/10 hover:bg-white/15 disabled:opacity-40 text-sm text-white transition-colors mb-4"
        >
          {loading ? "Testing…" : "Test Agent"}
        </button>

        {response && (
          <div className="flex gap-2.5 bg-white/5 rounded-xl p-3 flex-1 overflow-y-auto">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-sm flex-shrink-0"
              style={{ backgroundColor: agent.color }}
            >
              {agent.name[0]?.toUpperCase() ?? "A"}
            </div>
            <div>
              <p className="text-xs font-semibold mb-1" style={{ color: agent.color }}>
                {agent.name}
              </p>
              <p className="text-sm text-white/70 whitespace-pre-wrap">{response}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
