<template>
    <div v-if="movie" :class="s.page">

        <MovieHero :movie="movie" />

        <div :class="s.contentWrap">
            <div :class="s.narrowContent">
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
                </div>
            </div>

            <div :class="s.content">
                <div :class="s.wideCol1">
                    <div :class="s.poster">
                        <img v-if="movie.poster_path" :src="posterUrl(movie.poster_path)" :alt="movie.title" />
                    </div>

                    <MovieActionBar :movie="movie" />

                    <MovieServices v-if="hasServices" :movie="movie" />
                </div>

                <div :class="s.wideCol2">
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
                    </div>

                    <!-- <button v-if="movie.description"
                        :class="[s.description, descriptionExpanded && s.descriptionExpanded]"
                        @click="descriptionExpanded = true" ref="descriptionEl">
                        {{ movie.description }}
                    </button> -->

                    <p v-if="movie.description" :class="s.description">
                        {{ movie.description }}
                    </p>

                    <p v-if="movie.notes" :class="s.notes">{{ movie.notes }}</p>

                    <MovieCast v-if="movie.cast_members?.length" :cast="movie.cast_members" />

                    <p v-if="auth.isAdmin" :class="s.edit">
                        <RouterLink :to="{ name: 'edit-movie', params: { slug: movie.slug } }" :class="s.editLink">
                            <span v-html="pencil" :class="s.editIcon" />
                            Edit Movie
                        </RouterLink>
                    </p>
                </div>
            </div>
        </div>



        <div :class="[s.browse, sourceListClass]">
            <div :class="s.browseNav">
                <RouterLink v-if="prevMovie" :to="{ name: 'movie', params: { slug: prevMovie.slug } }"
                    :class="[s.browseLink, s.browseLinkPrev]">

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
    import { computed, ref, watch } from 'vue'
    import { useRoute } from 'vue-router'
    import { useMoviesStore } from '@/stores/movies'
    import { useAuthStore } from '@/stores/auth'
    import { useFiltersStore } from '@/stores/filters'
    import { useNavContextStore } from '@/stores/navContext'
    import MovieHero from '@/components/detail/MovieHero.vue'
    import MovieActionBar from '@/components/detail/MovieActionBar.vue'
    import MovieCast from '@/components/detail/MovieCast.vue'
    import MovieServices from '@/components/detail/MovieServices.vue'
    import { usePageTitle } from '@/composables/usePageTitle'
    import { posterUrl, profileUrl } from '@/lib/tmdb'
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

    const descriptionExpanded = ref(false)
    const descriptionEl = ref(null)
    const isDescriptionClamped = ref(false)

    watch(descriptionEl, (el, _, onCleanup) => {
        if (!el) {
            isDescriptionClamped.value = false
            return
        }
        const observer = new ResizeObserver(() => {
            isDescriptionClamped.value = el.scrollHeight > el.clientHeight
        })
        observer.observe(el)
        onCleanup(() => observer.disconnect())
    })

    watch(() => movie.value?.slug, () => {
        descriptionExpanded.value = false
    })
</script>

