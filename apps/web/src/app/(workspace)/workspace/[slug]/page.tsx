import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { UserMenu } from "@/components/auth/user-menu";
import { MemberList } from "@/components/room/member-list";
import { WorkspaceClient } from "@/components/workspace/workspace-client";

interface WorkspacePageProps {
  params: Promise<{ slug: string }>;
}

export default async function WorkspacePage({ params }: WorkspacePageProps) {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");

  const { slug } = await params;

  return (
    <div className="min-h-screen bg-[#0a0a0b] flex flex-col">
      <header className="border-b border-white/10 px-6 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <a href="/dashboard" className="text-white/50 hover:text-white transition-colors text-sm">
            ← Dashboard
          </a>
          <span className="text-white/20">/</span>
          <span className="text-white font-medium">{slug}</span>
        </div>
        <UserMenu user={session.user} />
      </header>

      <div className="flex flex-1 overflow-hidden">
        <main className="flex-1 overflow-hidden flex flex-col">
          <WorkspaceClient
            roomId={slug}
            userName={session.user?.name ?? "Anonymous"}
            userId={session.user?.id ?? "anonymous"}
          />
        </main>
        <aside className="w-64 border-l border-white/10 flex flex-col flex-shrink-0">
          <MemberList roomSlug={slug} currentUserId={session.user?.id ?? ""} />
        </aside>
      </div>
    </div>
  );
}
