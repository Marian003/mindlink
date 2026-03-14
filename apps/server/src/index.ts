import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { roomsRouter } from "./routes/rooms";
import { llmRouter } from "./routes/llm";
import { agentsRouter } from "./routes/agents";
import "./yjs/websocket-server"; // starts the Yjs WebSocket server on WS_PORT

const app = new Hono();

app.use("*", cors({ origin: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000", credentials: true }));
app.use("*", logger());

app.get("/health", (c) => c.json({ status: "ok" }));

app.route("/api/rooms", roomsRouter);
app.route("/api/llm", llmRouter);
app.route("/api/agents", agentsRouter);

const PORT = parseInt(process.env.PORT ?? "3001", 10);
serve({ fetch: app.fetch, port: PORT }, () => {
  console.log(`[API] MindLink server running on http://localhost:${PORT}`);
});

export default app;