<style module="s">
    .page {
        container-type: inline-size;
        margin: calc(var(--content-padding) * -1);
        padding-bottom: var(--size-2);

        @media (min-width: 64rem) {
            padding-bottom: 0;
        }
    }

    .contentWrap {
        margin: 0 auto;
        max-width: calc(var(--content-width) + (var(--content-padding) * 2));
        padding-inline: var(--content-padding);
        position: relative;
    }

    .narrowContent {
        align-items: end;
        display: flex;
        gap: 5%;
        margin-top: -4%;

        @media (min-width: 48rem) {
            display: none;
        }

        /*
        @container (min-width: 48rem) {
            gap: var(--size-12);
            margin-top: -12%;
        }

        @container (min-width: 64rem) {
            gap: var(--size-16);
            margin-top: -20%;
        } */
    }

    .content {
        margin-top: var(--size-8);

        @media (min-width: 48rem) {
            display: flex;
            gap: var(--size-12);
            margin-top: -22%;
        }

        @media (min-width: 64rem) {
            gap: var(--size-16);
        }

        .poster {
            display: none;

            @media (min-width: 48rem) {
                display: block;
            }

            img {
                border-radius: var(--radius-xl);
            }
        }

        .meta {
            display: none;

            @media (min-width: 48rem) {
                display: block;
                padding-top: var(--size-16);
            }

            @media (min-width: 64rem) {
                padding-top: var(--size-24);
            }
        }
    }

    .wideCol1 {
        container-name: wide-col1;
        container-type: inline-size;
        display: flex;
        flex: 0 0 28%;
        flex-direction: column;
        gap: var(--size-4);
        min-width: 12rem;
    }

    .wideCol2 {
        container-name: wide-col2;
        container-type: inline-size;
        flex: 1;
        min-width: 0;
    }

    .poster {
        flex-shrink: 0;
        min-width: 6rem;
        width: 20%;

        @media (min-width: 48rem) {
            margin-bottom: var(--size-4);
            min-width: 0;
            width: auto;
        }
    }

    .poster img {
        aspect-ratio: 2 / 3;
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-xl);
        display: block;
        object-fit: cover;
        width: 100%;

        @media (min-width: 48rem) {
            box-shadow: var(--shadow-2xl);
        }
    }

    .meta {
        flex: 1;
        min-width: 0;

        @media (min-width: 64rem) {
            padding-top: var(--size-6);
        }
    }

    .title {
        color: var(--blue-50);
        font-size: var(--text-2xl);
        font-weight: var(--font-weight-bold);
        line-height: var(--leading-tighter);
        letter-spacing: var(--tracking-widest);
        margin-bottom: var(--size-3);
        text-transform: uppercase;
        /* text-shadow: var(--text-shadow-lg); */
        text-wrap: pretty;

        @media (min-width: 36rem) {
            font-size: var(--text-3xl);
        }

        @media (min-width: 48rem) {
            font-size: var(--text-4xl);
            margin-bottom: var(--size-3);
            text-wrap: balance;
        }

        @media (min-width: 64rem) {
            font-size: var(--text-5xl);
            margin-bottom: var(--size-4);
        }
    }

    .tags {
        display: flex;
        flex-wrap: wrap;
        gap: var(--size-1) var(--size-2);
        margin-bottom: var(--size-2);
        color: var(--blue-50);
        font-size: var(--text-2xs);
        font-weight: var(--font-weight-bold);
        letter-spacing: var(--tracking-widest);
        line-height: var(--leading-tighter);
        /* text-shadow: var(--text-shadow-md); */
        text-transform: uppercase;

        @media (min-width: 48rem) {
            font-size: var(--text-xs);
            margin-bottom: var(--size-3);
        }

        @media (min-width: 64rem) {
            margin-bottom: var(--size-4);
        }
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
        font-size: var(--text-xs);
        justify-content: center;
    }

    .genres {
        display: flex;
        flex-wrap: wrap;
        gap: var(--size-1);
    }

    .genre {
        background: var(--color-bg-frosted);
        border-radius: var(--radius-full);
        color: var(--blue-400);
        font-size: var(--text-2xs);
        font-weight: var(--font-weight-bold);
        letter-spacing: var(--tracking-widest);
        line-height: var(--leading-tighter);
        padding: var(--size-1) var(--size-2);
        text-transform: uppercase;

        @media (min-width: 48rem) {
            font-size: var(--text-xs);
            padding: var(--size-1) var(--size-3);
        }
    }

    .description {
        color: var(--blue-200);
        font-size: var(--text-base);
        font-weight: var(--font-weight-medium);
        line-height: var(--leading-relaxed);
        margin-top: var(--size-8);
        text-align: left;
        text-wrap: pretty;

        @media (min-width: 48rem) {
            font-size: var(--text-base);
            margin-top: var(--size-8);
        }

        @media (min-width: 64rem) {
            font-size: var(--text-lg);
            line-height: var(--leading-loose);
        }
    }

    .descriptionExpanded {
        -webkit-line-clamp: unset;
        cursor: default;
        display: block;
        overflow: visible;
    }

    .notes {
        color: var(--blue-200);
        font-size: var(--text-xs);
        font-weight: var(--font-weight-bold);
        margin-top: var(--size-2);
    }

    .browse {
        margin-top: var(--size-8);

        @media (min-width: 64rem) {
            background: var(--blue-900);
            margin-top: var(--size-24);
            padding-block: var(--size-12);
        }
    }

    .browseLabel {
        color: var(--blue-400);
        font-size: var(--text-xs);
        font-weight: var(--font-weight-bold);
        letter-spacing: var(--tracking-widest);
        margin-bottom: var(--size-3);
        text-transform: uppercase;
    }

    .browseNav {
        display: flex;
        gap: var(--size-2);
        margin-inline: auto;
        max-width: calc(var(--content-width) + (var(--content-padding) * 2));

        @media (min-width: 64rem) {
            padding-inline: var(--content-padding);
        }
    }

    .browseLink {
        background: var(--blue-900);
        container-name: browse-card;
        container-type: inline-size;
        display: flex;
        flex: 1;
        gap: var(--size-4);
        min-width: 0;
        padding: var(--size-6) var(--size-4);
        text-align: right;
        transition: border-color var(--transition-fast), background var(--transition-fast);

        @media (min-width: 48rem) {
            padding: var(--size-6);
        }

        @media (min-width: 64rem) {
            border: 1px solid var(--blue-800);
            border-radius: var(--radius-xl);
        }
    }

    @media (hover: hover) and (pointer: fine) {
        .browseLink:hover {
            background: var(--blue-800);
        }
    }

    .browseLinkNext {
        border-top-left-radius: var(--radius-xl);
        border-bottom-left-radius: var(--radius-xl);
        text-align: left;
    }

    .browseLinkPrev {
        border-top-right-radius: var(--radius-xl);
        border-bottom-right-radius: var(--radius-xl);
    }

    .browseContent {
        align-items: center;
        display: flex;
        flex: 1;
        flex-direction: row-reverse;
        gap: var(--size-3);

        @container browse-card (min-width: 20rem) {
            gap: var(--size-4);
        }

        @container browse-card (min-width: 24rem) {
            gap: var(--size-5);
        }
    }

    .browseLinkNext .browseContent {
        align-items: center;
        flex-direction: row;
    }

    .browseIcon {
        align-items: center;
        color: var(--blue-50);
        font-size: var(--text-xs);
        display: flex;
        flex-shrink: 0;
        justify-content: center;

        @container browse-card (min-width: 16rem) {
            font-size: var(--text-sm);
        }

        @container browse-card (min-width: 24rem) {
            font-size: var(--text-xl);
        }
    }

    .browsePoster {
        display: none;

        @container browse-card (min-width: 14rem) {
            aspect-ratio: 2 / 3;
            border-radius: var(--radius-lg);
            box-shadow: var(--shadow-md);
            display: block;
            flex-shrink: 0;
            object-fit: cover;
            width: var(--size-12);
        }

        @container browse-card (min-width: 20rem) {
            width: var(--size-16);
        }

        @container browse-card (min-width: 24rem) {
            width: var(--size-20);
        }
    }

    .browseMeta {
        display: flex;
        flex-direction: column;
        font-size: var(--text-2xs);
        font-weight: var(--font-weight-bold);
        gap: var(--size-2);
        letter-spacing: var(--tracking-widest);
        line-height: var(--leading-tighter);
        min-width: 0;
        text-transform: uppercase;
    }

    .browsePrevNext {
        color: var(--color-list-400, var(--blue-500));
    }

    .browseTitle {
        color: var(--blue-50);
        font-size: var(--text-xs);
        text-wrap: pretty;

        @container browse-card (min-width: 18rem) {
            font-size: var(--text-sm);
        }

        @container browse-card (min-width: 24rem) {
            font-size: var(--text-base);
        }
    }

    .browseYear {
        color: var(--blue-200);
    }

    .browseEmpty {
        flex: 1;
    }

    .edit {
        margin-top: var(--size-8) auto 0 auto;
    }

    .editLink {
        align-items: center;
        border: none;
        border-radius: var(--radius-full);
        color: var(--yellow-400);
        display: flex;
        font-size: var(--text-xs);
        font-weight: var(--font-weight-bold);
        gap: var(--size-2);
        justify-content: center;
        letter-spacing: var(--tracking-widest);
        line-height: var(--leading-tight);
        margin-top: var(--size-9);
        text-transform: uppercase;
        transition: background var(--transition-fast), color var(--transition-fast);

        @media (min-width: 48rem) {
            display: inline-flex;
        }
    }

    @media (hover: hover) and (pointer: fine) {
        .editLink:hover {
            color: var(--yellow-300);
        }
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
        color: var(--blue-400);
        font-size: var(--text-sm);
    }

</style>
