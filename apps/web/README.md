# @mindlink/web

Next.js 15 frontend for MindLink.

## Architecture

- **App Router** — all pages in `src/app/`
- **Server Components** by default — client components only where state/effects needed
- **State management** — Zustand for global state, Yjs for collaborative state
- **Styling** — TailwindCSS 4 with dark theme

## Key Directories

```
src/
├── app/                  # Routes (App Router)
│   ├── (auth)/          # Auth pages (signin)
│   ├── (workspace)/     # Protected workspace pages
│   ├── api/             # API routes (proxies to server)
│   ├── demo/            # Public demo page
│   └── page.tsx         # Landing page
├── components/
│   ├── agents/          # Agent panel, messages, debate, builder
│   ├── architecture/    # Architecture mode
│   ├── auth/            # User menu, session UI
│   ├── code-editor/     # Monaco collaborative editor
│   ├── code-review/     # Code review mode
│   ├── decisions/       # Decision log, export
│   ├── editor/          # Tiptap collaborative editor
│   ├── onboarding/      # Tutorial flow
│   ├── presence/        # Cursor overlay, participant bar
│   ├── room/            # Room cards, modals, settings
│   ├── voting/          # Vote widgets
│   ├── whiteboard/      # Excalidraw whiteboard
│   ├── workspace/       # Mode selector, workspace client
│   └── writing/         # Writing mode
├── hooks/               # Custom React hooks
└── lib/
    ├── auth.ts          # NextAuth configuration
    └── yjs/             # Yjs provider + store
```

## Adding a New Workspace Mode

1. Add the mode ID to `WorkspaceMode` union in `mode-selector.tsx`
2. Add a button to the `MODES` array in `mode-selector.tsx`
3. Create a new component in `src/components/<mode-name>/`
4. Add a render branch in `workspace-client.tsx`

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_WS_URL` | Yes | WebSocket server URL |
| `NEXT_PUBLIC_APP_URL` | Yes | This app's public URL |
| `SERVER_URL` | Yes | Hono API server URL (server-side only) |
| `NEXTAUTH_SECRET` | Yes | Session signing secret |
| `GITHUB_CLIENT_ID` | Yes | GitHub OAuth |
| `GITHUB_CLIENT_SECRET` | Yes | GitHub OAuth |
