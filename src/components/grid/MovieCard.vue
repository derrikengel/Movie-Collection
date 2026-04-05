<template>
    <div :class="[s.card, faded && s.cardFaded]">
        <RouterLink :to="`/${movie.slug}`" :class="s.cardFront">
            <span :class="s.preloadTitle">
                {{ movie.title }} ({{ releaseYear(movie.release_date) }})
            </span>
            <img v-if="movie.poster_path" :src="posterUrl(movie.poster_path)"
                :alt="`${movie.title} ${releaseYear(movie.release_date)}`" :class="s.poster" loading="lazy" />
        </RouterLink>

        <div :class="s.cardOverlay">
            <RouterLink :to="`/${movie.slug}`" :class="s.cardOverlayContent">
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
                    :aria-label="action.label" :title="action.label" @click.prevent="handleAction(action.field)"
                    v-html="action.icon" />
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
        border-radius: var(--radius-lg);
        container-type: inline-size;
        overflow: hidden;
        position: relative;
        transition: scale var(--transition-slow), box-shadow var(--transition-slow), z-index var(--transition-slow);
        z-index: 0;
    }

    .cardFront {
        display: block;
        height: 100%;
        width: 100%;
    }

    .cardFaded .cardFront {
        opacity: 0.35;
        transition: opacity var(--transition-normal);
    }

    .preloadTitle {
        align-content: center;
        color: var(--color-text-subtle);
        font-size: var(--text-xs);
        inset: 0;
        line-height: var(--leading-snug);
        padding: var(--size-4);
        position: absolute;
        text-align: center;
    }

    .poster {
        aspect-ratio: 2 / 3;
        display: block;
        object-fit: cover;
        position: relative;
        width: 100%;
    }

    .cardOverlay {
        backdrop-filter: var(--bg-frosted-sm);
        background: var(--color-bg-frosted-dark);
        border-radius: inherit;
        display: flex;
        flex-direction: column;
        inset: 0;
        opacity: 0;
        pointer-events: none;
        position: absolute;
        transition: opacity var(--transition-normal);
    }

    .cardOverlayContent {
        align-items: center;
        color: var(--color-text);
        display: flex;
        flex: 1;
        flex-direction: column;
        gap: var(--size-2);
        justify-content: center;
        min-height: 0;
        padding: var(--size-3);
        text-align: center;
        text-decoration: none;
    }

    .cardTitle {
        color: var(--color-heading);
        font-size: var(--text-xs);
        font-weight: var(--font-weight-bold);
        line-height: var(--leading-snug);
        opacity: 0;
        translate: 0 var(--size-0-5);
        transition: opacity var(--transition-slow), translate var(--transition-slow);
        transition-delay: 100ms;

        @container (min-width: 12rem) {
            font-size: var(--text-base);
        }
    }

    .tags {
        display: flex;
        flex-wrap: wrap;
        font-weight: var(--font-weight-medium);
        gap: var(--size-1) var(--size-2);
        justify-content: center;
        letter-spacing: var(--tracking-wider);
        opacity: 0;
        translate: 0 calc(var(--size-0-5) * -1);
        transition: opacity var(--transition-slow), translate var(--transition-slow);
        transition-delay: 100ms;
    }

    .tag {
        align-items: center;
        color: var(--color-heading);
        display: flex;
        font-size: var(--text-2xs);
        gap: var(--size-1);
        justify-content: center;

        &:not(:first-of-type):before {
            background: oklch(from var(--blue-300) l c h / 0.4);
            border-radius: var(--radius-full);
            content: '';
            display: block;
            height: var(--size-0-5);
            margin-right: var(--size-1);
            width: var(--size-0-5);
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

    .cardAction {
        align-items: center;
        border: 1px solid var(--color-border-frosted-strong);
        border-radius: var(--radius-md);
        color: oklch(from var(--color-list-300) l c h / 0.65);
        cursor: pointer;
        display: flex;
        flex: 1;
        font-size: var(--text-base);
        justify-content: center;
        padding: var(--size-2) 0;
        transition: color var(--transition-fast), opacity var(--transition-fast), border-color var(--transition-fast), background var(--transition-fast);

        &:hover {
            border-color: oklch(from var(--color-list-400) l c h / 0.4);
            color: var(--color-list-400);
        }

        @container (min-width: 12rem) {
            border-radius: var(--radius-lg);
        }

        @container (min-width: 16rem) {
            font-size: var(--text-lg);
        }

        :global(.outline) {
            display: block;
        }

        :global(.solid) {
            display: none;
        }
    }

    .cardActionActive {
        background: oklch(from var(--color-list-600) l c h / 0.16);
        border-color: oklch(from var(--color-list-400) l c h / 0.4);
        color: var(--color-list-400);
        opacity: 1;

        :global(.outline) {
            display: none;
        }

        :global(.solid) {
            display: block;
        }
    }

    @media (hover: hover) {
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
