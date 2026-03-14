import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

interface InvitePageProps {
  params: Promise<{ slug: string }>;
}

export default async function InvitePage({ params }: InvitePageProps) {
  const session = await auth();
  const { slug } = await params;

  if (!session) {
    redirect(`/auth/signin?callbackUrl=/invite/${slug}`);
  }

  // Join the room via API then redirect
  try {
    await fetch(`${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/api/rooms/${slug}/join`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
  } catch {}

  redirect(`/workspace/${slug}`);
}
