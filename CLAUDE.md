# Movie Collection App — Claude Code Context

## What This Project Is
A mobile-first PWA for browsing, searching, and filtering a household movie collection (~2,000 titles, growing 2–5/month). 4 family members have accounts with personal lists. The public can browse without an account. Only admins can add/edit movies.

**Live dev URL:** movies-dev.derrikengel.com
**Production URL:** movies.derrikengel.com
**GitHub branch:** `master`
**Hosting:** Cloudflare Pages

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
- **Vendor prefixes only when no standard exists** — avoid `-webkit-` etc. unless absolutely necessary
- **Frosted glass pattern:** `background: var(--color-bg-frosted); backdrop-filter: var(--bg-frosted-md);` — pick the blur size that fits the context
- **All colors in oklch format** — use relative color syntax for opacity variants: `oklch(from var(--blue-950) l c h / 0.5)`
- **Primitives over aliases** — semantic alias tokens don't exist; use palette primitives directly (e.g. `var(--blue-200)` for body text, `var(--blue-950)` for page background)

### Design Tokens (from global.css)

```css
/* Primitive color scales — blue/red/green/yellow/purple, steps 50–950 */
/* e.g. --blue-950 (page bg), --blue-200 (body text), --yellow-400 (accent) */
/* Built from shared --l-* (lightness) and --c-* (chroma) scales + per-hue --*-h values */

/* List-specific color ramps (full 50–950 scale) */
--color-watched-*    /* green */
--color-watchlist-*  /* purple */
--color-favorite-*   /* yellow */
--color-ignored-*    /* red */

/* List context pattern — utility classes set --color-list-* to the active ramp */
/* .list-watched / .list-watchlist / .list-favorite / .list-ignored */
/* Components use --color-list-400, --color-list-700, etc. for context-aware coloring */

/* Frosted glass */
--color-bg-frosted              /* blue-800 at 85% opacity */
--color-bg-frosted-subtle       /* blue-950 at 50% opacity */
--color-divider-frosted         /* blue-400 at 10% opacity */
--color-bg-frosted-selected     /* blue-400 at 20% opacity */
--color-bg-frosted-unselected   /* blue-950 at 20% opacity */
--color-frosted-input           /* blue-950 at 50% opacity */
--color-frosted-input-focus     /* blue-950 at 75% opacity */
--bg-frosted-xs/sm/md/lg/xl/2xl/3xl/4xl/5xl/6xl  /* blur() scale */

/* Utility */

/* Service brand tokens (utility classes on container elements) */
/* .svc-fandango-at-home / .svc-movies-anywhere / .svc-apple-tv / .svc-youtube / .svc-plex */
/* Each sets --brand-fg, --brand-bg, --btn-bg, --btn-fg */

/* Spacing: --size-0-5, --size-1 through --size-24 (0.25rem base) */
/* Radius: --radius-xs(2px) --radius-sm(4px) --radius-md(6px) --radius-lg(8px) --radius-xl(12px) --radius-2xl(16px) --radius-3xl(24px) --radius-4xl(32px) --radius-full */
/* Typography: --font-sans (futura-pt), --text-2xs through --text-9xl, --font-weight-*, --leading-*, --tracking-* */
/* Layout: --content-width(64rem), --content-padding (responsive: 20px→32px→48px→64px), --tab-bar-height(64px) */
/* Shadows: --shadow-2xs/xs/sm/md/lg/xl/2xl, --text-shadow-2xs/xs/sm/md/lg */
/* Transitions: --transition-fast(150ms), --transition-normal(250ms), --transition-slow(500ms) */
```

---

