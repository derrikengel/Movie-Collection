<template>
    <div :class="s.page">
        <FilterBar />

        <div :class="s.results">
            <p v-if="moviesStore.loading" :class="s.status">Loading…</p>
            <p v-else-if="props.movies.length === 0" :class="s.status">{{ emptyMessage }}</p>
            <p v-else-if="filters.visibleMovies.length === 0" :class="s.status">No movies match your filters.</p>
            <div v-else :class="s.grid">
                <RouterLink v-for="movie in filters.visibleMovies" :key="movie.id" :to="`/${movie.slug}`"
                    :class="[s.card, filters.isWatchedFaded(movie) && s.cardFaded]">
                    <img v-if="movie.poster_path" :src="posterUrl(movie.poster_path)" :alt="movie.title"
                        :class="s.poster" loading="lazy" />
                    <div v-else :class="[s.poster, s.posterEmpty]">
                        <span>{{ movie.title }}</span>
                    </div>
                </RouterLink>
            </div>
        </div>
    </div>
</template>

<script setup>
    import { watch, onMounted, onUnmounted } from 'vue'
    import { useMoviesStore } from '@/stores/movies'
    import { useFiltersStore } from '@/stores/filters'
    import FilterBar from '@/components/FilterBar.vue'
    import { posterUrl } from '@/lib/tmdb'

    const props = defineProps({
        movies: { type: Array, required: true },
        emptyMessage: { type: String, default: 'Nothing here yet.' },
        defaultWatchedMode: { type: String, default: 'fade' },
        defaultIgnoredMode: { type: String, default: 'hide' },
    })

    const moviesStore = useMoviesStore()
    const filters = useFiltersStore()

    onMounted(() => {
        filters.reset()
        filters.setBase(props.movies)
        if (props.defaultWatchedMode !== 'fade') filters.watchedMode = props.defaultWatchedMode
        if (props.defaultIgnoredMode !== 'hide') filters.ignoredMode = props.defaultIgnoredMode
        filters.initFromUrl()
    })

    onUnmounted(() => {
        filters.clearBase()
    })

    // Keep Fuse index + filteredMovies in sync if the list changes
    // (e.g. user removes a movie from the list while on this view)
    watch(() => props.movies, (newMovies) => {
        filters.setBase(newMovies)
    })
</script>

<style module="s">
    .page {
        container-type: inline-size;
    }

    .results {
        padding: var(--space-4) var(--content-padding);
        margin: 0 auto;
    }

    .status {
        text-align: center;
        color: var(--color-text-muted);
        font-size: var(--text-sm);
        padding: var(--space-12) 0;
    }

    .grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: var(--space-2);
    }

    @container (min-width: 480px) {
        .grid {
            grid-template-columns: repeat(3, 1fr);
        }
    }

    @container (min-width: 700px) {
        .grid {
            grid-template-columns: repeat(4, 1fr);
        }
    }

    @container (min-width: 900px) {
        .grid {
            grid-template-columns: repeat(5, 1fr);
        }
    }

    @container (min-width: 1100px) {
        .grid {
            grid-template-columns: repeat(6, 1fr);
        }
    }

    .card {
        display: block;
        border-radius: var(--radius-md);
        overflow: hidden;
        transition: transform var(--transition-fast), opacity var(--transition-fast);
    }

    .card:hover {
        transform: scale(1.03);
    }

    .cardFaded {
        opacity: 0.35;
    }

    .cardFaded:hover {
        opacity: 0.7;
    }

    .poster {
        width: 100%;
        aspect-ratio: 2/3;
        object-fit: cover;
        display: block;
    }

    .posterEmpty {
        background: var(--color-surface-raised);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: var(--space-4);
        font-size: var(--text-xs);
        color: var(--color-text-muted);
        text-align: center;
    }
</style>
