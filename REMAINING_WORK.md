# Remaining Work — Movie Collection App

This file tracks everything not yet built. Use it to plan sessions with Claude Code.

---

## Priority 1 — Core completeness (needed before launch)

### Individual List Views
**Files:** `src/views/lists/WatchlistView.vue`, `WatchedView.vue`, `FavoritesView.vue`, `IgnoredView.vue`

Each view should:
- Show all movies on that list for the current user
- Display as a poster grid (same card style as HomeView)
- Allow removing a movie from the list (toggle the boolean off)
- Show an empty state if the list is empty
- Be searchable/sortable within the list (basic: title sort at minimum)
- Reuse the same card + faded-watched pattern from HomeView

These are currently placeholder files that just render the route path.

---

### ~~PWA Configuration~~ ✅ Done

---

### Footer with TMDB Attribution
**File:** `src/App.vue` (add below `<main>`)

Simple footer:
- "Powered by TMDB" with their logo (required by their API terms)
- Logo SVG available at: https://www.themoviedb.org/about/logos-attribution
- Should be subtle, not distracting
- On mobile, sits above the tab bar (needs bottom padding)

---

### Loading + Error States
Currently the app mostly renders empty states silently. Needed:
- `HomeView`: loading skeleton or spinner while movies fetch
- `MovieDetailView`: loading state if movie not yet in store
- `MovieFormView`: better error display on TMDB failures
- `ProfileView`: loading state for user data
- Network error handling in `useMoviesStore.fetchMovies()`

---

## Priority 2 — Polish pass (before launch, but not blocking)

### Accessibility Audit
- Keyboard navigation through movie grid
- Focus management when bottom sheets open/close (trap focus, restore on close)
- ARIA labels on all icon-only buttons
- `prefers-reduced-motion` — disable transitions/animations
- Color contrast check on muted text against dark backgrounds
- Screen reader testing on movie detail page

### Page Transitions
Vue `<Transition>` or `<TransitionGroup>` on `<RouterView>` in App.vue.
Suggested: simple fade or slide-up on route change. Keep it subtle.

### Responsive Polish
- Test on actual iOS Safari (PWA mode)
- Test on Android Chrome
- Verify safe-area-inset handling on notched devices
- FilterBar height on very small screens (320px width)

---

## Priority 3 — Data Migration (before launch)

### Firebase → Supabase Migration Script
**Context:** ~2,000 movies currently in Firestore. Need to migrate to Supabase `movies` table.

**Steps:**
1. Export Firestore data (JSON)
2. Write a Node.js migration script that:
   - For each movie, searches TMDB by title + year
   - Presents top 3 results for manual confirmation (semi-automatic)
   - Merges TMDB metadata (poster_path, backdrop_path, tmdb_id, runtime, genres, description) with existing data (service links, notes, acquired dates)
   - Generates `slug` and `search_keywords`
   - Inserts into Supabase `movies` + `movie_services`
3. Handle ambiguous matches (prompt for manual selection)
4. Verify data integrity post-import
5. Spot-check ~50 movies manually

**Migration script location:** `scripts/migrate.js` (run locally, not deployed)

---

## Priority 4 — v1.1 (post-launch)

### Push Notifications
Architecture already in place (service worker, `push_subscriptions` table).

**Steps:**
1. Generate VAPID keys: `npx web-push generate-vapid-keys`
2. Store private key as Supabase secret
3. In app: prompt authenticated users to enable notifications
4. Store `PushSubscription` object in `push_subscriptions` table
5. Create Supabase Edge Function: triggered by Database Webhook on `INSERT` to `movies`
6. Edge Function reads all `push_subscriptions` rows, sends Web Push to each
7. Service worker handles `push` event, displays notification: "New movie added: {title} ({year})"

---

## Decisions Still Open

| Decision | Notes |
|---|---|
| App name for PWA manifest | Something short. "Movies"? "The Collection"? Derrik to decide. |
| PWA icons | Need to create/source 192px and 512px maskable icons |
| Individual list view sort options | Title A-Z only, or full sort controls? |
| Empty state illustrations | Plain text message or something more visual? |
| Movie request feature (stretch) | Users submit movie requests. Was in original mockup but deferred. |
