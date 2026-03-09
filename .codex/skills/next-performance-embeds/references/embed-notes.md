# Embed Notes

## Repo hotspots

- LinkedIn and generic embed preview logic currently lives in client components.
- OG preview fetches are triggered from the client for visible cards and previews.
- Jobs pages were previously bootstrapped from client-side fetches.

## First-pass preference

- Fix render/data-flow first.
- Add caching or server prefetch only where it reduces repeated external requests without adding risky infrastructure changes.
- Do not force a full `next/image` migration for remote assets in this pass if it requires broader remote pattern policy work.

## Source basis

- Vercel React/Next guidance favors smaller client trees and fewer waterfalls.
