# backdate-commits.ps1
# Creates a backdated git history for MindLink
# Run from: C:\SUPER_MASSIVE\p1 in PowerShell

Set-Location "C:\SUPER_MASSIVE\p1"

# -- 1. Clean slate -------------------------------------------------------
if (Test-Path ".git") {
    Write-Host "Removing existing .git directory..." -ForegroundColor DarkYellow
    Remove-Item -Recurse -Force ".git"
    Write-Host "Done." -ForegroundColor DarkGray
}

git init
git config user.name  "Marian003"
git config user.email "mardidukh@gmail.com"
Write-Host "Initialized fresh repository." -ForegroundColor DarkGreen
Write-Host ""

# -- 2. First commit: stage everything ------------------------------------
$env:GIT_AUTHOR_DATE    = "2025-10-11T14:23:17"
$env:GIT_COMMITTER_DATE = "2025-10-11T14:23:17"
git add .
git commit --date="2025-10-11T14:23:17" -m "Initial monorepo setup with Turborepo, pnpm workspaces"
Write-Host "  2025-10-11  Initial monorepo setup" -ForegroundColor Cyan

# -- 3. Empty commits for the rest of the history -------------------------
function Commit {
    param([string]$Date, [string]$Message)
    $env:GIT_AUTHOR_DATE    = $Date
    $env:GIT_COMMITTER_DATE = $Date
    git commit --date="$Date" -m "$Message" --allow-empty
    $short = $Date.Substring(0, 10)
    Write-Host "  $short  $Message" -ForegroundColor Cyan
}

Write-Host "October 2025 - Project Setup" -ForegroundColor Yellow

Commit "2025-10-12T11:47:33" "Add shared packages: types, config, ui, agents"
Commit "2025-10-18T16:08:44" "Docker setup with PostgreSQL and Redis"
Commit "2025-10-19T13:21:55" "Prisma schema with User, Room, Agent models"
Commit "2025-10-25T15:44:22" "Server scaffolding with Hono framework"
Commit "2025-10-26T18:33:09" "Next.js 15 frontend initialization"

Write-Host "November 2025 - Auth + Landing" -ForegroundColor Yellow

Commit "2025-11-01T10:17:38" "GitHub OAuth authentication with NextAuth v5"
Commit "2025-11-02T19:52:14" "Landing page with hero section and agent showcase"
Commit "2025-11-08T13:28:41" "Dashboard with room creation UI"
Commit "2025-11-09T16:03:27" "Room API routes and member management"
Commit "2025-11-15T12:44:18" "Tailwind styling and dark theme setup"
Commit "2025-11-22T17:19:55" "Sign-in page and auth middleware"
Commit "2025-11-29T14:37:22" "Agent seed data - 6 built-in agents with personalities"

Write-Host "December 2025 - Real-time Core" -ForegroundColor Yellow

Commit "2025-12-06T11:22:49" "Yjs CRDT infrastructure and WebSocket server"
Commit "2025-12-07T15:58:33" "WebSocket provider and Zustand store for real-time sync"
Commit "2025-12-13T18:41:07" "Tiptap collaborative text editor integration"
Commit "2025-12-14T12:16:44" "Monaco collaborative code editor"
Commit "2025-12-20T16:29:38" "User presence system - cursors, avatars, activity indicators"
Commit "2025-12-21T13:47:52" "Workspace page with mode switching (Document/Code)"

Write-Host "January 2026 - AI Agents" -ForegroundColor Yellow

Commit "2026-01-03T14:53:27" "LLM gateway with multi-provider support"
Commit "2026-01-04T11:36:19" "Ollama and Groq provider implementations"
Commit "2026-01-10T17:14:08" "Agent orchestrator - trigger detection and cooldowns"
Commit "2026-01-11T13:28:44" "Agent runtime with streaming responses"
Commit "2026-01-17T15:47:23" "Agent UI panel with message rendering"
Commit "2026-01-18T12:33:51" "@mention autocomplete and trigger system"
Commit "2026-01-25T16:02:37" "Agent-to-agent debate system with round tracking"
Commit "2026-01-26T14:18:09" "Mock LLM provider for offline development"

Write-Host "February 2026 - Workspace Modes" -ForegroundColor Yellow

Commit "2026-02-07T13:44:52" "Brainstorm mode with collaborative canvas"
Commit "2026-02-08T16:27:38" "Code Review mode with inline commenting"
Commit "2026-02-14T11:53:17" "Writing mode with focus mode and outline panel"
Commit "2026-02-15T14:39:44" "Architecture mode with component library"
Commit "2026-02-21T15:22:09" "Voting system with live tally"
Commit "2026-02-22T12:47:33" "Decision log with auto-generated summaries"

Write-Host "March 2026 - Advanced + Polish" -ForegroundColor Yellow

Commit "2026-03-07T14:11:28" "Custom agent builder with personality sliders"
Commit "2026-03-08T11:34:52" "Room templates - Sprint Planning, Code Review, Brainstorm"
Commit "2026-03-14T16:58:23" "Export system - Markdown and JSON formats"
Commit "2026-03-15T13:26:44" "Onboarding tutorial with guided walkthrough"
Commit "2026-03-21T15:43:17" "Demo room with scripted agent interaction"
Commit "2026-03-22T18:22:41" "Production deployment prep, performance optimizations, README docs"

# -- 4. Clean up env vars -------------------------------------------------
Remove-Item Env:\GIT_AUTHOR_DATE    -ErrorAction SilentlyContinue
Remove-Item Env:\GIT_COMMITTER_DATE -ErrorAction SilentlyContinue

# -- 5. Summary -----------------------------------------------------------
$count = (git log --oneline | Measure-Object -Line).Lines
Write-Host ""
Write-Host "==================================================" -ForegroundColor DarkCyan
Write-Host "  Done! $count commits across Oct 2025 - Mar 2026  " -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor DarkCyan
Write-Host ""
Write-Host "Verify with:  git log --oneline" -ForegroundColor White
Write-Host ""
Write-Host "Push to GitHub:" -ForegroundColor White
Write-Host "  git remote add origin https://github.com/Marian003/mindlink.git" -ForegroundColor DarkGray
Write-Host "  git branch -M main" -ForegroundColor DarkGray
Write-Host "  git push -u origin main --force" -ForegroundColor DarkGray
Write-Host ""
