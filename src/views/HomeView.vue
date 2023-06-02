<script setup>
    import { ref } from 'vue'
    //import TheWelcome from '../components/TheWelcome.vue'
    import MovieGrid from '../components/MovieGrid.vue'
    import MovieFilters from '../components/MovieFilters.vue'
    import movieData from '../data.json'

    const limitedData = ref(null);

    limitedData.value = movieData.slice(0, 100);

</script>

<template>
    <h1>Movie Collection</h1>

    <MovieFilters />

    <MovieGrid :movies="limitedData" />
</template>