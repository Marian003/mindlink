import Link from "next/link";

interface Room {
  id: string;
  name: string;
  slug: string;
  updatedAt: string;
  _count?: { members: number };
  members?: Array<{ user: { name: string; avatarUrl?: string } }>;
}

interface RoomCardProps {
  room: Room;
}

export function RoomCard({ room }: RoomCardProps) {
  const memberCount = room._count?.members ?? room.members?.length ?? 0;
  const updatedAt = new Date(room.updatedAt);
  const timeAgo = formatTimeAgo(updatedAt);

  return (
    <Link
      href={`/workspace/${room.slug}`}
      className="block bg-[#111113] border border-white/10 rounded-2xl p-5 hover:border-white/20 hover:bg-[#18181b] transition-all group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-600/30 flex items-center justify-center">
          <span className="text-blue-400 font-bold text-lg">{room.name[0]?.toUpperCase()}</span>
        </div>
        <span className="text-xs text-white/30 group-hover:text-white/50 transition-colors">
          {timeAgo}
        </span>
      </div>
      <h3 className="text-white font-semibold mb-1 group-hover:text-blue-300 transition-colors">
        {room.name}
      </h3>
      <p className="text-sm text-white/40">{memberCount} member{memberCount !== 1 ? "s" : ""}</p>
    </Link>
  );
}

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}
