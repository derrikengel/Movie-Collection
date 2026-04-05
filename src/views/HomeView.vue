<template>
    <MovieGrid :movies="moviesStore.movies" />
</template>

<script setup>
    import { useMoviesStore } from '@/stores/movies'
    import MovieGrid from '@/components/grid/MovieGrid.vue'

    const moviesStore = useMoviesStore()
</script>