## Project File Structure
```
src/
├── assets/
│   └── global.css              # CSS layers: reset, tokens, base, utilities, components
├── components/
│   ├── detail/
│   │   ├── MovieActionBar.vue  # action buttons (watched/watchlist/favorite/ignore)
│   │   ├── MovieCast.vue       # cast list
│   │   ├── MovieHero.vue       # hero banner: YouTube > backdrop > blurred poster
│   │   └── MovieServices.vue   # streaming services bottom sheet
│   ├── filters/
│   │   ├── FilterOptionList.vue   # multi-select option list
│   │   ├── FilterRangeSlider.vue  # dual-handle range slider
│   │   ├── NarrowFilterPanel.vue  # mobile filter sheet
│   │   └── ToggleSwitch.vue       # toggle for watched/ignored modes
│   ├── grid/
│   │   ├── MovieCard.vue       # individual movie card
│   │   └── MovieGrid.vue       # paginated grid (infinite scroll, filter integration)
│   ├── navigation/
│   │   ├── AppHeader.vue       # header with search, sort, filter UI, nav links
│   │   └── NarrowTabBar.vue    # mobile bottom tab bar (hidden on desktop)
│   ├── profile/
│   │   └── ProfileListCard.vue # list preview card (used in ProfileView)
│   ├── ConfirmDialog.vue       # promise-based confirmation modal (scaffolded, not active yet)
│   └── ToastStack.vue          # renders active toasts
├── composables/
│   ├── useConfirm.js           # wraps confirm store with a promisified request() call
│   ├── useDualSlider.js        # dual-handle range slider logic
│   ├── useListCounts.js        # watchlist + favorites counts from userMovies
│   ├── useMovieActions.js      # list action toggles with toast feedback
│   ├── useMovieForm.js         # admin form state
│   ├── useMovieSubmit.js       # admin form submission (add/edit)
│   ├── usePageTitle.js         # dynamic <title> updates
│   └── useTmdbSearch.js        # TMDB search + selection logic
├── lib/
│   ├── datetime.js             # date utilities (e.g. releaseYear)
│   ├── filterOptions.js        # filter/sort option constants (mpaaGroupOptions, sortOptions, etc.)
│   ├── icons.js                # service icon SVGs keyed by service name
│   ├── movies.js               # movie utility functions
│   ├── supabase.js             # Supabase client (uses VITE_SUPABASE_URL + VITE_SUPABASE_PUBLISHABLE_KEY)
│   └── tmdb.js                 # TMDB API helpers
├── router/
│   └── index.js                # Vue Router with auth guards + initialized flag
├── stores/
│   ├── auth.js                 # user, profile, isAdmin, displayName
│   ├── confirm.js              # promise-based confirmation dialog state
│   ├── filters.js              # filter + sort state, filteredMovies, URL sync
│   ├── movies.js               # fetchMovies(), movies[], loading
│   ├── navContext.js           # source list tracking for back navigation
│   ├── toast.js                # toast queue (max 3 visible, auto-dismiss after 3s)
│   └── userMovies.js           # user list store: optimistic upserts + rollback
└── views/
    ├── HomeView.vue            # main browse/search/filter page
    ├── LoginView.vue           # login form
    ├── MovieDetailView.vue     # movie detail: hero, metadata, action bar, services sheet
    ├── ProfileView.vue         # user dashboard: list previews + sign out
    ├── StyleGuideView.vue      # color palette reference (requiresAdmin)
    ├── admin/
    │   └── MovieFormView.vue   # combined Add + Edit form (mode detected by route param)
    └── lists/
        ├── FavoritesView.vue
        ├── IgnoredView.vue
        ├── WatchedView.vue
        └── WatchlistView.vue
```

---

## Routes
```
/                      → HomeView (public)
/login                 → LoginView (public)
/:slug                 → MovieDetailView (public, e.g. /speak-no-evil-2024)
/user/:name            → ProfileView (requiresAuth)
/user/:name/watchlist  → WatchlistView (requiresAuth)
/user/:name/watched    → WatchedView (requiresAuth)
/user/:name/favorites  → FavoritesView (requiresAuth)
/user/:name/ignored    → IgnoredView (requiresAuth)
/styleguide            → StyleGuideView (requiresAdmin)
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
- Filter panel in `AppHeader.vue` / `NarrowFilterPanel.vue`
- Services sheet in `MovieServices.vue`
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
VITE_SUPABASE_PUBLISHABLE_KEY
VITE_TMDB_TOKEN
```
All three set in `.env.local` and in Cloudflare Pages environment variables.

---

## Database Schema Summary

