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
        <img :src="movie.image" :alt="`${movie.title} (${movie.year})`" class="movie-card-img" loading="lazy" width="360" height="540">
    </RouterLink>
</template>

<style>
    .movie-card {
        aspect-ratio: 2 / 3;
        background: #181b23;
        border-radius: var(--size-2);
        box-shadow: 0 0 0 #000;
        color: rgba(255, 255, 255, 0.3);
        font-weight: bold;
        overflow: hidden;
        position: relative;
        transition: z-index var(--transition2), transform var(--transition2), box-shadow var(--transition2);
        z-index: 0;
    }

    .movie-card:hover {
        /* background: var(--color-backdrop); */
        box-shadow: var(--shadow-lg);
        transform: scale(1.25);
        z-index: 20;
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

    @media screen and (min-width: 84rem) {
        .movie-card:hover {
            transform: scale(1.5);
        }
    }
</style>