<script setup>
    import { ref } from 'vue'
    import { usePlayer } from '@vue-youtube/core';

    const youtubePlayer = ref()
    const trailerMuted = ref(true)
    const trailerLoaded = ref(false)

    const props = defineProps({
        movie: {
            type: Object,
            required: true
        }
    })

    const { instance, onReady } = usePlayer(props.movie?.trailerId, youtubePlayer, {
        playerVars: {
            'controls': 0,
            'modestbranding': 1,
            'loop': 1, 
            'rel': 0,
            'mute': 1,
            'playsinline': 1,
            'autoplay': 1,
            'fs': 0
        }
    });

    onReady((event) => {
        event.target.playVideo()
        trailerLoaded.value = true
        trailerMuted.value = event.target.isMuted()
    })

    function toggleMute() {
        const isMuted = instance.value.isMuted()
        isMuted ? instance.value.unMute() : instance.value.mute()
        trailerMuted.value = !isMuted
    }
</script>

<template>
    <div class="movie-hero" :style="`background-image: url(${movie.hero || movie.image})`" :class="{ 'no-img': !movie.hero, 'no-trailer': !movie.trailerId }">

        <!-- <img :src="movie.hero || movie.image" :alt="movie.title" class="movie-hero-img" width="1280" height="720"> -->

        <div v-if="movie.trailerId" ref="youtubePlayer" class="movie-trailer" />

        <button v-if="movie.trailerId && trailerLoaded" @click="toggleMute" class="movie-trailer-mute" :class="{ 'is-muted': trailerMuted }" title="Toggle Mute">
            <span class="icon icon-btn">

                <svg v-show="trailerMuted" width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path d="M9.40938 3.24221C9.76875 3.40471 10 3.76096 10 4.15471V16.1547C10 16.5485 9.76875 16.9047 9.40938 17.0672C9.05 17.2297 8.62813 17.1641 8.33438 16.9016L4.11875 13.1547H2C0.896875 13.1547 0 12.2578 0 11.1547V9.15471C0 8.05158 0.896875 7.15471 2 7.15471H4.11875L8.33438 3.40783C8.62813 3.14533 9.05 3.08283 9.40938 3.24221Z" />
                    <path d="M20 10.1547C20 7.33596 18.7031 4.82033 16.675 3.17033V3.16721C16.3531 2.90783 15.8781 2.95471 15.6187 3.27658C15.3593 3.59846 15.4062 4.07033 15.7281 4.33283C17.4218 5.71096 18.5 7.80471 18.5 10.1547C18.5 12.5047 17.4218 14.5985 15.7281 15.9735C15.4062 16.236 15.3562 16.7078 15.6187 17.0297C15.8812 17.3516 16.3531 17.4016 16.675 17.1391C18.7031 15.4922 20 12.9735 20 10.1547Z" />
                    <path d="M17 10.1547C17 8.27658 16.1343 6.59846 14.7843 5.49846V5.49533C14.4625 5.23596 13.9875 5.28283 13.7281 5.60471C13.4687 5.92658 13.5156 6.39846 13.8375 6.66096C14.8531 7.48908 15.5 8.74533 15.5 10.1547C15.5 11.5641 14.8531 12.8203 13.8375 13.6453C13.5156 13.9078 13.4656 14.3797 13.7281 14.7016C13.9906 15.0235 14.4625 15.0735 14.7843 14.811C16.1343 13.711 17 12.0328 17 10.1547Z" />
                    <path d="M14 10.1547C14 9.21408 13.5656 8.37658 12.8937 7.82658V7.82346C12.5718 7.56408 12.0968 7.61096 11.8375 7.93283C11.5781 8.25471 11.625 8.72658 11.9468 8.98908C12.2843 9.26721 12.5 9.68596 12.5 10.1547C12.5 10.6235 12.2843 11.0422 11.9468 11.3172C11.625 11.5797 11.575 12.0516 11.8375 12.3735C12.1 12.6953 12.5718 12.7453 12.8937 12.4828C13.5656 11.9328 14 11.0953 14 10.1547Z" />
                </svg>

                <svg v-show="!trailerMuted" width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path d="M9.40938 3.24221C9.76875 3.40471 10 3.76096 10 4.15471V16.1547C10 16.5485 9.76875 16.9047 9.40938 17.0672C9.05 17.2297 8.62813 17.1641 8.33438 16.9016L4.11875 13.1547H2C0.896875 13.1547 0 12.2578 0 11.1547V9.15471C0 8.05158 0.896875 7.15471 2 7.15471H4.11875L8.33438 3.40783C8.62813 3.14533 9.05 3.08283 9.40938 3.24221Z" />
                    <path d="M16.6667 9.15451L14.757 7.24479C14.434 6.9184 13.9063 6.92188 13.5799 7.24479C13.2535 7.56771 13.2535 8.09549 13.5799 8.42187L15.4896 10.3316L13.5799 12.2413C13.2535 12.5642 13.257 13.092 13.5799 13.4184C13.9028 13.7448 14.4306 13.7448 14.757 13.4184L16.6667 11.5087L18.5764 13.4184C18.8993 13.7448 19.4271 13.7413 19.7535 13.4184C20.0799 13.0955 20.0799 12.5677 19.7535 12.2413L17.8438 10.3316L19.7535 8.42187C20.0799 8.09896 20.0764 7.57118 19.7535 7.24479C19.4306 6.9184 18.9028 6.9184 18.5764 7.24479L16.6667 9.15451Z" />
                </svg>

            </span>
        </button>

    </div>
