<script setup>
    import IconVudu from './icons/IconVudu.vue'
    import IconYouTube from './icons/IconYouTube.vue'
    import IconiTunes from './icons/IconiTunes.vue'
    import IconPlex from './icons/IconPlex.vue'
    import IconMA from './icons/IconMA.vue'
    import IconDisc from './icons/IconDisc.vue'
    import WatchListItem from './WatchListItem.vue'

    defineProps({
        watchOptions: {
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
        <WatchListItem v-if="watchOptions.vudu" name="Vudu" :icon="IconVudu" :quality="watchOptions.vudu.quality" :link="updateVuduUrl(watchOptions.vudu.link)" />

        <WatchListItem v-if="watchOptions.youtube" name="YouTube" :icon="IconYouTube" :quality="watchOptions.youtube.quality" :link="watchOptions.youtube.link" />

        <WatchListItem v-if="watchOptions.itunes" name="Apple TV" :icon="IconiTunes" :quality="watchOptions.itunes.quality" :link="watchOptions.itunes.link" />

        <WatchListItem v-if="watchOptions.plex" name="Plex" :icon="IconPlex" :quality="watchOptions.plex.quality" :link="watchOptions.plex.link" />

        <WatchListItem v-if="watchOptions.moviesAnywhere" name="Movies Anywhere" :icon="IconMA" :quality="watchOptions.moviesAnywhere.quality" :link="watchOptions.moviesAnywhere.link" />

        <WatchListItem v-if="watchOptions.disc" name="Disc" :icon="IconDisc" :quality="watchOptions.disc.quality" />
    </div>
</template>

<style>
    .movie-watch-list {
        display: flex;
        flex-direction: column;
    	list-style: none;
    	margin: 0;
    	padding: 0;
    }

    @media screen and (min-width: 54rem) {
        .movie-watch-list {
            align-items: center;
            flex-direction: row;
            flex-wrap: wrap;
            gap: var(--size-base);
        }
    }
</style>