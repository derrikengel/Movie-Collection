# ADR 0003 — Actor Identity via TMDB profile_path, Not Name or Person ID

## Status
Accepted

## Context
The actor filmography feature needs to identify "the same actor" across every movie in the collection, so clicking a cast member surfaces every owned movie they appear in. `movies.cast_members` (jsonb) stores only `{ name, character, profile_path }` per credit — TMDB's person ID is never persisted (see `useTmdbSearch.js`, which destructures TMDB's `/credits` response and drops `id`). Options considered:

1. **Match by `profile_path` (chosen), falling back to `name` when no photo exists**
2. Match by `name` string alone
3. Add a `tmdb_person_id` column to each cast_members entry going forward

## Decision
Treat `profile_path` as the primary identity key for an actor. Two cast credits are the same actor if they share a non-null `profile_path`. When `profile_path` is null (TMDB has no photo for that person), fall back to matching by exact `name`.

The URL slug encodes both: `slugify(name) + '-' + <profile_path fragment>` when a photo exists (e.g. `tom-hanks-abc123`), or just `slugify(name)` when it doesn't. This makes the route self-resolving from the URL alone — no click-context needed — mirroring how movie slugs combine title + year to disambiguate remakes.

## Rationale

**Why not name-only:** Two different real people can share an exact name (common actor names, or a lead and an extra with the same name). `profile_path` is TMDB's own designated image reference for a specific person and is far less likely to collide.

**Why not a `tmdb_person_id` column:** Would require a schema/migration change and a backfill pass over ~2,000 existing movies (re-editing each to fetch the ID) to be reliable. The fallback-to-name path would never fully go away for un-migrated rows, so it doesn't eliminate the edge case — it just narrows it, at real migration cost.

**Accepted risk:** Two distinct people with the same name where only one has a TMDB photo will incorrectly merge under the name-fallback path. Given this is a ~2,000-title household collection (not an open catalog), this collision is judged unlikely enough to accept rather than engineer around.
