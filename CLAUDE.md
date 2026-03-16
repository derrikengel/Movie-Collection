# Movie Collection App — Claude Code Context

## What This Project Is
A mobile-first PWA for browsing, searching, and filtering a household movie collection (~2,000 titles, growing 2–5/month). 4 family members have accounts with personal lists. The public can browse without an account. Only Derrik (admin) can add/edit movies.

This is a **Vue 3 rebuild** of an existing Firebase/Vue app. The rebuild migrates to Supabase and adds per-user lists, TMDB-powered data entry, fuzzy search, faceted filtering, and push notifications.

**Live dev URL:** movies-dev.derrikengel.com
**Production URL:** movies.derrikengel.com (not yet switched over)
**GitHub branch:** `v3`
**Hosting:** Cloudflare Pages

---

## Developer Background
UI designer and front-end developer. Primary tools: HTML, SCSS, Tailwind, Vue, vanilla JS. No backend languages. Always prioritize clean, practical, accessible solutions. Avoid over-engineering.

---

## Code Style

- **Indentation:** 4 spaces (tab key converts to spaces)
- **Vue files:** `<script>` and `<style>` block contents are indented one level
- **CSS properties:** Alphabetized within each rule block
- **CSS and JS formatting:** Single space between property/key and value — never column-aligned
- **JavaScript:** Single quotes
- **Line length:** Soft limit 110 characters, hard limit 120
- **CSS Units:** Prefer REM units, but use what's most sensible situationally

---

## Tech Stack
| Concern | Choice |
|---|---|
| Framework | Vue 3 (Composition API), no TypeScript |
| Build tool | Vite |
| State management | Pinia |
| Routing | Vue Router (HTML5 history mode) |
| Styling | CSS Modules with `module="s"` on all components |
| Database + Auth | Supabase (Postgres + Supabase Auth) |
| Movie data API | TMDB (free, used only during admin data entry) |
| Fuzzy search | Fuse.js (client-side, searches `title` + `search_keywords`) |
| PWA tooling | vite-plugin-pwa (minimal — installability + push only) |
| YouTube player | @vue-youtube/core (muted autoplay background video) |
| Hosting | Cloudflare Pages |

---

## Styling Rules
- **Always use CSS Modules** with `<style module="s">` — classes accessed as `s.className`
- **camelCase class names** (not kebab-case) — required for JS property access
- **CSS custom properties** for all design tokens — defined in `src/assets/global.css`
- **Container queries** for component-level responsive layout (not media queries inside components)
- **Media queries** only for global layout concerns (showing/hiding desktop vs mobile nav)
- **No vendor prefixes** — drop `-webkit-` etc.
- **Frosted glass pattern:** `background: var(--color-bg-frosted); backdrop-filter: blur(Npx);`
- **All colors in oklch format** — use relative color syntax for opacity variants: `oklch(from var(--token) l c h / 0.12)`
- **No Tailwind** — scoped CSS Modules only

### Design Tokens (from global.css)

Two-layer architecture: **primitives** (color scales, spacing, radius, typography) + **semantic tokens** (what components use).

```css
/* Semantic color tokens — use these in components */
--color-bg                  /* page background */
--color-surface             /* card/panel background */
--color-surface-raised      /* elevated card */
--color-overlay             /* overlay/modal background */
--color-text                /* primary text */
--color-text-secondary      /* secondary text */
--color-text-muted          /* muted/placeholder text */
--color-text-on-accent      /* text on colored (accent) backgrounds */
--color-border              /* default border */
--color-border-subtle       /* subtle/faint border */
--color-border-strong       /* prominent border */
--color-accent              /* amber/gold accent */
--color-accent-bright       /* brighter accent */
--color-accent-muted        /* muted accent */
--color-accent-subtle       /* accent at 12% opacity */
--color-accent-glow         /* accent at 40% opacity */
--color-success             /* green */
--color-error               /* red */
--color-warning             /* amber */
--color-bg-frosted          /* bg at 85% opacity (frosted glass) */
--color-border-frosted      /* white at 6% opacity (frosted glass) */
--color-bg-hover            /* white at 5% opacity (hover states) */
--color-disabled            /* gray-800 — disabled element backgrounds */
--color-backdrop            /* black at 50% opacity (modal backdrops) */

/* Spacing: --size-1 through --size-12 (4px increments) */
/* Radius: --radius-sm(8px) --radius-md(12px) --radius-lg(16px) --radius-xl(24px) --radius-full(9999px) */
/* Typography: --text-xs through --text-3xl, --font-weight-*, --leading-* */
/* Layout: --header-height: 56px, --content-max-width: 960px, --content-padding */
/* Shadows: --shadow-sm, --shadow-md, --shadow-lg */
/* Transitions: --transition-fast, --transition-normal */
```

