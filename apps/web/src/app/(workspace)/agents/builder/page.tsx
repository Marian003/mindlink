import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AgentBuilder } from "@/components/agents/agent-builder";

export default async function AgentBuilderPage() {
  const session = await auth();
  if (!session) redirect("/auth/signin");

  return (
    <div className="min-h-screen bg-[#0a0a0b]">
      <header className="border-b border-white/10 px-6 py-4 flex items-center gap-4">
        <a href="/dashboard" className="text-white/50 hover:text-white text-sm transition-colors">
          ← Dashboard
        </a>
        <span className="text-white/20">/</span>
        <span className="text-white font-medium">Build an Agent</span>
      </header>
      <AgentBuilder userId={session.user?.id ?? ""} />
    </div>
  );
}
