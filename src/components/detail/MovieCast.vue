<template>
    <section :class="s.cast">
        <!-- <h2 :class="s.heading">Cast</h2> -->
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
        margin-top: var(--size-6);

        @media (min-width: 32rem) {
            margin-top: var(--size-8);
        }

        @media (min-width: 64rem) {
            margin-top: var(--size-12);
            margin-inline: auto;
            max-width: var(--content-width);
            padding-inline: var(--content-padding);
        }
    }

    .heading {
        color: var(--blue-400);
        font-size: var(--text-xs);
        font-weight: var(--font-weight-semibold);
        letter-spacing: var(--tracking-widest);
        margin-bottom: var(--size-4);
        text-transform: uppercase;
    }

    .scroll {
        display: flex;
        gap: var(--size-2);
        overflow-x: auto;
        padding-bottom: var(--size-3);
        padding-inline: var(--content-padding);
        scroll-padding-inline: var(--content-padding);
        scrollbar-width: thin;

        @media (min-width: 64rem) {
            padding-inline: 0;
            scroll-padding-inline: 0;
        }
    }

    .card {
        align-items: center;
        display: flex;
        flex-direction: column;
        flex-shrink: 0;
        gap: var(--size-0-5);
        text-align: center;
        width: 6rem;

        @media (min-width: 48rem) {
            width: 7rem;
        }
    }

    .actor {
        align-items: center;
        display: flex;
        flex-direction: column;
        gap: var(--size-3);
        width: 100%;
    }

    .photo,
    .silhouette {
        aspect-ratio: 3 / 4;
        background-color: var(--blue-900);
        border-radius: var(--radius-md);
        display: block;
        object-fit: cover;
        object-position: 50% 0;
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
        color: var(--blue-100);
        font-size: var(--text-2xs);
        font-weight: var(--font-weight-semibold);
        line-height: var(--leading-snug);
        text-wrap: pretty;

        @media (min-width: 48rem) {
            font-size: var(--text-xs);
        }
    }

    .character {
        color: var(--blue-300);
        font-size: var(--text-2xs);
        font-weight: var(--font-weight-semibold);
        line-height: var(--leading-snug);
        text-wrap: pretty;
    }
</style>
