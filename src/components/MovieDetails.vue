<script setup>
    import { ref } from 'vue'
    import router from '../router'
    import MovieHero from './MovieHero.vue'
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
    <Transition name="movie-details">
        <div class="movie-details-backdrop" @click.stop="router.push({ path: '/' })" @keydown.esc="router.push({ path: '/' })" tabindex="-1">
            <div class="movie-details" tabindex="-1" ref="movieDetails" @click.stop>

                <MovieHero :movie="movie" />

                <div class="movie-content">
                    <img :src="movie.image" :alt="`${movie.title} (${movie.year})`" class="movie-poster" loading="lazy" width="360" height="540">
                    
                    <div class="movie-info">
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

                        <WatchList v-if="movie.watchOptions" :watch-options="movie.watchOptions" />

                        <p class="movie-note" v-if="movie.notes" title="Notes">{{ movie.notes }}</p>

                        <RouterLink :to="{ name: 'edit' }">Edit</RouterLink>
                        <RouterLink :to="{ name: 'home' }">Close</RouterLink>
                    </div>
                </div>
            </div>
        </div>
    </Transition>
</template>

<style>

.movie-details-enter-active,
.movie-details-leave-active {
  transition: opacity 1s ease-out;
}

.movie-details-enter-from,
.movie-details-leave-to {
  opacity: 0;
}


    .movie-details-backdrop {
        background: var(--color-backdrop);
        backdrop-filter: blur(var(--size-1));
        bottom: 0;
        left: 0;
        position: fixed;
        overscroll-behavior: contain;
        overflow: auto;
        right: 0;
        top: 0;
        z-index: 30;
    }

    .movie-details {
        background: var(--color-details-bg);
        box-shadow: var(--shadow-lg);
        max-width: 80rem;
        min-height: 100%;
        position: relative;
        width: 100%;
    }

    .movie-details:focus-visible {
        outline: none;
    }

    .movie-content {
        padding: var(--size2) var(--size1);
        position: relative;
    }

    .movie-hero.no-trailer + .movie-content {
        margin-top: calc(-1 * var(--size4));
    }

    .movie-poster {
        display: none;
    }

    .movie-info {
        display: flex;
        flex-direction: column;
        gap: var(--size1);
    }

    .movie-details-title {
        font-family: var(--font-secondary);
        font-weight: var(--font-weight-bold);
        letter-spacing: 0.1em;
        line-height: 1;
        margin: 0;
        overflow-wrap: break-word;
        text-transform: uppercase;
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
    	border-radius: var(--size-4);
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
        margin: 0;
    }

    @media screen and (min-width: 42rem) {
        .movie-details-backdrop {
            align-items: center;
            display: flex;
            justify-content: center;
        }

        .movie-details {
            border-radius: var(--size-2);
            height: auto;
            max-height: calc(100% - var(--size4));
            min-height: 0;
            overflow: hidden;
        }

        .movie-hero.no-img.no-trailer + .movie-content {
            margin-top: 0;
        }

        .movie-hero.no-img.no-trailer + .movie-content .movie-img {
            margin-bottom: 0;
        }

        .movie-content,
        .movie-hero.no-trailer + .movie-content,
        .movie-hero.no-img.no-trailer + .movie-content {
            margin-top: calc(-1 * var(--size6));
        }

        .movie-content {
            align-items: flex-start;
            display: flex;
            gap: var(--size3);
            padding: 0 var(--size4) var(--size4) var(--size4);
        }

        .movie-info {
            padding-top: 10%;
        }

        .movie-poster {
            border-radius: var(--size-2);
            box-shadow: var(--shadow-lg);
            display: block;
            width: 28%;
        }
    }
</style>