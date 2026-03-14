// Auth
export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AppSession {
  user: {
    id: string;
    email: string;
    name: string;
    avatarUrl?: string;
  };
  expires: string;
}

// Rooms
export type RoomStatus = "active" | "archived" | "deleted";

export interface Room {
  id: string;
  name: string;
  description: string | null;
  ownerId: string;
  status: RoomStatus;
  agentIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Agents
export type AgentPersonality =
  | "analytical"
  | "creative"
  | "critical"
  | "pragmatic"
  | "empathetic"
  | "adversarial";

export interface Agent {
  id: string;
  name: string;
  role: string;
  description: string;
  personality: AgentPersonality;
  systemPrompt: string;
  avatarColor: string;
  isBuiltIn: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Chat Messages
export type MessageRole = "user" | "assistant" | "system";

export type MessageStatus = "pending" | "streaming" | "complete" | "error";

export interface ChatMessage {
  id: string;
  roomId: string;
  agentId: string | null;
  userId: string | null;
  role: MessageRole;
  content: string;
  status: MessageStatus;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
}

// Yjs / Collaboration
export interface YjsAwarenessState {
  userId: string;
  name: string;
  color: string;
  cursor?: { anchor: number; head: number } | null;
  mousePosition?: { x: number; y: number } | null;
  mode?: "document" | "code" | "whiteboard";
  status?: "active" | "idle" | "viewing";
  lastActiveAt?: number;
}

export type WebSocketMessageType =
  | "sync"
  | "awareness"
  | "auth"
  | "error"
  | "ping"
  | "pong";

export interface WebSocketMessage {
  type: WebSocketMessageType;
  payload?: unknown;
}
