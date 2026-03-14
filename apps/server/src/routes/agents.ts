import { Hono } from "hono";
import { PrismaClient } from "@prisma/client";
import { authMiddleware } from "../middleware/auth";

const prisma = new PrismaClient();

export const agentsRouter = new Hono();
agentsRouter.use("*", authMiddleware);

agentsRouter.get("/", async (c) => {
  const userId = c.get("userId") as string;
  const agents = await prisma.agentConfig.findMany({
    where: { OR: [{ isBuiltIn: true }, { createdById: userId }] },
    orderBy: [{ isBuiltIn: "desc" }, { createdAt: "asc" }],
  });
  return c.json(agents);
});

agentsRouter.post("/", async (c) => {
  const userId = c.get("userId") as string;
  const body = await c.req.json();
  const agent = await prisma.agentConfig.create({
    data: {
      name: body.name,
      slug: body.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      role: body.role ?? "",
      personality: body.personality ?? "",
      behaviorRules: body.behaviorRules ?? {},
      avatarUrl: body.avatar ?? null,
      color: body.color ?? "#3b82f6",
      isBuiltIn: false,
      createdById: userId,
    },
  });
  return c.json(agent, 201);
});

agentsRouter.put("/:id", async (c) => {
  const userId = c.get("userId") as string;
  const id = c.req.param("id");
  const body = await c.req.json();
  const agent = await prisma.agentConfig.updateMany({
    where: { id, createdById: userId, isBuiltIn: false },
    data: { name: body.name, role: body.role, personality: body.personality, behaviorRules: body.behaviorRules, color: body.color },
  });
  return c.json(agent);
});

agentsRouter.delete("/:id", async (c) => {
  const userId = c.get("userId") as string;
  const id = c.req.param("id");
  await prisma.agentConfig.deleteMany({ where: { id, createdById: userId, isBuiltIn: false } });
  return c.json({ success: true });
});
