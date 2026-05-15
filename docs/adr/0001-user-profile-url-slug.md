# ADR 0001 — User profile URLs use slugified display names

**Status:** Accepted

## Context

Public user profile routes need a URL parameter to identify which user's profile to show (e.g. `/user/:name`). Two options were considered: Supabase UUID or a slug derived from `display_name`.

## Decision

Use a slug derived from `display_name` at runtime (`display_name.toLowerCase().replace(/\s+/g, '-')`). No slug column is stored in the database.

## Reasons

- Only 4 manually-created accounts exist; collision is not a real risk.
- Readable URLs are preferable for sharing (e.g. `/user/derrik-engel` vs `/user/a3f2...`).
- Display names are controlled by an admin, so accidental collisions can be avoided operationally.

## Consequences

- If a user's `display_name` changes, their profile URL changes and old links break. Acceptable given the small, known user base.
- A future slug column in `profiles` would be a straightforward migration path if the app ever scales beyond this household.
