# Repo Auth Notes

## Current target behavior

- Normal page visits should not force Discord reauth.
- `discordReauthRequired` is contextual state for Discord-dependent actions.
- Protected page access should be decided in server entrypoints with `redirect()`.
- Layout-level UI should receive pre-resolved viewer/session data.

## Permission model

- `ALLOWED_ROLES` controls public profile activation.
- `STAFF_ROLES` and `COLLABORATOR_ROLES` control jobs management.
- Trial-period and recent-activation logic must stay centralized and reusable.

## Source basis

- Discord OAuth2 supports `refresh_token`.
- Next.js server entrypoints are the preferred place for auth and redirect decisions.
