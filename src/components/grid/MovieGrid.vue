<template>
    <div :class="s.page">

        <div :class="s.results">
            <p v-if="moviesStore.loading" :class="s.status">Loading…</p>

            <p v-else-if="props.movies.length === 0" :class="s.status">{{ emptyMessage }}</p>

            <p v-else-if="filters.visibleMovies.length === 0" :class="s.status">No movies match your filters.</p>

            <div v-else :class="s.grid">
                <MovieCard v-for="movie in displayedMovies" :key="movie.id" :movie="movie"
                    :faded="filters.isWatchedFaded(movie)" />
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
    import MovieCard from '@/components/grid/MovieCard.vue'

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

    watch(
        () => [
            filters.search, filters.genres, filters.mpaaGroups,
            filters.yearMin, filters.yearMax,
            filters.runtimeMin, filters.runtimeMax,
            filters.watchedMode, filters.ignoredMode,
            filters.sort,
        ],
        () => { if (isActive) visibleCount.value = PAGE_SIZE },
        { deep: true }
    )

    function initFilters() {
        filters.setDefaults({ watchedMode: props.defaultWatchedMode, ignoredMode: props.defaultIgnoredMode })
        filters.reset()
        filters.setBase(props.movies)
        filters.initFromUrl()
    }

    onActivated(() => {
        const isReturningFromDetail = !!fromRoute?.params?.slug
        if (!isReturningFromDetail) {
            visibleCount.value = PAGE_SIZE
            initFilters()
        } else {
            filters.setBase(props.movies)
        }
        isActive = true
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
        color: var(--blue-400);
        font-weight: var(--font-weight-medium);
        padding: var(--size-12) 0;
        text-align: center;
    }

    .grid {
        display: grid;
        gap: var(--size-2);
        grid-template-columns: repeat(auto-fill, minmax(6rem, 1fr));

        @media (hover: hover) and (pointer: fine) {
            grid-template-columns: repeat(auto-fill, minmax(10rem, 1fr));
        }

        @container (min-width: 32rem) {
            gap: var(--size-3);
        }

        @container (min-width: 80rem) {
            gap: var(--size-4);
            grid-template-columns: repeat(auto-fill, minmax(16rem, 1fr));
        }
    }

    .sentinel {
        height: 1px;
    }
</style>
