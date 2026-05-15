<template>
    <MovieGrid :movies="movies" emptyMessage="No favorites yet." defaultWatchedMode="show" defaultIgnoredMode="show"
        whenAddedSortLabel="Recently Favorited" />
</template>

<script setup>
    import { computed } from 'vue'
    import MovieGrid from '@/components/grid/MovieGrid.vue'
    import { useMoviesStore } from '@/stores/movies'
    import { useUserMoviesStore } from '@/stores/userMovies'

    const moviesStore = useMoviesStore()
    const userMoviesStore = useUserMoviesStore()

    const movies = computed(() => {
        return userMoviesStore.userMovies
            .filter(um => um.favorite)
            .map(um => {
                const movie = moviesStore.movies.find(m => m.id === um.movie_id)
                if (!movie) return null
                return { ...movie, _added_at: um.favorited_at }
            })
            .filter(Boolean)
    })
</script>