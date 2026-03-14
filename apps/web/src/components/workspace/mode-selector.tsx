"use client";

import { FileText, Code2, Lightbulb, Search, PenLine, GitBranch } from "lucide-react";

export type WorkspaceMode = "document" | "code" | "brainstorm" | "review" | "writing" | "architecture";

interface ModeSelectorProps {
  mode: WorkspaceMode;
  onChange: (mode: WorkspaceMode) => void;
}

const MODES = [
  { id: "document" as WorkspaceMode, label: "Document", icon: <FileText className="w-3.5 h-3.5" /> },
  { id: "code" as WorkspaceMode, label: "Code", icon: <Code2 className="w-3.5 h-3.5" /> },
  { id: "brainstorm" as WorkspaceMode, label: "Brainstorm", icon: <Lightbulb className="w-3.5 h-3.5" /> },
  { id: "review" as WorkspaceMode, label: "Review", icon: <Search className="w-3.5 h-3.5" /> },
  { id: "writing" as WorkspaceMode, label: "Writing", icon: <PenLine className="w-3.5 h-3.5" /> },
  { id: "architecture" as WorkspaceMode, label: "Architecture", icon: <GitBranch className="w-3.5 h-3.5" /> },
];

export function ModeSelector({ mode, onChange }: ModeSelectorProps) {
  return (
    <div className="flex items-center gap-0.5 bg-white/5 rounded-lg p-1">
      {MODES.map((m) => (
        <button
          key={m.id}
          onClick={() => onChange(m.id)}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${
            mode === m.id
              ? "bg-white/10 text-white shadow-sm"
              : "text-white/40 hover:text-white/70"
          }`}
        >
          {m.icon}
          <span className="hidden sm:inline">{m.label}</span>
        </button>
      ))}
    </div>
  );
}
