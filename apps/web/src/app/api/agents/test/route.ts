import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

const SERVER_URL = process.env.SERVER_URL ?? "http://localhost:3001";

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const res = await fetch(`${SERVER_URL}/api/llm/test`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.user.id}` },
    body: JSON.stringify({ prompt: body.prompt, agentSlug: "sage" }),
  });
  const text = await res.text();
  return new NextResponse(text, { status: res.status, headers: { "Content-Type": "text/plain" } });
}
