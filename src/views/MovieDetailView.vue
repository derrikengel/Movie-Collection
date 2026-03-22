<template>
    <div v-if="movie" :class="s.page">

        <MovieHero :movie="movie" />

        <div :class="s.contentWrap">
            <div :class="s.content">
                <div :class="s.poster">
                    <img v-if="movie.poster_path" :src="posterUrl(movie.poster_path)" :alt="movie.title" />
                </div>

                <div :class="s.meta">
                    <dl :class="s.tags">
                        <dt class="visually-hidden">Release Year</dt>
                        <dd :class="s.tag" :title="movie.release_date ? new Date(movie.release_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : undefined">{{ releaseYear(movie.release_date) }}</dd>

                        <dt v-if="movie.mpaa_rating" class="visually-hidden">Rating</dt>
                        <dd v-if="movie.mpaa_rating" :class="s.tag">{{ movie.mpaa_rating }}</dd>

                        <dt v-if="movie.runtime_minutes" class="visually-hidden">Runtime</dt>
                        <dd v-if="movie.runtime_minutes" :class="s.tag">{{ formattedRuntime }}</dd>

                        <dt v-if="movie.tmdb_rating" class="visually-hidden">Rating</dt>
                        <dd v-if="movie.tmdb_rating" :class="s.tag">
                            <span v-html="star" :class="s.tagIcon" />
                            {{ movie.tmdb_rating.toFixed(1) }}
                        </dd>
                    </dl>

                    <h1 :class="s.title">{{ movie.title }}</h1>

                    <div v-if="movie.genres?.length" :class="s.genres">
                        <span v-for="genre in movie.genres" :key="genre" :class="s.genre">{{ genre }}</span>
                    </div>

                    <p v-if="movie.description" :class="`${s.description} ${s.descriptionWide}`">{{ movie.description }}
                    </p>

                    <p v-if="movie.notes" :class="s.notes">{{ movie.notes }}</p>

                </div>
            </div>

            <p v-if="movie.description" :class="`${s.description} ${s.descriptionNarrow}`">{{ movie.description }}</p>
        </div>


        <MovieActionBar :actions="actions" :is-active="isActive" :has-services="hasServices" :is-guest="!auth.user"
            :movie="movie" @action="handleAction" />

        <RouterLink v-if="auth.isAdmin" :to="`/admin/edit/${movie.slug}`" :class="s.editLink">
            Edit Movie
        </RouterLink>

    </div>

    <div v-else-if="notFound" :class="s.notFound">
        <p>Movie not found.</p>
    </div>
</template>

<script setup>
    import { computed } from 'vue'
    import { useRoute } from 'vue-router'
    import { useMoviesStore } from '@/stores/movies'
    import { useAuthStore } from '@/stores/auth'
    import MovieHero from '@/components/MovieHero.vue'
    import MovieActionBar from '@/components/MovieActionBar.vue'
    import { usePageTitle } from '@/composables/usePageTitle'
    import { posterUrl } from '@/lib/tmdb'
    import { releaseYear } from '@/lib/movies'
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
            ? `${movie.value.title} (${releaseYear(movie.value.release_date)}) | Movie Collection`
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

    const { actions, isActive, handleAction } = useMovieActions(movie)
</script>

<style module="s">
    .page {
        container-type: inline-size;
    }

    .contentWrap {
        margin: 0 auto;
        max-width: var(--content-width);
        padding-inline: var(--content-padding);
        position: relative;
    }

    .content {
        align-items: center;
        display: flex;
        flex-direction: row-reverse;
        gap: 5%;
        margin-top: -6%;

        @container (min-width: 48rem) {
            align-items: stretch;
            gap: var(--size-12);
            margin-top: -12%;
        }

        @container (min-width: 60rem) {
            gap: var(--size-16);
            margin-top: -18%;
        }
    }

    .poster {
        flex-shrink: 0;
        min-width: 7rem;
        width: 24%;
    }

    .poster img {
        aspect-ratio: 2 / 3;
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-2xl);
        display: block;
        object-fit: cover;
        width: 100%;
    }

    .meta {
        flex: 1;
        min-width: 0;
        padding-top: var(--size-4);

        @container (min-width: 60rem) {
            padding-top: var(--size-6);
        }
    }

    .title {
        color: var(--color-heading);
        font-size: var(--text-3xl);
        font-weight: var(--font-weight-normal);
        line-height: var(--leading-tight);
        margin-bottom: var(--size-4);
        text-shadow: var(--text-shadow-lg);
        text-wrap: pretty;

        @container (min-width: 40rem) {
            font-size: var(--text-5xl);
        }

        @container (min-width: 60rem) {
            font-size: var(--text-6xl);
        }
    }

    .tags {
        display: flex;
        flex-wrap: wrap;
        gap: var(--size-1) var(--size-3);
        letter-spacing: var(--tracking-wider);
        margin-bottom: var(--size-2);
    }

    .tag {
        align-items: center;
        /* background: var(--color-bg-frosted-subtle);
        backdrop-filter: var(--bg-frosted-md);
        border-radius: var(--radius-md); */
        color: var(--color-heading);
        display: flex;
        font-size: var(--text-xs);
        gap: var(--size-1);
        justify-content: center;
        text-shadow: var(--text-shadow-md);
        /* padding: var(--size-1) var(--size-2); */
        /* letter-spacing: var(--tracking-wider); */

        &:not(:first-of-type):before {
            background: oklch(from var(--blue-300) l c h / 0.4);
            border-radius: var(--radius-full);
            content: '';
            display: block;
            height: var(--size-1);
            margin-right: var(--size-2);
            width: var(--size-1);
        }
    }

    .tagIcon {
        align-items: center;
        display: flex;
        justify-content: center;
        color: var(--color-text-muted);
    }

    .genres {
        display: flex;
        flex-wrap: wrap;
        gap: var(--size-1);
        margin-bottom: var(--size-4);
    }

    .genre {
        background: var(--color-surface-raised);
        /* background: var(--color-bg-frosted-subtle);
        backdrop-filter: var(--bg-frosted-md); */
        /* border: 1px solid var(--color-border); */
        border-radius: var(--radius-full);
        color: var(--color-text-muted);
        font-size: var(--text-2xs);
        letter-spacing: var(--tracking-wider);
        padding: var(--size-1) var(--size-3);
    }

    .description {
        color: var(--color-text-secondary);
        font-size: var(--text-sm);
        line-height: var(--leading-relaxed);
        text-wrap: pretty;

        @container (min-width: 48rem) {
            font-size: var(--text-base);
        }
    }

    .descriptionNarrow {
        margin-top: var(--size-6);

        @container (min-width: 32rem) {
            display: none;
        }
    }

    .descriptionWide {
        display: none;

        @container (min-width: 32rem) {
            display: block;
        }
    }

    .notes {
        font-size: var(--text-sm);
        color: var(--color-text-muted);
        font-style: italic;
        margin-bottom: var(--size-4);
    }

    .editLink {
        display: flex;
        align-items: center;
        padding: var(--size-2) var(--size-4);
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

    /* ─── Not found ─── */
    .notFound {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--size-4);
        padding: var(--size-12) var(--content-padding);
        color: var(--color-text-muted);
        font-size: var(--text-sm);
    }

</style>
