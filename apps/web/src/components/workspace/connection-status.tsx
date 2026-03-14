"use client";

import { motion, AnimatePresence } from "framer-motion";

interface ConnectionStatusProps {
  connected: boolean;
  reconnecting?: boolean;
}

export function ConnectionStatus({ connected, reconnecting }: ConnectionStatusProps) {
  if (connected) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-yellow-900/90 border border-yellow-600/40 text-yellow-300 px-4 py-2 rounded-full text-sm shadow-lg backdrop-blur-sm"
      >
        <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
        {reconnecting ? "Reconnecting…" : "Disconnected — check your connection"}
      </motion.div>
    </AnimatePresence>
  );
}
