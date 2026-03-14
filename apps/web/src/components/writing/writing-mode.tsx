"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Collaboration from "@tiptap/extension-collaboration";
import CollaborationCursor from "@tiptap/extension-collaboration-cursor";
import Placeholder from "@tiptap/extension-placeholder";
import Highlight from "@tiptap/extension-highlight";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import { useEffect, useState } from "react";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { Toolbar } from "@/components/editor/toolbar";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:4444";

interface WritingModeProps {
  roomId: string;
  userName: string;
  userColor: string;
  token?: string;
}

function countWords(text: string) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function readingTime(words: number) {
  return Math.max(1, Math.ceil(words / 200));
}

export function WritingMode({ roomId, userName, userColor, token }: WritingModeProps) {
  const [ydoc] = useState(() => new Y.Doc());
  const [provider, setProvider] = useState<WebsocketProvider | null>(null);
  const [focusMode, setFocusMode] = useState(false);
  const [wordCount, setWordCount] = useState(0);

  useEffect(() => {
    const params: Record<string, string> = { room: `${roomId}-writing` };
    if (token) params.token = token;
    const p = new WebsocketProvider(WS_URL, `${roomId}-writing`, ydoc, { params });
    setProvider(p);
    return () => p.destroy();
  }, [roomId, token, ydoc]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ history: false }),
      Collaboration.configure({ document: ydoc }),
      ...(provider ? [CollaborationCursor.configure({ provider, user: { name: userName, color: userColor } })] : []),
      Placeholder.configure({ placeholder: "Start writing…" }),
      Highlight,
      TaskList,
      TaskItem.configure({ nested: true }),
    ],
    onUpdate: ({ editor }) => {
      setWordCount(countWords(editor.getText()));
    },
    editorProps: {
      attributes: {
        class: `prose prose-invert prose-lg max-w-2xl mx-auto focus:outline-none min-h-[60vh] px-1 ${
          focusMode ? "focus-mode" : ""
        }`,
      },
    },
  }, [provider]);

  // Outline: extract headings
  const outline: { level: number; text: string }[] = [];
  if (editor) {
    editor.state.doc.forEach((node) => {
      if (node.type.name === "heading") {
        outline.push({ level: node.attrs.level, text: node.textContent });
      }
    });
  }

  return (
    <div className="flex h-full bg-[#0a0a0b]">
      {/* Outline sidebar */}
      {outline.length > 0 && (
        <div className="w-48 border-r border-white/10 p-4 overflow-y-auto flex-shrink-0">
          <p className="text-xs text-white/30 uppercase tracking-wider font-semibold mb-3">Outline</p>
          <div className="space-y-1">
            {outline.map((item, i) => (
              <button
                key={i}
                className="block text-left text-xs text-white/50 hover:text-white transition-colors truncate w-full"
                style={{ paddingLeft: `${(item.level - 1) * 8}px` }}
              >
                {item.text}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Editor */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <div className="flex items-center gap-2 flex-shrink-0">
          <Toolbar editor={editor} />
          <button
            onClick={() => setFocusMode(!focusMode)}
            className={`mr-4 text-xs px-3 py-1.5 rounded-lg transition-colors ${
              focusMode ? "bg-blue-600/30 text-blue-400" : "text-white/30 hover:text-white"
            }`}
          >
            {focusMode ? "Exit Focus" : "Focus Mode"}
          </button>
        </div>

        <div className="flex-1 overflow-auto px-8 py-10">
          <EditorContent editor={editor} />
        </div>

        {/* Word count bar */}
        <div className="flex items-center gap-4 px-6 py-2 border-t border-white/10 text-xs text-white/30 flex-shrink-0">
          <span>{wordCount} words</span>
          <span>{readingTime(wordCount)} min read</span>
        </div>
      </div>
    </div>
  );
}
