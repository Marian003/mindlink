"use client";

import { motion } from "framer-motion";
import React from "react";

interface AgentAvatarProps {
  name: string;
  color: string;
  role?: string;
  thinking?: boolean;
  size?: "sm" | "md" | "lg";
}

const ROLE_ICONS: Record<string, string> = {
  "Senior Architect": "🏗️",
  "Creative Ideator": "⚡",
  "Code Reviewer": "🔍",
  "Project Manager": "📋",
  "User Researcher": "💬",
  "Security Auditor": "🛡️",
};

export function AgentAvatar({ name, color, role, thinking, size = "md" }: AgentAvatarProps) {
  const sizes = { sm: "w-6 h-6 text-xs", md: "w-8 h-8 text-sm", lg: "w-10 h-10 text-base" };
  const icon = role ? ROLE_ICONS[role] : null;

  return (
    <div className="relative flex-shrink-0">
      <motion.div
        className={`${sizes[size]} rounded-full flex items-center justify-center font-semibold text-white ring-2`}
        style={{ backgroundColor: color, ["--tw-ring-color" as string]: color } as React.CSSProperties}
        animate={thinking ? { opacity: [1, 0.5, 1] } : { opacity: 1 }}
        transition={thinking ? { duration: 1.2, repeat: Infinity, ease: "easeInOut" } : {}}
      >
        {name[0]?.toUpperCase()}
      </motion.div>
      {icon && (
        <span className="absolute -bottom-0.5 -right-0.5 text-[10px] leading-none bg-[#0a0a0b] rounded-full p-0.5">
          {icon}
        </span>
      )}
    </div>
  );
}
