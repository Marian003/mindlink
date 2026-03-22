import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { roomsRouter } from "./routes/rooms";
import { llmRouter } from "./routes/llm";
import { agentsRouter } from "./routes/agents";
import { createWSSHandler } from "./yjs/websocket-server";

const app = new Hono();

// Allow both production frontend URL and localhost for development
const allowedOrigins = [
  process.env.NEXT_PUBLIC_APP_URL,
  "http://localhost:3000",
].filter(Boolean) as string[];

app.use(
  "*",
  cors({
    origin: (origin) => (allowedOrigins.includes(origin) ? origin : allowedOrigins[0]),
    credentials: true,
  })
);
app.use("*", logger());

app.get("/health", (c) => c.json({ status: "ok" }));

app.route("/api/rooms", roomsRouter);
app.route("/api/llm", llmRouter);
app.route("/api/agents", agentsRouter);

const PORT = parseInt(process.env.PORT ?? "3001", 10);

// serve() returns the underlying http.Server — attach WS handler to the same port
const server = serve({ fetch: app.fetch, port: PORT }, () => {
  console.log(`[API] MindLink server running on port ${PORT}`);
});

// Attach Yjs WebSocket handler to the same HTTP server (path: /ws)
createWSSHandler(server as any);

export default app;
