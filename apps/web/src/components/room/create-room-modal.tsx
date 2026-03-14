"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ROOM_TEMPLATES } from "@mindlink/agents";

interface CreateRoomModalProps {
  open: boolean;
  onClose: () => void;
}

function toSlug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

type Tab = "new" | "template";

export function CreateRoomModal({ open, onClose }: CreateRoomModalProps) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("new");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const previewSlug = toSlug(name);

  if (!open) return null;

  async function createRoom(roomName: string) {
    if (!roomName.trim()) { setError("Name is required"); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: roomName.trim() }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Failed to create room");
        return;
      }
      const room = await res.json();
      router.push(`/workspace/${room.slug}`);
      onClose();
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-[#111113] border border-white/10 rounded-2xl p-6 w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-white">Create a Room</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white text-xl leading-none">×</button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-5 bg-white/5 rounded-xl p-1">
          {(["new", "template"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                tab === t ? "bg-white/10 text-white" : "text-white/40 hover:text-white"
              }`}
            >
              {t === "new" ? "New Room" : "From Template"}
            </button>
          ))}
        </div>

        {tab === "new" && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-white/60 mb-2">Room Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && createRoom(name)}
                placeholder="e.g. Sprint Planning Q2"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/25 focus:outline-none focus:border-blue-500 transition-colors"
                autoFocus
              />
            </div>

            {name && (
              <div className="bg-white/5 rounded-lg px-4 py-3">
                <p className="text-xs text-white/40 mb-1">Shareable link</p>
                <p className="text-sm text-white/70 font-mono">
                  /workspace/<span className="text-blue-400">{previewSlug}-xxxxx</span>
                </p>
              </div>
            )}

            {error && <p className="text-sm text-red-400">{error}</p>}

            <div className="flex gap-3 pt-2">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 text-white/60 hover:text-white hover:border-white/20 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => createRoom(name)}
                disabled={loading || !name.trim()}
                className="flex-1 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium transition-colors"
              >
                {loading ? "Creating…" : "Create Room"}
              </button>
            </div>
          </div>
        )}

        {tab === "template" && (
          <div className="space-y-3">
            {error && <p className="text-sm text-red-400 mb-2">{error}</p>}
            {ROOM_TEMPLATES.map((template) => (
              <button
                key={template.name}
                disabled={loading}
                onClick={() => createRoom(template.name)}
                className="w-full text-left p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all disabled:opacity-50 group"
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{template.icon}</span>
                  <div>
                    <p className="font-medium text-white text-sm group-hover:text-blue-300 transition-colors">
                      {template.name}
                    </p>
                    <p className="text-xs text-white/40 mt-0.5">{template.description}</p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      <span className="text-[10px] bg-white/10 text-white/50 rounded px-1.5 py-0.5">
                        {template.defaultMode}
                      </span>
                      {template.agentSlugs.map((slug) => (
                        <span key={slug} className="text-[10px] bg-white/10 text-white/50 rounded px-1.5 py-0.5">
                          {slug}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
