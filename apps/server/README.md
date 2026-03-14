# @mindlink/server

Hono API server + Yjs WebSocket server for MindLink.

## Architecture

Two separate processes:
- **API server** (`src/index.ts`) — REST API on port 3001
- **WebSocket server** (`src/yjs/websocket-server.ts`) — Yjs sync on port 4444

## API Routes

| Method | Path | Description | Auth |
|---|---|---|---|
| GET | `/health` | Health check | No |
| POST | `/api/rooms` | Create room | Yes |
| GET | `/api/rooms` | List user's rooms | Yes |
| GET | `/api/rooms/:slug` | Get room + members | Yes |
| POST | `/api/rooms/:slug/join` | Join a room | Yes |
| DELETE | `/api/rooms/:slug` | Delete room (owner only) | Yes |
| GET | `/api/agents` | List available agents | Yes |
| POST | `/api/agents` | Create custom agent | Yes |
| PUT | `/api/agents/:id` | Update custom agent | Yes |
| DELETE | `/api/agents/:id` | Delete custom agent | Yes |
| POST | `/api/llm/test` | Test LLM streaming | Yes |
| GET | `/api/llm/usage/:roomId` | Token usage stats | Yes |

## LLM Gateway

Agent requests are routed to providers based on agent slug:

```
sage, ghost  → Anthropic Claude (deep reasoning)
spark, echo  → OpenAI GPT-4o (creative)
lens, atlas  → Groq (fastest)
```

Fallback chain: primary → anthropic → openai → groq

## Agent Orchestration Flow

```
Document change / @mention detected
         ↓
   TriggerDetector
         ↓
   AgentOrchestrator (cooldown check, deduplication)
         ↓
     AgentRuntime
         ↓
   ContextBuilder → LLM Gateway → Y.Array (live updates)
```

## Adding a New LLM Provider

1. Create `src/llm/providers/<name>.ts` implementing `LLMProvider` interface
2. Add the provider to `PROVIDERS` map in `src/llm/router.ts`
3. Add agent slug mappings to `AGENT_PROVIDER_MAP`

## Adding a New Built-in Agent

1. Add agent config to `packages/agents/src/index.ts`
2. Add the agent to `prisma/seed.ts`
3. Add routing preference to `src/llm/router.ts`
4. Run `pnpm db:seed` to insert into database

## Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `REDIS_URL` | Redis connection string |
| `ANTHROPIC_API_KEY` | Anthropic API key |
| `OPENAI_API_KEY` | OpenAI API key |
| `GROQ_API_KEY` | Groq API key |
| `PORT` | API server port (default: 3001) |
| `WS_PORT` | WebSocket server port (default: 4444) |
| `NEXTAUTH_SECRET` | Shared JWT secret with web app |
