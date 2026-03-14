"use client";

import { useState, useEffect } from "react";
import * as Y from "yjs";
import type { VoteSession } from "@/components/voting/vote-widget";

interface DecisionEntry {
  id: string;
  topic: string;
  outcome: string;
  tally: Record<string, number>;
  closedAt: number;
  summary?: string;
}

interface DecisionLogProps {
  doc: Y.Doc | null;
}

export function DecisionLog({ doc }: DecisionLogProps) {
  const [decisions, setDecisions] = useState<DecisionEntry[]>([]);

  useEffect(() => {
    if (!doc) return;
    const yDecisions = doc.getArray<DecisionEntry>("decisions");

    function update() {
      setDecisions(yDecisions.toArray().slice().reverse());
    }

    yDecisions.observe(update);
    update();
    return () => yDecisions.unobserve(update);
  }, [doc]);

  function exportMarkdown() {
    const md = decisions
      .map((d) => {
        const tally = Object.entries(d.tally)
          .map(([opt, count]) => `  - ${opt}: ${count} votes`)
          .join("\n");
        return `## ${d.topic}\n**Outcome:** ${d.outcome}\n**Date:** ${new Date(d.closedAt).toLocaleDateString()}\n\n${tally}${d.summary ? `\n\n**Summary:** ${d.summary}` : ""}`;
      })
      .join("\n\n---\n\n");

    const blob = new Blob([`# Decision Log\n\n${md}`], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "decisions.md";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex flex-col h-full bg-[#0d0d0f]">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <h3 className="text-sm font-semibold text-white">Decision Log</h3>
        {decisions.length > 0 && (
          <button
            onClick={exportMarkdown}
            className="text-xs text-white/40 hover:text-white transition-colors"
          >
            Export .md
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {decisions.length === 0 ? (
          <p className="text-center text-white/25 text-xs py-8">No decisions yet.</p>
        ) : (
          decisions.map((d) => (
            <div key={d.id} className="bg-white/5 border border-white/10 rounded-xl p-3">
              <p className="text-sm font-medium text-white mb-1">{d.topic}</p>
              <p className="text-xs text-green-400 mb-2">✓ {d.outcome}</p>
              <div className="space-y-0.5 mb-2">
                {Object.entries(d.tally).map(([opt, count]) => (
                  <p key={opt} className="text-xs text-white/40">
                    {opt}: {count} vote{count !== 1 ? "s" : ""}
                  </p>
                ))}
              </div>
              {d.summary && <p className="text-xs text-white/50 italic">{d.summary}</p>}
              <p className="text-xs text-white/20 mt-2">
                {new Date(d.closedAt).toLocaleDateString()}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
