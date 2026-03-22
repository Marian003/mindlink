import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { UserMenu } from "@/components/auth/user-menu";
import { RoomCard } from "@/components/room/room-card";
import { CreateRoomButton } from "@/components/room/create-room-button";

async function getRooms(userId: string) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/api/rooms`,
      { cache: "no-store", headers: { "x-user-id": userId } }
    );
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");

  const rooms = await getRooms(session.user?.id ?? "");

  return (
    <div className="min-h-screen bg-[#0a0a0b]">
      <header className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <span className="text-white font-bold text-sm">M</span>
          </div>
          <span className="text-white font-semibold">MindLink</span>
        </div>
        <UserMenu user={session.user} />
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">Your Rooms</h1>
            <p className="text-white/50">Collaborate with your team and AI agents in real-time.</p>
          </div>
          <CreateRoomButton />
        </div>

        {rooms.length === 0 ? (
          <div className="text-center py-24 border border-dashed border-white/10 rounded-2xl">
            <p className="text-white/40 text-lg mb-2">No rooms yet</p>
            <p className="text-white/25 text-sm">Create your first room to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rooms.map((room: any) => (
              <RoomCard key={room.id} room={room} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
