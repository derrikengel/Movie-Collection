import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useMoviesStore } from '@/stores/movies'
import { useUserMoviesStore } from '@/stores/userMovies'
import Fuse from 'fuse.js'

export const useFiltersStore = defineStore('filters', () => {
  const moviesStore = useMoviesStore()
  const userMoviesStore = useUserMoviesStore()
  const router = useRouter()
  const route = useRoute()

  // ── State ──────────────────────────────────────────
  const search = ref('')
  const genres = ref([])       // AND logic
  const mpaaGroups = ref([])   // 'family', 'teens', 'mature', 'unrated'
  const yearMin = ref(null)
  const yearMax = ref(null)
  const runtimeMin = ref(null)
  const runtimeMax = ref(null)
  const ratingMin = ref(null)
  const ratingMax = ref(null)
  const watchedMode = ref('fade')   // 'fade' | 'show' | 'hide'
  const ignoredMode = ref('hide')   // 'hide' | 'show'
  const sort = ref('acquired-desc')

  // ── MPAA groups ────────────────────────────────────
  const mpaaMap = {
    family:  ['G', 'PG'],
    teens:   ['PG-13', 'TV-14'],
    mature:  ['R', 'NC-17', 'TV-MA'],
    unrated: ['NR', 'Not Rated', 'Unrated', null, ''],
  }

  // ── Genre counts ───────────────────────────────────
  const genreCounts = computed(() => {
    const counts = {}
    for (const movie of moviesStore.movies) {
      for (const g of movie.genres ?? []) {
        counts[g] = (counts[g] ?? 0) + 1
      }
    }
    return counts
  })

  const allGenres = computed(() =>
    Object.keys(genreCounts.value).sort()
  )

  // ── Fuse instance ──────────────────────────────────
  const fuse = computed(() => new Fuse(moviesStore.movies, {
    keys: ['title', 'search_keywords'],
    threshold: 0.3,
    includeScore: true,
  }))

  // ── Filtered + sorted movies ───────────────────────
  const filteredMovies = computed(() => {
    let results = moviesStore.movies

    // Search
    if (search.value.trim()) {
      results = fuse.value.search(search.value.trim()).map(r => r.item)
    }

    // Genre (AND)
    if (genres.value.length) {
      results = results.filter(m =>
        genres.value.every(g => m.genres?.includes(g))
      )
    }

    // MPAA groups
    if (mpaaGroups.value.length) {
      const allowed = mpaaGroups.value.flatMap(g => mpaaMap[g])
      results = results.filter(m =>
        allowed.includes(m.mpaa_rating ?? null) ||
        allowed.includes(m.mpaa_rating ?? '')
      )
    }

    // Year range
    if (yearMin.value !== null) results = results.filter(m => m.year >= yearMin.value)
    if (yearMax.value !== null) results = results.filter(m => m.year <= yearMax.value)

    // Runtime range
    if (runtimeMin.value !== null) results = results.filter(m => m.runtime_minutes >= runtimeMin.value)
    if (runtimeMax.value !== null) results = results.filter(m => m.runtime_minutes <= runtimeMax.value)

    // TMDB rating range
    if (ratingMin.value !== null) results = results.filter(m => m.tmdb_rating >= ratingMin.value)
    if (ratingMax.value !== null) results = results.filter(m => m.tmdb_rating <= ratingMax.value)

    // Ignored
    if (ignoredMode.value === 'hide') {
      const ignoredIds = new Set(
        userMoviesStore.userMovies.filter(m => m.ignored).map(m => m.movie_id)
      )
      results = results.filter(m => !ignoredIds.has(m.id))
    }

    // Sort (skip if searching — Fuse order is relevance)
    if (!search.value.trim()) {
      results = [...results].sort((a, b) => {
        switch (sort.value) {
          case 'acquired-desc': return new Date(b.acquired_at) - new Date(a.acquired_at)
          case 'acquired-asc':  return new Date(a.acquired_at) - new Date(b.acquired_at)
          case 'title-asc':     return a.title.localeCompare(b.title)
          case 'title-desc':    return b.title.localeCompare(a.title)
          case 'year-desc':     return (b.year ?? 0) - (a.year ?? 0)
          case 'year-asc':      return (a.year ?? 0) - (b.year ?? 0)
          case 'rating-desc':   return (b.tmdb_rating ?? 0) - (a.tmdb_rating ?? 0)
          case 'rating-asc':    return (a.tmdb_rating ?? 0) - (b.tmdb_rating ?? 0)
          default:              return 0
        }
      })
    }

    return results
  })

  // Watched mode applied separately so faded movies are still in the list
  const watchedMovieIds = computed(() =>
    new Set(userMoviesStore.userMovies.filter(m => m.watched).map(m => m.movie_id))
  )

  function isWatchedFaded(movie) {
    return watchedMode.value === 'fade' && watchedMovieIds.value.has(movie.id)
  }

  // Movies with watched hidden filtered out
  const visibleMovies = computed(() => {
    if (watchedMode.value === 'hide') {
      return filteredMovies.value.filter(m => !watchedMovieIds.value.has(m.id))
    }
    return filteredMovies.value
  })

  // ── Active filter count ────────────────────────────
  const activeFilterCount = computed(() => {
    let count = 0
    if (genres.value.length) count++
    if (mpaaGroups.value.length) count++
    if (yearMin.value !== null || yearMax.value !== null) count++
    if (runtimeMin.value !== null || runtimeMax.value !== null) count++
    if (ratingMin.value !== null || ratingMax.value !== null) count++
    if (watchedMode.value !== 'fade') count++
    if (ignoredMode.value !== 'hide') count++
    return count
  })

  // ── Random pick ────────────────────────────────────
  function randomMovie() {
    const pool = visibleMovies.value
    if (!pool.length) return null
    return pool[Math.floor(Math.random() * pool.length)]
  }

  // ── Reset ──────────────────────────────────────────
  function reset() {
    search.value = ''
    genres.value = []
    mpaaGroups.value = []
    yearMin.value = null
    yearMax.value = null
    runtimeMin.value = null
    runtimeMax.value = null
    ratingMin.value = null
    ratingMax.value = null
    watchedMode.value = 'fade'
    ignoredMode.value = 'hide'
    sort.value = 'acquired-desc'
  }

  // ── URL sync ───────────────────────────────────────
  function toQueryParams() {
    const p = {}
    if (search.value)            p.q = search.value
    if (genres.value.length)     p.genre = genres.value.join(',')
    if (mpaaGroups.value.length) p.mpaa = mpaaGroups.value.join(',')
    if (yearMin.value !== null)  p.ymin = yearMin.value
    if (yearMax.value !== null)  p.ymax = yearMax.value
    if (runtimeMin.value !== null) p.rmin = runtimeMin.value
    if (runtimeMax.value !== null) p.rmax = runtimeMax.value
    if (ratingMin.value !== null) p.tmin = ratingMin.value
    if (ratingMax.value !== null) p.tmax = ratingMax.value
    if (watchedMode.value !== 'fade')  p.watched = watchedMode.value
    if (ignoredMode.value !== 'hide')  p.ignored = ignoredMode.value
    if (sort.value !== 'acquired-desc') p.sort = sort.value
    return p
  }

  function fromQueryParams(query) {
    if (query.q)      search.value = query.q
    if (query.genre)  genres.value = query.genre.split(',')
    if (query.mpaa)   mpaaGroups.value = query.mpaa.split(',')
    if (query.ymin)   yearMin.value = Number(query.ymin)
    if (query.ymax)   yearMax.value = Number(query.ymax)
    if (query.rmin)   runtimeMin.value = Number(query.rmin)
    if (query.rmax)   runtimeMax.value = Number(query.rmax)
    if (query.tmin)   ratingMin.value = Number(query.tmin)
    if (query.tmax)   ratingMax.value = Number(query.tmax)
    if (query.watched) watchedMode.value = query.watched
    if (query.ignored) ignoredMode.value = query.ignored
    if (query.sort)   sort.value = query.sort
  }

  function initFromUrl() {
    fromQueryParams(route.query)
  }

  watch(
    [search, genres, mpaaGroups, yearMin, yearMax, runtimeMin, runtimeMax,
     ratingMin, ratingMax, watchedMode, ignoredMode, sort],
    () => {
      router.replace({ query: toQueryParams() })
    },
    { deep: true }
  )

  return {
    search, genres, mpaaGroups,
    yearMin, yearMax,
    runtimeMin, runtimeMax,
    ratingMin, ratingMax,
    watchedMode, ignoredMode,
    sort,
    allGenres, genreCounts,
    filteredMovies, visibleMovies,
    activeFilterCount,
    isWatchedFaded,
    randomMovie, reset,
    initFromUrl,
    mpaaMap,
  }
})
