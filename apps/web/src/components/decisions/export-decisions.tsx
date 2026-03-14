"use client";

import type { VoteSession } from "@/components/voting/vote-widget";

interface ExportDecisionsProps {
  decisions: Array<{
    id: string;
    topic: string;
    outcome: string;
    tally: Record<string, number>;
    closedAt: number;
    summary?: string;
  }>;
}

export function ExportDecisions({ decisions }: ExportDecisionsProps) {
  function exportAsMarkdown() {
    const md = decisions
      .map((d) => {
        const tally = Object.entries(d.tally)
          .map(([opt, count]) => `- ${opt}: **${count}**`)
          .join("\n");
        return `## ${d.topic}\n\n**Outcome:** ${d.outcome}\n\n${tally}${d.summary ? `\n\n> ${d.summary}` : ""}`;
      })
      .join("\n\n---\n\n");

    download(`# Decision Log\n\n${md}`, "decisions.md", "text/markdown");
  }

  function exportAsJSON() {
    download(JSON.stringify(decisions, null, 2), "decisions.json", "application/json");
  }

  function download(content: string, filename: string, type: string) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={exportAsMarkdown}
        className="text-xs px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
      >
        Export .md
      </button>
      <button
        onClick={exportAsJSON}
        className="text-xs px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
      >
        Export .json
      </button>
    </div>
  );
}
