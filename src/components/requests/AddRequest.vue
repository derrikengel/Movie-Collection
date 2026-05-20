<template>
    <div ref="popoverEl" popover :class="s.popover" aria-label="Request a Movie" @toggle="onToggle">
        <div :class="s.modal">
            <h2 :class="s.title">Request a Movie</h2>

            <button :class="s.closeBtn" @click="popoverEl?.hidePopover()" aria-label="Close">
                <span v-html="xIcon" />
            </button>

            <div :class="s.body">
                <div :class="s.field">
                    <div :class="s.searchWrap">
                        <input v-model="tmdbQuery" type="search" placeholder="Search by title and year" :class="s.input"
                            @keydown.enter.prevent="searchTmdb" ref="searchInputEl" />
                        <button :class="s.searchBtn" @click="searchTmdb" :disabled="tmdbSearching || !tmdbQuery"
                            :aria-label="tmdbSearching ? 'Searching' : 'Search'">
                            <span :class="[s.searchIcon, tmdbSearching && s.isLoading]" v-html="searchIcon" />
                        </button>
                    </div>
                </div>

                <div v-if="tmdbResults.length" :class="s.results">
                    <component :is="libraryByTmdbId[result.id] ? RouterLink : 'button'" v-for="result in tmdbResults"
                        :key="result.id" v-bind="libraryByTmdbId[result.id]
                            ? { to: { name: 'movie', params: { slug: libraryByTmdbId[result.id] } } }
                            : {}" :class="[s.result, selectingId && result.id !== selectingId && s.resultDimmed]"
                        :disabled="!libraryByTmdbId[result.id] && !!selectingId || undefined"
                        @click="libraryByTmdbId[result.id] ? popoverEl?.hidePopover() : handleSelect(result)">

                        <div :class="s.resultPoster">
                            <img v-if="result.poster_path" :src="posterUrl(result.poster_path, 'w92')"
                                :alt="`${result.title} ${result.release_date?.slice(0, 4)}`"
                                :class="s.resultPosterImg" />
                        </div>

                        <p :class="s.resultInfo">
                            <span :class="s.resultTitle">{{ result.title }}</span>
                            <span :class="s.resultYear">{{ result.release_date?.slice(0, 4) }}</span>
                            <span v-if="libraryByTmdbId[result.id]" :class="s.badgeLibrary">
                                Already owned
                            </span>
                            <span v-else-if="requestsByTmdbId[result.id]" :class="s.badgeRequested">
                                Already requested
                            </span>
                        </p>

                        <span v-html="libraryByTmdbId[result.id] ? arrowRightIcon : plusIcon" aria-hidden="true"
                            :class="[s.resultIcon, result.id === selectingId && s.isLoading, libraryByTmdbId[result.id] && s.resultIconArrow]" />
                    </component>
                </div>

                <p v-if="tmdbResults.length === 0 && tmdbSearched" :class="s.empty">
                    No results found.
                </p>
            </div>
        </div>
    </div>
</template>

<script setup>
    import { ref, computed, watch, nextTick } from 'vue'
    import { useMoviesStore } from '@/stores/movies'
    import { useRequestsStore } from '@/stores/requests'
    import { useTmdbSearch } from '@/composables/useTmdbSearch'
    import { posterUrl } from '@/lib/tmdb'
    import { RouterLink } from 'vue-router'
    import xIcon from '@/assets/icons/x-mark.svg?raw'
    import searchIcon from '@/assets/icons/magnifying-glass.svg?raw'
    import plusIcon from '@/assets/icons/plus-simple.svg?raw'
    import arrowRightIcon from '@/assets/icons/arrow-right.svg?raw'

    const props = defineProps({
        open: {
            type: Boolean,
            default: false,
        },
    })

    const emit = defineEmits(['close'])

    const moviesStore = useMoviesStore()
    const requestsStore = useRequestsStore()
    const { tmdbQuery, tmdbResults, tmdbSearching, tmdbSearched, searchTmdb, selectTmdb, resetTmdb } = useTmdbSearch()

    const popoverEl = ref(null)
    const searchInputEl = ref(null)
    const selectingId = ref(null)

    const libraryByTmdbId = computed(() =>
        Object.fromEntries(moviesStore.movies.filter(m => m.tmdb_id).map(m => [m.tmdb_id, m.slug]))
    )

    const requestsByTmdbId = computed(() => requestsStore.requestByTmdbId)

    watch(() => props.open, async (isOpen) => {
        if (isOpen) {
            resetTmdb()
            popoverEl.value?.showPopover()
            await nextTick()
            searchInputEl.value?.focus()
        } else {
            popoverEl.value?.hidePopover()
        }
    })

    function onToggle(e) {
        if (e.newState === 'closed') emit('close')
    }

    async function handleSelect(result) {
        selectingId.value = result.id
        try {
            const data = await selectTmdb(result)
            await requestsStore.addRequest(data)
            popoverEl.value?.hidePopover()
        } finally {
            selectingId.value = null
        }
    }
