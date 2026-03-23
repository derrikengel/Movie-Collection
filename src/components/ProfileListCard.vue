<!-- src/components/ProfileListCard.vue -->
<template>
    <RouterLink :to="to" :class="s.listCard">
        <div :class="s.listCardHeader">
            <div :class="s.listCardMeta">
                <span :class="s.listCardIcon" v-html="icon" aria-hidden="true" />
                <span :class="s.listCardName">{{ label }}</span>
            </div>
            <span class="badge" :class="s.listCardCount">{{ count }}</span>
        </div>

        <div :class="s.listCardPosters">
            <template v-if="previews.length">
                <img v-for="movie in previews" :key="movie.id" :src="posterUrl(movie.poster_path, 'w92')"
                    :alt="movie.title" :class="s.listCardPoster" />
                <div v-if="count > previews.length" :class="s.listCardMore">
                    +{{ count - previews.length }}
                </div>
            </template>
            <div v-else :class="s.listCardEmpty">
                Nothing here yet
            </div>
        </div>
    </RouterLink>
</template>

<script setup>
    import { posterUrl } from '@/lib/tmdb'

    defineProps({
        to: String,
        label: String,
        count: Number,
        previews: Array,
        icon: String,
    })
</script>

<style module="s">
    .listCard {
        background: var(--color-surface);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-lg);
        display: flex;
        flex-direction: column;
        gap: var(--size-4);
        padding: var(--size-4);
        transition: border-color var(--transition-fast), background var(--transition-fast);

        @container (min-width: 48rem) {
            gap: var(--size-6);
            padding: var(--size-6);
        }
    }

    .listCard:hover {
        border-color: var(--color-border-strong);
        background: var(--color-surface-raised);
    }

    .listCardHeader {
        display: flex;
        align-items: center;
        justify-content: space-between;
    }

    .listCardMeta {
        display: flex;
        align-items: center;
        gap: var(--size-2);
        color: var(--color-text-secondary);
    }

    .listCardIcon {
        align-items: center;
        color: var(--color-text-muted);
        display: flex;
        font-size: var(--text-2xl);
        justify-content: center;
    }

    .listCardName {
        color: var(--color-heading);
        font-weight: var(--font-weight-medium);

        @container (min-width: 32rem) {
            font-size: var(--text-lg);
        }

        @container (min-width: 48rem) {
            font-size: var(--text-xl);
        }
    }

    .listCardCount {
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
            width: var(--size-12);
        }

        @container (min-width: 64rem) {
            width: var(--size-14);
        }
    }

    .listCardMore {
        color: var(--color-text-muted);
        font-size: var(--text-xs);
        font-weight: var(--font-weight-medium);
        padding-left: var(--size-1);

        @container (min-width: 64rem) {
            padding-left: var(--size-2);
        }
    }

    .listCardEmpty {
        color: var(--color-text-muted);
        font-size: var(--text-xs);
        font-style: italic;
    }
</style>
