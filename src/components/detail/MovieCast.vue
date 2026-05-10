<template>
    <section :class="s.cast">
        <h2 :class="s.heading">Top Cast</h2>
        <dl :class="s.scroll">
            <div v-for="member in cast" :key="member.name" :class="s.card">
                <dt :class="s.actor">
                    <img v-if="member.profile_path" :src="profileUrl(member.profile_path)" :alt="member.name"
                        :class="s.photo" loading="lazy" />
                    <div v-else :class="s.silhouette" v-html="silhouette" />

                    <span :class="s.name">{{ member.name }}</span>
                </dt>

                <dd :class="s.character">{{ member.character }}</dd>
            </div>
        </dl>
    </section>
</template>

<script setup>
    import { profileUrl } from '@/lib/tmdb'
    import silhouette from '@/assets/icons/user.svg?raw'

    defineProps({
        cast: {
            type: Array,
            required: true,
        },
    })
</script>

<style module="s">
    .cast {
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

    .scroll {
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
            padding-inline: 0;
            scroll-padding-inline: 0;
        }
    }

    .card {
        display: flex;
        flex-direction: column;
        flex-shrink: 0;
        gap: var(--size-1);
        scroll-snap-align: start;
        width: 6rem;

        @media (min-width: 48rem) {
            width: 7rem;
        }
    }

    .actor {
        display: flex;
        flex-direction: column;
        gap: var(--size-3);
        width: 100%;
    }

    .photo,
    .silhouette {
        aspect-ratio: 3 / 4;
        background-color: var(--blue-900);
        border-radius: var(--radius-lg);
        display: block;
        object-fit: cover;
        object-position: 0 25%;
        width: 100%;
    }

    .silhouette {
        align-items: center;
        color: var(--blue-800);
        display: flex;
        font-size: var(--text-6xl);
        justify-content: center;
    }

    .name {
        color: var(--blue-50);
        font-size: var(--text-sm);
        font-weight: var(--font-weight-semibold);
        line-height: var(--leading-tight);
        text-wrap: pretty;
    }

    .character {
        color: var(--blue-300);
        font-size: var(--text-xs);
        font-weight: var(--font-weight-medium);
        line-height: var(--leading-tight);
        text-wrap: pretty;
    }
</style>
