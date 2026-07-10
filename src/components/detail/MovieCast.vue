<template>
    <section :class="s.cast">
        <h2 :class="s.heading">Top Cast</h2>
        <div :class="s.scroll">
            <RouterLink v-for="member in cast" :key="member.name"
                :to="{ name: 'actor', params: { actorSlug: slugifyActor(member.name, member.profile_path) } }"
                :class="s.card">
                <span :class="s.actor">
                    <div :class="s.photoWrap">
                        <img v-if="member.profile_path" :src="profileUrl(member.profile_path)" :alt="member.name"
                            :class="s.photo" loading="lazy" />
                        <span v-else :class="s.silhouette" v-html="silhouette" />
                    </div>

                    <span :class="s.name">{{ member.name }}</span>
                </span>

                <span :class="s.character">{{ member.character }}</span>
            </RouterLink>
        </div>
    </section>
</template>

<script setup>
    import { profileUrl } from '@/lib/tmdb'
    import { slugifyActor } from '@/lib/movies'
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
        flex: 0 0 6rem;
        gap: var(--size-1);
        scroll-snap-align: start;

        @media (min-width: 48rem) {
            flex: 0 0 7rem;
        }
    }

    .actor {
        display: flex;
        flex-direction: column;
        gap: var(--size-3);
        width: 100%;
    }

    .photoWrap {
        aspect-ratio: 3 / 4;
        border-radius: var(--radius-lg);
        display: block;
        overflow: hidden;
        width: 100%;
    }

    .photo,
    .silhouette {
        background-color: var(--blue-900);
        display: block;
        height: 100%;
        object-fit: cover;
        object-position: 0 25%;
        transform-origin: 50% 25%;
        transition: scale var(--transition-normal);
        width: 100%;
        will-change: scale;

        @media (hover: hover) and (pointer: fine) {
            .card:hover & {
                scale: 1.05;
            }
        }
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

        @media (hover: hover) and (pointer: fine) {
            .card:hover & {
                text-decoration-line: underline;
                text-decoration-thickness: 0.0625em;
            }
        }
    }

    .character {
        color: var(--blue-300);
        font-size: var(--text-xs);
        font-weight: var(--font-weight-medium);
        line-height: var(--leading-tight);
        text-wrap: pretty;
    }
</style>
