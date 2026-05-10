<template>
    <div :class="[s.card, faded && s.cardFaded]">
        <RouterLink :to="{ name: 'movie', params: { slug: movie.slug } }" :class="s.cardFront">
            <span :class="s.preloadTitle">
                {{ movie.title }}
                <span :class="s.preloadYear">{{ releaseYear(movie.release_date) }}</span>
            </span>
            <img v-if="movie.poster_path" :src="posterUrl(movie.poster_path)" alt="" :class="s.poster" loading="lazy" />
        </RouterLink>

        <div :class="s.cardOverlay">
            <RouterLink :to="{ name: 'movie', params: { slug: movie.slug } }" :class="s.cardOverlayContent">
                <p :class="s.cardTitle">{{ movie.title }}</p>
                <dl :class="s.tags">
                    <dt class="visually-hidden">Release Year</dt>
                    <dd :class="s.tag"
                        :title="movie.release_date ? new Date(movie.release_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : undefined">
                        {{ releaseYear(movie.release_date) }}</dd>

                    <dt v-if="movie.mpaa_rating" class="visually-hidden">Rating</dt>
                    <dd v-if="movie.mpaa_rating" :class="s.tag">{{ movie.mpaa_rating }}</dd>

                    <dt v-if="movie.runtime_minutes" class="visually-hidden">Runtime</dt>
                    <dd v-if="movie.runtime_minutes" :class="s.tag">{{ formattedRuntime(movie.runtime_minutes) }}</dd>

                    <dt v-if="movie.tmdb_rating" class="visually-hidden">TMDB Rating</dt>
                    <dd v-if="movie.tmdb_rating" :class="s.tag">
                        <span v-html="star" :class="s.tagIcon" />
                        {{ movie.tmdb_rating.toFixed(1) }}
                    </dd>
                </dl>
            </RouterLink>

            <div v-if="auth.user" :class="s.cardActions">
                <button v-for="action in actions" :key="action.field"
                    :class="[s.cardAction, action.listClass, isActive(action.field) && s.cardActionActive]"
                    :aria-label="action.label" :title="action.label" @click.prevent="handleAction(action.field)">
                    <span :class="s.cardActionIcon" v-html="action.icon" />
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
    import { computed } from 'vue'
    import { useAuthStore } from '@/stores/auth'
    import { useMovieActions } from '@/composables/useMovieActions'
    import { posterUrl } from '@/lib/tmdb'
    import { releaseYear } from '@/lib/movies'
    import star from '@/assets/icons/star.svg?raw'

    const props = defineProps({
        movie: { type: Object, required: true },
        faded: { type: Boolean, default: false },
    })

    const auth = useAuthStore()
    const movieRef = computed(() => props.movie)
    const { actions, isActive, handleAction } = useMovieActions(movieRef)

    function formattedRuntime(minutes) {
        const h = Math.floor(minutes / 60)
        const m = minutes % 60
        return h > 0 ? `${h}h ${m}m` : `${m}m`
    }
</script>

