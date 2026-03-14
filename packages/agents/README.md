# @mindlink/agents

Agent configurations, presets, templates, and demo script for MindLink.

## Exports

```typescript
import {
  BUILT_IN_AGENTS,   // Array of 6 built-in agent configs
  ROOM_TEMPLATES,    // Array of 5 room templates
  DEMO_SCRIPT,       // Scripted demo sequence
  DEMO_CODE,         // Demo code snippet (buggy React component)
} from "@mindlink/agents";
```

## Built-in Agents

| Name | Role | Color | LLM Provider |
|---|---|---|---|
| Sage | Senior Architect | Blue | Claude |
| Spark | Creative Ideator | Orange | GPT-4o |
| Lens | Code Reviewer | Green | Groq |
| Atlas | Project Manager | Purple | Groq |
| Echo | User Researcher | Pink | GPT-4o |
| Ghost | Security Auditor | Red | Claude |

## Agent Configuration Schema

```typescript
interface AgentConfig {
  name: string;          // Display name
  slug: string;          // URL-safe identifier
  role: string;          // Job title shown in UI
  color: string;         // Hex color for avatars and highlights
  personality: string;   // Full system prompt personality
  behaviorRules: {
    triggers: string[];  // What activates this agent
    style: string;       // Communication style description
    avoid: string;       // What not to do
    specialty: string;   // Domain of expertise
  };
}
```

## Room Templates

| Template | Mode | Agents |
|---|---|---|
| Sprint Planning | Document | Atlas, Sage |
| Code Review | Review | Lens, Ghost, Sage |
| Brainstorm | Brainstorm | Spark, Echo, Sage |
| Architecture Decision | Architecture | Sage, Ghost, Atlas |
| Writing Workshop | Writing | Echo, Spark |
