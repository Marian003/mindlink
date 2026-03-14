"use client";

import { useState } from "react";
import { ExportDecisions } from "@/components/decisions/export-decisions";

interface RoomSettingsProps {
  room: { id: string; name: string; slug: string };
  onClose: () => void;
  isOwner: boolean;
}

export function RoomSettings({ room, onClose, isOwner }: RoomSettingsProps) {
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function generateShareLink() {
    setShareLink(`${window.location.origin}/invite/${room.slug}`);
  }

  async function handleDelete() {
    if (!confirm(`Delete "${room.name}"? This cannot be undone.`)) return;
    setDeleting(true);
    await fetch(`/api/rooms/${room.slug}`, { method: "DELETE" });
    window.location.href = "/dashboard";
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-[#111113] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-white">Room Settings</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white text-xl">×</button>
        </div>

        <div className="space-y-5">
          <div>
            <p className="text-xs text-white/40 mb-1">Room name</p>
            <p className="text-sm text-white font-medium">{room.name}</p>
          </div>

          <div>
            <p className="text-xs text-white/40 mb-2">Share link</p>
            {shareLink ? (
              <div className="flex gap-2">
                <input
                  readOnly
                  value={shareLink}
                  className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white font-mono"
                />
                <button
                  onClick={() => navigator.clipboard.writeText(shareLink)}
                  className="px-3 py-2 bg-white/10 hover:bg-white/15 rounded-lg text-xs text-white transition-colors"
                >
                  Copy
                </button>
              </div>
            ) : (
              <button
                onClick={generateShareLink}
                className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
              >
                Generate invite link →
              </button>
            )}
          </div>

          <div>
            <p className="text-xs text-white/40 mb-2">Export session</p>
            <ExportDecisions decisions={[]} />
          </div>

          {isOwner && (
            <div className="pt-4 border-t border-white/10">
              <p className="text-xs text-red-400/60 mb-2 uppercase tracking-wider font-semibold">Danger Zone</p>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="text-sm text-red-400 hover:text-red-300 transition-colors disabled:opacity-50"
              >
                {deleting ? "Deleting…" : "Delete this room"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
