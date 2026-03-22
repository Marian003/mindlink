export interface RoomTemplate {
  name: string;
  description: string;
  icon: string;
  defaultMode: "document" | "code" | "brainstorm" | "review" | "writing" | "architecture";
  agentSlugs: string[];
  initialContent?: string;
}

export const ROOM_TEMPLATES: RoomTemplate[] = [
  {
    name: "Sprint Planning",
    description: "Plan your sprint with an AI PM and architect",
    icon: "📋",
    defaultMode: "document",
    agentSlugs: ["atlas", "sage"],
    initialContent: `# Sprint Planning\n\n## Goals\n\n## User Stories\n\n## Technical Tasks\n\n## Definition of Done\n`,
  },
  {
    name: "Code Review",
    description: "Get AI-powered code review from Lens & Ghost",
    icon: "🔍",
    defaultMode: "review",
    agentSlugs: ["lens", "ghost", "sage"],
  },
  {
    name: "Brainstorm",
    description: "Generate ideas freely with creative agents",
    icon: "💡",
    defaultMode: "brainstorm",
    agentSlugs: ["spark", "echo", "sage"],
  },
  {
    name: "Architecture Decision",
    description: "Design systems with an architect and security review",
    icon: "🏗️",
    defaultMode: "architecture",
    agentSlugs: ["sage", "ghost", "atlas"],
  },
  {
    name: "Writing Workshop",
    description: "Write and refine content with UX and creative agents",
    icon: "✍️",
    defaultMode: "writing",
    agentSlugs: ["echo", "spark"],
    initialContent: `# Document Title\n\n## Introduction\n\n## Main Content\n\n## Conclusion\n`,
  },
];
