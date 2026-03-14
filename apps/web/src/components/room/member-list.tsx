"use client";

import { useEffect, useState } from "react";

interface Member {
  id: string;
  role: "OWNER" | "MEMBER";
  user: { id: string; name: string; avatarUrl?: string; email?: string };
}

interface MemberListProps {
  roomSlug: string;
  currentUserId: string;
}

export function MemberList({ roomSlug, currentUserId }: MemberListProps) {
  const [members, setMembers] = useState<Member[]>([]);

  useEffect(() => {
    fetch(`/api/rooms/${roomSlug}`)
      .then((r) => r.json())
      .then((room) => setMembers(room.members ?? []))
      .catch(() => {});
  }, [roomSlug]);

  return (
    <div className="p-4">
      <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">
        Members ({members.length})
      </h3>
      <div className="space-y-2">
        {members.map((m) => (
          <div key={m.id} className="flex items-center gap-2.5">
            <div className="relative">
              {m.user.avatarUrl ? (
                <img src={m.user.avatarUrl} alt="" className="w-7 h-7 rounded-full" />
              ) : (
                <div className="w-7 h-7 rounded-full bg-blue-600/40 flex items-center justify-center text-xs text-blue-300 font-medium">
                  {m.user.name?.[0]?.toUpperCase() ?? "?"}
                </div>
              )}
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-[#0a0a0b]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white truncate">
                {m.user.name}
                {m.user.id === currentUserId && <span className="text-white/30 ml-1">(you)</span>}
              </p>
              {m.role === "OWNER" && <p className="text-xs text-white/30">Owner</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
