<template>
  <div v-if="movie" :class="s.page">

    <MovieHero :movie="movie" />

    <div :class="s.content">
      <div :class="s.poster">
        <img
          v-if="movie.poster_path"
          :src="`https://image.tmdb.org/t/p/w300${movie.poster_path}`"
          :alt="movie.title"
        />
      </div>

      <div :class="s.meta">
        <h1 :class="s.title">{{ movie.title }}</h1>

        <div :class="s.tags">
          <span :class="s.tag">{{ movie.year }}</span>
          <span v-if="movie.runtime_minutes" :class="s.tag">{{ formattedRuntime }}</span>
          <span v-if="movie.mpaa_rating" :class="s.tag">{{ movie.mpaa_rating }}</span>
          <span v-if="movie.tmdb_rating" :class="s.tag">⭐ {{ movie.tmdb_rating.toFixed(1) }}</span>
        </div>

        <div v-if="movie.genres?.length" :class="s.genres">
          <span v-for="genre in movie.genres" :key="genre" :class="s.genre">{{ genre }}</span>
        </div>

        <p v-if="movie.description" :class="s.description">{{ movie.description }}</p>

        <p v-if="movie.notes" :class="s.notes">{{ movie.notes }}</p>

        <RouterLink
          v-if="auth.isAdmin"
          :to="`/admin/edit/${movie.slug}`"
          :class="s.editLink"
        >
          Edit Movie
        </RouterLink>
      </div>
    </div>

    <!-- Sticky bottom bar -->
    <div :class="s.bottomBar">
      <button
        v-for="action in actions"
        :key="action.field"
        :class="[s.barBtn, isActive(action.field) && s.barBtnActive, !auth.user && s.barBtnGuest]"
        @click="handleAction(action.field)"
        :aria-label="action.label"
        :title="action.label"
      >
        <span :class="s.barBtnIcon" v-html="action.icon" aria-hidden="true" />
        <span :class="s.barBtnLabel">{{ action.label }}</span>
      </button>

      <!-- Center play button -->
      <button
        v-if="hasServices"
        :class="[s.barBtn, s.barBtnPlay]"
        @click="sheetOpen = true"
        aria-label="Watch options"
      >
        <span :class="s.playIcon" aria-hidden="true">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path d="M6.5 4.5l9 5.5-9 5.5V4.5z"/>
          </svg>
        </span>
      </button>
    </div>

    <!-- Bottom sheet backdrop -->
    <Transition :name="'fade'">
      <div v-if="sheetOpen" :class="s.backdrop" @click="sheetOpen = false" aria-hidden="true" />
    </Transition>

    <!-- Bottom sheet -->
    <Transition name="sheet">
      <div
        v-if="sheetOpen"
        :class="s.sheet"
        role="dialog"
        aria-modal="true"
        aria-label="Watch options"
      >
        <div :class="s.sheetHandle" />
        <h2 :class="s.sheetTitle">Watch</h2>

        <div :class="s.sheetServices">
        <a
            v-for="service in movie.movie_services"
            :key="service.id"
            :href="service.url"
            target="_blank"
            rel="noopener noreferrer"
            :class="s.sheetService"
          >
            <span :class="s.sheetServiceName">{{ formatService(service.service) }}</span>
            <span v-if="service.quality" :class="s.sheetServiceQuality">{{ service.quality }}</span>
          </a>

          <div v-if="movie.disc_format" :class="s.sheetDisc">
            <span :class="s.sheetServiceName">{{ movie.disc_format }}</span>
            <span :class="s.sheetServiceQuality">Disc</span>
          </div>
        </div>

        <button :class="s.sheetClose" @click="sheetOpen = false">Dismiss</button>
      </div>
    </Transition>

    <!-- Login prompt toast -->
    <Transition name="fade">
      <div v-if="loginPrompt" :class="s.loginPrompt" role="status">
        <RouterLink to="/login" :class="s.loginPromptLink">Sign in</RouterLink>
        to save movies to your lists
      </div>
    </Transition>

  </div>

  <div v-else-if="notFound" :class="s.notFound">
    <p>Movie not found.</p>
    <RouterLink to="/">Back to collection</RouterLink>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useMoviesStore } from '@/stores/movies'
import { useAuthStore } from '@/stores/auth'
import { useUserMoviesStore } from '@/stores/userMovies'
import MovieHero from '@/components/MovieHero.vue'

const route = useRoute()
const moviesStore = useMoviesStore()
const auth = useAuthStore()
const userMoviesStore = useUserMoviesStore()

