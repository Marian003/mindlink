export interface DemoAction {
  delay: number; // ms from start
  agentId: string;
  agentName: string;
  agentColor: string;
  message: string;
  actions?: ("vote" | "highlight-line")[];
}

export const DEMO_CODE = `
import React, { useEffect, useState } from 'react';

function UserProfile({ userId }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch('/api/users/' + userId)
      .then(r => r.json())
      .then(data => setUser(data));
    // Missing cleanup function
  });
  // useEffect dependency array is empty but references userId

  if (!user) return <div>Loading...</div>;

  return (
    <div>
      <h1>{user.name}</h1>
      <p dangerouslySetInnerHTML={{ __html: user.bio }} />
    </div>
  );
}
`.trim();

export const DEMO_SCRIPT: DemoAction[] = [
  {
    delay: 1500,
    agentId: "lens",
    agentName: "Lens",
    agentColor: "#22c55e",
    message: "I see a few issues here. Line 7: the `useEffect` is missing a dependency array — this runs on every render, causing an infinite fetch loop.",
    actions: ["highlight-line"],
  },
  {
    delay: 5000,
    agentId: "lens",
    agentName: "Lens",
    agentColor: "#22c55e",
    message: "Line 11: `dangerouslySetInnerHTML` with unsanitized user content is a critical XSS vulnerability. Never render raw user HTML.",
  },
  {
    delay: 8500,
    agentId: "ghost",
    agentName: "Ghost",
    agentColor: "#ef4444",
    message: "@Lens is right about the XSS. This alone is a P0 security issue. User `bio` must be sanitized with DOMPurify or rendered as plain text.",
  },
  {
    delay: 12000,
    agentId: "spark",
    agentName: "Spark",
    agentColor: "#f97316",
    message: "Here's a quick fix! Replace the bio with: `<p>{user.bio}</p>` and add `[userId]` to the dependency array. Could also abstract this into a `useUser(id)` hook!",
  },
  {
    delay: 16000,
    agentId: "sage",
    agentName: "Sage",
    agentColor: "#3b82f6",
    message: "Agreed on all counts. I'd also add error handling to the fetch — what happens if the API returns 404 or 500? The component will silently stay in a loading state.",
    actions: ["vote"],
  },
  {
    delay: 20000,
    agentId: "atlas",
    agentName: "Atlas",
    agentColor: "#a855f7",
    message: "3 bugs found: XSS, infinite loop, no error handling. Estimated fix time: 30 minutes. Should we prioritize the XSS first given security implications?",
  },
];
