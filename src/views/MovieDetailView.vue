<template>
    <div v-if="movie" :class="s.page">

        <MovieHero :movie="movie" />

        <div :class="s.content">
            <div :class="s.poster">
                <img v-if="movie.poster_path" :src="posterUrl(movie.poster_path)" :alt="movie.title" />
            </div>

            <div :class="s.meta">
                <h1 :class="s.title">{{ movie.title }}</h1>

                <div :class="s.tags">
                    <span :class="s.tag">{{ movie.year }}</span>
                    <span v-if="movie.runtime_minutes" :class="s.tag">{{ formattedRuntime }}</span>
                    <span v-if="movie.mpaa_rating" :class="s.tag">{{ movie.mpaa_rating }}</span>
                    <span v-if="movie.tmdb_rating" :class="s.tag">
                        <span v-html="star" :class="s.tagIcon" />
                        {{ movie.tmdb_rating.toFixed(1) }}
                    </span>
                </div>

                <div v-if="movie.genres?.length" :class="s.genres">
                    <span v-for="genre in movie.genres" :key="genre" :class="s.genre">{{ genre }}</span>
                </div>

                <p v-if="movie.description" :class="s.description">{{ movie.description }}</p>

                <p v-if="movie.notes" :class="s.notes">{{ movie.notes }}</p>

            </div>

        </div>

        <RouterLink v-if="auth.isAdmin" :to="`/admin/edit/${movie.slug}`" :class="s.editLink">
            Edit Movie
        </RouterLink>

        <MovieActionBar :actions="actions" :is-active="isActive" :has-services="hasServices" :is-guest="!auth.user"
            @action="handleAction" @open-sheet="sheetOpen = true" />

        <MovieServicesSheet v-model="sheetOpen" :movie="movie" />

        <!-- Login prompt toast -->
        <Transition name="fade">
            <div v-if="loginPrompt" :class="s.loginPrompt" role="status">
                <RouterLink to="/login" :class="s.loginPromptLink">Sign in</RouterLink>
                to save movies to your lists
            </div>
        </Transition>

    </div>

    <div v-else-if="notFound" :class="s.notFound">
        <p>Movie not found.</p>
        <RouterLink to="/">Back to collection</RouterLink>
    </div>
</template>

<script setup>
    import { computed } from 'vue'
    import { useRoute } from 'vue-router'
    import { useMoviesStore } from '@/stores/movies'
    import { useAuthStore } from '@/stores/auth'
    import MovieHero from '@/components/MovieHero.vue'
    import MovieActionBar from '@/components/MovieActionBar.vue'
    import MovieServicesSheet from '@/components/MovieServicesSheet.vue'
    import { usePageTitle } from '@/composables/usePageTitle'
    import { posterUrl } from '@/lib/tmdb'
    import { useMovieActions } from '@/composables/useMovieActions'
    import star from '@/assets/icons/star.svg?raw'

    const route = useRoute()
    const moviesStore = useMoviesStore()
    const auth = useAuthStore()

    const movie = computed(() =>
        moviesStore.movies.find(m => m.slug === route.params.slug) ?? null
    )

    usePageTitle(computed(() =>
        movie.value
            ? `${movie.value.title} (${movie.value.year}) | Movie Collection`
            : 'Movie Collection'
    ))
    const notFound = computed(() => !moviesStore.loading && movie.value === null)
    const hasServices = computed(() =>
        movie.value?.movie_services?.length || movie.value?.disc_format
    )
    const formattedRuntime = computed(() => {
        if (!movie.value?.runtime_minutes) return null
        const h = Math.floor(movie.value.runtime_minutes / 60)
        const m = movie.value.runtime_minutes % 60
        return h > 0 ? `${h}h ${m}m` : `${m}m`
    })

    const { sheetOpen, loginPrompt, actions, isActive, handleAction } = useMovieActions(movie)
</script>