const movie = computed(() =>
  moviesStore.movies.find(m => m.slug === route.params.slug) ?? null
)
const notFound = computed(() => !moviesStore.loading && movie.value === null)
const userMovie = computed(() =>
  movie.value ? userMoviesStore.getForMovie(movie.value.id) : null
)
const hasServices = computed(() =>
  movie.value?.movie_services?.length || movie.value?.disc_format
)
const formattedRuntime = computed(() => {
  if (!movie.value?.runtime_minutes) return null
  const h = Math.floor(movie.value.runtime_minutes / 60)
  const m = movie.value.runtime_minutes % 60
  return h > 0 ? `${h}h ${m}m` : `${m}m`
})

const sheetOpen = ref(false)
const loginPrompt = ref(false)
let loginPromptTimer = null

const actions = [
  {
    field: 'watched',
    label: 'Watched',
    icon: `<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path d="M10 3C5.5 3 1.73 5.61 0 9.5 1.73 13.39 5.5 16 10 16s8.27-2.61 10-6.5C18.27 5.61 14.5 3 10 3zm0 11a4.5 4.5 0 1 1 0-9 4.5 4.5 0 0 1 0 9zm0-7a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5z"/></svg>`,
  },
  {
    field: 'watchlist',
    label: 'Watchlist',
    icon: `<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path d="M5 2a2 2 0 0 0-2 2v14l7-3 7 3V4a2 2 0 0 0-2-2H5z"/></svg>`,
  },
  {
    field: 'favorite',
    label: 'Favorite',
    icon: `<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 0 0 .95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.368 2.448a1 1 0 0 0-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118l-3.368-2.448a1 1 0 0 0-1.175 0l-3.368 2.448c-.784.57-1.838-.197-1.539-1.118l1.287-3.957a1 1 0 0 0-.364-1.118L2.063 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 0 0 .95-.69l1.286-3.957z"/></svg>`,
  },
  {
    field: 'ignored',
    label: 'Ignore',
    icon: `<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM8.28 7.22a.75.75 0 0 0-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 1 0 1.06 1.06L10 11.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L11.06 10l1.72-1.72a.75.75 0 0 0-1.06-1.06L10 8.94 8.28 7.22z" clip-rule="evenodd"/></svg>`,
  },
]

function isActive(field) {
  return userMovie.value?.[field] === true
}

async function handleAction(field) {
  if (!auth.user) {
    showLoginPrompt()
    return
  }
  await userMoviesStore.toggle(auth.user.id, movie.value.id, field)
}

function showLoginPrompt() {
  loginPrompt.value = true
  clearTimeout(loginPromptTimer)
  loginPromptTimer = setTimeout(() => { loginPrompt.value = false }, 3000)
}

function formatService(slug) {
  const names = {
    fandango_at_home: 'Fandango at Home',
    apple_tv: 'Apple TV',
    youtube: 'YouTube',
    plex: 'Plex',
    movies_anywhere: 'Movies Anywhere',
  }
  return names[slug] ?? slug
}
</script>

<style module="s">
.page {
  container-type: inline-size;
  padding-bottom: 80px; /* room for sticky bar */
}

.content {
  display: flex;
  gap: var(--space-4);
  padding: var(--content-padding);
  margin-top: -60px;
  position: relative;
  max-width: var(--content-max-width);
  margin-inline: auto;
}

.poster {
  flex-shrink: 0;
  width: 100px;
}

.poster img {
  width: 100%;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  display: block;
}

@container (min-width: 600px) {
  .content {
    margin-top: -100px;
  }
  .poster {
    width: 180px;
  }
}

.meta {
  flex: 1;
  min-width: 0;
  padding-top: var(--space-6);
}

.title {
  font-size: var(--text-xl);
  font-weight: var(--font-weight-bold);
  line-height: var(--leading-tight);
  margin-bottom: var(--space-3);
  color: var(--color-text-primary);
}

@container (min-width: 600px) {
  .title { font-size: var(--text-3xl); }
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  margin-bottom: var(--space-3);
}

.tag {
  font-size: var(--text-xs);
  font-weight: var(--font-weight-medium);
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-sm);
  padding: var(--space-1) var(--space-2);
  color: var(--color-text-secondary);
}

.genres {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  margin-bottom: var(--space-4);
}

.genre {
  font-size: var(--text-xs);
  font-weight: var(--font-weight-medium);
  color: var(--color-accent);
  background: rgba(245, 166, 35, 0.1);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(245, 166, 35, 0.25);
  border-radius: var(--radius-full);
  padding: var(--space-1) var(--space-3);
}

