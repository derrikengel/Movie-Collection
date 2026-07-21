# Movie Collection — Domain Context

## Related Movies

**Related Movies**
Other owned movies shown on a movie's public detail page because they belong to the same franchise. The public heading prefers the specific franchise name (e.g. "The Toy Story Collection") when one is set, falling back to a generic "Related Movies" label otherwise — it never displays a bare, unqualified "Collection" label, since the app itself is already "Movie Collection" (the whole household library) and that word alone would be ambiguous. The admin form's field for assigning this is labeled "Collection" (matching TMDB's own terminology for the concept); that's an admin-only label with clear context, not user-facing prose.

**Franchise (`tmdb_collection_id` / `tmdb_collection_name`)**
The single grouping a movie belongs to. Usually captured automatically at admin add/edit time from TMDB's `belongs_to_collection` field (no extra API call — already present in the movie-details response). Owned siblings sharing the same `tmdb_collection_id` are derived locally from the already-loaded movie list; TMDB's collection-detail endpoint is never called at page-render time. An admin can also assign a movie into any existing franchise directly (searchable in the admin form by name, across every franchise already in use by an owned movie) — this is how a movie TMDB didn't group correctly (e.g. a spin-off short) gets added to the right franchise, since it becomes a sibling of every other member the moment it shares that ID. An admin can also invent a franchise TMDB has no record of at all, which gets a synthetic ID (negative, so it can never collide with a real TMDB collection ID) and becomes a normal joinable option for future movies. Clearing a movie's franchise (the × button in the admin form) removes it from the group entirely.

## Accounts

**Test Account**
The single, permanent Supabase Auth account + `profiles` row used to run automated E2E tests (see `e2e/`). It is a real, functioning account — it can log in and use every feature exactly like a household member — but its profile must never be visible to or discoverable by any other signed-in user. This is a one-time-only construct: the household intentionally maintains exactly one, never expects to need a second, and explicitly rejected a general "service/test account" schema concept in favor of a single hardcoded exclusion.

It is permanently `is_admin = true`, so the same one account covers both regular-user and admin E2E flows (list toggles, requests, and admin add/edit movie tests all run as this one identity). Accepted tradeoff: there is no E2E coverage for "a logged-in, non-admin user is denied an admin route" specifically — only the logged-out case is covered (`e2e/router-guards.spec.js`) — since that's an intentionally deferred gap, not an oversight, given the guard's boolean check (`!auth.isAdmin`) doesn't meaningfully differ between the two circumstances.

**Hidden (from `allProfiles`)**
The Test Account's profile is hidden when its id matches the `VITE_TEST_PROFILE_ID` env var, checked once in `fetchAllProfiles()` (`src/stores/auth.js`) — the single source every other feature reads from (profile pages, movie-detail "wants/watched" rows, the requests filter, etc.), so filtering there covers all of them. A single-value var, not a list — there is intentionally only ever one Test Account, so a list shape would misrepresent the domain. Hidden means invisible to every other account but still visible to itself, so the Test Account's own profile page, avatar picker, and lists keep working normally when it's signed in.

## Push Notifications

**Push Subscription**
A browser-generated endpoint + cryptographic keys stored as a JSON blob in the `push_subscriptions` table. Scoped to one user + device pair. Created when the user grants notification permission via the browser prompt. Managed entirely through browser settings — there is no in-app toggle. Stale subscriptions (browser permission revoked) are automatically removed from the table when the Edge Function receives a 404 or 410 response on send.

**VAPID**
A public/private key pair used to authenticate Web Push sends. The public key (`VITE_VAPID_PUBLIC_KEY`) is exposed to the client and embedded in each push subscription. The private key (`VAPID_PRIVATE_KEY`) lives only in the Edge Function environment and is never sent to the browser.

**Notification trigger**
Always initiated server-side via a Supabase DB webhook on `movies INSERT` → the `notify-movie-added` Edge Function. Never client-initiated. This ensures all subscribers are notified regardless of who added the movie or whether the admin's browser is still open.

**Requester**
A user who added a "want" to a movie request (via `request_wants`) before the movie was added to the collection. Requesters receive a personalized notification variant: "Your request [Title] ([Year]) added to the movie collection." All other subscribers receive the standard variant.

**Request notification**
Unlike the movie-added notification (broadcast to all subscribers), this notifies a single hardcoded recipient only — not derived from `is_admin` or any other profile flag. Triggered by a DB webhook on `request_wants INSERT` (not `movie_requests INSERT`) because every request — new or joined — always produces a `request_wants` row: the creator's own initial want is inserted immediately after the `movie_requests` row. The Edge Function counts existing wants for that `request_id` to tell the two cases apart: count of 1 means this want *is* the request's creation ("New Request"), count greater than 1 means someone joined an existing request ("Request Update"). Self-triggered activity (acting user_id matches the hardcoded recipient) is suppressed — the recipient doesn't need a push for their own action.
