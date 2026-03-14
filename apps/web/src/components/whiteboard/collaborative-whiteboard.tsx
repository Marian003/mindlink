"use client";

import { useCallback, useRef, useState } from "react";

interface StickyNote {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
  width: number;
}

const NOTE_COLORS = [
  "#fef08a", // yellow
  "#86efac", // green
  "#93c5fd", // blue
  "#f9a8d4", // pink
  "#fdba74", // orange
  "#c4b5fd", // purple
];

function randomColor() {
  return NOTE_COLORS[Math.floor(Math.random() * NOTE_COLORS.length)];
}

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

interface CollaborativeWhiteboardProps {
  roomId: string;
  token?: string;
  /** Called when an external item is drag-dropped onto the board */
  onExternalDrop?: (text: string, x: number, y: number) => void;
}

export function CollaborativeWhiteboard({ roomId, onExternalDrop }: CollaborativeWhiteboardProps) {
  const [notes, setNotes] = useState<StickyNote[]>([
    { id: "welcome", text: "Double-click the board to add a note", x: 60, y: 60, color: "#fef08a", width: 200 },
  ]);
  const [editing, setEditing] = useState<string | null>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const dragging = useRef<{ id: string; ox: number; oy: number } | null>(null);

  // Create note on double-click of the board background
  const handleBoardDblClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement) !== boardRef.current) return;
    const rect = boardRef.current!.getBoundingClientRect();
    const newNote: StickyNote = {
      id: uid(),
      text: "",
      x: e.clientX - rect.left - 100,
      y: e.clientY - rect.top - 60,
      color: randomColor(),
      width: 200,
    };
    setNotes((n) => [...n, newNote]);
    setEditing(newNote.id);
  }, []);

  const addNote = useCallback(() => {
    const newNote: StickyNote = {
      id: uid(),
      text: "",
      x: 80 + Math.random() * 200,
      y: 80 + Math.random() * 150,
      color: randomColor(),
      width: 200,
    };
    setNotes((n) => [...n, newNote]);
    setEditing(newNote.id);
  }, []);

  const deleteNote = useCallback((id: string) => {
    setNotes((n) => n.filter((note) => note.id !== id));
    setEditing((e) => (e === id ? null : e));
  }, []);

  const updateText = useCallback((id: string, text: string) => {
    setNotes((n) => n.map((note) => (note.id === id ? { ...note, text } : note)));
  }, []);

  const changeColor = useCallback((id: string, color: string) => {
    setNotes((n) => n.map((note) => (note.id === id ? { ...note, color } : note)));
  }, []);

  // Drag logic (pointer events for cross-browser reliability)
  const onPointerDownNote = useCallback(
    (e: React.PointerEvent<HTMLDivElement>, id: string) => {
      if ((e.target as HTMLElement).tagName === "TEXTAREA") return;
      if ((e.target as HTMLElement).tagName === "BUTTON") return;
      e.currentTarget.setPointerCapture(e.pointerId);
      const note = notes.find((n) => n.id === id)!;
      dragging.current = { id, ox: e.clientX - note.x, oy: e.clientY - note.y };
    },
    [notes]
  );

  const onPointerMoveBoard = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return;
    const { id, ox, oy } = dragging.current;
    setNotes((n) =>
      n.map((note) =>
        note.id === id ? { ...note, x: e.clientX - ox, y: e.clientY - oy } : note
      )
    );
  }, []);

  const onPointerUp = useCallback(() => {
    dragging.current = null;
  }, []);

  return (
    <div className="flex flex-col h-full bg-[#1a1a2e] overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-3 px-4 py-2 border-b border-white/10 bg-[#0d0d0f] flex-shrink-0">
        <button
          onClick={addNote}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-white/10 hover:bg-white/20 text-white text-sm transition-colors"
        >
          <span className="text-lg leading-none">+</span> Add note
        </button>
        <span className="text-white/30 text-xs">Double-click the board to add a note anywhere</span>
      </div>

      {/* Board */}
      <div
        ref={boardRef}
        className="flex-1 relative overflow-hidden select-none"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
        onDoubleClick={handleBoardDblClick}
        onPointerMove={onPointerMoveBoard}
        onPointerUp={onPointerUp}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const data = e.dataTransfer.getData("application/mindlink-arch");
          if (!data) return;
          const rect = boardRef.current!.getBoundingClientRect();
          const x = e.clientX - rect.left - 100;
          const y = e.clientY - rect.top - 50;
          if (onExternalDrop) {
            onExternalDrop(data, x, y);
          } else {
            const newNote: StickyNote = {
              id: uid(),
              text: data,
              x,
              y,
              color: randomColor(),
              width: 200,
            };
            setNotes((n) => [...n, newNote]);
          }
        }}
      >
        {notes.map((note) => (
          <div
            key={note.id}
            style={{
              position: "absolute",
              left: note.x,
              top: note.y,
              width: note.width,
              background: note.color,
              borderRadius: 6,
              boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
              cursor: dragging.current?.id === note.id ? "grabbing" : "grab",
              zIndex: editing === note.id ? 20 : 10,
              display: "flex",
              flexDirection: "column",
            }}
            onPointerDown={(e) => onPointerDownNote(e, note.id)}
          >
            {/* Note header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "6px 8px 4px",
                gap: 4,
              }}
            >
              {/* Color swatches */}
              <div style={{ display: "flex", gap: 3 }}>
                {NOTE_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => changeColor(note.id, c)}
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: "50%",
                      background: c,
                      border: c === note.color ? "2px solid rgba(0,0,0,0.5)" : "1px solid rgba(0,0,0,0.2)",
                      cursor: "pointer",
                      flexShrink: 0,
                    }}
                  />
                ))}
              </div>
              {/* Delete */}
              <button
                onClick={() => deleteNote(note.id)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "rgba(0,0,0,0.4)",
                  fontSize: 14,
                  lineHeight: 1,
                  padding: "0 2px",
                }}
              >
                ×
              </button>
            </div>

            {/* Text area */}
            <textarea
              value={note.text}
              placeholder="Type here…"
              onFocus={() => setEditing(note.id)}
              onBlur={() => setEditing((e) => (e === note.id ? null : e))}
              onChange={(e) => updateText(note.id, e.target.value)}
              style={{
                background: "transparent",
                border: "none",
                outline: "none",
                resize: "none",
                padding: "4px 10px 10px",
                fontSize: 13,
                lineHeight: "1.5",
                color: "rgba(0,0,0,0.8)",
                minHeight: 80,
                cursor: "text",
                fontFamily: "inherit",
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
