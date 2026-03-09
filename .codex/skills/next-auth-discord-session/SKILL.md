---
name: next-auth-discord-session
description: Use for authentication, session, permission, and Discord OAuth work in this repo, especially when separating local app session state from Discord token validity or moving role checks to server boundaries.
---

# Next Auth Discord Session

Use this skill when changing auth or permissions in this repo.

## Default approach

- Treat the app session and the Discord access token as related but not identical concerns.
- Keep navigation and page access tied to the local app session.
- Require Discord reauthentication only for actions that actually call Discord APIs.
- Resolve permissions in server code and pass them down as serialized props.

## Repo rules

- Do not redirect to `/login` only because a page mounted and discovered a stale Discord token.
- Do not repeat session bootstrap fetches in every client page.
- Use one server-resolved viewer model for layout, navbar, and protected pages.
- Keep role gating consistent between desktop and mobile navigation.

## Apply here

- Session hydration for the root layout.
- Protected routes such as `/dashboard`, `/jobs`, and `/jobs/manage`.
- Discord-dependent actions such as profile sync.

## References

- Read `.codex/skills/next-auth-discord-session/references/repo-auth-notes.md` before changing auth flows.
