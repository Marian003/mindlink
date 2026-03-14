"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import * as Y from "yjs";

const MonacoEditor = dynamic(
  () => import("@monaco-editor/react").then((m) => m.default),
  { ssr: false }
);

export interface ReviewComment {
  id: string;
  authorId: string;
  authorName: string;
  authorType: "human" | "agent";
  agentId?: string;
  agentColor?: string;
  content: string;
  timestamp: number;
  status: "open" | "resolved";
  line: number;
  replies?: ReviewComment[];
}

interface ReviewModeProps {
  doc: Y.Doc | null;
  code?: string;
  language?: string;
}

export function ReviewMode({ doc, code = "", language = "typescript" }: ReviewModeProps) {
  const [comments, setComments] = useState<Map<number, ReviewComment[]>>(new Map());
  const [selectedLine, setSelectedLine] = useState<number | null>(null);
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    if (!doc) return;
    const yComments = doc.getMap<ReviewComment[]>("review-comments");

    function update() {
      const map = new Map<number, ReviewComment[]>();
      yComments.forEach((val, key) => {
        map.set(Number(key), val);
      });
      setComments(map);
    }

    yComments.observe(update);
    update();
    return () => yComments.unobserve(update);
  }, [doc]);

  function addComment(line: number, content: string) {
    if (!doc || !content.trim()) return;
    const yComments = doc.getMap<ReviewComment[]>("review-comments");
    const existing = yComments.get(String(line)) ?? [];
    const comment: ReviewComment = {
      id: Math.random().toString(36).slice(2),
      authorId: "current-user",
      authorName: "You",
      authorType: "human",
      content,
      timestamp: Date.now(),
      status: "open",
      line,
    };
    yComments.set(String(line), [...existing, comment]);
    setNewComment("");
    setSelectedLine(null);
  }

  const openCount = Array.from(comments.values()).flat().filter((c) => c.status === "open").length;
  const resolvedCount = Array.from(comments.values()).flat().filter((c) => c.status === "resolved").length;

  return (
    <div className="flex flex-col h-full">
      {/* Summary bar */}
      <div className="flex items-center gap-4 px-4 py-2 border-b border-white/10 bg-[#0d0d0f] text-xs text-white/50">
        <span>💬 {openCount} open</span>
        <span>✅ {resolvedCount} resolved</span>
        <span className="text-white/20">|</span>
        <span>Click any line to comment</span>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Code pane */}
        <div className="flex-1 overflow-hidden">
          <MonacoEditor
            height="100%"
            language={language}
            value={code}
            theme="vs-dark"
            options={{
              readOnly: true,
              lineNumbers: "on",
              glyphMargin: true,
              minimap: { enabled: false },
              automaticLayout: true,
              scrollBeyondLastLine: false,
              fontSize: 13,
            }}
            onMount={(editor) => {
              editor.onMouseDown((e) => {
                const line = e.target.position?.lineNumber;
                if (line) setSelectedLine(line);
              });
            }}
          />
        </div>

        {/* Comments pane */}
        <div className="w-80 border-l border-white/10 flex flex-col bg-[#0d0d0f] overflow-y-auto">
          <div className="p-3 border-b border-white/10">
            <p className="text-xs font-semibold text-white/60 uppercase tracking-wider">
              Review Comments
            </p>
          </div>

          {selectedLine && (
            <div className="p-3 border-b border-white/10 bg-blue-600/10">
              <p className="text-xs text-white/50 mb-2">Comment on line {selectedLine}:</p>
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment…"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/25 focus:outline-none focus:border-blue-500 resize-none"
                rows={3}
                autoFocus
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => setSelectedLine(null)}
                  className="text-xs text-white/40 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={() => addComment(selectedLine, newComment)}
                  className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded-md transition-colors"
                >
                  Comment
                </button>
              </div>
            </div>
          )}

          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {Array.from(comments.entries())
              .sort(([a], [b]) => a - b)
              .map(([line, lineComments]) => (
                <div key={line} className="bg-white/5 rounded-lg p-3 border border-white/10">
                  <p className="text-xs text-white/30 mb-2">Line {line}</p>
                  {lineComments.map((comment) => (
                    <div key={comment.id} className="mb-2">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span
                          className="text-xs font-semibold"
                          style={{ color: comment.agentColor ?? "#fff" }}
                        >
                          {comment.authorName}
                        </span>
                        {comment.authorType === "agent" && (
                          <span className="text-[10px] bg-white/10 text-white/50 rounded px-1">AI</span>
                        )}
                      </div>
                      <p className="text-xs text-white/70">{comment.content}</p>
                    </div>
                  ))}
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
