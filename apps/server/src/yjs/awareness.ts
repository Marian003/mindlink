export const AWARENESS_COLORS = [
  "#3b82f6", // blue
  "#f97316", // orange
  "#22c55e", // green
  "#a855f7", // purple
  "#ec4899", // pink
  "#ef4444", // red
  "#eab308", // yellow
  "#14b8a6", // teal
  "#6366f1", // indigo
  "#f43f5e", // rose
];

export function assignColor(connectionOrder: number): string {
  return AWARENESS_COLORS[connectionOrder % AWARENESS_COLORS.length];
}

export interface AwarenessUser {
  userId: string;
  name: string;
  color: string;
  cursor?: { anchor: number; head: number } | null;
  mousePosition?: { x: number; y: number } | null;
  mode?: "document" | "code" | "whiteboard";
  status?: "active" | "idle" | "viewing";
  lastActiveAt?: number;
}
