"use client";

import { useCallback } from "react";
import { CollaborativeWhiteboard } from "@/components/whiteboard/collaborative-whiteboard";

const ARCH_COMPONENTS = [
  { icon: "🖥️", label: "Server", category: "Compute" },
  { icon: "🗄️", label: "Database", category: "Storage" },
  { icon: "📬", label: "Queue", category: "Messaging" },
  { icon: "🔀", label: "API Gateway", category: "Networking" },
  { icon: "🌐", label: "Browser", category: "Clients" },
  { icon: "📱", label: "Mobile", category: "Clients" },
  { icon: "☁️", label: "Cloud Service", category: "Services" },
  { icon: "⚖️", label: "Load Balancer", category: "Networking" },
  { icon: "🔒", label: "Auth Service", category: "Services" },
  { icon: "📊", label: "Analytics", category: "Services" },
  { icon: "💾", label: "Cache", category: "Storage" },
  { icon: "🔔", label: "Notification", category: "Services" },
];

const CATEGORIES = ["Compute", "Storage", "Networking", "Clients", "Messaging", "Services"];

interface ArchitectureModeProps {
  roomId: string;
  token?: string;
}

export function ArchitectureMode({ roomId, token }: ArchitectureModeProps) {
  const handleDragStart = useCallback(
    (e: React.DragEvent<HTMLButtonElement>, icon: string, label: string) => {
      e.dataTransfer.setData("application/mindlink-arch", `${icon} ${label}`);
      e.dataTransfer.effectAllowed = "copy";
    },
    []
  );

  return (
    <div className="flex h-full">
      {/* Component library */}
      <div className="w-48 border-r border-white/10 bg-[#0d0d0f] overflow-y-auto flex-shrink-0">
        <div className="p-3">
          <p className="text-xs text-white/30 uppercase tracking-wider font-semibold mb-1">
            Components
          </p>
          <p className="text-[10px] text-white/20 mb-3">Drag onto canvas →</p>
          {CATEGORIES.map((category) => (
            <div key={category} className="mb-4">
              <p className="text-[10px] text-white/20 uppercase tracking-wider mb-1 px-1">
                {category}
              </p>
              <div className="space-y-1">
                {ARCH_COMPONENTS.filter((c) => c.category === category).map((comp) => (
                  <button
                    key={comp.label}
                    draggable
                    onDragStart={(e) => handleDragStart(e, comp.icon, comp.label)}
                    className="flex items-center gap-2 w-full px-2 py-1.5 rounded-lg hover:bg-white/10 transition-colors text-left cursor-grab active:cursor-grabbing"
                  >
                    <span className="text-base">{comp.icon}</span>
                    <span className="text-xs text-white/60">{comp.label}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Whiteboard canvas */}
      <div className="flex-1 overflow-hidden">
        <CollaborativeWhiteboard roomId={roomId} token={token} />
      </div>
    </div>
  );
}
