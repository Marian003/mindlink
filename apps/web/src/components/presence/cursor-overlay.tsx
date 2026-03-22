"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Awareness } from "y-protocols/awareness";

interface RemoteCursor {
  clientId: number;
  userId: string;
  name: string;
  color: string;
  mousePosition: { x: number; y: number } | null;
  lastActiveAt: number;
}

interface CursorOverlayProps {
  awareness: Awareness | null;
  currentClientId?: number;
}

export function CursorOverlay({ awareness, currentClientId }: CursorOverlayProps) {
  const [cursors, setCursors] = useState<RemoteCursor[]>([]);

  useEffect(() => {
    if (!awareness) return;

    function update() {
      const now = Date.now();
      const states = awareness!.getStates();
      const remote: RemoteCursor[] = [];

      states.forEach((state, clientId) => {
        if (clientId === currentClientId) return;
        if (!state.mousePosition) return;
        if (now - (state.lastActiveAt ?? 0) > 5000) return; // fade after 5s

        remote.push({
          clientId,
          userId: state.userId ?? String(clientId),
          name: state.name ?? "Anonymous",
          color: state.color ?? "#3b82f6",
          mousePosition: state.mousePosition,
          lastActiveAt: state.lastActiveAt ?? now,
        });
      });

      setCursors(remote);
    }

    awareness.on("change", update);
    return () => awareness.off("change", update);
  }, [awareness, currentClientId]);

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      <AnimatePresence>
        {cursors.map((cursor) =>
          cursor.mousePosition ? (
            <motion.div
              key={cursor.clientId}
              style={{
                position: "absolute",
                left: cursor.mousePosition.x,
                top: cursor.mousePosition.y,
              }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.15 }}
            >
              {/* Cursor arrow */}
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M0 0L10 14L5.5 9.5L2 16L0 14L3 8.5L0 0Z"
                  fill={cursor.color}
                  stroke="white"
                  strokeWidth="0.5"
                />
              </svg>
              {/* Name label */}
              <div
                className="absolute left-4 top-0 px-2 py-0.5 rounded-md text-xs font-medium text-white whitespace-nowrap shadow-lg"
                style={{ backgroundColor: cursor.color }}
              >
                {cursor.name}
              </div>
            </motion.div>
          ) : null
        )}
      </AnimatePresence>
    </div>
  );
}
