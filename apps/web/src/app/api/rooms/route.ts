import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

const SERVER_URL = process.env.SERVER_URL ?? "http://localhost:3001";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const res = await fetch(`${SERVER_URL}/api/rooms`, {
    headers: {
      Authorization: `Bearer ${session.user.id}`,
      "X-User-Email": session.user.email ?? "",
      "X-User-Name": session.user.name ?? "",
    },
    cache: "no-store",
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const res = await fetch(`${SERVER_URL}/api/rooms`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.user.id}`,
      "X-User-Email": session.user.email ?? "",
      "X-User-Name": session.user.name ?? "",
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