<style module="s">
    .card {
        aspect-ratio: 2 / 3;
        background: var(--blue-900);
        border-radius: var(--radius-xl);
        container-type: inline-size;
        overflow: hidden;
        position: relative;
        transition: scale var(--transition-slow), box-shadow var(--transition-slow), z-index var(--transition-slow);
        z-index: 0;
    }

    .cardFront {
        display: block;
        height: 100%;
        transition: opacity var(--transition-slow);
        width: 100%;
    }

    .cardFaded .cardFront {
        opacity: 0.2;
    }

    .preloadTitle {
        align-content: center;
        color: var(--blue-500);
        font-size: var(--text-xs);
        font-weight: var(--font-weight-bold);
        inset: 0;
        letter-spacing: var(--tracking-widest);
        line-height: var(--leading-tight);
        padding: var(--size-4);
        position: absolute;
        text-align: center;
        text-transform: uppercase;
        text-wrap: balance;
    }

    .preloadYear {
        color: var(--blue-600);
        display: block;
        margin-top: var(--size-1);
    }

    .poster {
        display: block;
        object-fit: cover;
        height: 100%;
        position: relative;
        width: 100%;
    }

    .cardOverlay {
        backdrop-filter: var(--bg-frosted-2xl);
        background: linear-gradient(oklch(from var(--blue-950) l c h / 0.25), oklch(from var(--blue-950) l c h / 0.8));
        border-radius: inherit;
        display: none;
        flex-direction: column;
        inset: 0;
        opacity: 0;
        pointer-events: none;
        position: absolute;
        transition: opacity var(--transition-normal);
    }

    .cardOverlayContent {
        align-items: center;
        color: var(--blue-50);
        display: flex;
        flex: 1;
        flex-direction: column;
        font-size: var(--text-sm);
        font-weight: var(--font-weight-bold);
        letter-spacing: var(--tracking-widest);
        line-height: var(--leading-tighter);
        gap: var(--size-3);
        justify-content: center;
        min-height: 0;
        padding: var(--size-3);
        text-transform: uppercase;
        text-align: center;
        text-decoration: none;

        @container (min-width: 12rem) {
            font-size: var(--text-lg);
        }
    }

    .cardTitle {
        opacity: 0;
        text-wrap: balance;
        translate: 0 var(--size-0-5);
        transition: opacity var(--transition-slow), translate var(--transition-slow);
        transition-delay: 100ms;
    }

    .tags {
        color: oklch(from var(--blue-50) l c h / 0.8);
        display: flex;
        flex-wrap: wrap;
        font-size: var(--text-2xs);
        font-weight: var(--font-weight-bold);
        gap: var(--size-1) var(--size-2);
        justify-content: center;
        letter-spacing: var(--tracking-widest);
        opacity: 0;
        translate: 0 calc(var(--size-0-5) * -1);
        transition: opacity var(--transition-slow), translate var(--transition-slow);
        transition-delay: 100ms;
    }

    .tag {
        align-items: center;
        display: flex;
        gap: var(--size-1);
        justify-content: center;

        &:not(:first-of-type):before {
            background: oklch(from var(--blue-50) l c h / 0.2);
            border-radius: var(--radius-full);
            content: '';
            display: block;
            height: var(--size-1);
            margin-right: var(--size-1);
            width: var(--size-1);
        }
    }

    .tagIcon {
        align-items: center;
        color: var(--yellow-200);
        display: flex;
        justify-content: center;
    }

    .cardActions {
        display: grid;
        gap: var(--size-1);
        grid-template-columns: repeat(2, 1fr);
        padding: 0 var(--size-3) var(--size-3) var(--size-3);

        @container (min-width: 12rem) {
            padding: 0 var(--size-4) var(--size-4) var(--size-4);
        }
    }

    @property --grad-start {
        inherits: false;
        initial-value: transparent;
        syntax: '<color>';
    }

    @property --grad-end {
        inherits: false;
        initial-value: transparent;
        syntax: '<color>';
    }

    .cardAction {
        --grad-start: oklch(from var(--color-list-400) l c h / 0.1);
        --grad-end: var(--grad-start);
        align-items: center;
        background: linear-gradient(135deg, var(--grad-start), var(--grad-end));
        border: none;
        border-radius: var(--radius-md);
        cursor: pointer;
        display: flex;
        flex: 1;
        justify-content: center;
        padding: var(--size-2) 0;
        transition: color var(--transition-fast), --grad-start var(--transition-fast), --grad-end var(--transition-fast);

        @container (min-width: 12rem) {
            border-radius: var(--radius-lg);
        }
    }

    .cardActionIcon {
        align-items: center;
        border: 1px solid var(--color-list-400);
        border-radius: var(--radius-full);
        color: var(--color-list-400);
        display: flex;
        font-size: var(--text-xs);
        height: var(--size-6);
        justify-content: center;
        width: var(--size-6);
        transition: background var(--transition-fast), color var(--transition-fast), border-color var(--transition-fast);

        @container (min-width: 12rem) {
            font-size: var(--text-sm);
            height: var(--size-7);
            width: var(--size-7);
        }
    }

    .cardAction:hover {
        --grad-start: oklch(from var(--color-list-400) l c h / 0.25);
    }

    .cardActionActive {
        --grad-start: var(--color-list-400);
        --grad-end: var(--color-list-500);
        color: var(--color-list-900);

        .cardActionIcon {
            background: var(--color-list-900);
            border-color: transparent;
            color: var(--color-list-400);
        }
    }

    .cardActionActive:hover {
        --grad-start: var(--color-list-400);
        --grad-end: var(--color-list-400);
    }

    @media (hover: hover) and (pointer: fine) {
        .cardOverlay {
            display: flex;
        }

        .card:hover {
            box-shadow: var(--shadow-2xl);
            scale: 1.25;
            z-index: 20;

            .cardOverlay {
                opacity: 1;
                pointer-events: auto;
            }

            .cardTitle,
            .tags {
                opacity: 1;
                translate: none;
            }
        }
    }
</style>
