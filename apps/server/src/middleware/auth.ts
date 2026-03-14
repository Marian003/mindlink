import { Context, Next } from "hono";

export async function authMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header("Authorization");

  // For dev: extract user from a simple bearer token or cookie
  // In production this would verify the NextAuth JWT
  let userId: string | null = null;
  let userName: string | null = null;
  let userEmail: string | null = null;

  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    try {
      const parts = token.split(".");
      if (parts.length === 3) {
        // Full JWT — decode payload
        const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf-8"));
        userId = payload.sub ?? payload.id ?? null;
        userName = payload.name ?? null;
        userEmail = payload.email ?? null;
      } else {
        // Plain user ID passed directly from Next.js API routes
        userId = token;
      }
    } catch {}
  }

  // Pick up supplemental headers forwarded by Next.js API routes
  if (!userEmail) userEmail = c.req.header("X-User-Email") ?? null;
  if (!userName) userName = c.req.header("X-User-Name") ?? null;

  // Allow anonymous for dev
  c.set("userId", userId ?? "dev-user-id");
  c.set("userName", userName ?? "Dev User");
  c.set("userEmail", userEmail ?? "");

  await next();
}
