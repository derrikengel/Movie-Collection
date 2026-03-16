<template>
    <MovieBrowseLayout :movies="moviesStore.movies" />
</template>

<script setup>
    import { useMoviesStore } from '@/stores/movies'
    import MovieBrowseLayout from '@/components/MovieBrowseLayout.vue'

    const moviesStore = useMoviesStore()
</script>