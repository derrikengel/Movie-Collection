<template>
    <section :class="s.related">
        <h2 :class="s.heading">{{ heading }}</h2>
        <div :class="s.collection">
            <RouterLink v-for="related in movies" :key="related.id"
                :to="{ name: 'movie', params: { slug: related.slug } }" :class="s.card">
                <div :class="s.posterWrap">
                    <img v-if="related.poster_path" :src="posterUrl(related.poster_path)" :alt="related.title"
                        :class="s.poster" loading="lazy" />
                </div>

                <span :class="s.title">{{ related.title }}</span>
                <span :class="s.year">{{ releaseYear(related.release_date) }}</span>
            </RouterLink>
        </div>
    </section>
</template>

<script setup>
    import { computed } from 'vue'
    import { posterUrl } from '@/lib/tmdb'
    import { releaseYear } from '@/lib/movies'

    const props = defineProps({
        movies: {
            type: Array,
            required: true,
        },
        collectionName: {
            type: String,
            default: null,
        },
    })

    const heading = computed(() => {
        if (!props.collectionName) return 'Related Movies'
        return /^the\s/i.test(props.collectionName) ? props.collectionName : `The ${props.collectionName}`
    })
</script>

<style module="s">
    .related {
        margin: var(--size-8) calc(-1 * var(--content-padding)) 0 calc(-1 * var(--content-padding));

        @media (min-width: 48rem) {
            margin-inline: 0;
        }
    }

    .heading {
        color: var(--blue-500);
        font-size: var(--text-xs);
        font-weight: var(--font-weight-bold);
        letter-spacing: var(--tracking-widest);
        line-height: var(--leading-tight);
        margin-bottom: var(--size-3);
        padding-inline: var(--content-padding);
        text-transform: uppercase;

        @media (min-width: 48rem) {
            padding-inline: 0;
        }
    }

    .collection {
        display: flex;
        gap: var(--size-3);
        overflow-x: auto;
        padding-bottom: var(--size-3);
        padding-inline: var(--content-padding);
        scroll-padding-inline: var(--content-padding);
        scrollbar-width: thin;
        scrollbar-color: var(--blue-800) transparent;
        scroll-snap-type: x proximity;

        @media (min-width: 48rem) {
            gap: var(--size-4);
            padding-inline: 0;
            scroll-padding-inline: 0;
        }
    }

    .card {
        display: flex;
        flex: 0 0 8rem;
        flex-direction: column;
        gap: var(--size-2);
        font-size: var(--text-2xs);
        font-weight: var(--font-weight-bold);
        letter-spacing: var(--tracking-widest);
        line-height: var(--leading-tighter);
        scroll-snap-align: start;
        text-transform: uppercase;

        @media (min-width: 48rem) {
            flex: 0 0 10rem;
        }
    }

    .posterWrap {
        aspect-ratio: 2 / 3;
        background: var(--blue-900);
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-md);
        display: block;
        overflow: hidden;
        width: 100%;
    }

    .poster {
        display: block;
        height: 100%;
        object-fit: cover;
        transition: scale var(--transition-normal);
        width: 100%;
        will-change: scale;
    }

    .title {
        color: var(--blue-50);
        font-size: var(--text-sm);
        margin-top: var(--size-2);
        text-wrap: pretty;

        .card:hover & {
            text-decoration-line: underline;
            text-decoration-thickness: 0.0625em;
        }
    }

    .year {
        color: var(--blue-200);
    }
</style>
