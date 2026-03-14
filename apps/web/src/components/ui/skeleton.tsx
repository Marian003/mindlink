export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse bg-white/5 rounded-lg ${className}`}
    />
  );
}

export function RoomCardSkeleton() {
  return (
    <div className="bg-[#111113] border border-white/10 rounded-2xl p-5">
      <Skeleton className="w-10 h-10 rounded-xl mb-4" />
      <Skeleton className="w-3/4 h-4 mb-2" />
      <Skeleton className="w-1/3 h-3" />
    </div>
  );
}

export function MessageSkeleton() {
  return (
    <div className="flex gap-2.5 py-3 px-4">
      <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="w-24 h-3" />
        <Skeleton className="w-full h-4" />
        <Skeleton className="w-3/4 h-4" />
      </div>
    </div>
  );
}
