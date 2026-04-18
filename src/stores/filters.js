import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useMoviesStore } from '@/stores/movies'
import { useUserMoviesStore } from '@/stores/userMovies'
import Fuse from 'fuse.js'
import { releaseYear } from '@/lib/movies'

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
    const watchedMode = ref('fade')   // 'fade' | 'show' | 'hide'
    const ignoredMode = ref('hide')   // 'hide' | 'show'
    const sort = ref('acquired-desc')
    const _baseMovies = ref(null)  // null = use all movies
    const _defaultWatchedMode = ref('fade')
    const _defaultIgnoredMode = ref('hide')

    // ── MPAA groups ────────────────────────────────────
    const mpaaMap = {
        family: ['G', 'PG', 'TV-G', 'TV-PG'],
        teens: ['PG-13', 'TV-14'],
        mature: ['R', 'NC-17', 'TV-MA'],
        unrated: ['NR', 'Not Rated', 'Unrated', null, ''],
    }

    // ── Fuse instance ──────────────────────────────────
    const fuse = computed(() => new Fuse(_baseMovies.value ?? moviesStore.movies, {
        keys: ['title', 'search_keywords'],
        threshold: 0.3,
        includeScore: true,
    }))

    // ── Filter step helpers ────────────────────────────
    function _applySearch(results) {
        if (!search.value.trim()) return results
        return fuse.value.search(search.value.trim()).map(r => r.item)
    }
    function _applyGenre(results) {
        if (!genres.value.length) return results
        return results.filter(m => genres.value.every(g => m.genres?.includes(g)))
    }
    function _applyMpaa(results) {
        if (!mpaaGroups.value.length) return results
        const allowed = mpaaGroups.value.flatMap(g => mpaaMap[g])
        return results.filter(m =>
            allowed.includes(m.mpaa_rating ?? null) ||
            allowed.includes(m.mpaa_rating ?? '')
        )
    }
    function _applyYear(results) {
        if (Number.isFinite(yearMin.value)) results = results.filter(m => {
            const y = releaseYear(m.release_date)
            return y === null || y >= yearMin.value
        })
        if (Number.isFinite(yearMax.value)) results = results.filter(m => {
            const y = releaseYear(m.release_date)
            return y === null || y <= yearMax.value
        })
        return results
    }
    function _applyRuntime(results) {
        if (Number.isFinite(runtimeMin.value)) results = results.filter(m => m.runtime_minutes >= runtimeMin.value)
        if (Number.isFinite(runtimeMax.value)) results = results.filter(m => m.runtime_minutes <= runtimeMax.value)
        return results
    }
    function _applyIgnored(results) {
        if (ignoredMode.value !== 'hide') return results
        const ignoredIds = new Set(userMoviesStore.userMovies.filter(m => m.ignored).map(m => m.movie_id))
        return results.filter(m => !ignoredIds.has(m.id))
    }
    function _applySort(results) {
        return [...results].sort((a, b) => {
            switch (sort.value) {
                case 'acquired-desc': return new Date(b.acquired_at) - new Date(a.acquired_at)
                case 'acquired-asc': return new Date(a.acquired_at) - new Date(b.acquired_at)
                case 'title-asc': return a.title.localeCompare(b.title)
                case 'title-desc': return b.title.localeCompare(a.title)
                case 'year-desc': return new Date(b.release_date ?? 0) - new Date(a.release_date ?? 0)
                case 'year-asc': return new Date(a.release_date ?? 0) - new Date(b.release_date ?? 0)
                case 'rating-desc': return (b.tmdb_rating ?? 0) - (a.tmdb_rating ?? 0)
                case 'rating-asc': return (a.tmdb_rating ?? 0) - (b.tmdb_rating ?? 0)
                default: return 0
            }
        })
    }

    // ── Intermediate filtered sets ─────────────────────
    // Used for faceted counts + dynamic bounds

    // All filters except genre (for faceted genre counts + allGenres)
    const _withoutGenre = computed(() => {
        const src = _baseMovies.value ?? moviesStore.movies
        return _applyIgnored(_applyRuntime(_applyYear(_applyMpaa(_applySearch(src)))))
    })

    // All filters except year range (for year bounds)
    const _withoutYear = computed(() => {
        const src = _baseMovies.value ?? moviesStore.movies
        return _applyIgnored(_applyRuntime(_applyMpaa(_applyGenre(_applySearch(src)))))
    })

    // All filters except runtime range (for runtime bounds)
    const _withoutRuntime = computed(() => {
        const src = _baseMovies.value ?? moviesStore.movies
        return _applyIgnored(_applyYear(_applyMpaa(_applyGenre(_applySearch(src)))))
    })

    // ── Genre counts (faceted AND logic) ───────────────
    const genreCounts = computed(() => {
        const counts = {}
        for (const movie of _withoutGenre.value) {
            for (const g of movie.genres ?? []) {
                // For unselected genre: count = movies matching [currentGenres + g]
                // For selected genre: count = movies matching [currentGenres] that have g
                const testGenres = genres.value.includes(g) ? genres.value : [...genres.value, g]
                if (testGenres.every(genre => movie.genres?.includes(genre))) {
                    counts[g] = (counts[g] ?? 0) + 1
                }
            }
        }
        return counts
    })

    // All genres across the full collection — never filtered out, so genres
    // can be shown as disabled (count 0) rather than disappearing entirely
    const allGenres = computed(() => {
        const set = new Set()
        const src = _baseMovies.value ?? moviesStore.movies
        for (const movie of src) {
            for (const g of movie.genres ?? []) set.add(g)
        }
        return [...set].sort()
    })

    // ── Dynamic bounds ─────────────────────────────────
    const yearBounds = computed(() => {
        const years = _withoutYear.value.map(m => releaseYear(m.release_date)).filter(y => y !== null)
        return {
            min: years.length ? Math.min(...years) : null,
            max: years.length ? Math.max(...years) : null,
        }
    })

    const runtimeBounds = computed(() => {
        const runtimes = _withoutRuntime.value.map(m => m.runtime_minutes).filter(Number.isFinite)
        return {
            min: runtimes.length ? Math.min(...runtimes) : null,
            max: runtimes.length ? Math.max(...runtimes) : null,
        }
    })

    // ── Filtered + sorted movies ───────────────────────
    const filteredMovies = computed(() => {
        const src = _baseMovies.value ?? moviesStore.movies
        return _applySort(_applyIgnored(_applyRuntime(_applyYear(_applyMpaa(_applyGenre(_applySearch(src)))))))
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
        count += genres.value.length
        count += mpaaGroups.value.length
        if (Number.isFinite(yearMin.value)) count++
        if (Number.isFinite(yearMax.value)) count++
        if (Number.isFinite(runtimeMin.value)) count++
        if (Number.isFinite(runtimeMax.value)) count++
        if (watchedMode.value !== _defaultWatchedMode.value) count++
        if (ignoredMode.value !== _defaultIgnoredMode.value) count++
        return count
    })

    // ── Random pick ────────────────────────────────────
    function randomMovie() {
        const pool = visibleMovies.value
        if (!pool.length) return null
        return pool[Math.floor(Math.random() * pool.length)]
    }

    // ── Base movies (for scoped list views) ────────────
    function setBase(movies) {
        _baseMovies.value = movies
    }
    function clearBase() {
        _baseMovies.value = null
    }

    // ── Per-view defaults ──────────────────────────────
    function setDefaults({ watchedMode: wm = 'fade', ignoredMode: im = 'hide' } = {}) {
        _defaultWatchedMode.value = wm
        _defaultIgnoredMode.value = im
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
        watchedMode.value = _defaultWatchedMode.value
        ignoredMode.value = _defaultIgnoredMode.value
        sort.value = 'acquired-desc'
    }

    // ── URL sync ───────────────────────────────────────
    function toQueryParams() {
        const p = {}
        if (search.value) p.q = search.value
        if (genres.value.length) p.genre = genres.value.join(',')
        if (mpaaGroups.value.length) p.mpaa = mpaaGroups.value.join(',')
        if (Number.isFinite(yearMin.value)) p.ymin = yearMin.value
        if (Number.isFinite(yearMax.value)) p.ymax = yearMax.value
        if (Number.isFinite(runtimeMin.value)) p.rmin = runtimeMin.value
        if (Number.isFinite(runtimeMax.value)) p.rmax = runtimeMax.value
        if (watchedMode.value !== _defaultWatchedMode.value) p.watched = watchedMode.value
        if (ignoredMode.value !== _defaultIgnoredMode.value) p.ignored = ignoredMode.value
        if (sort.value !== 'acquired-desc') p.sort = sort.value
        return p
    }

    function fromQueryParams(query) {
        if (query.q) search.value = query.q
        if (query.genre) genres.value = query.genre.split(',')
        if (query.mpaa) mpaaGroups.value = query.mpaa.split(',')
        if (query.ymin) yearMin.value = Number(query.ymin)
        if (query.ymax) yearMax.value = Number(query.ymax)
        if (query.rmin) runtimeMin.value = Number(query.rmin)
        if (query.rmax) runtimeMax.value = Number(query.rmax)
        if (query.watched) watchedMode.value = query.watched
        if (query.ignored) ignoredMode.value = query.ignored
        if (query.sort) sort.value = query.sort
    }

    function initFromUrl() {
        fromQueryParams(route.query)
    }

    watch(
        [search, genres, mpaaGroups, yearMin, yearMax, runtimeMin, runtimeMax,
            watchedMode, ignoredMode, sort],
        () => {
            router.replace({ query: toQueryParams() })
        },
        { deep: true }
    )

    return {
        search, genres, mpaaGroups,
        yearMin, yearMax,
        runtimeMin, runtimeMax,
        watchedMode, ignoredMode,
        sort,
        allGenres, genreCounts,
        yearBounds, runtimeBounds,
        filteredMovies, visibleMovies,
        activeFilterCount,
        isWatchedFaded,
        randomMovie, reset,
        setBase, clearBase, setDefaults,
        initFromUrl,
        mpaaMap,
    }
})
