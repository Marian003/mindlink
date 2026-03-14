import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:4444";

export function createProvider(
  doc: Y.Doc,
  roomId: string,
  token?: string
) {
  const params: Record<string, string> = { room: roomId };
  if (token) params.token = token;

  const provider = new WebsocketProvider(WS_URL, roomId, doc, {
    params,
    connect: false, // connect manually
  });

  return provider;
}
