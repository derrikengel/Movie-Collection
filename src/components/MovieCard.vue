<script setup>
    import slugify from 'slugify'

    defineProps({
        movie: {
            type: Object,
            required: true
        }
    })
</script>

<template>
    <RouterLink class="movie-card" :title="`${movie.title} (${movie.year})`" :to="{
        name: 'moviedetails',
        params: {
            title: slugify(`${movie.title} ${movie.year}`, { strict: true, lower: true })
        },
        meta: { pageTitle: 'test' }
    }">
        <!-- <img :src="movie.image" :alt="`${movie.title} (${movie.year})`" class="movie-card-img" loading="lazy"> -->
    </RouterLink>
</template>

<style>
    .movie-card {
        aspect-ratio: 2 / 3;
        color: rgba(255, 255, 255, 0.3);
        background: rgba(255, 255, 255, 0.04);
        border-radius: var(--size-2);
        font-weight: bold;
        overflow: hidden;
        position: relative;
    }
    
    .movie-card:after {
        align-items: center;
        content: attr(title);
        display: flex;
        font-size: var(--font-size-sm);
        height: 100%;
        justify-content: center;
        padding: var(--size1);
        text-align: center;
    }

    .movie-card-img {
        aspect-ratio: 2/3;
        display: block;
        object-fit: cover;
        position: relative;
        z-index: 10;
    }
</style>