### `movies`
`id, tmdb_id, title, slug, search_keywords, release_date (date), runtime_minutes, description, genres (text[]), mpaa_rating, tmdb_rating, poster_path, backdrop_path, trailer_youtube_id, disc_format, notes, acquired_at, cast_members (jsonb)`

### `movie_services`
`id, movie_id, service, quality, url`
Services: `fandango_at_home`, `apple_tv`, `youtube`, `plex`, `movies_anywhere`

### `user_movies`
`id, user_id, movie_id, watchlist, watched, favorite, ignored, updated_at, watchlist_added_at, watched_at, favorited_at, ignored_at`

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

---

## Filtering & Sorting (filters.js store)
- **Genre:** multi-select, AND logic
- **MPAA:** grouped (Family=G/PG, Teens=PG-13/TV-14, Mature=R/NC-17/TV-MA, Unrated=NR/null)
- **Year, Runtime, TMDB Rating:** min/max number inputs with dynamic bounds
- **Watched:** fade (default) / show / hide
- **Ignored:** hide (default) / show
- **Sort:** acquired-desc (default), acquired-asc, title-asc, title-desc, year-desc, year-asc, rating-desc, rating-asc
- All filter state syncs to URL query params bidirectionally
- `visibleMovies` computed = filteredMovies with watched-hide applied
- `isWatchedFaded(movie)` returns true when watchedMode=fade and movie is watched
- `setBase(movies)` — restricts the filter pool to a subset; `MovieGrid` calls this on mount with its `movies` prop (used by list views to scope filtering to e.g. only favorited movies)
- `setDefaults(options)` — lets individual views override initial filter state on mount

---

## What's Built
- ✅ Supabase project, tables, RLS policies, 4 user accounts
- ✅ Cloudflare Pages + dev subdomain, production domain live
- ✅ Vue 3 + Vite + Pinia + Vue Router scaffolded
- ✅ All stores: auth, movies, userMovies, filters, toast, navContext, confirm
- ✅ App.vue with frosted glass header + desktop nav
- ✅ AppHeader.vue with embedded filter UI, search, sort, nav links
- ✅ NarrowTabBar.vue (mobile bottom nav, hidden on desktop)
- ✅ HomeView with filter UI + movie grid (faded watched movies)
- ✅ MovieGrid.vue (infinite scroll, filter integration via setBase)
- ✅ MovieHero.vue (YouTube autoplay > backdrop > blurred poster)
- ✅ MovieDetailView.vue with sticky action bar + services bottom sheet
- ✅ MovieFormView.vue (combined Add + Edit, TMDB search + auto-populate)
- ✅ ProfileView.vue (user dashboard: list previews + sign out)
- ✅ WatchlistView, WatchedView, FavoritesView, IgnoredView (functional with filtering, infinite scroll, empty states)
- ✅ LoginView.vue
- ✅ Toast notification system (ToastStack + toast store)
- ✅ StyleGuideView (color palette reference for admins)

## What's Not Built Yet
- ⬜ PWA manifest + service worker configuration (vite-plugin-pwa)
- ⬜ Push notifications (v1.1 — Supabase Edge Function + VAPID)
- ⬜ Loading states, error handling, empty states (polish pass)
- ⬜ Accessibility audit

---

## Known Issues / Things to Watch For
1. **`backdrop-filter` + `position: fixed`** — always use `<Teleport to="body">` for overlays
2. **`@vue-youtube/core` requires `app.use(createManager())`** in `main.js` — already done, but don't remove it
3. **CSS Modules active-class on RouterLink** — Vue Router's `:active-class` prop accepts a string, but with CSS Modules the hashed class name must be passed dynamically. Pattern: `:active-class="s.navLinkActive"`
4. **Reactive badge values in computed arrays** — don't snapshot `.value` inside a computed object literal. Either inline the filter expression directly or use the ref itself and access `.value` in the template.

---

## Agent skills

### Issue tracker

Issues live in GitHub Issues on `derrikengel/Movie-Collection`. See `docs/agents/issue-tracker.md`.

### Triage labels

Default five-role vocabulary (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context layout — `CONTEXT.md` + `docs/adr/` at the repo root. See `docs/agents/domain.md`.
