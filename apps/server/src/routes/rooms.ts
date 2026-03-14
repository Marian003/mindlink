import { Hono } from "hono";
import { PrismaClient } from "@prisma/client";
import { authMiddleware } from "../middleware/auth";

const prisma = new PrismaClient();

function generateSlug(name: string): string {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 50) +
    "-" +
    Math.random().toString(36).slice(2, 7)
  );
}

export const roomsRouter = new Hono();

roomsRouter.use("*", authMiddleware);

// POST /api/rooms — create room
roomsRouter.post("/", async (c) => {
  const userId = c.get("userId") as string;
  const userEmail = c.get("userEmail") as string;
  const userName = c.get("userName") as string;
  const { name, slug } = await c.req.json<{ name: string; slug?: string }>();

  if (!name) return c.json({ error: "name is required" }, 400);

  // Ensure the user exists in the DB (fallback for sessions created before the Prisma adapter was enabled)
  if (userEmail) {
    await prisma.user.upsert({
      where: { id: userId },
      update: {},
      create: { id: userId, email: userEmail, name: userName || null },
    });
  }

  const finalSlug = slug ?? generateSlug(name);

  try {
    const room = await prisma.room.create({
      data: {
        name,
        slug: finalSlug,
        createdById: userId,
        members: { create: { userId, role: "OWNER" } },
      },
      include: { members: true },
    });
    return c.json(room, 201);
  } catch (e: any) {
    if (e.code === "P2002") return c.json({ error: "Slug already taken" }, 409);
    throw e;
  }
});

// GET /api/rooms — list rooms for user
roomsRouter.get("/", async (c) => {
  const userId = c.get("userId") as string;
  const rooms = await prisma.room.findMany({
    where: { members: { some: { userId } } },
    include: {
      members: { include: { user: { select: { id: true, name: true, avatarUrl: true } } } },
      _count: { select: { members: true } },
    },
    orderBy: { updatedAt: "desc" },
  });
  return c.json(rooms);
});

// GET /api/rooms/:slug
roomsRouter.get("/:slug", async (c) => {
  const slug = c.req.param("slug");
  const room = await prisma.room.findUnique({
    where: { slug },
    include: {
      members: {
        include: { user: { select: { id: true, name: true, avatarUrl: true, email: true } } },
      },
      agentConfigs: true,
    },
  });
  if (!room) return c.json({ error: "Room not found" }, 404);
  return c.json(room);
});

// POST /api/rooms/:slug/join
roomsRouter.post("/:slug/join", async (c) => {
  const slug = c.req.param("slug");
  const userId = c.get("userId") as string;

  const room = await prisma.room.findUnique({ where: { slug } });
  if (!room) return c.json({ error: "Room not found" }, 404);

  try {
    const member = await prisma.roomMember.create({
      data: { roomId: room.id, userId, role: "MEMBER" },
    });
    return c.json(member, 201);
  } catch (e: any) {
    if (e.code === "P2002") return c.json({ error: "Already a member" }, 409);
    throw e;
  }
});

// DELETE /api/rooms/:slug
roomsRouter.delete("/:slug", async (c) => {
  const slug = c.req.param("slug");
  const userId = c.get("userId") as string;

  const room = await prisma.room.findUnique({
    where: { slug },
    include: { members: { where: { userId, role: "OWNER" } } },
  });

  if (!room) return c.json({ error: "Room not found" }, 404);
  if (room.members.length === 0) return c.json({ error: "Not the owner" }, 403);

  await prisma.room.delete({ where: { slug } });
  return c.json({ success: true });
});
