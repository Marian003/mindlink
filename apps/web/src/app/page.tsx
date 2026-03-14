import Link from "next/link";

const AGENTS = [
  { name: "Sage", role: "Senior Architect", color: "#3b82f6", emoji: "🏗️", quote: "Let's think through the trade-offs before we commit." },
  { name: "Spark", role: "Creative Ideator", color: "#f97316", emoji: "⚡", quote: "What if we threw out the rulebook entirely?!" },
  { name: "Lens", role: "Code Reviewer", color: "#22c55e", emoji: "🔍", quote: "Line 47: this will fail on empty arrays." },
  { name: "Atlas", role: "Project Manager", color: "#a855f7", emoji: "📋", quote: "What's the MVP here? Let's ship something first." },
  { name: "Echo", role: "User Researcher", color: "#ec4899", emoji: "💬", quote: "But what does the user actually need?" },
  { name: "Ghost", role: "Security Auditor", color: "#ef4444", emoji: "🛡️", quote: "This auth flow has a session fixation vulnerability." },
];

const MODES = [
  { icon: "📝", name: "Document", desc: "Collaborative rich text with AI commentary" },
  { icon: "💻", name: "Code", desc: "Monaco editor with real-time pair programming" },
  { icon: "💡", name: "Brainstorm", desc: "Shared whiteboard with AI sticky notes" },
  { icon: "🔍", name: "Code Review", desc: "Inline AI comments on every line" },
  { icon: "✍️", name: "Writing", desc: "Focus mode with AI editing suggestions" },
  { icon: "🏗️", name: "Architecture", desc: "Diagram canvas with AI critique" },
];