<style module="s">
    .page {
        container-type: inline-size;
    }

    .content {
        display: flex;
        gap: var(--space-4);
        margin-inline: auto;
        margin-top: calc(var(--space-16) * -1);
        max-width: var(--content-width);
        padding: var(--content-padding);
        position: relative;
    }

    .poster {
        flex-shrink: 0;
        width: 100px;
    }

    .poster img {
        width: 100%;
        border-radius: var(--radius-md);
        box-shadow: var(--shadow-lg);
        display: block;
    }

    @container (min-width: 600px) {
        .content {
            margin-top: -100px;
        }

        .poster {
            width: 180px;
        }
    }

    .meta {
        flex: 1;
        min-width: 0;
        padding-top: var(--space-4);
    }

    .title {
        font-size: var(--text-2xl);
        font-weight: var(--font-weight-bold);
        line-height: var(--leading-tight);
        margin-bottom: var(--space-3);
        color: var(--color-text);
    }

    @container (min-width: 600px) {
        .title {
            font-size: var(--text-6xl);
        }
    }

    .tags {
        display: flex;
        flex-wrap: wrap;
        gap: var(--space-2);
        margin-bottom: var(--space-3);
    }

    .tag {
        align-items: center;
        background: var(--color-bg-frosted);
        backdrop-filter: var(--bg-frosted-sm);
        border: 1px solid var(--color-border-frosted);
        border-radius: var(--radius-sm);
        color: var(--color-text-secondary);
        display: flex;
        font-size: var(--text-xs);
        font-weight: var(--font-weight-medium);
        gap: var(--space-1);
        justify-content: center;
        padding: var(--space-1) var(--space-2);
    }

    .tagIcon {
        align-items: center;
        display: flex;
        justify-content: center;
    }

    .genres {
        display: flex;
        flex-wrap: wrap;
        gap: var(--space-2);
        margin-bottom: var(--space-4);
    }

    .genre {
        font-size: var(--text-xs);
        font-weight: var(--font-weight-medium);
        color: var(--color-accent);
        background: var(--color-accent-subtle);
        backdrop-filter: var(--bg-frosted-sm);
        border: 1px solid oklch(77% 0.175 72 / 0.25);
        border-radius: var(--radius-full);
        padding: var(--space-1) var(--space-3);
    }

    .description {
        font-size: var(--text-sm);
        line-height: var(--leading-normal);
        color: var(--color-text-secondary);
        margin-bottom: var(--space-5);
    }

    .notes {
        font-size: var(--text-sm);
        color: var(--color-text-muted);
        font-style: italic;
        margin-bottom: var(--space-4);
    }

    .editLink {
        display: flex;
        align-items: center;
        padding: var(--space-2) var(--space-4);
        font-size: var(--text-sm);
        font-weight: var(--font-weight-medium);
        background: none;
        border: 1px solid var(--color-border);
        border-radius: var(--radius-md);
        color: var(--color-text-muted);
        transition: border-color var(--transition-fast), color var(--transition-fast);

        margin: var(--content-padding);
        max-width: var(--content-max-width);
        justify-content: center;
    }

    .editLink:hover {
        border-color: var(--color-border-strong);
        color: var(--color-text);
    }

    /* ─── Login prompt ─── */
    .loginPrompt {
        position: fixed;
        bottom: 84px;
        left: 50%;
        transform: translateX(-50%);
        white-space: nowrap;
        background: var(--color-surface-raised);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-full);
        padding: var(--space-2) var(--space-4);
        font-size: var(--text-sm);
        color: var(--color-text-secondary);
        z-index: 55;
        box-shadow: var(--shadow-lg);
    }

    .loginPromptLink {
        color: var(--color-accent);
        font-weight: var(--font-weight-semibold);
        margin-right: var(--space-1);
    }

    /* ─── Not found ─── */
    .notFound {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--space-4);
        padding: var(--space-12) var(--content-padding);
        color: var(--color-text-muted);
        font-size: var(--text-sm);
    }

    /* Sheet transition — global because Vue applies these to the element directly */
    .sheet-enter-active,
    .sheet-leave-active {
        transition: transform 0.3s cubic-bezier(0.32, 0.72, 0, 1);
    }

    .sheet-enter-from,
    .sheet-leave-to {
        transform: translateY(100%);
    }

    .fade-enter-active,
    .fade-leave-active {
        transition: opacity 0.2s ease;
    }

    .fade-enter-from,
    .fade-leave-to {
        opacity: 0;
    }
</style>