</script>

<style module="s">

    /* ─── Popover container (verbatim from MovieServices) ─── */
    .popover {
        background: none;
        border: none;
        left: 50%;
        max-height: calc(100dvh - var(--size-8));
        max-width: 40rem;
        opacity: 0;
        overflow: visible;
        padding: 0;
        position: fixed;
        top: 50%;
        transition:
            display var(--transition-normal) allow-discrete,
            opacity var(--transition-normal),
            overlay var(--transition-normal) allow-discrete,
            translate var(--transition-normal);
        translate: -50% calc(-50% + var(--size-8));
        width: calc(100% - var(--size-8));
    }

    .popover:popover-open {
        opacity: 1;
        translate: -50% -50%;
    }

    @starting-style {
        .popover:popover-open {
            opacity: 0;
            translate: -50% calc(-50% + var(--size-4));
        }
    }

    .popover::backdrop {
        backdrop-filter: var(--bg-frosted-sm);
        background: oklch(from var(--blue-950) l c h / 0.75);
        opacity: 0;
        transition:
            display allow-discrete,
            opacity var(--transition-slow),
            overlay allow-discrete;
    }

    .popover:popover-open::backdrop {
        opacity: 1;
    }

    @starting-style {
        .popover:popover-open::backdrop {
            opacity: 0;
        }
    }

    /* ─── Modal box ─── */
    .modal {
        backdrop-filter: var(--bg-frosted-3xl);
        background: var(--color-bg-frosted);
        border-radius: var(--radius-xl);
        box-shadow: var(--shadow-2xl);
        color: var(--blue-200);
        max-height: calc(100dvh - var(--size-8));
        overflow-y: auto;
        overscroll-behavior: contain;
        padding: var(--size-11) 0 0 0;
        position: relative;
        scrollbar-width: thin;

        @media (min-width: 48rem) {
            padding: var(--size-11) var(--size-8) var(--size-8) var(--size-8);
        }
    }

    .title {
        color: var(--blue-50);
        font-size: var(--text-xl);
        font-weight: var(--font-weight-bold);
        letter-spacing: var(--tracking-widest);
        line-height: var(--leading-tight);
        margin-bottom: var(--size-6);
        text-align: center;
        text-transform: uppercase;
    }

    .closeBtn {
        align-items: center;
        color: var(--blue-400);
        display: flex;
        font-size: var(--text-xl);
        height: var(--size-8);
        justify-content: center;
        position: absolute;
        right: var(--size-3);
        top: var(--size-3);
        transition: color var(--transition-fast);
        width: var(--size-8);
    }

    @media (hover: hover) and (pointer: fine) {
        .closeBtn:hover {
            color: var(--blue-50);
        }
    }

    /* ─── Body ─── */
    .body {
        display: flex;
        flex-direction: column;
        gap: var(--size-3);
        overflow-y: auto;
        padding: 0 var(--size-4) var(--size-4);

        @media (min-width: 30rem) {
            padding-inline: var(--size-6);
        }
    }

    .field {
        display: flex;
        flex-direction: column;
        gap: var(--size-2);
    }

    .searchWrap {
        display: flex;
        gap: var(--size-2);
        position: relative;

        .input {
            padding-right: var(--size-12);
        }
    }

    .input {
        appearance: auto;
        background: var(--color-frosted-input);
        border: none;
        border-radius: var(--radius-lg);
        color: var(--blue-50);
        font-size: var(--text-base);
        outline: none;
        padding: var(--size-4);
        transition: background var(--transition-fast);
        width: 100%;

        &:focus {
            background: var(--color-frosted-input-focus);
        }
    }

    .input::placeholder {
        color: var(--blue-400);
    }

    .searchBtn {
        align-items: center;
        color: var(--blue-50);
        display: flex;
        font-size: var(--text-xl);
        height: 100%;
        justify-content: center;
        position: absolute;
        right: 0;
        top: 0;
        width: var(--size-12);
    }

    .searchIcon {
        align-items: center;
        border: var(--size-0-5) solid transparent;
        border-radius: 100%;
        display: flex;
        height: var(--size-5);
        justify-content: center;
        position: relative;
        transition: border-color var(--transition-fast);
        width: var(--size-5);

        svg {
            transition: opacity var(--transition-fast);
        }

        &.isLoading {
            animation: loader-outer 1s linear infinite;
            border-color: var(--green-300) var(--green-300) transparent;

            &:after {
                animation: loader-inner 0.5s linear infinite;
                border: var(--size-0-5) solid;
                border-color: transparent var(--blue-50) var(--blue-50);
                border-radius: 100%;
                bottom: 0;
                content: '';
                height: var(--size-3);
                left: 0;
                margin: auto;
                position: absolute;
                right: 0;
                top: 0;
                transform-origin: center center;
                width: var(--size-3);
            }

            svg {
                opacity: 0;
            }
        }
    }

    @keyframes loader-outer {
        0% {
            transform: rotate(0deg);
        }

        100% {
            transform: rotate(360deg);
        }
    }

    @keyframes loader-inner {
        0% {
            transform: rotate(0deg);
        }

        100% {
            transform: rotate(-360deg);
        }
    }

    .results {
        display: flex;
        flex-direction: column;
        gap: var(--size-1);
    }

    .result {
        align-items: center;
        background: var(--color-bg-frosted-unselected);
        border-radius: var(--radius-lg);
        color: var(--blue-50);
        cursor: pointer;
        display: flex;
        font-size: var(--text-xs);
        font-weight: var(--font-weight-bold);
        gap: var(--size-4);
        letter-spacing: var(--tracking-widest);
        line-height: var(--leading-tighter);
        padding: var(--size-4);
        text-align: left;
        text-transform: uppercase;
        transition: background var(--transition-fast);
        width: 100%;

        @media (min-width: 30rem) {
            padding: var(--size-4) var(--size-6);
        }

        &:disabled {
            cursor: default;
            opacity: 0.5;
        }
    }

    @media (hover: hover) and (pointer: fine) {
        .result:not(:disabled):hover {
            background: var(--color-bg-frosted-selected);
        }
    }

    .resultDimmed {
        opacity: 0.35;
    }

    .resultPoster {
        aspect-ratio: 2 / 3;
        background: var(--blue-800);
        border-radius: var(--radius-md);
        box-shadow: var(--shadow-xl);
        flex-shrink: 0;
        overflow: hidden;
        width: 4rem;
    }

    .resultPosterImg {
        display: block;
        height: 100%;
        object-fit: cover;
        width: 100%;
    }

    .resultInfo {
        display: flex;
        flex: 1;
        flex-direction: column;
        gap: var(--size-1);
    }

    .resultTitle {
        font-size: var(--text-sm);
        text-wrap: balance;
    }

    .resultYear {
        color: var(--blue-400);
    }

    .badgeLibrary {
        color: var(--yellow-400);
        font-size: var(--text-2xs);
    }

    .badgeRequested {
        color: var(--green-300);
        font-size: var(--text-2xs);
    }

    .resultIcon {
        align-items: center;
        background: var(--green-300);
        border-radius: var(--radius-full);
        color: var(--green-800);
        display: flex;
        flex-shrink: 0;
        font-size: var(--text-lg);
        justify-content: center;
        width: var(--size-7);
        height: var(--size-7);
    }

    .resultIconArrow {
        background: none;
        color: var(--blue-50);
    }

    .empty {
        color: var(--blue-400);
        font-size: var(--text-sm);
        padding: var(--size-2) 0;
    }
</style>
