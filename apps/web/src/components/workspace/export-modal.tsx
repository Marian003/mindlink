"use client";

import * as Y from "yjs";

interface ExportModalProps {
  doc: Y.Doc | null;
  roomId: string;
  onClose: () => void;
}

interface AgentMessage {
  agentName: string;
  content: string;
  timestamp: number;
}

function xmlFragmentToText(fragment: Y.XmlFragment): string {
  const lines: string[] = [];

  function walk(node: Y.XmlElement | Y.XmlText | Y.XmlFragment) {
    if (node instanceof Y.XmlText) {
      lines.push(node.toString());
      return;
    }
    const tag = node instanceof Y.XmlElement ? node.nodeName : "";
    const attrs = node instanceof Y.XmlElement ? node.getAttributes() : {};

    if (tag === "paragraph" || tag === "p") {
      const parts: string[] = [];
      node.forEach((child) => {
        if (child instanceof Y.XmlText) parts.push(child.toString());
      });
      lines.push(parts.join(""));
    } else if (tag === "heading") {
      const level = attrs.level ?? 1;
      const parts: string[] = [];
      node.forEach((child) => {
        if (child instanceof Y.XmlText) parts.push(child.toString());
      });
      lines.push(`${"#".repeat(level)} ${parts.join("")}`);
    } else {
      node.forEach((child: any) => walk(child));
    }
  }

  fragment.forEach((child: any) => walk(child));
  return lines.filter(Boolean).join("\n\n");
}

function downloadFile(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function ExportModal({ doc, roomId, onClose }: ExportModalProps) {
  function exportMarkdown() {
    if (!doc) return;

    const fragment = doc.getXmlFragment("default");
    const docContent = xmlFragmentToText(fragment);

    const messages = doc.getArray<AgentMessage>("agent-messages").toArray();
    const agentSection = messages.length > 0
      ? `\n\n---\n\n## Agent Conversation\n\n` +
        messages
          .map((m) => `**${m.agentName}** *(${new Date(m.timestamp).toLocaleTimeString()})*\n\n${m.content}`)
          .join("\n\n---\n\n")
      : "";

    const md = `# ${roomId}\n\n${docContent}${agentSection}`;
    downloadFile(md, `${roomId}.md`, "text/markdown");
    onClose();
  }

  function exportJSON() {
    if (!doc) return;

    const fragment = doc.getXmlFragment("default");
    const data = {
      roomId,
      exportedAt: new Date().toISOString(),
      document: xmlFragmentToText(fragment),
      agentMessages: doc.getArray("agent-messages").toArray(),
      votes: doc.getArray("votes").toArray(),
      decisions: doc.getArray("decisions").toArray(),
    };
    downloadFile(JSON.stringify(data, null, 2), `${roomId}.json`, "application/json");
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-[#111113] border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-white">Export Room</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white text-xl leading-none">×</button>
        </div>

        <div className="space-y-3">
          <button
            onClick={exportMarkdown}
            className="w-full flex items-center gap-3 p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all text-left"
          >
            <span className="text-2xl">📄</span>
            <div>
              <p className="text-sm font-medium text-white">Export as Markdown</p>
              <p className="text-xs text-white/40 mt-0.5">Document + agent conversation</p>
            </div>
          </button>

          <button
            onClick={exportJSON}
            className="w-full flex items-center gap-3 p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all text-left"
          >
            <span className="text-2xl">🗂️</span>
            <div>
              <p className="text-sm font-medium text-white">Export as JSON</p>
              <p className="text-xs text-white/40 mt-0.5">Full state: messages, votes, decisions</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
