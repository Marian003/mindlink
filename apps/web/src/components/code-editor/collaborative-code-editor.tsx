"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { MonacoBinding } from "y-monaco";
import type { editor as MonacoEditor } from "monaco-editor";
import { CodeToolbar } from "./code-toolbar";

// Dynamic import — Monaco must not SSR
const MonacoEditorComponent = dynamic(
  () => import("@monaco-editor/react").then((m) => m.default),
  { ssr: false, loading: () => (
    <div className="flex-1 flex items-center justify-center bg-[#1e1e1e]">
      <div className="text-white/30 text-sm">Loading editor…</div>
    </div>
  )}
);

const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:4444";

interface CollaborativeCodeEditorProps {
  roomId: string;
  token?: string;
  userName?: string;
  userColor?: string;
  readOnly?: boolean;
}

export function CollaborativeCodeEditor({
  roomId,
  token,
  userName = "Anonymous",
  userColor = "#3b82f6",
  readOnly = false,
}: CollaborativeCodeEditorProps) {
  const [language, setLanguage] = useState("typescript");
  const [wordWrap, setWordWrap] = useState(false);
  const [minimap, setMinimap] = useState(false);
  const [connected, setConnected] = useState(false);

  const ydocRef = useRef<Y.Doc | null>(null);
  const providerRef = useRef<WebsocketProvider | null>(null);
  const bindingRef = useRef<MonacoBinding | null>(null);
  const editorRef = useRef<MonacoEditor.IStandaloneCodeEditor | null>(null);

  useEffect(() => {
    const ydoc = new Y.Doc();
    ydocRef.current = ydoc;

    const params: Record<string, string> = { room: `${roomId}-code` };
    if (token) params.token = token;

    const provider = new WebsocketProvider(WS_URL, `${roomId}-code`, ydoc, { params });
    providerRef.current = provider;

    provider.on("status", ({ status }: { status: string }) => {
      setConnected(status === "connected");
    });

    return () => {
      bindingRef.current?.destroy();
      provider.destroy();
      ydoc.destroy();
    };
  }, [roomId, token]);

  function handleEditorDidMount(editor: MonacoEditor.IStandaloneCodeEditor) {
    editorRef.current = editor;

    if (ydocRef.current && providerRef.current) {
      const yText = ydocRef.current.getText("code");
      const binding = new MonacoBinding(
        yText,
        editor.getModel()!,
        new Set([editor]),
        providerRef.current.awareness
      );
      bindingRef.current = binding;
    }
  }

  function handleCopy() {
    const value = editorRef.current?.getValue() ?? "";
    navigator.clipboard.writeText(value).catch(() => {});
  }

  return (
    <div className="flex flex-col h-full bg-[#0a0a0b]">
      <div className="flex items-center gap-2 px-4 py-2 border-b border-white/5">
        <div className={`w-2 h-2 rounded-full ${connected ? "bg-green-500" : "bg-yellow-500 animate-pulse"}`} />
        <span className="text-xs text-white/30">{connected ? "Connected" : "Connecting…"}</span>
      </div>

      <CodeToolbar
        language={language}
        onLanguageChange={setLanguage}
        wordWrap={wordWrap}
        onWordWrapToggle={() => setWordWrap(!wordWrap)}
        minimap={minimap}
        onMinimapToggle={() => setMinimap(!minimap)}
        onCopy={handleCopy}
      />

      <div className="flex-1 overflow-hidden">
        <MonacoEditorComponent
          height="100%"
          language={language}
          theme="vs-dark"
          onMount={handleEditorDidMount}
          options={{
            readOnly,
            wordWrap: wordWrap ? "on" : "off",
            minimap: { enabled: minimap },
            fontSize: 14,
            lineNumbers: "on",
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            insertSpaces: true,
            renderWhitespace: "selection",
            smoothScrolling: true,
            cursorBlinking: "smooth",
          }}
        />
      </div>
    </div>
  );
}
