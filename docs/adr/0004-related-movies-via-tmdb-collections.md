# ADR 0004 — Related Movies via a Single Shared Collection ID (TMDB or Admin-Created)

## Status
Accepted

## Context
Movie detail pages should surface other owned movies in the same franchise (e.g. showing owned *Toy Story* sequels on *Toy Story*'s page). TMDB exposes a `belongs_to_collection` field on movie details and a `/collection/{id}` endpoint listing every movie in that franchise. Two shapes were considered for computing this:

1. Fetch the TMDB collection endpoint client-side when a movie detail page loads, then cross-reference against owned movies.
2. Store the TMDB collection ID on each movie at admin add/edit time; derive owned siblings from the existing in-memory movie list at render time.

A separate but related need: TMDB doesn't know about every movie the household considers part of a franchise (e.g. a direct-to-video short, or a spin-off TMDB never grouped in). The admin needs a way to add such a movie to an existing franchise, or invent a franchise TMDB has no record of at all.

**Superseded design:** An earlier version of this feature modeled manual additions as a separate `movie_related` join table (one row per admin-linked pair), with the related list computed as a graph traversal (BFS) over "same collection" + "manually linked" edges. This broke down in practice: linking *Toy Story of Terror* to *Toy Story 4* only created one edge, so editing *Toy Story 4* showed the link but editing *Toy Story 3* did not — despite both belonging to the same franchise. The admin's actual mental model wasn't "link this movie to that movie," it was "add this movie to that franchise," and a pairwise edge model couldn't represent that without additional traversal complexity.

## Decision
**A movie's related list is every other owned movie sharing its `tmdb_collection_id` — full stop. No join table, no graph traversal.** `tmdb_collection_id`/`tmdb_collection_name` are captured automatically from TMDB's `belongs_to_collection` at add/edit time (no extra API call — it's already in the movie-details response `useTmdbSearch.js` fetches). Membership is derived purely from the already-loaded `moviesStore.movies` array at render time — no TMDB API call happens when a detail page loads.

The admin form exposes one unified "Collection" field per movie:
- If assigned, it shows the collection name read-only with a clear (×) button that nulls both fields.
- If not assigned, it's a search box over every distinct collection already in use across owned movies (deduplicated by `tmdb_collection_id`) — selecting one copies that `id`/`name` onto the movie, immediately making it a sibling of every other movie in that collection.
- Typing a name with no match offers "Create '\<name\>'", which generates a synthetic negative ID (real TMDB collection IDs are always positive, so this can never collide) and assigns it. That synthetic collection then appears as a normal searchable option for any other movie to join later — e.g. if a second thematically-linked movie with no TMDB franchise is added afterward.

Because "same shared value" is inherently symmetric, joining *Toy Story of Terror* to the same `tmdb_collection_id` as *Toy Story 4* makes it appear on **every** Toy Story movie's page immediately, and every Toy Story movie appears on its page — solved by the data model itself, with no traversal logic required.

## Rationale

**Why not fetch TMDB at render time:** `CLAUDE.md` documents TMDB as "used only during admin data entry" — fetching the collection endpoint on every page load would expose the TMDB token to every anonymous public visitor, breaking that boundary and adding a runtime dependency + latency + rate-limit risk to the app's most-visited page. `src/stores/movies.js` already holds every owned movie (with `tmdb_id`) in memory for the whole session, so once `tmdb_collection_id` is stored, finding owned siblings is a synchronous local array filter.

**Why not keep the pairwise join table:** Once the admin's actual intent ("add this movie to that franchise") is understood, a join table is solving the wrong problem — it models a relationship between two specific movies when the real relationship is between a movie and a group. Collapsing manual additions into the same `tmdb_collection_id` field TMDB already populates means there is exactly one mechanism, one admin-form field, and one rendering rule to reason about, instead of two mechanisms that have to be merged at read time.

**Why a synthetic ID instead of requiring an existing TMDB collection:** Some franchises the household cares about grouping may not exist as a TMDB collection at all, or TMDB may not link every entry into it. Allowing a from-scratch "Create" option means the admin isn't blocked on TMDB's data being complete.

**Accepted cost:** Backfilling `tmdb_collection_id` onto the ~2,000 pre-existing movies requires a one-off script (`scripts/backfill-collections.mjs`) making one TMDB request per movie. This is a bounded, one-time cost, not an ongoing one. The `movie_related` table created for the superseded design must be dropped, and any rows in it manually re-created as shared `tmdb_collection_id` assignments through the new admin UI.
