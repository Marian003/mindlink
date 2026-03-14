import { Hono } from "hono";
import { streamText } from "hono/streaming";
import { authMiddleware } from "../middleware/auth";
import { streamWithFallback } from "../llm/router";
import { getUsage } from "../llm/token-tracker";

export const llmRouter = new Hono();

llmRouter.use("*", authMiddleware);

// POST /api/llm/test — test streaming endpoint
llmRouter.post("/test", async (c) => {
  const { prompt, agentSlug = "sage" } = await c.req.json<{
    prompt: string;
    agentSlug?: string;
  }>();

  return streamText(c, async (stream) => {
    const gen = streamWithFallback(agentSlug, {
      systemPrompt: "You are a helpful assistant.",
      messages: [{ role: "user", content: prompt }],
    });

    for await (const chunk of gen) {
      await stream.write(chunk);
    }
  });
});

// GET /api/llm/usage/:roomId
llmRouter.get("/usage/:roomId", (c) => {
  const roomId = c.req.param("roomId");
  return c.json(getUsage(roomId));
});
