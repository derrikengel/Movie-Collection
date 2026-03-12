<!-- src/components/ProfileListCard.vue -->
<template>
    <RouterLink :to="to" :class="s.listCard">
        <div :class="s.listCardHeader">
            <div :class="s.listCardMeta">
                <span :class="s.listCardIcon" v-html="icon" aria-hidden="true" />
                <span :class="s.listCardName">{{ label }}</span>
            </div>
            <span :class="s.listCardCount">{{ count }}</span>
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
        padding: var(--space-4);
        display: flex;
        flex-direction: column;
        gap: var(--space-3);
        transition: border-color var(--transition-fast), background var(--transition-fast);
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
        gap: var(--space-2);
        color: var(--color-text-secondary);
    }

    .listCardIcon {
        display: flex;
        align-items: center;
        color: var(--color-text-muted);
    }

    .listCardName {
        font-size: var(--text-sm);
        font-weight: var(--font-weight-semibold);
        color: var(--color-text);
    }

    .listCardCount {
        font-size: var(--text-sm);
        font-weight: var(--font-weight-bold);
        color: var(--color-accent);
        background: var(--color-accent-subtle);
        border: 1px solid var(--color-accent-muted);
        border-radius: var(--radius-full);
        padding: 2px var(--space-2);
        min-width: 28px;
        text-align: center;
    }

    .listCardPosters {
        display: flex;
        align-items: center;
        gap: var(--space-2);
        min-height: 60px;
    }

    .listCardPoster {
        width: 40px;
        height: 60px;
        object-fit: cover;
        border-radius: var(--radius-sm);
        flex-shrink: 0;
    }

    .listCardMore {
        font-size: var(--text-xs);
        font-weight: var(--font-weight-semibold);
        color: var(--color-text-muted);
        padding-left: var(--space-1);
    }

    .listCardEmpty {
        font-size: var(--text-xs);
        color: var(--color-text-muted);
        font-style: italic;
    }
</style>
