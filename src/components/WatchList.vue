<script setup>
    import IconVudu from './icons/IconVudu.vue'
    import IconYouTube from './icons/IconYouTube.vue'
    import IconiTunes from './icons/IconiTunes.vue'
    import IconPlex from './icons/IconPlex.vue'
    import IconMA from './icons/IconMA.vue'
    import IconDisc from './icons/IconDisc.vue'
    import WatchListItem from './WatchListItem.vue'

    defineProps({
        movie: {
            type: Object,
            required: true
        }
    })

    function updateVuduUrl(url) {
        if (url) {
            const urlParts = url.split('/');
            const movieId = urlParts[urlParts.length - 1];
            return `https://www.vudu.com/content/movies/play/${movieId}/PURCHASED_CONTENT?returnUrl=${url}`
        }
    }
</script>

<template>
    <div class="movie-watch-list small-caps">
        <WatchListItem v-if="movie.vudu" name="Vudu" :icon="IconVudu" :quality="movie.vudu" :link="updateVuduUrl(movie.vuduUrl)" />

        <WatchListItem v-if="movie.googlePlay" name="YouTube" :icon="IconYouTube" :quality="movie.googlePlay" :link="movie.gpUrl" />

        <WatchListItem v-if="movie.itunes" name="Apple TV" :icon="IconiTunes" :quality="movie.itunes" :link="movie.itunesUrl" />

        <WatchListItem v-if="movie.plex" name="Plex" :icon="IconPlex" :quality="movie.plex" :link="movie.plexUrl" />

        <WatchListItem v-if="movie.moviesAnywhere" name="Movies Anywhere" :icon="IconMA" :quality="movie.moviesAnywhere" :link="movie.maUrl" />

        <WatchListItem v-if="movie.disc" name="Disc" :icon="IconDisc" :quality="movie.disc" />
    </div>
</template>

<style>
    .movie-watch-list {
        display: flex;
        flex-direction: column;
        /* gap: var(--size-2); */
    	list-style: none;
    	margin: 0;
    	padding: 0;
    }
</style>