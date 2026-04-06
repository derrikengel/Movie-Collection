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
                        <dd :class="s.tag"
                            :title="movie.release_date ? new Date(movie.release_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : undefined">
                            {{ releaseYear(movie.release_date) }}</dd>

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

                    <p v-if="movie.description" :class="`${s.description} ${s.descriptionWide}`">
                        {{ movie.description }}
                    </p>

                    <p v-if="movie.notes" :class="`${s.notes} ${s.notesWide}`">{{ movie.notes }}</p>
                </div>
            </div>

            <p v-if="movie.description" :class="`${s.description} ${s.descriptionNarrow}`">{{ movie.description }}</p>
            <p v-if="movie.notes" :class="`${s.notes} ${s.notesNarrow}`">{{ movie.notes }}</p>
        </div>

        <MovieActionBar :movie="movie" />

        <MovieServices v-if="hasServices" :movie="movie" />

        <p v-if="auth.isAdmin" :class="s.edit">
            <RouterLink :to="{ name: 'edit-movie', params: { slug: movie.slug } }" :class="s.editLink">
                <span v-html="pencil" :class="s.editIcon" />
                Edit Movie
            </RouterLink>
        </p>

        <div :class="[s.browse, sourceListClass]">
            <div :class="s.browseNav">
                <RouterLink v-if="prevMovie" :to="{ name: 'movie', params: { slug: prevMovie.slug } }"
                    :class="s.browseLink">

                    <span v-html="arrowLeft" :class="s.browseIcon" />

                    <div :class="s.browseContent">
                        <img v-if="prevMovie.poster_path" :src="posterUrl(prevMovie.poster_path)" :alt="prevMovie.title"
                            :class="s.browsePoster" />

                        <div :class="s.browseMeta">
                            <span :class="s.browsePrevNext">{{ sourceLabel }} Prev</span>
                            <span :class="s.browseTitle">{{ prevMovie.title }}</span>
                            <span :class="s.browseYear">{{ releaseYear(prevMovie.release_date) }}</span>
                        </div>
                    </div>
                </RouterLink>
                <div v-else :class="s.browseEmpty" />

                <RouterLink v-if="nextMovie" :to="{ name: 'movie', params: { slug: nextMovie.slug } }"
                    :class="[s.browseLink, s.browseLinkNext]">
                    <div :class="s.browseContent">
                        <img v-if="nextMovie.poster_path" :src="posterUrl(nextMovie.poster_path)" :alt="nextMovie.title"
                            :class="s.browsePoster" />

                        <div :class="s.browseMeta">
                            <span :class="s.browsePrevNext">{{ sourceLabel }} Next</span>
                            <span :class="s.browseTitle">{{ nextMovie.title }}</span>
                            <span :class="s.browseYear">{{ releaseYear(nextMovie.release_date) }}</span>
                        </div>
                    </div>

                    <span v-html="arrowRight" :class="s.browseIcon" />
                </RouterLink>
                <div v-else :class="s.browseEmpty" />
            </div>
        </div>

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
    import { useFiltersStore } from '@/stores/filters'
    import { useNavContextStore } from '@/stores/navContext'
    import MovieHero from '@/components/detail/MovieHero.vue'
    import MovieActionBar from '@/components/detail/MovieActionBar.vue'
    import MovieServices from '@/components/detail/MovieServices.vue'
    import { usePageTitle } from '@/composables/usePageTitle'
    import { posterUrl } from '@/lib/tmdb'
    import { releaseYear } from '@/lib/movies'
    import star from '@/assets/icons/star.svg?raw'
    import pencil from '@/assets/icons/pencil.svg?raw'
    import arrowLeft from '@/assets/icons/arrow-left.svg?raw'
    import arrowRight from '@/assets/icons/arrow-right.svg?raw'

    const route = useRoute()
    const moviesStore = useMoviesStore()
    const auth = useAuthStore()
    const filters = useFiltersStore()
    const navContext = useNavContextStore()

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

    const sourceLabelMap = {
        home: '',
        watchlist: 'Watchlist:',
        watched: 'Watched:',
        favorites: 'Favorites:',
        ignored: 'Ignored:',
    }
    const sourceLabel = computed(() => sourceLabelMap[navContext.sourceList] ?? '')

    const sourceListClassMap = {
        watchlist: 'list-watchlist',
        watched: 'list-watched',
        favorites: 'list-favorite',
        ignored: 'list-ignored',
    }
    const sourceListClass = computed(() => sourceListClassMap[navContext.sourceList] ?? null)

    const browseList = computed(() =>
        navContext.contextMovies.length ? navContext.contextMovies : filters.filteredMovies
    )
    const currentIndex = computed(() => browseList.value.findIndex(m => m.slug === route.params.slug))
    const prevMovie = computed(() => currentIndex.value > 0 ? browseList.value[currentIndex.value - 1] : null)
    const nextMovie = computed(() =>
        currentIndex.value < browseList.value.length - 1 ? browseList.value[currentIndex.value + 1] : null
    )

</script>

