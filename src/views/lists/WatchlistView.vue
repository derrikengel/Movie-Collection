<template>
    <MovieGrid :movies="movies" emptyMessage="Your watchlist is empty." defaultIgnoredMode="show" />
</template>

<script setup>
    import { computed } from 'vue'
    import MovieGrid from '@/components/grid/MovieGrid.vue'
    import { useMoviesStore } from '@/stores/movies'
    import { useUserMoviesStore } from '@/stores/userMovies'

    const moviesStore = useMoviesStore()
    const userMoviesStore = useUserMoviesStore()

    const movies = computed(() => {
        const ids = new Set(
            userMoviesStore.userMovies.filter(m => m.watchlist).map(m => m.movie_id)
        )
        return moviesStore.movies.filter(m => ids.has(m.id))
    })
</script>