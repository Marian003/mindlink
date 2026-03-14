"use client";

interface ActivityIndicatorProps {
  status: "active" | "idle" | "viewing";
  className?: string;
}

export function ActivityIndicator({ status, className = "" }: ActivityIndicatorProps) {
  const config = {
    active: { color: "bg-green-500", pulse: true, label: "Active" },
    idle: { color: "bg-yellow-500", pulse: false, label: "Idle" },
    viewing: { color: "bg-white/30", pulse: false, label: "Viewing" },
  }[status];

  return (
    <div className={`relative flex items-center justify-center w-3 h-3 ${className}`} title={config.label}>
      {config.pulse && (
        <span className="absolute inline-flex w-full h-full rounded-full bg-green-500 opacity-75 animate-ping" />
      )}
      <span className={`relative inline-flex rounded-full w-2 h-2 ${config.color}`} />
    </div>
  );
}
