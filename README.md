# 🎬 Movie Collection

A mobile-first PWA for browsing, searching, and filtering a household movie collection. Built for
family use — public visitors can browse and search, while account holders can track watched movies,
build a watchlist, mark favorites, and request movies.

## Features

- Fuzzy search across ~2,000 titles (title + keywords)
- Filter by genre, MPAA rating, year, runtime, and TMDB rating
- Sort by date acquired, title, year, or rating
- Personal lists per account: Watched, Watchlist, Favorites, Ignored
- Actor filmography pages
- Account holders can request movies to be added and see who else wants them
- Push notifications for new movies, fulfilled requests, and request activity
- Movie detail pages with trailer/backdrop hero, cast, and streaming service links
- Admin tooling to add/edit movies with TMDB auto-populate, including fulfilling a request directly
- Installable as a PWA with an offline-capable service worker

## Tech Stack

| Concern | Choice |
|---|---|
| Framework | Vue 3 (Composition API) |
| Build tool | Vite |
| State management | Pinia |
| Routing | Vue Router (HTML5 history mode) |
| Styling | CSS Modules |
| Database + Auth | Supabase (Postgres + Supabase Auth) |
| Movie data | TMDB API |
| Fuzzy search | Fuse.js |
| Hosting | Cloudflare Pages |

## Project Setup

```sh
npm install
```

Create a `.env.local` file with:

```
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=
VITE_TMDB_TOKEN=
VITE_VAPID_PUBLIC_KEY=
```

Push notifications are sent from Supabase Edge Functions and require their own secrets
(`VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`, `SUPABASE_SERVICE_ROLE_KEY`, `MY_USER_ID`) set via
`supabase secrets` — see [CLAUDE.md](./CLAUDE.md) for details.

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```

## Documentation

Project architecture, conventions, and agent-facing context live in [CLAUDE.md](./CLAUDE.md).
