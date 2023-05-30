<script setup>
    import { ref } from 'vue'
    import router from '../router'
    import WatchList from './WatchList.vue'
    const movieDetails = ref(null)

    defineProps({
        movie: {
            type: Object,
            required: true
        }
    })

    defineExpose({ setFocus })

    function setFocus() {
        movieDetails.value.focus()
    }
</script>

<template>
    <div class="movie-details-backdrop" @click.stop="router.push({ path: '/' })" @keydown.esc="router.push({ path: '/' })" tabindex="-1">
        <div class="movie-details" tabindex="-1" ref="movieDetails" @click.stop>

            <div class="movie-hero" :style="'background-image: url(' + (movie.hero || movie.image) + ')'" :class="{ 'no-img': !movie.hero, 'no-trailer': !movie.trailerId }">
                <iframe class="movie-trailer" v-if="movie.trailerId" :src="'https://www.youtube.com/embed/' + movie.trailerId + '?playlist=' + movie.trailerId + '&controls=0&modestbranding=1&autoplay=1&loop=1&rel=0'" width="1280" height="720" :title="movie.title + ' Trailer'" frameborder="0" allow="autoplay" tabindex="-1" loading="lazy"></iframe>
            </div>

            <div class="movie-content">
                <img :src="movie.image" :alt="`${movie.title} (${movie.year})`" class="movie-poster">

                <h2 class="movie-details-title">{{ movie.title }}</h2>        

                <ul class="movie-facts small-caps">
                    <li><span class="movie-rating" title="Rating">{{ movie.rating }}</span></li>
                    <li class="movie-year" title="Release Year">{{ movie.year }}</li>
                    <li class="movie-length" title="Length" v-if="movie.length">{{ movie.length }}</li>
                    <li class="movie-genre" title="Genre(s)">
                        <ul>
                            <li v-for="genre in movie.genre" :key="genre">{{ genre }}</li>
                        </ul>
                    </li>
                </ul>

                <p class="movie-teaser" v-if="movie.description">{{ movie.description }}</p>

                <WatchList :movie="movie" />

                <p class="movie-note" v-if="movie.notes" title="Notes">{{ movie.notes }}</p>

                <RouterLink :to="{ name: 'edit' }">Edit</RouterLink>
                <RouterLink :to="{ name: 'home' }">Close</RouterLink>
            </div>
        </div>
    </div>
</template>

<style>
    .movie-details-backdrop {
        background: var(--color-backdrop);
        backdrop-filter: blur(var(--size-2));
        bottom: 0;
        left: 0;
        position: fixed;
        overscroll-behavior: contain;
        overflow: auto;
        right: 0;
        top: 0;
        z-index: 20;
    }

    .movie-details {
        background: var(--color-details-bg);
        box-shadow: 0 var(--size-base) var(--size5) calc(-1 * var(--size-base)) #000, 0 var(--size-base) var(--size4) calc(-1 * var(--size-base)) #000;
        margin: 0 auto;
        min-height: 100%;
        max-width: 80rem;
        position: relative;
        width: 100%;
        /* border-radius: var(--size-2);
        overflow: hidden; */
    }

    .movie-hero {
        aspect-ratio: 16 / 9;
        background-position: 50% 50%;
        background-repeat: no-repeat;
        background-size: cover;
        height: auto;
        width: 100%;
    }

    .movie-hero:not(.no-trailer) {        
        position: sticky;
        top: 0;
        z-index: 20;
    }

    .movie-hero.no-trailer {
        mask: linear-gradient(#000, transparent);
    }

    .movie-hero.no-img.no-trailer {
        filter: blur(40px);
    }

    .movie-hero.no-img.no-trailer + .movie-content {
        margin-top: -7rem;
    }

    .movie-trailer {
        aspect-ratio: 16 / 9;
        display: block;
        height: 100%;
        width: 100%;
    }

    .movie-content {
        padding: var(--size1);
        position: relative;
    }

    .movie-poster {
        display: none;
    }

    .movie-details-title {
        font-family: var(--font-secondary);
        font-weight: var(--font-weight-bold);
        hyphens: auto;
        letter-spacing: 0.1em;
        line-height: 1;
        text-transform: uppercase;
        overflow-wrap: break-word;
    }

    .movie-facts {
        color: var(--color-accent);
        list-style: none;
        margin: 0;
        padding: 0;
    }

    .movie-facts > li {
        display: inline;
    	line-height: var(--size1);
    	vertical-align: middle;
    }

    .movie-facts > li:not(:last-child) {
    	padding-right: var(--size-1);
    }

    .movie-facts > li + li:before {
        content: '\2022';
        display: inline;
        font-size: var(--size-1);
    	padding-right: var(--size-1);
        vertical-align: middle;
    }

    .movie-rating {
    	border-radius: 0.125rem;
    	box-shadow: inset 0 0 0 1px currentColor;
    	font-size: var(--size-1);
    	line-height: 1;
    	padding: var(--size-3) var(--size-2);
        vertical-align: middle;
        white-space: nowrap;
    }

    .movie-genre ul {
    	display: inline;
    	list-style: none;
    	margin: 0;
    	padding: 0;
    }

    .movie-genre li {
    	display: inline;
    }

    .movie-genre li + li:before {
    	content: ', ';
    }

    .movie-teaser {
        line-height: var(--size2);
    }


    @media screen and (min-width: 42rem) {
        .movie-details {
            border-radius: var(--size-2);
            height: calc(100% - calc(var(--size3) * 2));
            margin-top: var(--size3);
            min-height: 0;
        }

        .movie-hero {
            mask: linear-gradient(#000, transparent);
        }

        .movie-hero.no-img.no-trailer {
            display: block;
            height: auto;
        }

        .movie-hero.no-img.no-trailer + .movie-content {
            margin-top: 0;
        }

        .movie-hero.no-img.no-trailer + .movie-content .movie-img {
            margin-bottom: 0;
        }

        .movie-content {
            padding: 0 var(--size4) var(--size4) var(--size4);
        }

        .movie-poster {
            display: block;
        }
    }
</style>