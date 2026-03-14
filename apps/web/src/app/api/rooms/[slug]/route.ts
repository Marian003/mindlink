import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

const SERVER_URL = process.env.SERVER_URL ?? "http://localhost:3001";

export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { slug } = await params;
  const res = await fetch(`${SERVER_URL}/api/rooms/${slug}`, {
    headers: { Authorization: `Bearer ${session.user.id}` },
    cache: "no-store",
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { slug } = await params;
  const res = await fetch(`${SERVER_URL}/api/rooms/${slug}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${session.user.id}` },
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
