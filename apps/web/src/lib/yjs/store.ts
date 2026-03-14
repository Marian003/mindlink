"use client";

import { create } from "zustand";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { createProvider } from "./provider";

interface YjsStore {
  doc: Y.Doc | null;
  provider: WebsocketProvider | null;
  connected: boolean;
  connect: (roomId: string, token?: string) => void;
  disconnect: () => void;
  getDoc: () => Y.Doc | null;
  getAwareness: () => import("y-protocols/awareness").Awareness | null;
}

export const useYjsStore = create<YjsStore>((set, get) => ({
  doc: null,
  provider: null,
  connected: false,

  connect: (roomId, token) => {
    const { provider: existingProvider } = get();
    if (existingProvider) existingProvider.destroy();

    const doc = new Y.Doc();
    const provider = createProvider(doc, roomId, token);

    provider.on("status", ({ status }: { status: string }) => {
      set({ connected: status === "connected" });
    });

    provider.connect();
    set({ doc, provider, connected: false });
  },

  disconnect: () => {
    const { provider } = get();
    if (provider) {
      provider.disconnect();
      provider.destroy();
    }
    set({ doc: null, provider: null, connected: false });
  },

  getDoc: () => get().doc,

  getAwareness: () => get().provider?.awareness ?? null,
}));
