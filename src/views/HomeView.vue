<script setup>
    //import { ref } from 'vue'
    //import TheWelcome from '../components/TheWelcome.vue'
    import MovieGrid from '../components/MovieGrid.vue'
    import MovieFilters from '../components/MovieFilters.vue'
    import movieData from '../data.json'

    //const movieData = ref(staticJson);
</script>

<template>
    <h1>Movie Collection</h1>

    <MovieFilters />

    <MovieGrid :movies="movieData" />
</template>