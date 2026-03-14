"use client";

import { motion } from "framer-motion";

interface WelcomeModalProps {
  onStartTutorial: () => void;
  onSkip: () => void;
}

export function WelcomeModal({ onStartTutorial, onSkip }: WelcomeModalProps) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[#111113] border border-white/10 rounded-2xl p-8 max-w-md w-full shadow-2xl text-center"
      >
        <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center text-2xl mx-auto mb-5">
          🧠
        </div>
        <h2 className="text-2xl font-bold text-white mb-3">Welcome to MindLink</h2>
        <p className="text-white/50 leading-relaxed mb-8">
          A multiplayer workspace where you and your AI agents collaborate in real-time. Six specialists are ready to join your team.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onSkip}
            className="flex-1 py-3 border border-white/10 rounded-xl text-white/50 hover:text-white hover:border-white/20 transition-colors text-sm"
          >
            Jump In
          </button>
          <button
            onClick={onStartTutorial}
            className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl text-white font-medium transition-colors text-sm"
          >
            Start Tutorial →
          </button>
        </div>
      </motion.div>
    </div>
  );
}