---

## Project File Structure
```
src/
├── assets/
│   └── global.css              # CSS layers: reset, tokens, base, utilities, components
├── components/
│   ├── AppTabBar.vue            # Mobile bottom tab bar (hidden on desktop)
│   ├── FilterBar.vue            # Search + filter controls (sticky, desktop + mobile)
│   ├── FilterSection.vue        # Collapsible section wrapper used in mobile filter sheet
│   ├── MovieHero.vue            # Hero banner: YouTube autoplay > backdrop > blurred poster
│   └── MovieList.vue            # Reusable movie grid
├── composables/                 # (empty, reserved)
├── lib/
│   └── supabase.js              # Supabase client (uses VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY)
├── router/
│   └── index.js                 # Vue Router with auth guards + initialized flag
├── stores/
│   ├── auth.js                  # Auth store: user, profile, isAdmin, displayName
│   ├── filters.js               # Filter + sort state, filteredMovies, URL sync
│   ├── movies.js                # Movies store: fetchMovies(), movies[], loading
│   └── userMovies.js            # User list store: optimistic upserts + rollback
└── views/
    ├── HomeView.vue              # Main browse/search/filter page
    ├── LoginView.vue             # Login form
    ├── MovieDetailView.vue       # Movie detail: hero, metadata, sticky action bar, services sheet
    ├── admin/
    │   ├── MovieFormView.vue     # Combined Add + Edit form (mode detected by route param)
    └── lists/
        ├── ProfileView.vue       # User dashboard: list previews + sign out
        ├── WatchlistView.vue
        ├── WatchedView.vue
        ├── FavoritesView.vue
        └── IgnoredView.vue
```

---

## Routes
```
/                      → HomeView (public)
/login                 → LoginView (public)
/:slug                 → MovieDetailView (public, e.g. /speak-no-evil-2024)
/profile               → ProfileView (requiresAuth)
/profile/watchlist     → WatchlistView (requiresAuth)
/profile/watched       → WatchedView (requiresAuth)
/profile/favorites     → FavoritesView (requiresAuth)
/profile/ignored       → IgnoredView (requiresAuth)
/admin/add             → MovieFormView (requiresAdmin)
/admin/edit/:slug      → MovieFormView (requiresAdmin)
```

---

## Key Architecture Decisions

### Data Flow
- On app init: single Supabase query fetches all `movies` + joined `movie_services`. Stored in Pinia. Fuse.js index built from this data.
- On login: fetch `user_movies` for the authenticated user, merge into `useUserMoviesStore`.
- User list toggles (watchlist/watched/favorite/ignored): optimistic local update first, then Supabase upsert. Rollback on failure.
- Admin add/edit: TMDB API calls in the form. On submit, write to Supabase, update local store without full refetch.
- No localStorage caching. Fresh fetch each session.

### Authentication
- 4 manually-created Supabase accounts. No public sign-up.
- `is_admin` flag on `profiles` table determines admin access.
- RLS policies enforce access at the database level (public read on movies, admin-only writes, user-scoped user_movies).

### CSS Modules + `backdrop-filter` Gotcha
**Critical:** Elements using `backdrop-filter` create a new stacking context that traps `position: fixed` children. Always use `<Teleport to="body">` for modals, bottom sheets, and overlays that need to escape their parent. This affects:
- Filter sheet in `FilterBar.vue`
- Services sheet in `MovieDetailView.vue`
- Any future modals/overlays

### MovieHero Background Tiers
1. Trailer exists → muted autoplaying YouTube via `@vue-youtube/core` (requires `app.use(createManager())` in main.js)
2. No trailer → backdrop image from TMDB
3. Neither → poster scaled up + heavily blurred as abstract color fill

### Bottom Bar on Movie Detail
- Sticky bottom bar with 5 slots: Watched · Watchlist · Play (center, elevated, amber) · Favorite · Ignore
- Play button opens a bottom sheet showing all streaming service links + disc format
- List buttons: active for logged-in users, greyed + tap-to-login-prompt for guests
- Both the bottom bar AND the mobile tab bar are visible on mobile detail pages — detail bar sits above tab bar

---

## Environment Variables
```
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
VITE_TMDB_TOKEN
```
All three set in `.env.local` and in Cloudflare Pages environment variables.

