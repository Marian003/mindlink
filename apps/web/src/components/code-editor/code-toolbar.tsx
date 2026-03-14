"use client";

import { Copy, WrapText, Map } from "lucide-react";
import { LanguageSelector } from "./language-selector";

interface CodeToolbarProps {
  language: string;
  onLanguageChange: (lang: string) => void;
  wordWrap: boolean;
  onWordWrapToggle: () => void;
  minimap: boolean;
  onMinimapToggle: () => void;
  onCopy: () => void;
}

export function CodeToolbar({
  language, onLanguageChange,
  wordWrap, onWordWrapToggle,
  minimap, onMinimapToggle,
  onCopy,
}: CodeToolbarProps) {
  return (
    <div className="flex items-center gap-2 px-4 py-2 border-b border-white/10 bg-[#0f0f11]">
      <LanguageSelector value={language} onChange={onLanguageChange} />
      <div className="flex-1" />
      <button
        onClick={onWordWrapToggle}
        title="Toggle Word Wrap"
        className={`p-2 rounded-lg transition-colors ${wordWrap ? "bg-blue-600/30 text-blue-400" : "text-white/50 hover:text-white hover:bg-white/10"}`}
      >
        <WrapText className="w-4 h-4" />
      </button>
      <button
        onClick={onMinimapToggle}
        title="Toggle Minimap"
        className={`p-2 rounded-lg transition-colors ${minimap ? "bg-blue-600/30 text-blue-400" : "text-white/50 hover:text-white hover:bg-white/10"}`}
      >
        <Map className="w-4 h-4" />
      </button>
      <button
        onClick={onCopy}
        title="Copy All"
        className="p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors"
      >
        <Copy className="w-4 h-4" />
      </button>
    </div>
  );
}
