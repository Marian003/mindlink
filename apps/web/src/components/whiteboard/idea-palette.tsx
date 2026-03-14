"use client";

const PALETTE_ITEMS = [
  { icon: "💡", label: "Idea", color: "#eab308" },
  { icon: "✅", label: "Pro", color: "#22c55e" },
  { icon: "❌", label: "Con", color: "#ef4444" },
  { icon: "❓", label: "Question", color: "#3b82f6" },
  { icon: "🎯", label: "Goal", color: "#a855f7" },
  { icon: "⚠️", label: "Risk", color: "#f97316" },
];

export function IdeaPalette() {
  return (
    <div className="flex flex-col gap-2 p-3 bg-[#0d0d0f] border-r border-white/10">
      <p className="text-xs text-white/30 uppercase tracking-wider font-semibold px-1">Ideas</p>
      {PALETTE_ITEMS.map((item) => (
        <button
          key={item.label}
          title={item.label}
          className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-white/10 transition-colors group"
        >
          <span className="text-xl">{item.icon}</span>
          <span className="text-xs text-white/40 group-hover:text-white/70">{item.label}</span>
        </button>
      ))}
    </div>
  );
}
