"use client";

import { useEffect, useRef, useCallback } from "react";
import type { Awareness } from "y-protocols/awareness";

interface UseAwarenessOptions {
  awareness: Awareness | null;
  userId: string;
  name: string;
  color: string;
  mode?: "document" | "code" | "whiteboard";
}

export function useAwareness({
  awareness,
  userId,
  name,
  color,
  mode = "document",
}: UseAwarenessOptions) {
  const lastUpdateRef = useRef(0);

  const updateStatus = useCallback(
    (status: "active" | "idle" | "viewing") => {
      if (!awareness) return;
      awareness.setLocalStateField("status", status);
      awareness.setLocalStateField("lastActiveAt", Date.now());
    },
    [awareness]
  );

  useEffect(() => {
    if (!awareness) return;

    // Set initial awareness state
    awareness.setLocalState({
      userId,
      name,
      color,
      mode,
      status: "viewing",
      lastActiveAt: Date.now(),
    });

    // Track mouse position (throttled to 10 updates/sec)
    function onMouseMove(e: MouseEvent) {
      if (!awareness) return;
      const now = Date.now();
      if (now - lastUpdateRef.current < 100) return; // 10fps max
      lastUpdateRef.current = now;

      awareness.setLocalStateField("mousePosition", { x: e.clientX, y: e.clientY });
      awareness.setLocalStateField("status", "active");
      awareness.setLocalStateField("lastActiveAt", now);
    }

    // Idle detection
    let idleTimer: ReturnType<typeof setTimeout>;
    function resetIdle() {
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => updateStatus("idle"), 30_000);
    }

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("keydown", resetIdle);
    resetIdle();

    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("keydown", resetIdle);
      clearTimeout(idleTimer);
      awareness.setLocalState(null);
    };
  }, [awareness, userId, name, color, mode, updateStatus]);

  return { updateStatus };
}
