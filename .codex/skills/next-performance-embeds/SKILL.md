---
name: next-performance-embeds
description: Use for performance work in this repo around embeds, Open Graph previews, image handling, hydration cost, and duplicate client-side fetch or parsing in jobs-related UI.
---

# Next Performance Embeds

Use this skill for jobs, embeds, and media-heavy UI in this repo.

## Default approach

- Move expensive parsing and first-render data work to the server when practical.
- Cache external metadata fetches when the result is not user-specific.
- Avoid running the same OG/embed detection logic separately for initial render and immediate client hydration.
- Prefer stable image primitives and only expand remote image configuration when it has clear payoff.

## Repo rules

- Keep initial jobs page content server-rendered.
- Avoid extra client fetches for the first visible batch of jobs when the server already has the source URLs.
- Prefer `router.refresh()` after mutations over custom full bootstrap refetch trees.

## Apply here

- `app/jobs/page.tsx`
- `app/jobs/manage/page.tsx`
- `app/jobs/genericEmbed.tsx`
- `app/api/og-metadata/route.ts`

## References

- Read `.codex/skills/next-performance-embeds/references/embed-notes.md` before changing jobs/embed rendering.