<style module="s">
    .page {
        container-type: inline-size;
        margin: calc(var(--content-padding) * -1) calc(var(--content-padding) * -1) 0 calc(var(--content-padding) * -1);
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

        @container (min-width: 32rem) {
            align-items: stretch;
        }

        @container (min-width: 48rem) {
            gap: var(--size-12);
            margin-top: -12%;
        }

        @container (min-width: 64rem) {
            gap: var(--size-16);
            margin-top: -14%;
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

        @container (min-width: 64rem) {
            padding-top: var(--size-6);
        }
    }

    .title {
        color: var(--color-heading);
        font-size: var(--text-3xl);
        font-weight: var(--font-weight-bold);
        line-height: var(--leading-tight);
        margin-bottom: var(--size-4);
        text-shadow: var(--text-shadow-lg);
        text-wrap: pretty;

        @container (min-width: 48rem) {
            font-size: var(--text-5xl);
        }

        @container (min-width: 64rem) {
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
        color: var(--color-heading);
        display: flex;
        font-size: var(--text-xs);
        font-weight: var(--font-weight-medium);
        gap: var(--size-1);
        justify-content: center;
        text-shadow: var(--text-shadow-md);

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
        color: var(--yellow-200);
        display: flex;
        justify-content: center;
    }

    .genres {
        display: flex;
        flex-wrap: wrap;
        gap: var(--size-1);
        margin-bottom: var(--size-4);
    }

    .genre {
        background: var(--blue-800);
        border-radius: var(--radius-full);
        color: var(--blue-300);
        font-size: var(--text-2xs);
        font-weight: var(--font-weight-semibold);
        letter-spacing: var(--tracking-widest);
        line-height: var(--leading-snug);
        padding: var(--size-1) var(--size-3);
        text-transform: uppercase;
    }

    .description {
        color: var(--color-text);
        font-size: var(--text-sm);
        line-height: var(--leading-relaxed);
        text-wrap: pretty;

        @container (min-width: 48rem) {
            font-size: var(--text-base);
        }
    }

    .descriptionNarrow {
        margin-top: var(--size-8);

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
        color: var(--color-text-muted);
        font-size: var(--text-sm);
        font-style: italic;
        margin-top: var(--size-4);
    }

    .notesNarrow {
        @container (min-width: 32rem) {
            display: none;
        }
    }

    .notesWide {
        display: none;

        @container (min-width: 32rem) {
            display: block;
        }
    }

    .browse {
        background: var(--blue-900);
        margin-bottom: calc(var(--content-padding) * -1);
        margin-top: var(--size-12);
        padding: var(--size-4) 0;

        @media (min-width: 64rem) {
            padding: var(--size-8) 0;
        }
    }

    .browseLabel {
        color: var(--blue-400);
        font-size: var(--text-xs);
        font-weight: var(--font-weight-semibold);
        letter-spacing: var(--tracking-widest);
        margin-bottom: var(--size-3);
        text-transform: uppercase;
    }

    .browseNav {
        display: flex;
        gap: var(--size-2);
        margin-inline: auto;
        max-width: var(--content-width);
        padding-inline: var(--content-padding);
    }

    .browseLink {
        background: var(--color-surface);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-md);
        container-type: inline-size;
        display: flex;
        flex: 1;
        gap: var(--size-3);
        min-width: 0;
        padding: var(--size-3);
        text-align: right;
        transition: border-color var(--transition-fast), background var(--transition-fast);
    }

    .browseLink:hover {
        background: var(--color-surface-raised);
        border-color: var(--color-border-strong);
    }

    .browseLinkNext {
        text-align: left;
    }

    .browseContent {
        align-items: center;
        display: flex;
        flex: 1;
        flex-direction: row-reverse;
        gap: var(--size-3);

        @container (min-width: 20rem) {
            gap: var(--size-4);
        }
    }

    .browseLinkNext .browseContent {
        align-items: center;
        flex-direction: row;
    }

    .browseIcon {
        align-items: center;
        color: var(--color-text-muted);
        font-size: var(--text-xs);
        display: flex;
        flex-shrink: 0;
        justify-content: center;

        @container (min-width: 16rem) {
            font-size: var(--text-sm);
        }
    }

    .browsePoster {
        display: none;

        @container (min-width: 14rem) {
            aspect-ratio: 2 / 3;
            border-radius: var(--radius-sm);
            box-shadow: var(--shadow-md);
            display: block;
            flex-shrink: 0;
            object-fit: cover;
            width: var(--size-12);
        }

        @container (min-width: 20rem) {
            width: var(--size-16);
        }
    }

    .browseMeta {
        display: flex;
        flex-direction: column;
        gap: var(--size-1);
        min-width: 0;
    }

    .browsePrevNext {
        color: var(--color-list-400, var(--blue-400));
        font-size: var(--text-2xs);
        font-weight: var(--font-weight-medium);
        letter-spacing: var(--tracking-wider);
        text-transform: uppercase;
    }

    .browseTitle {
        color: var(--blue-50);
        font-size: var(--text-xs);
        font-weight: var(--font-weight-bold);
        line-height: var(--leading-snug);
        text-wrap: pretty;

        @container (min-width: 20rem) {
            font-size: var(--text-sm);
        }
    }

    .browseYear {
        color: var(--blue-100);
        font-size: var(--text-xs);
        line-height: var(--leading-tight);
    }

    .browseEmpty {
        flex: 1;
    }

    .edit {
        margin: var(--size-6) auto 0 auto;
        max-width: var(--content-width);
        padding-inline: var(--content-padding);
    }

    .editLink {
        align-items: center;
        background: var(--yellow-900);
        border: 1px solid var(--yellow-800);
        border-radius: var(--radius-md);
        color: var(--yellow-400);
        display: flex;
        font-size: var(--text-xs);
        font-weight: var(--font-weight-medium);
        gap: var(--size-2);
        justify-content: center;
        padding: var(--size-2) var(--size-4);
        transition: border-color var(--transition-fast), color var(--transition-fast), background var(--transition-fast);
    }

    .editLink:hover {
        border-color: var(--yellow-500);
        background: var(--yellow-500);
        color: var(--yellow-950);
    }

    .editIcon {
        align-items: center;
        display: flex;
        justify-content: center;
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
