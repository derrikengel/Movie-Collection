<template>
    <MovieBrowseLayout :movies="movies" emptyMessage="No watched movies yet." defaultWatchedMode="show" />
</template>

<script setup>
    import { computed } from 'vue'
    import MovieBrowseLayout from '@/components/MovieBrowseLayout.vue'
    import { useMoviesStore } from '@/stores/movies'
    import { useUserMoviesStore } from '@/stores/userMovies'

    const moviesStore = useMoviesStore()
    const userMoviesStore = useUserMoviesStore()

    const movies = computed(() => {
        const ids = new Set(
            userMoviesStore.userMovies.filter(m => m.watched).map(m => m.movie_id)
        )
        return moviesStore.movies.filter(m => ids.has(m.id))
    })
</script>
