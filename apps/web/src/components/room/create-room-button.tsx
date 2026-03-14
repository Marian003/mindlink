"use client";

import { useState } from "react";
import { CreateRoomModal } from "./create-room-modal";

export function CreateRoomButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-medium px-4 py-2 rounded-xl transition-colors"
      >
        <span className="text-lg leading-none">+</span>
        New Room
      </button>
      <CreateRoomModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
