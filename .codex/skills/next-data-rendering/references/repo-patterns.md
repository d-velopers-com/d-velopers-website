# Repo Patterns

## Preferred patterns

- Resolve viewer/session in server code once per request and hydrate client context from that result.
- For listing pages, parse and validate `searchParams` in the server entrypoint, fetch data directly from domain helpers, and pass the result to a client shell.
- Client shells may own:
  - form state
  - debounced query updates
  - optimistic UI
  - mutation requests
- Client shells should not own:
  - first-load data bootstrap
  - first-load role/config bootstrap
  - route guards that the server can decide earlier

## Existing hotspots in this repo

- `app/page.tsx`
- `app/jobs/page.tsx`
- `app/dashboard/page.tsx`
- `app/jobs/manage/page.tsx`
- `components/navbar.tsx`

## Source basis

- Vercel React/Next best practices: avoid client waterfalls and oversized client trees.
- Next.js App Router docs: Server Components, Composition Patterns, and Data Fetching Patterns.
