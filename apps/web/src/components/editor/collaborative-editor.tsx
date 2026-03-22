"use client";

import { useEffect, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Collaboration from "@tiptap/extension-collaboration";
import CollaborationCursor from "@tiptap/extension-collaboration-cursor";
import Placeholder from "@tiptap/extension-placeholder";
import Highlight from "@tiptap/extension-highlight";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { common, createLowlight } from "lowlight";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { Toolbar } from "./toolbar";

const lowlight = createLowlight(common);

const WS_URL = (process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:3001") + "/ws";

interface CollaborativeEditorProps {
  roomId: string;
  token?: string;
  userName?: string;
  userColor?: string;
  /** Optional: share an existing doc + provider from the parent to avoid a duplicate WS connection */
  doc?: Y.Doc;
  provider?: WebsocketProvider;
}

export function CollaborativeEditor({
  roomId,
  token,
  userName = "Anonymous",
  userColor = "#3b82f6",
  doc: externalDoc,
  provider: externalProvider,
}: CollaborativeEditorProps) {
  const [ydoc] = useState(() => externalDoc ?? new Y.Doc());
  const [provider, setProvider] = useState<WebsocketProvider | null>(externalProvider ?? null);
  const [connected, setConnected] = useState(false);

  // Only create our own connection if no external doc/provider was given
  useEffect(() => {
    if (externalDoc && externalProvider) {
      // Use external provider's status
      function onStatus({ status }: { status: string }) {
        setConnected(status === "connected");
      }
      externalProvider.on("status", onStatus);
      setConnected(externalProvider.wsconnected);
      return () => externalProvider.off("status", onStatus);
    }

    const params: Record<string, string> = { room: roomId };
    if (token) params.token = token;

    const p = new WebsocketProvider(WS_URL, roomId, ydoc, { params });

    p.on("status", ({ status }: { status: string }) => {
      setConnected(status === "connected");
    });

    setProvider(p);

    return () => {
      p.destroy();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId, token]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ history: false }),
      Collaboration.configure({ document: ydoc }),
      ...(provider
        ? [
            CollaborationCursor.configure({
              provider,
              user: { name: userName, color: userColor },
            }),
          ]
        : []),
      Placeholder.configure({ placeholder: "Start typing or @mention an agent…" }),
      Highlight,
      TaskList,
      TaskItem.configure({ nested: true }),
      CodeBlockLowlight.configure({ lowlight }),
    ],
    editorProps: {
      attributes: {
        class:
          "prose prose-invert prose-sm sm:prose-base max-w-none focus:outline-none min-h-[60vh] px-1",
      },
    },
  }, [provider]);

  return (
    <div className="flex flex-col h-full bg-[#0a0a0b]">
      <div className="flex items-center gap-2 px-4 py-2 border-b border-white/5">
        <div className={`w-2 h-2 rounded-full transition-colors ${connected ? "bg-green-500" : "bg-yellow-500 animate-pulse"}`} />
        <span className="text-xs text-white/30">{connected ? "Connected" : "Connecting…"}</span>
      </div>

      <Toolbar editor={editor} />

      <div className="flex-1 overflow-auto px-8 py-6">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
