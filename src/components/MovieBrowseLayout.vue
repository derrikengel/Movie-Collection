<template>
    <div :class="s.page">
        <FilterBar />

        <div :class="s.results">
            <p v-if="moviesStore.loading" :class="s.status">Loading…</p>

            <p v-else-if="props.movies.length === 0" :class="s.status">{{ emptyMessage }}</p>

            <p v-else-if="filters.visibleMovies.length === 0" :class="s.status">No movies match your filters.</p>

            <div v-else :class="s.grid">
                <RouterLink v-for="movie in displayedMovies" :key="movie.id" :to="`/${movie.slug}`"
                    :class="[s.card, filters.isWatchedFaded(movie) && s.cardFaded]">
                    <div :class="s.cardContent">
                        <span :class="s.preloadTitle">
                            {{ movie.title }} ({{ releaseYear(movie.release_date) }})
                        </span>

                        <img v-if="movie.poster_path" :src="posterUrl(movie.poster_path)"
                            :alt="`${movie.title} ${releaseYear(movie.release_date)}`" :class="s.poster"
                            loading="lazy" />
                    </div>
                </RouterLink>
            </div>

            <div v-if="hasMore" ref="sentinel" :class="s.sentinel"></div>
        </div>
    </div>
</template>

<script setup>
    import { ref, computed, watch, onMounted, onUnmounted, onActivated, onDeactivated } from 'vue'
    import { useRouter } from 'vue-router'
    import { useMoviesStore } from '@/stores/movies'
    import { useFiltersStore } from '@/stores/filters'
    import FilterBar from '@/components/FilterBar.vue'
    import { posterUrl } from '@/lib/tmdb'
    import { releaseYear } from '@/lib/movies'

    const props = defineProps({
        movies: { type: Array, required: true },
        emptyMessage: { type: String, default: 'Nothing here yet.' },
        defaultWatchedMode: { type: String, default: 'fade' },
        defaultIgnoredMode: { type: String, default: 'hide' },
    })

    const router = useRouter()
    const moviesStore = useMoviesStore()
    const filters = useFiltersStore()

    const PAGE_SIZE = 100
    const visibleCount = ref(PAGE_SIZE)
    const sentinel = ref(null)
    let observer = null
    let fromRoute = null

    const removeAfterEach = router.afterEach((_to, from) => { fromRoute = from })

    const displayedMovies = computed(() => filters.visibleMovies.slice(0, visibleCount.value))
    const hasMore = computed(() => visibleCount.value < filters.visibleMovies.length)

    function loadMore() {
        visibleCount.value = Math.min(visibleCount.value + PAGE_SIZE, filters.visibleMovies.length)
    }

    function setupObserver() {
        observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) loadMore()
        }, { rootMargin: '400px' })
    }

    watch(sentinel, (el) => {
        if (observer) observer.disconnect()
        if (el) observer.observe(el)
    })

    let isActive = false

    watch(() => filters.visibleMovies, () => {
        if (isActive) visibleCount.value = PAGE_SIZE
    })

    function initFilters() {
        filters.reset()
        filters.setBase(props.movies)
        if (props.defaultWatchedMode !== 'fade') filters.watchedMode = props.defaultWatchedMode
        if (props.defaultIgnoredMode !== 'hide') filters.ignoredMode = props.defaultIgnoredMode
        filters.initFromUrl()
    }

    onActivated(() => {
        isActive = true
        const isReturningFromDetail = !!fromRoute?.params?.slug
        if (!isReturningFromDetail) {
            filters.watchedMode = props.defaultWatchedMode
            filters.ignoredMode = props.defaultIgnoredMode
        }
    })
    onDeactivated(() => { isActive = false })

    onMounted(() => {
        isActive = true
        initFilters()
        setupObserver()
    })

    onUnmounted(() => {
        isActive = false
        removeAfterEach()
        if (observer) observer.disconnect()
        filters.clearBase()
    })

    watch(() => props.movies, (newMovies) => {
        filters.setBase(newMovies)
    })
</script>

<style module="s">
    .page {
        container-type: inline-size;
    }

    .results {
        margin: 0 auto;
    }

    .status {
        text-align: center;
        color: var(--color-text-muted);
        font-size: var(--text-sm);
        padding: var(--size-12) 0;
    }

    .grid {
        display: grid;
        gap: var(--size-2);
        grid-template-columns: repeat(auto-fill, minmax(6rem, 1fr));
    }

    @container (min-width: 32rem) {
        .grid {
            gap: var(--size-3);
            grid-template-columns: repeat(auto-fill, minmax(8rem, 1fr));
        }
    }

    @container (min-width: 48rem) {
        .grid {
            gap: var(--size-3);
            grid-template-columns: repeat(auto-fill, minmax(10rem, 1fr));
        }
    }

    @container (min-width: 80rem) {
        .grid {
            gap: var(--size-4);
            grid-template-columns: repeat(auto-fill, minmax(16rem, 1fr));
        }
    }

    .card {
        background: var(--color-bg);
        border-radius: var(--radius-md);
        display: block;
        overflow: hidden;
        transition: transform var(--transition-normal), box-shadow var(--transition-normal), z-index var(--transition-normal);
        z-index: 0;
    }

    .card:hover {
        box-shadow: var(--shadow-2xl);
        transform: scale(1.25);
        z-index: 20;
    }

    .cardFaded .cardContent {
        opacity: 0.25;
    }

    .cardFaded:hover .cardContent {
        opacity: 1;
    }

    .cardContent {
        position: relative;
        transition: opacity var(--transition-normal);
    }

    .preloadTitle {
        align-content: center;
        color: var(--color-text-subtle);
        font-size: var(--text-xs);
        line-height: var(--leading-snug);
        inset: 0;
        padding: var(--size-4);
        position: absolute;
        text-align: center;
    }

    .poster {
        aspect-ratio: 2/3;
        display: block;
        object-fit: cover;
        position: relative;
        width: 100%;
    }

    .posterEmpty {
        background: var(--color-surface-raised);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: var(--size-4);
        font-size: var(--text-xs);
        color: var(--color-text-muted);
        text-align: center;
    }

    .sentinel {
        height: 1px;
    }
</style>
