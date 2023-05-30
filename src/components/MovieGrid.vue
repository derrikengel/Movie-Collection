<script setup>
    import slugify from 'slugify'
    import { ref, watch, onMounted, nextTick } from 'vue'
    import { useRoute } from 'vue-router'
    import MovieCard from './MovieCard.vue'
    import MovieDetails from './MovieDetails.vue'

    const props = defineProps({
        movies: {
            type: Array,
            required: true
        }
    })

    const route = useRoute()
    const currentMovie = ref(null)
    const detailsVisible = ref(false)
    const detailsView = ref(null)
    let isMounted = false;

    // watch for changes to title param
    watch(
        () => route.params.title,
        () => {
            if (route.params.title) {
                // if title param is supplied, set the current movie
                setCurrentMovie()
            } else {
                // if no title param is supplied, hide movie details
                detailsVisible.value = false

                document.documentElement.classList.remove('scroll-locked')
            }
        },
        {
            immediate: true
        }
    )

    onMounted(() => {
        isMounted = true
        if (currentMovie.value) setFocus()
    })

    function setCurrentMovie() {
        // find match
        currentMovie.value = props.movies.find(movie => {
            // slugify current route and compare to each movie to find match
            const isMatch = route.params.title === slugify(`${movie.title} ${movie.year}`,  { strict: true, lower: true })

            if (isMatch) {
                detailsVisible.value = true

                document.title = `${movie.title} (${movie.year}) | Movie Collection`

                document.documentElement.classList.add('scroll-locked')

                if (isMounted) setFocus()
            }

            return isMatch
        })
    }

    async function setFocus() {
        // move focus to details view
        await nextTick()
        detailsView.value.setFocus()
    }
</script>

<template>
    <MovieDetails v-if="detailsVisible" :movie="currentMovie" ref="detailsView" />

    <main class="movies">
        <MovieCard v-for="movie in movies" :key="movie.id" :movie="movie" />
    </main>
</template>

<style>
    .movies {
        --card-width: 150px;
        display: grid;
        gap: var(--size1) var(--size-1);
        grid-template-columns: repeat(auto-fill, minmax(var(--card-width, 150px), 1fr));
    }

    @media screen and (min-width: 42rem) {
        .movies {
            --card-width: 180px;
        }
    }

    @media screen and (min-width: 84rem) {
        .movies {
            --card-width: 220px;
        }
    }
</style>