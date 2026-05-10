<template>
    <RouterLink :to="to" :class="[s.listCard, listClass]">
        <div :class="s.listCardHeader">
            <div :class="s.listCardMeta">
                <span :class="s.listCardIcon" v-html="icon" aria-hidden="true" />
                <h2 :class="s.listCardName">{{ label }}</h2>
            </div>
            <span class="badge" :class="s.listCardCount">{{ count }}</span>
        </div>

        <div :class="s.listCardPosters">
            <template v-if="previews.length">
                <img v-for="movie in previews" :key="movie.id" :src="posterUrl(movie.poster_path, 'w92')"
                    :alt="`${movie.title} (${releaseYear(movie.release_date)})`"
                    :title="`${movie.title} (${releaseYear(movie.release_date)})`" :class="s.listCardPoster" />
                <div v-if="count > previews.length" :class="s.listCardMore">
                    +{{ count - previews.length }}
                </div>
            </template>
            <div v-else :class="s.listCardEmpty">
                Nothing here yet.
            </div>
        </div>
    </RouterLink>
</template>

<script setup>
    import { posterUrl } from '@/lib/tmdb'
    import { releaseYear } from '@/lib/movies'

    defineProps({
        to: [String, Object],
        label: String,
        count: Number,
        previews: Array,
        icon: String,
        listClass: String,
    })
</script>

<style module="s">
    .listCard {
        background: var(--blue-900);
        border-radius: var(--radius-xl);
        display: flex;
        flex-direction: column;
        gap: var(--size-6);
        padding: var(--size-6);
        transition: border-color var(--transition-fast), background var(--transition-fast);

        @container (min-width: 48rem) {
            border-radius: var(--radius-2xl);
            padding: var(--size-8);
        }
    }

    @media (hover: hover) and (pointer: fine) {
        .listCard:hover {
            background: var(--blue-800);
        }
    }

    .listCardHeader {
        align-items: center;
        display: flex;
        justify-content: space-between;
    }

    .listCardMeta {
        align-items: center;
        display: flex;
        gap: var(--size-3);

        @container (min-width: 48rem) {
            gap: var(--size-4);
        }
    }

    .listCardIcon {
        align-items: center;
        color: var(--color-list-400);
        display: flex;
        font-size: var(--text-3xl);
        justify-content: center;
    }

    .listCardName {
        color: var(--blue-50);
        font-size: var(--text-sm);
        font-weight: var(--font-weight-bold);
        letter-spacing: var(--tracking-widest);
        line-height: var(--leading-tighter);
        text-transform: uppercase;

        @container (min-width: 32rem) {
            font-size: var(--text-lg);
        }
    }

    .listCardCount {
        background: oklch(from var(--color-list-400) l c h / 0.25);
        color: var(--color-list-400);
        font-size: var(--text-xs);
        padding: 0 var(--size-2);

        @container (min-width: 32rem) {
            font-size: var(--text-sm);
        }
    }

    .listCardPosters {
        align-items: center;
        display: flex;
        gap: var(--size-2);

        @container (min-width: 64rem) {
            gap: var(--size-3);
        }
    }

    .listCardPoster {
        aspect-ratio: 2 / 3;
        border-radius: var(--radius-sm);
        box-shadow: var(--shadow-md);
        flex-shrink: 0;
        object-fit: cover;
        width: var(--size-10);

        @container (min-width: 48rem) {
            border-radius: var(--radius-md);
            width: var(--size-12);
        }

        @container (min-width: 64rem) {
            width: var(--size-14);
        }
    }

    .listCardMore {
        color: var(--blue-500);
        font-size: var(--text-xs);
        font-weight: var(--font-weight-bold);
        padding-left: var(--size-1);
        transition: color var(--transition-fast);

        @container (min-width: 64rem) {
            padding-left: var(--size-2);
        }
    }

    .listCardEmpty {
        color: var(--blue-400);
        font-size: var(--text-sm);
        font-weight: var(--font-weight-medium);
    }
</style>