.description {
  font-size: var(--text-sm);
  line-height: var(--leading-normal);
  color: var(--color-text-secondary);
  margin-bottom: var(--space-5);
}

.notes {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  font-style: italic;
  margin-bottom: var(--space-4);
}

.editLink {
  display: inline-flex;
  align-items: center;
  padding: var(--space-2) var(--space-4);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  background: none;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-muted);
  transition: border-color var(--transition-fast), color var(--transition-fast);
}

.editLink:hover {
  border-color: var(--color-border-strong);
  color: var(--color-text-primary);
}

/* ─── Bottom bar ─── */
.bottomBar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 72px;
  display: flex;
  align-items: center;
  justify-content: space-around;
  background: rgba(13, 13, 15, 0.5);
  backdrop-filter: blur(12px);
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  padding: 0 var(--space-2);
  padding-bottom: env(safe-area-inset-bottom);
  z-index: 50;
}

.barBtn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-2);
  background: none;
  border: none;
  color: var(--color-text-muted);
  font-size: var(--text-2xs, 10px);
  font-weight: var(--font-weight-medium);
  letter-spacing: 0.04em;
  text-transform: uppercase;
  transition: color var(--transition-fast);
  min-width: 56px;
}

.barBtn:hover {
  color: var(--color-text-secondary);
}

.barBtnActive {
  color: var(--color-accent);
}

.barBtnGuest {
  opacity: 0.4;
}

.barBtnIcon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.barBtnLabel {
  font-size: 10px;
}

.barBtnPlay {
  width: 52px;
  height: 52px;
  border-radius: var(--radius-full);
  background: var(--color-accent);
  color: #000;
  min-width: unset;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 16px rgba(245, 166, 35, 0.4);
  transition: background var(--transition-fast), transform var(--transition-fast);
}

.barBtnPlay:hover {
  background: var(--color-accent-bright);
  transform: scale(1.05);
}

.playIcon {
  display: flex;
  align-items: center;
  justify-content: center;
  padding-left: 2px; /* optical centering for play triangle */
}

/* ─── Bottom sheet ─── */
.backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  z-index: 60;
  backdrop-filter: blur(4px);
}

.sheet {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(22, 22, 26, 0.85);
  backdrop-filter: blur(24px);
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: var(--radius-xl) var(--radius-xl) 0 0;
  padding: var(--space-3) var(--space-5) var(--space-6);
  padding-bottom: calc(var(--space-6) + env(safe-area-inset-bottom));
  z-index: 70;
  max-width: 600px;
  margin: 0 auto;
}

.sheetHandle {
  width: 36px;
  height: 4px;
  border-radius: var(--radius-full);
  background: var(--color-border-strong);
  margin: 0 auto var(--space-4);
}

.sheetTitle {
  font-size: var(--text-xs);
  font-weight: var(--font-weight-semibold);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-text-muted);
  margin-bottom: var(--space-3);
}

.sheetServices {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  margin-bottom: var(--space-4);
}

.sheetService {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-3) var(--space-4);
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  transition: border-color var(--transition-fast);
}

.sheetService:hover {
  border-color: var(--color-border-strong);
}

.sheetDisc {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-3) var(--space-4);
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
}

.sheetServiceName {
  font-size: var(--text-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.sheetServiceQuality {
  font-size: var(--text-xs);
  font-weight: var(--font-weight-semibold);
  color: var(--color-accent);
}

.sheetClose {
  width: 100%;
  padding: var(--space-3);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  background: none;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
  transition: border-color var(--transition-fast), color var(--transition-fast);
}

.sheetClose:hover {
  border-color: var(--color-border-strong);
  color: var(--color-text-primary);
}

/* ─── Login prompt ─── */
.loginPrompt {
  position: fixed;
  bottom: 84px;
  left: 50%;
  transform: translateX(-50%);
  white-space: nowrap;
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  padding: var(--space-2) var(--space-4);
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  z-index: 55;
  box-shadow: var(--shadow-lg);
}

.loginPromptLink {
  color: var(--color-accent);
  font-weight: var(--font-weight-semibold);
  margin-right: var(--space-1);
}

/* ─── Not found ─── */
.notFound {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-12) var(--content-padding);
  color: var(--color-text-muted);
  font-size: var(--text-sm);
}
</style>

<style>
/* Sheet transition — global because Vue applies these to the element directly */
.sheet-enter-active,
.sheet-leave-active {
  transition: transform 0.3s cubic-bezier(0.32, 0.72, 0, 1);
}
.sheet-enter-from,
.sheet-leave-to {
  transform: translateY(100%);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