const STEPS = [
  { num: "01", title: "Create a room", desc: "Invite your team with a single link. No setup, no waiting." },
  { num: "02", title: "Add AI agents", desc: "Choose from 6 built-in specialists or build your own." },
  { num: "03", title: "Collaborate in real-time", desc: "Agents participate like team members — they read, react, and respond." },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white">
      {/* Nav */}
      <nav className="border-b border-white/5 px-6 py-4 flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-sm">M</div>
          <span className="font-semibold text-lg">MindLink</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/demo" className="text-sm text-white/50 hover:text-white transition-colors">
            Try Demo
          </Link>
          <Link
            href="/auth/signin"
            className="text-sm bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl transition-colors font-medium"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 py-28 text-center">
        <div className="inline-flex items-center gap-2 bg-blue-600/10 border border-blue-600/20 rounded-full px-4 py-1.5 mb-8">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
          <span className="text-xs text-blue-400 font-medium">Real-time collaboration with AI agents</span>
        </div>

        <h1 className="text-6xl font-bold leading-tight mb-6 tracking-tight">
          Your Team.{" "}
          <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Your Agents.
          </span>
          <br />
          Real-Time.
        </h1>

        <p className="text-xl text-white/50 mb-10 max-w-2xl mx-auto leading-relaxed">
          The first multiplayer workspace where humans and AI agents collaborate simultaneously.
          Not a chatbot — a team member.
        </p>

        <div className="flex items-center justify-center gap-4">
          <Link
            href="/auth/signin"
            className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-8 py-4 rounded-2xl transition-colors text-lg"
          >
            Launch Workspace →
          </Link>
          <Link
            href="/demo"
            className="border border-white/10 hover:border-white/20 text-white/70 hover:text-white px-8 py-4 rounded-2xl transition-colors text-lg"
          >
            Watch Demo
          </Link>
        </div>

        {/* Animated hero visual */}
        <div className="mt-20 relative mx-auto max-w-4xl">
          <div className="bg-[#111113] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
            {/* Fake workspace header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-[#0d0d0f]">
              <div className="flex items-center gap-2">
                {["document", "code", "brainstorm"].map((mode) => (
                  <span key={mode} className={`text-xs px-3 py-1 rounded-md ${mode === "document" ? "bg-white/10 text-white" : "text-white/30"}`}>
                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                  </span>
                ))}
              </div>
              <div className="flex gap-1.5">
                {AGENTS.slice(0, 3).map((a) => (
                  <div key={a.name} className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold" style={{ backgroundColor: a.color }}>
                    {a.name[0]}
                  </div>
                ))}
              </div>
            </div>

            {/* Fake editor */}
            <div className="flex min-h-[280px]">
              <div className="flex-1 p-6 text-left font-mono text-sm text-white/60">
                <p className="text-white mb-2">{"# API Design Review"}</p>
                <p className="mb-1">{"Should we use REST or GraphQL?"}</p>
                <p className="mb-4 opacity-50">{"..."}</p>
                <div className="space-y-3">
                  {[
                    { agent: "Sage", color: "#3b82f6", msg: "GraphQL introduces query complexity — REST is simpler to cache." },
                    { agent: "Spark", color: "#f97316", msg: "GraphQL! Real-time subscriptions are a game changer for this!" },
                    { agent: "Ghost", color: "#ef4444", msg: "GraphQL mutations need careful auth scope validation." },
                  ].map((m) => (
                    <div key={m.agent} className="flex gap-2 items-start">
                      <div className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-white" style={{ backgroundColor: m.color }}>
                        {m.agent[0]}
                      </div>
                      <span style={{ color: m.color }} className="text-xs font-semibold flex-shrink-0">{m.agent}:</span>
                      <span className="text-xs text-white/50">{m.msg}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-5xl mx-auto px-6 py-24">
        <h2 className="text-4xl font-bold text-center mb-16">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {STEPS.map((step) => (
            <div key={step.num} className="relative">
              <span className="text-6xl font-bold text-white/5 absolute -top-4 -left-2">{step.num}</span>
              <div className="relative">
                <h3 className="text-xl font-semibold text-white mb-3">{step.title}</h3>
                <p className="text-white/50 leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Agent Showcase */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <h2 className="text-4xl font-bold text-center mb-4">Meet Your AI Team</h2>
        <p className="text-white/40 text-center mb-16 text-lg">Six specialists. One workspace. All real-time.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {AGENTS.map((agent) => (
            <div
              key={agent.name}
              className="bg-[#111113] border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-colors group"
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                  style={{ backgroundColor: agent.color + "20", border: `1px solid ${agent.color}40` }}
                >
                  {agent.emoji}
                </div>
                <div>
                  <p className="font-semibold text-white">{agent.name}</p>
                  <p className="text-xs text-white/40">{agent.role}</p>
                </div>
              </div>
              <blockquote className="text-sm text-white/60 italic border-l-2 pl-3" style={{ borderColor: agent.color + "60" }}>
                "{agent.quote}"
              </blockquote>
            </div>
          ))}
        </div>
      </section>

      {/* Workspace Modes */}
      <section className="max-w-5xl mx-auto px-6 py-24">
        <h2 className="text-4xl font-bold text-center mb-4">Six Workspace Modes</h2>
        <p className="text-white/40 text-center mb-16 text-lg">One tool for every kind of collaborative work.</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {MODES.map((mode) => (
            <div key={mode.name} className="bg-[#111113] border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-colors">
              <span className="text-3xl mb-3 block">{mode.icon}</span>
              <h3 className="font-semibold text-white mb-1">{mode.name}</h3>
              <p className="text-sm text-white/40">{mode.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-3xl mx-auto px-6 py-24 text-center">
        <h2 className="text-4xl font-bold mb-6">Ready to collaborate differently?</h2>
        <p className="text-white/40 mb-10 text-lg">Create your first room in under 60 seconds.</p>
        <Link
          href="/auth/signin"
          className="inline-block bg-blue-600 hover:bg-blue-500 text-white font-semibold px-10 py-4 rounded-2xl transition-colors text-lg"
        >
          Launch Workspace →
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 px-6 py-8 max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-blue-600 flex items-center justify-center font-bold text-xs">M</div>
          <span className="text-white/40 text-sm">MindLink — MIT License</span>
        </div>
        <div className="flex items-center gap-4 text-sm text-white/30">
          <span>Built with Claude + GPT-4o + Groq</span>
        </div>
      </footer>
    </div>
  );
}
