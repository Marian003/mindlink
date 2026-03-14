"use client";

import { signOut } from "next-auth/react";
import { useState } from "react";

interface UserMenuProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export function UserMenu({ user }: UserMenuProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-full p-1 hover:bg-white/10 transition-colors"
      >
        {user.image ? (
          <img src={user.image} alt={user.name ?? ""} className="w-8 h-8 rounded-full" />
        ) : (
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-medium">
            {user.name?.[0] ?? "?"}
          </div>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-56 bg-[#1a1a1d] border border-white/10 rounded-xl shadow-xl z-20 overflow-hidden">
            <div className="px-4 py-3 border-b border-white/10">
              <p className="text-sm font-medium text-white">{user.name}</p>
              <p className="text-xs text-white/50">{user.email}</p>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="w-full text-left px-4 py-3 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors"
            >
              Sign out
            </button>
          </div>
        </>
      )}
    </div>
  );
}
