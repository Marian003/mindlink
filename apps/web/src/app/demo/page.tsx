"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { DEMO_SCRIPT, DEMO_CODE } from "@mindlink/agents";
import type { DemoAction } from "@mindlink/agents";

export default function DemoPage() {
  const [messages, setMessages] = useState<DemoAction[]>([]);
  const [playing, setPlaying] = useState(false);
  const [done, setDone] = useState(false);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  function startDemo() {
    setMessages([]);
    setDone(false);
    setPlaying(true);
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];

    DEMO_SCRIPT.forEach((action) => {
      const t = setTimeout(() => {
        setMessages((prev) => [...prev, action]);
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
      }, action.delay);
      timersRef.current.push(t);
    });

    const lastDelay = DEMO_SCRIPT[DEMO_SCRIPT.length - 1]?.delay ?? 0;
    const done = setTimeout(() => { setPlaying(false); setDone(true); }, lastDelay + 2000);
    timersRef.current.push(done);
  }

  function resetDemo() {
    timersRef.current.forEach(clearTimeout);
    setMessages([]);
    setPlaying(false);
    setDone(false);
  }

  useEffect(() => {
    startDemo();
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white">
      {/* Header */}
      <header className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-xs">M</div>
          <span className="font-semibold">MindLink</span>
          <span className="text-white/30 text-sm ml-2">/ Live Demo</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-white/30">Read-only — agents are scripted</span>
          <button
            onClick={resetDemo}
            className="text-xs px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 transition-colors"
          >
            ↺ Replay
          </button>
        </div>
      </header>

      {/* Demo workspace */}
      <div className="flex h-[calc(100vh-65px-80px)]">
        {/* Code pane */}
        <div className="flex-1 border-r border-white/10 overflow-auto">
          <div className="p-3 border-b border-white/10 flex items-center gap-2 bg-[#0d0d0f]">
            <span className="text-xs text-white/50">Code Review Mode</span>
            <span className="text-xs bg-orange-600/20 text-orange-400 rounded px-2 py-0.5">3 issues</span>
          </div>
          <pre className="p-6 text-sm font-mono text-white/60 leading-7 overflow-auto">
            <code>{DEMO_CODE}</code>
          </pre>
        </div>

        {/* Agent messages */}
        <div className="w-80 flex flex-col bg-[#0d0d0f] overflow-hidden">
          <div className="p-3 border-b border-white/10">
            <span className="text-xs font-semibold text-white/60 uppercase tracking-wider">Agent Review</span>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {messages.map((msg, i) => (
              <div key={i} className="flex gap-2.5">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 mt-0.5"
                  style={{ backgroundColor: msg.agentColor }}
                >
                  {msg.agentName[0]}
                </div>
                <div>
                  <p className="text-xs font-semibold mb-1" style={{ color: msg.agentColor }}>
                    {msg.agentName}
                  </p>
                  <p className="text-sm text-white/70 leading-relaxed">{msg.message}</p>
                </div>
              </div>
            ))}
            {playing && messages.length > 0 && (
              <div className="flex gap-1.5 items-center text-white/25 text-xs pl-9">
                <div className="w-1.5 h-1.5 rounded-full bg-white/30 animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-1.5 h-1.5 rounded-full bg-white/30 animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-1.5 h-1.5 rounded-full bg-white/30 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        </div>
      </div>

      {/* CTA bar */}
      <div className="h-20 border-t border-white/10 flex items-center justify-center gap-6 bg-[#0d0d0f]">
        <p className="text-white/50 text-sm">
          {done ? "Demo complete — this is what real collaboration looks like." : "AI agents reviewing your code in real-time…"}
        </p>
        <Link
          href="/auth/signin"
          className="bg-blue-600 hover:bg-blue-500 text-white font-medium px-6 py-2.5 rounded-xl transition-colors text-sm"
        >
          Create Your Own Room →
        </Link>
      </div>
    </div>
  );
}
