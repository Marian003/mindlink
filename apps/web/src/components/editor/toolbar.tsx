"use client";

import { Editor } from "@tiptap/react";
import {
  Bold, Italic, Strikethrough, Code, Heading1, Heading2, Heading3,
  List, ListOrdered, CheckSquare, Code2, Minus, Highlighter,
} from "lucide-react";

interface ToolbarProps {
  editor: Editor | null;
}

interface ToolbarButton {
  icon: React.ReactNode;
  action: () => void;
  isActive: boolean;
  title: string;
}

export function Toolbar({ editor }: ToolbarProps) {
  if (!editor) return null;

  const buttons: ToolbarButton[] = [
    {
      icon: <Bold className="w-4 h-4" />,
      action: () => editor.chain().focus().toggleBold().run(),
      isActive: editor.isActive("bold"),
      title: "Bold",
    },
    {
      icon: <Italic className="w-4 h-4" />,
      action: () => editor.chain().focus().toggleItalic().run(),
      isActive: editor.isActive("italic"),
      title: "Italic",
    },
    {
      icon: <Strikethrough className="w-4 h-4" />,
      action: () => editor.chain().focus().toggleStrike().run(),
      isActive: editor.isActive("strike"),
      title: "Strikethrough",
    },
    {
      icon: <Code className="w-4 h-4" />,
      action: () => editor.chain().focus().toggleCode().run(),
      isActive: editor.isActive("code"),
      title: "Inline Code",
    },
    {
      icon: <Highlighter className="w-4 h-4" />,
      action: () => editor.chain().focus().toggleHighlight().run(),
      isActive: editor.isActive("highlight"),
      title: "Highlight",
    },
  ];

  const headingButtons = [1, 2, 3].map((level) => ({
    icon: level === 1 ? <Heading1 className="w-4 h-4" /> : level === 2 ? <Heading2 className="w-4 h-4" /> : <Heading3 className="w-4 h-4" />,
    action: () => editor.chain().focus().toggleHeading({ level: level as 1 | 2 | 3 }).run(),
    isActive: editor.isActive("heading", { level }),
    title: `Heading ${level}`,
  }));

  const listButtons: ToolbarButton[] = [
    {
      icon: <List className="w-4 h-4" />,
      action: () => editor.chain().focus().toggleBulletList().run(),
      isActive: editor.isActive("bulletList"),
      title: "Bullet List",
    },
    {
      icon: <ListOrdered className="w-4 h-4" />,
      action: () => editor.chain().focus().toggleOrderedList().run(),
      isActive: editor.isActive("orderedList"),
      title: "Ordered List",
    },
    {
      icon: <CheckSquare className="w-4 h-4" />,
      action: () => editor.chain().focus().toggleTaskList().run(),
      isActive: editor.isActive("taskList"),
      title: "Task List",
    },
    {
      icon: <Code2 className="w-4 h-4" />,
      action: () => editor.chain().focus().toggleCodeBlock().run(),
      isActive: editor.isActive("codeBlock"),
      title: "Code Block",
    },
    {
      icon: <Minus className="w-4 h-4" />,
      action: () => editor.chain().focus().setHorizontalRule().run(),
      isActive: false,
      title: "Divider",
    },
  ];

  const allGroups = [buttons, headingButtons, listButtons];

  return (
    <div className="flex items-center gap-1 px-4 py-2 border-b border-white/10 bg-[#0f0f11] flex-wrap">
      {allGroups.map((group, gi) => (
        <div key={gi} className="flex items-center gap-1">
          {gi > 0 && <div className="w-px h-5 bg-white/10 mx-1" />}
          {group.map((btn, i) => (
            <button
              key={i}
              onClick={btn.action}
              title={btn.title}
              className={`p-2 rounded-lg transition-colors ${
                btn.isActive
                  ? "bg-blue-600/30 text-blue-400"
                  : "text-white/50 hover:text-white hover:bg-white/10"
              }`}
            >
              {btn.icon}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}
