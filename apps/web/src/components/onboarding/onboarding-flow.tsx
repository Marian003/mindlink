"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const STEPS = [
  {
    id: "workspace",
    title: "Welcome to your workspace",
    description: "This is where you write, code, and brainstorm. Everything syncs in real-time with your team.",
    target: "editor",
  },
  {
    id: "agents",
    title: "Meet your AI agents",
    description: "Sage, Spark, Lens, Atlas, Echo, and Ghost are here to help. Each has a unique specialty.",
    target: "agent-panel",
  },
  {
    id: "mention",
    title: "Talk to an agent",
    description: 'Type @Sage in the editor to ask a question. Agents respond directly in the panel.',
    target: "editor",
  },
  {
    id: "modes",
    title: "Switch workspace modes",
    description: "Use the mode selector to switch between Document, Code, Brainstorm, and more.",
    target: "mode-selector",
  },
  {
    id: "invite",
    title: "Invite your team",
    description: "Share your room link to collaborate with teammates in real-time.",
    target: "header",
  },
];

interface OnboardingFlowProps {
  onComplete: () => void;
}

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [step, setStep] = useState(0);
  const current = STEPS[step];

  function next() {
    if (step < STEPS.length - 1) setStep(step + 1);
    else onComplete();
  }

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 pointer-events-auto" onClick={() => {}} />

      {/* Tooltip card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 16, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.95 }}
          transition={{ duration: 0.25 }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 bg-[#1a1a1d] border border-white/15 rounded-2xl p-6 shadow-2xl w-80 pointer-events-auto"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-white/30 font-medium">
              Step {step + 1} of {STEPS.length}
            </span>
            <button
              onClick={onComplete}
              className="text-xs text-white/30 hover:text-white transition-colors"
            >
              Skip tutorial
            </button>
          </div>

          <h3 className="text-base font-semibold text-white mb-2">{current.title}</h3>
          <p className="text-sm text-white/50 leading-relaxed mb-5">{current.description}</p>

          {/* Progress dots */}
          <div className="flex items-center gap-1.5 mb-5">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-1 rounded-full transition-all ${
                  i === step ? "w-6 bg-blue-500" : i < step ? "w-2 bg-white/30" : "w-2 bg-white/10"
                }`}
              />
            ))}
          </div>

          <button
            onClick={next}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl transition-colors text-sm"
          >
            {step < STEPS.length - 1 ? "Next →" : "Get Started!"}
          </button>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
