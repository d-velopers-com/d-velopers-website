# Repo Guidance

This repo keeps project-specific Codex skills under `.codex/skills/`.

Use these skills when a task matches:

- `next-data-rendering`: server-first rendering, App Router composition, route `searchParams`, and replacing client fetch-on-mount patterns.
- `next-auth-discord-session`: local app session vs Discord token lifecycle, server-side permission resolution, and Discord-only reauth flows.
- `next-performance-embeds`: embed/OG performance, hydration reduction, and image/embed handling.

Core rules for this repo:

- Default to server components unless the code needs browser APIs, local interactivity, or event handlers.
- Do not fetch initial page data from client components when the same data can be resolved in the route entrypoint.
- Do not call internal `/api/*` routes from server components if the underlying domain logic already exists in `lib/` or `features/`.
- Route handlers are for mutations and JSON consumers; initial page rendering should prefer direct server-side data access.
- Resolve viewer/session/permissions once per request in server code and pass serialized props to client islands.
- Discord reauthentication must only happen for actions that actually need Discord API access.
- Avoid repeated mount-time fetches for session, profile, and role config in layout-level UI such as the navbar.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