---

## Database Schema Summary

### `movies`
`id, tmdb_id, title, slug, search_keywords, year, runtime_minutes, description, genres (text[]), mpaa_rating, tmdb_rating, poster_path, backdrop_path, trailer_youtube_id, disc_format, notes, acquired_at`

### `movie_services`
`id, movie_id, service, quality, url`
Services: `fandango_at_home`, `apple_tv`, `youtube`, `plex`, `movies_anywhere`

### `user_movies`
`id, user_id, movie_id, watchlist, watched, favorite, ignored, updated_at`

### `profiles`
`id, display_name, is_admin`

### `push_subscriptions`
`id, user_id, subscription (jsonb), created_at`

---

## TMDB Integration
- Search: `GET /3/search/movie`
- On select, parallel fetch: `/movie/{id}`, `/movie/{id}/release_dates` (MPAA cert), `/movie/{id}/videos` (trailer)
- Store only the path (e.g. `/abc123.jpg`), construct URLs at render time:
  - Poster: `https://image.tmdb.org/t/p/w300{poster_path}`
  - Backdrop: `https://image.tmdb.org/t/p/w1280{backdrop_path}`
  - YouTube: `https://img.youtube.com/vi/{id}/...`
- Attribution required: "Powered by TMDB" badge in footer

---

## Filtering & Sorting (filters.js store)
- **Genre:** multi-select, AND logic
- **MPAA:** grouped (Family=G/PG, Teens=PG-13/TV-14, Mature=R/NC-17/TV-MA, Unrated=NR/null)
- **Year, Runtime, TMDB Rating:** min/max number inputs
- **Watched:** fade (default) / show / hide
- **Ignored:** hide (default) / show
- **Sort:** acquired-desc (default), acquired-asc, title-asc, title-desc, year-desc, year-asc, rating-desc, rating-asc
- All filter state syncs to URL query params bidirectionally
- `visibleMovies` computed = filteredMovies with watched-hide applied
- `isWatchedFaded(movie)` returns true when watchedMode=fade and movie is watched

---

## What's Built (as of this handoff)
- ✅ Supabase project, tables, RLS policies, 4 user accounts
- ✅ Cloudflare Pages + dev subdomain
- ✅ Vue 3 + Vite + Pinia + Vue Router scaffolded
- ✅ All stores: auth, movies, userMovies, filters
- ✅ App.vue with frosted glass header + desktop nav
- ✅ AppTabBar.vue (mobile bottom nav, hidden on desktop)
- ✅ HomeView with FilterBar + movie grid (faded watched movies)
- ✅ FilterBar.vue with mobile sheet + desktop dropdowns + URL sync
- ✅ FilterSection.vue (collapsible sections for mobile sheet)
- ✅ MovieHero.vue (YouTube autoplay > backdrop > blurred poster)
- ✅ MovieDetailView.vue with sticky action bar + services bottom sheet
- ✅ MovieFormView.vue (combined Add + Edit, TMDB search + auto-populate)
- ✅ ProfileView.vue (user dashboard: list previews + sign out)
- ✅ LoginView.vue

## What's Not Built Yet
- ⬜ WatchlistView, WatchedView, FavoritesView, IgnoredView (individual list management pages — currently placeholders)
- ⬜ PWA manifest + service worker configuration (vite-plugin-pwa)
- ⬜ Push notifications (v1.1 — Supabase Edge Function + VAPID)
- ⬜ Data migration script (Firebase → Supabase, ~2,000 movies)
- ⬜ Footer with TMDB attribution
- ⬜ Loading states, error handling, empty states (polish pass)
- ⬜ Accessibility audit
- ⬜ Production domain switch (movies.derrikengel.com → Cloudflare Pages)

---

## Known Issues / Things to Watch For
1. **`backdrop-filter` + `position: fixed`** — always use `<Teleport to="body">` for overlays
2. **Filter sheet top offset** — currently uses a hardcoded `calc(var(--header-height) + 120px)`. May need adjustment if the filter bar height changes.
3. **`@vue-youtube/core` requires `app.use(createManager())`** in `main.js` — already done, but don't remove it
4. **CSS Modules active-class on RouterLink** — Vue Router's `:active-class` prop accepts a string, but with CSS Modules the hashed class name must be passed dynamically. Pattern: `:active-class="s.navLinkActive"`
5. **Reactive badge values in computed arrays** — don't snapshot `.value` inside a computed object literal. Either inline the filter expression directly or use the ref itself and access `.value` in the template.