</template>

<style>
    .movie-hero {
        --aspect-ratio: 16 / 9;
        aspect-ratio: var(--aspect-ratio);
        background-position: 50% 50%;
        background-repeat: no-repeat;
        background-size: cover;
        height: auto;
        overflow: hidden;
        width: 100%;
    }

    .movie-hero-img {
        aspect-ratio: var(--aspect-ratio);
        display: block;
        object-fit: cover;
        width: 100%;
    }

    .movie-hero:not(.no-trailer) {        
        position: sticky;
        top: 0;
        z-index: 20;
    }

    .movie-hero.no-trailer {
        aspect-ratio: 4 / 3;
        mask: linear-gradient(#000, transparent);
    }

    .movie-trailer {
        aspect-ratio: 16 / 9; /* doesn't change for wide view */
        display: block;
        height: auto;
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        z-index: 10;
    }

    .movie-trailer-mute {
        align-items: flex-end;
        display: flex;
        height: 100%;
        left: 0;
        padding: var(--size-1);
        position: absolute;
        top: 0;
        width: 100%;
        z-index: 20;
    }

    .movie-trailer-mute .icon-btn {
        box-shadow: 0 0 0 var(--size-4) var(--color-backdrop);
        background: var(--color-backdrop);
        color: var(--color-text);
        transition: box-shadow var(--transition), color var(--transition), background var(--transition);
    }

    .movie-trailer-mute:not(.is-muted) .icon-btn {
        opacity: 0;
    }

    .movie-trailer-mute:hover .icon-btn {
        opacity: 1;
    }

    @media screen and (min-width: 42rem) {
        .movie-hero {
            --aspect-ratio: 3 / 1;
            mask: linear-gradient(#000, transparent);
        }

        .movie-hero:not(.no-trailer) {
            position: relative;
            z-index: 0;
        }

        .movie-hero.no-trailer {
            aspect-ratio: var(--aspect-ratio);
        }
            
        .movie-hero.no-img.no-trailer {
            display: block;
            filter: blur(40px);
            height: auto;
        }

        .movie-trailer {
            transform: translateY(-15%);
        }

        .movie-trailer-mute {
            align-items: flex-start;
            justify-content: flex-end;
            padding: var(--size2);
        }
    }
</style>