<template>
    <header :class="[s.header, isMovieDetail && s.hideHeaderNarrow, filtersOpen && s.headerExpanded]">

        <!-- Top row: animated title/count + narrow filter buttons + wide nav -->
        <div :class="s.globalHeader">

            <Transition name="count" mode="out-in">
                <h1 v-if="isListPage" :key="route.path" :class="[s.pageTitle, routeListClass]">
                    <UserAvatar v-if="isOtherUserList" :user="resolvedUserName" :avatar="resolvedProfileEntry.avatar"
                        :class="s.pageTitleAvatar" />
                    <div :class="s.pageTitleText">
                        <span :class="s.countHeaderNumber">{{ displayCount }}</span>
                        <span :class="s.countHeaderList">
                            {{ listName || 'movies' }}
                        </span>
                    </div>
                </h1>

                <a v-else-if="isMovieDetail" key="back" :href="backHref" :class="s.backBtn" @click.prevent="handleBack">
                    <span :class="s.backIcon" v-html="arrowLeft" />
                    Back
                </a>

                <h1 v-else-if="isProfile" key="profile" :class="[s.pageTitle, s.profileTitle]">
                    <UserAvatar :avatar="resolvedProfileEntry?.avatar" :class="s.pageTitleAvatar" />
                    {{ resolvedUserName ?? auth.displayName }}
                </h1>

                <h1 v-else :key="`title-${route.path}`" :class="s.pageTitle">{{ route.meta.title }}</h1>
            </Transition>

            <!-- Narrow: filter toggle + random buttons (listing pages only, hidden on wide) -->
            <div v-if="isListPage" :class="s.narrowButtons">
                <button v-if="filters.activeFilterCount > 0 || filters.search" :class="[s.narrowBtn, s.resetBtn]"
                    @click="filters.reset()" aria-label="Reset search & filters">
                    <span :class="s.narrowResetIcon" v-html="resetIcon" />
                </button>
                <button
                    :class="[s.narrowBtn, filtersOpen && s.narrowBtnActive, filters.activeFilterCount > 0 && s.narrowBtnSelections]"
                    @click="filtersOpen = !filtersOpen" aria-label="Open filters">
                    <span :class="s.narrowFilterIcon" v-html="filterIcon" />
                    <span v-if="filters.activeFilterCount > 0" class="badge" :class="s.narrowFilterBadge">
                        {{ filters.activeFilterCount }}
                    </span>
                </button>
                <button :class="[s.narrowBtn, s.randomBtn]" @click="handleRandom" aria-label="Random movie"
                    v-html="randomIcon" />
            </div>

            <!-- Wide nav links (hidden on narrow) -->
            <nav :class="s.nav">
                <RouterLink v-for="link in navLinks" :key="link.to" :to="link.to" :exact="link.exact"
                    :class="[s.navLink, link.colored && s.navLinkColored, link.listClass, forcedActiveRoute === link.to.name && s.navLinkActive]"
                    :active-class="s.navLinkActive">
                    <UserAvatar v-if="link.isAvatar" :avatar="auth.profile?.avatar" :class="s.navAvatar" />
                    <span v-else v-html="link.icon" :class="s.navIcon" />
                    <span :class="s.navLabel">{{ link.label }}</span>
                </RouterLink>
            </nav>

        </div>

        <!-- Filter area: search + filter controls (listing pages only) -->
        <div v-if="isListPage" :class="s.filterArea">

            <!-- Search — always visible on listing pages -->
            <div :class="s.searchInputWrap">
                <label for="search" class="visually-hidden">Search</label>
                <input v-model="filters.search" id="search" type="search" inputmode="search" placeholder="Search"
                    :class="s.searchInput" aria-label="Search movies" />
                <span :class="s.searchIcon" v-html="searchIcon" />
            </div>

            <!-- Random -->
            <button :class="[s.wideFilterBtn, s.wideRandomBtn]" @click="handleRandom">
                <span :class="s.wideFilterIcon" v-html="randomIcon" />
                Random Movie
            </button>

            <!-- Narrow filter panels (shown when header is expanded) -->
            <Transition name="filters-fade">
                <div v-show="filtersOpen" :class="s.narrowFilters">

                    <!-- Sort -->
                    <FilterPanel>
                        <template #label>
                            <span :class="s.sortIcon" v-html="sortIcon" />
                            <span :class="s.sortCurrentNarrow">
                                {{sortOptions.find(o => o.value === filters.sort)?.label}}
                            </span>
                        </template>
                        <FilterOptionList :options="sortOptions" :active-values="[filters.sort]"
                            @toggle="filters.sort = $event" />
                    </FilterPanel>

                    <!-- Genre -->
                    <FilterPanel label="Genre" :count="filters.genres.length">
                        <FilterOptionList :options="genreOptions" :active-values="filters.genres"
                            @toggle="toggleGenre" />
                    </FilterPanel>

                    <!-- Rating -->
                    <FilterPanel label="Rating" :count="filters.mpaaGroups.length">
                        <FilterOptionList :options="mpaaOptions" :active-values="filters.mpaaGroups"
                            @toggle="toggleMpaa" />
                    </FilterPanel>

                    <!-- Year -->
                    <FilterPanel label="Year"
                        :count="(Number.isFinite(filters.yearMin) ? 1 : 0) + (Number.isFinite(filters.yearMax) ? 1 : 0)">
                        <FilterRangeSlider :min="filters.yearBounds.min ?? 1900" :max="filters.yearBounds.max ?? 2025"
                            :model-value-min="filters.yearMin" :model-value-max="filters.yearMax" label-min="From"
                            label-max="To" aria-label-min="Minimum year" aria-label-max="Maximum year"
                            @update:model-value-min="filters.yearMin = $event"
                            @update:model-value-max="filters.yearMax = $event" />
                    </FilterPanel>

                    <!-- Runtime -->
                    <FilterPanel label="Runtime"
                        :count="(Number.isFinite(filters.runtimeMin) ? 1 : 0) + (Number.isFinite(filters.runtimeMax) ? 1 : 0)">
                        <FilterRangeSlider :min="filters.runtimeBounds.min ?? 0" :max="filters.runtimeBounds.max ?? 300"
                            :model-value-min="filters.runtimeMin" :model-value-max="filters.runtimeMax" label-min="Min"
                            label-max="Max" unit="time" aria-label-min="Minimum runtime"
                            aria-label-max="Maximum runtime" @update:model-value-min="filters.runtimeMin = $event"
                            @update:model-value-max="filters.runtimeMax = $event" />
                    </FilterPanel>

                    <!-- Watched / Ignored toggles -->
                    <div v-if="auth.user" :class="s.narrowToggles">
                        <ToggleSwitch label="Fade Watched" :model-value="filters.watchedMode === 'fade'"
                            @update:model-value="filters.watchedMode = $event ? 'fade' : 'show'" />

                        <ToggleSwitch label="Hide Ignored" :model-value="filters.ignoredMode === 'hide'"
                            @update:model-value="filters.ignoredMode = $event ? 'hide' : 'show'" />
                    </div>
                </div>
            </Transition>

            <!-- Wide inline filter controls (hidden on narrow) -->
            <div :class="s.wideFilters">

                <!-- Sort -->
                <div :class="s.wideFilter">
                    <button :class="[s.wideFilterBtn, s.sortBtn]" popovertarget="filter-sort">
                        <span :class="[s.sortIcon, s.wideFilterIcon]" v-html="sortIcon" />
                        {{sortOptions.find(o => o.value === filters.sort)?.label}}
                        <span :class="s.chevron" v-html="chevronIcon" />
                    </button>
                    <div id="filter-sort" popover="auto" :class="[s.widePanel, s.sortPanel]">
                        <div :class="s.widePanelContent">
                            <FilterOptionList :options="sortOptions" :active-values="[filters.sort]"
                                @toggle="filters.sort = $event" />
                        </div>
                    </div>
                </div>

                <!-- Genre -->
                <div :class="s.wideFilter">
                    <button :class="[s.wideFilterBtn, s.genreBtn, filters.genres.length && s.wideFilterBtnActive]"
                        popovertarget="filter-genre">
                        Genre
                        <span v-if="filters.genres.length" class="badge" :class="s.filterBadge">
                            {{ filters.genres.length }}
                        </span>
                        <span :class="s.chevron" v-html="chevronIcon" />
                    </button>
                    <div id="filter-genre" popover="auto" :class="[s.widePanel, s.genrePanel]">
                        <div :class="s.widePanelContent">
                            <FilterOptionList :options="genreOptions" :active-values="filters.genres"
                                @toggle="toggleGenre" />
                        </div>
                    </div>
                </div>

                <!-- Rating -->
                <div :class="s.wideFilter">
                    <button :class="[s.wideFilterBtn, s.mpaaBtn, filters.mpaaGroups.length && s.wideFilterBtnActive]"
                        popovertarget="filter-mpaa">
                        Rating
                        <span v-if="filters.mpaaGroups.length" class="badge" :class="s.filterBadge">
                            {{ filters.mpaaGroups.length }}
                        </span>
                        <span :class="s.chevron" v-html="chevronIcon" />
                    </button>
                    <div id="filter-mpaa" popover="auto" :class="[s.widePanel, s.mpaaPanel]">
                        <div :class="s.widePanelContent">
                            <FilterOptionList :options="mpaaOptions" :active-values="filters.mpaaGroups"
                                @toggle="toggleMpaa" />
                        </div>
                    </div>
                </div>

                <!-- Year -->
                <div :class="s.wideFilter">
                    <button
                        :class="[s.wideFilterBtn, s.yearBtn, (Number.isFinite(filters.yearMin) || Number.isFinite(filters.yearMax)) && s.wideFilterBtnActive]"
                        popovertarget="filter-year">
                        Year
                        <span :class="s.chevron" v-html="chevronIcon" />
                    </button>
                    <div id="filter-year" popover="auto" :class="[s.widePanel, s.yearPanel]">
                        <div :class="s.widePanelContent">
                            <FilterRangeSlider :min="filters.yearBounds.min ?? 1900"
                                :max="filters.yearBounds.max ?? 2025" :model-value-min="filters.yearMin"
                                :model-value-max="filters.yearMax" label-min="From" label-max="To"
                                aria-label-min="Minimum year" aria-label-max="Maximum year"
                                @update:model-value-min="filters.yearMin = $event"
                                @update:model-value-max="filters.yearMax = $event" />
                        </div>
                    </div>
                </div>

                <!-- Runtime -->
                <div :class="s.wideFilter">
                    <button
                        :class="[s.wideFilterBtn, s.runtimeBtn, (Number.isFinite(filters.runtimeMin) || Number.isFinite(filters.runtimeMax)) && s.wideFilterBtnActive]"
                        popovertarget="filter-runtime">
                        Runtime
                        <span :class="s.chevron" v-html="chevronIcon" />
                    </button>
                    <div id="filter-runtime" popover="auto" :class="[s.widePanel, s.runtimePanel]">
                        <div :class="s.widePanelContent">
                            <FilterRangeSlider :min="filters.runtimeBounds.min ?? 0"
                                :max="filters.runtimeBounds.max ?? 300" :model-value-min="filters.runtimeMin"
                                :model-value-max="filters.runtimeMax" label-min="Min" label-max="Max" unit="time"
                                aria-label-min="Minimum runtime" aria-label-max="Maximum runtime"
                                @update:model-value-min="filters.runtimeMin = $event"
                                @update:model-value-max="filters.runtimeMax = $event" />
                        </div>
                    </div>
                </div>

                <!-- Watched toggle -->
                <ToggleSwitch v-if="auth.user" label="Fade Watched" :model-value="filters.watchedMode === 'fade'"
                    @update:model-value="filters.watchedMode = $event ? 'fade' : 'show'" />

                <!-- Ignored toggle -->
                <ToggleSwitch v-if="auth.user" label="Hide Ignored" :model-value="filters.ignoredMode === 'hide'"
                    @update:model-value="filters.ignoredMode = $event ? 'hide' : 'show'" />

                <!-- Reset -->
                <button :class="[s.resetBtn, s.wideResetBtn]" :disabled="!filters.activeFilterCount && !filters.search"
                    @click="filters.reset()">
                    <span :class="s.wideResetIcon" v-html="resetIcon" />
                    Reset
                </button>
            </div>

            <!-- Narrow footer: "View X movies" + Reset (only shown when filters are open) -->
            <Transition name="filters-fade">
                <div v-if="filtersOpen" :class="s.narrowFooter">
                    <button :class="s.viewBtn" :disabled="filters.visibleMovies.length === 0"
                        @click="filtersOpen = false">
                        <span v-if="filters.visibleMovies.length">
                            View {{ filters.visibleMovies.length }}
                            {{ filters.visibleMovies.length === 1 ? 'movie' : 'movies' }}
                        </span>
                        <span v-else>No Results</span>
                    </button>
                </div>
            </Transition>

        </div>

    </header>

    <Teleport to="body">
        <div v-if="filtersOpen" :class="s.narrowBackdrop" @contextmenu.prevent />
    </Teleport>
</template>

<script setup>
    import { computed, ref, watch, onUnmounted } from 'vue'
    import { useRoute, useRouter } from 'vue-router'
    import { useAuthStore } from '@/stores/auth'
    import { useFiltersStore } from '@/stores/filters'
    import { useNavContextStore } from '@/stores/navContext'
    import { mpaaGroupOptions } from '@/lib/filterOptions'
    import { slugifyName } from '@/lib/movies'
    import UserAvatar from '@/components/profile/UserAvatar.vue'
    import FilterPanel from '@/components/filters/NarrowFilterPanel.vue'
    import FilterOptionList from '@/components/filters/FilterOptionList.vue'
    import FilterRangeSlider from '@/components/filters/FilterRangeSlider.vue'
    import ToggleSwitch from '@/components/filters/ToggleSwitch.vue'
    import arrowLeft from '@/assets/icons/arrow-left.svg?raw'
    import film from '@/assets/icons/film.svg?raw'
    import bookmark from '@/assets/icons/bookmark.svg?raw'
    import heart from '@/assets/icons/heart.svg?raw'
    import userIcon from '@/assets/icons/user.svg?raw'
    import plus from '@/assets/icons/plus.svg?raw'
    import searchIcon from '@/assets/icons/magnifying-glass.svg?raw'
    import filterIcon from '@/assets/icons/filters.svg?raw'
    import resetIcon from '@/assets/icons/reset.svg?raw'
    import randomIcon from '@/assets/icons/dice.svg?raw'
    import chevronIcon from '@/assets/icons/chevron-down.svg?raw'
    import sortIcon from '@/assets/icons/sort.svg?raw'

    const route = useRoute()
    const router = useRouter()
    const auth = useAuthStore()
    const filters = useFiltersStore()
    const navContext = useNavContextStore()

    // ── Filter panel state ──────────────────────────────
    const filtersOpen = ref(false)

    // Close filter panel when navigating away from listing pages
    watch(() => route.name, (newName) => {
        if (!listingNames.includes(newName)) filtersOpen.value = false
    })

    // ── Route-derived state ─────────────────────────────
    const forcedActiveRoute = computed(() =>
        route.name === 'movie' ? (navContext.sourceList ?? 'home') : null
    )

    const routeListClassMap = {
        watchlist: 'list-watchlist',
        watched: 'list-watched',
        favorites: 'list-favorite',
        ignored: 'list-ignored',
    }
    const routeListClass = computed(() => routeListClassMap[route.name] ?? null)

    const listingNames = ['home', 'watchlist', 'watched', 'favorites', 'ignored']
    const isListPage = computed(() => listingNames.includes(route.name))
    const isMovieDetail = computed(() => route.name === 'movie')
    const isProfile = computed(() => route.name === 'profile')

    const resolvedProfileEntry = computed(() => {
        const nameParam = route.params.name
        if (!nameParam) return null
        return auth.allProfiles.find(p => slugifyName(p.display_name) === nameParam) ?? null
    })

    const resolvedUserName = computed(() => resolvedProfileEntry.value?.display_name ?? null)
    const isOtherUserList = computed(() =>
        resolvedProfileEntry.value !== null && resolvedProfileEntry.value.id !== auth.user?.id
    )

    const listNameMap = {
        watchlist: 'Watchlist',
        watched: 'Watched',
        favorites: 'Favorites',
        ignored: 'Ignored',
    }
    const listName = computed(() => listNameMap[route.name] ?? null)

    // ── Animated count ──────────────────────────────────
    const displayCount = ref(filters.visibleMovies.length)
    let animFrame = null
    let debounceTimer = null
    let routeTimer = null
    let isRouteChange = false

    function cancelAnim() {
        if (animFrame) { cancelAnimationFrame(animFrame); animFrame = null }
    }

    function runAnim(from, to) {
        cancelAnim()
        if (from === to) return
        const start = performance.now()
        const duration = 400
        function step(now) {
            const t = Math.min((now - start) / duration, 1)
            const eased = 1 - (1 - t) ** 3
            displayCount.value = Math.round(from + (to - from) * eased)
            if (t < 1) animFrame = requestAnimationFrame(step)
        }
        animFrame = requestAnimationFrame(step)
    }

    // Route change: reset to 0 while count is hidden; flag to skip debounce on next update.
    // Fallback timer handles the KeepAlive case where filters.visibleMovies.length doesn't
    // change (base was already correct), so the length watcher never fires.
    watch(() => route.name, (newName) => {
        cancelAnim()
        clearTimeout(debounceTimer)
        clearTimeout(routeTimer)
        if (!listingNames.includes(newName)) return
        displayCount.value = 0
        isRouteChange = true
        routeTimer = setTimeout(() => {
            if (!isRouteChange) return
            isRouteChange = false
            runAnim(0, filters.visibleMovies.length)
        }, 200)
    })

    // Count change: immediate for route changes, debounced for filter/slider changes
    watch(() => filters.visibleMovies.length, (to) => {
        if (isRouteChange) {
            isRouteChange = false
            clearTimeout(routeTimer)
            runAnim(0, to)
            return
        }
        clearTimeout(debounceTimer)
        debounceTimer = setTimeout(() => { runAnim(displayCount.value, to) }, 150)
    })

    onUnmounted(() => {
        cancelAnim()
        clearTimeout(debounceTimer)
        clearTimeout(routeTimer)
    })

    // ── Nav links ───────────────────────────────────────
    const navLinks = computed(() => {
        const items = [
            { to: { name: 'home' }, exact: true, label: 'All Movies', icon: film },
        ]

        if (auth.user) {
            const userSlug = slugifyName(auth.displayName ?? '')
            items.push(
                {
                    to: { name: 'watchlist', params: { name: userSlug } },
                    exact: false,
                    label: 'Watchlist',
                    icon: bookmark,
                    listClass: 'list-watchlist',
                    colored: true,
                },
                {
                    to: { name: 'favorites', params: { name: userSlug } },
                    exact: false,
                    label: 'Favorites',
                    icon: heart,
                    listClass: 'list-favorite',
                    colored: true,
                },
            )

            if (auth.isAdmin) {
                items.push({ to: { name: 'add-movie' }, exact: false, label: 'Add Movie', icon: plus })
            }

            items.push({ to: { name: 'profile', params: { name: userSlug } }, exact: true, label: auth.displayName, isAvatar: true })
        } else {
            items.push({ to: { name: 'login' }, exact: false, label: 'Sign In', icon: userIcon })
        }

        return items
    })

    // ── Filter options ──────────────────────────────────
    const sortOptions = computed(() => {
        const options = []
        if (filters.whenAddedSortLabel) {
            options.push({ value: 'added-desc', label: filters.whenAddedSortLabel })
        }
        options.push(
            { value: 'acquired-desc', label: 'Recently Acquired' },
            { value: 'year-desc', label: 'Latest Release' },
            { value: 'rating-desc', label: 'Top Rated' },
        )
        return options
    })

    const genreOptions = computed(() =>
        filters.allGenres.map(genre => ({
            value: genre,
            label: genre,
            sublabel: String(filters.genreCounts[genre] ?? 0),
            disabled: (filters.genreCounts[genre] ?? 0) === 0 && !filters.genres.includes(genre),
        }))
    )

    const mpaaOptions = mpaaGroupOptions.map(g => ({
        value: g.value,
        label: g.label,
        sublabel: g.ratings.join(', '),
    }))

    function toggleGenre(genre) {
        const i = filters.genres.indexOf(genre)
        if (i === -1) filters.genres.push(genre)
        else filters.genres.splice(i, 1)
    }

    function toggleMpaa(group) {
        const i = filters.mpaaGroups.indexOf(group)
        if (i === -1) filters.mpaaGroups.push(group)
        else filters.mpaaGroups.splice(i, 1)
    }

    const backHref = computed(() => router.resolve({
        name: navContext.sourceList ?? 'home',
        params: navContext.sourceParams,
    }).href)

    function handleBack() {
        if (navContext.sourceList !== null) {
            router.back()
        } else {
            router.push({ name: 'home' })
        }
    }

    function handleRandom() {
        filtersOpen.value = false
        const movie = filters.randomMovie()
        if (movie) router.push({ name: 'movie', params: { slug: movie.slug } })
    }
</script>

<style module="s">

    :global(.count-enter-active),
    :global(.count-leave-active) {
        transition: opacity 150ms ease;
    }

    :global(.count-enter-from),
    :global(.count-leave-to) {
        opacity: 0;
    }

    /* ── Header shell ── */

    .header {
        background: var(--color-bg-frosted);
        backdrop-filter: var(--bg-frosted-3xl);
        box-shadow: var(--shadow-2xl);
        border-bottom-left-radius: var(--radius-2xl);
        border-bottom-right-radius: var(--radius-2xl);
        display: flex;
        flex-direction: column;
        gap: var(--size-2);
        overscroll-behavior: contain;
        padding-bottom: var(--size-3);
        position: sticky;
        top: 0;
        transition: border-radius var(--transition-fast), height 0.35s cubic-bezier(0.32, 0.72, 0, 1);
        z-index: 100;

        @media (min-width: 64rem) {
            border-bottom-left-radius: var(--radius-3xl);
            border-bottom-right-radius: var(--radius-3xl);
            gap: 0;
            padding-bottom: 0;
        }
    }

    /* Expand header to full screen when filters are open (narrow default, disabled on wide) */
    .headerExpanded {
        border-radius: 0;
        height: 100dvh;

        @media (min-width: 64rem) {
            height: auto;
        }
    }

    .headerExpanded .filterArea {
        border-bottom: none;
        border-radius: 0;
        flex: 1;
        min-height: 0;
        overflow: hidden;

        @media (min-width: 64rem) {
            border-bottom: none;
            border-bottom-left-radius: var(--radius-3xl);
            border-bottom-right-radius: var(--radius-3xl);
            flex: none;
            overflow: visible;
        }
    }

    /* Open: fade in after header starts expanding */
    :global(.filters-fade-enter-active) {
        transition: opacity 0.2s ease;
        transition-delay: 0.15s;
    }

    :global(.filters-fade-enter-from) {
        opacity: 0;
    }

    /* Close: disappear instantly so only the header height animates */
    :global(.filters-fade-leave-active) {
        transition: none;
    }

    /* Narrow: hide header on movie detail pages (back button lives in hero) */
    .hideHeaderNarrow {
        display: none;

        @media (min-width: 64rem) {
            display: flex;
        }
    }

    /* ── Top row ── */

    .globalHeader {
        align-items: center;
        display: flex;
        flex-shrink: 0;
        justify-content: space-between;
        min-height: var(--size-14);
        padding: var(--size-3) var(--content-padding) 0 var(--content-padding);

        @media (min-width: 64rem) {
            align-items: stretch;
            padding: 0 var(--content-padding);
        }
    }

    /* ── Count / title ── */

    .pageTitle {
        align-items: center;
        color: var(--blue-50);
        display: flex;
        gap: var(--size-3);
        font-size: var(--text-lg);
        font-weight: var(--font-weight-bold);
        letter-spacing: var(--tracking-widest);
        line-height: var(--leading-tighter);
        text-transform: uppercase;

        @media (min-width: 64rem) {
            font-size: var(--text-3xl);
            gap: var(--size-4);
            letter-spacing: var(--tracking-widest);
        }
    }

    .pageTitleText {
        display: flex;
        justify-content: center;
        flex-direction: column;
    }

    .pageTitleAvatar {
        flex-shrink: 0;
        font-size: var(--text-4xl);

        @media (min-width: 64rem) {
            font-size: var(--text-6xl);
        }
    }

    .countHeaderNumber {
        color: var(--color-list-50, var(--blue-50));
        font-weight: var(--font-weight-bold);
        font-size: var(--text-xs);

        @media (min-width: 64rem) {
            font-size: var(--text-sm);
        }
    }

    .countHeaderList {
        color: var(--color-list-400, var(--blue-400));
    }


    .backBtn {
        align-items: center;
        align-self: center;
        border-radius: var(--radius-full);
        color: var(--blue-50);
        display: inline-flex;
        font-size: var(--text-xs);
        font-weight: var(--font-weight-bold);
        gap: var(--size-3);
        letter-spacing: var(--tracking-widest);
        text-transform: uppercase;
        transition: color var(--transition-fast), background var(--transition-fast);
    }

    .backIcon {
        align-items: center;
        color: var(--blue-800);
        background-color: var(--blue-50);
        border-radius: var(--radius-full);
        display: flex;
        font-size: var(--text-base);
        height: var(--size-8);
        justify-content: center;
        transition: background var(--transition-fast);
        width: var(--size-8);
    }

    .backBtn:hover {
        color: var(--blue-200);

        .backIcon {
            background-color: var(--blue-200);
        }
    }

    /* ── Narrow buttons (filter toggle + random) ── */

    .narrowButtons {
        align-items: center;
        display: flex;
        gap: var(--size-1);

        @media (min-width: 64rem) {
            display: none;
        }
    }

    .narrowBtn {
        align-items: center;
        border-radius: var(--radius-full);
        color: var(--blue-400);
        display: flex;
        font-size: var(--text-xl);
        height: var(--size-11);
        justify-content: center;
        position: relative;
        transition: background var(--transition-fast), box-shadow var(--transition-fast), color var(--transition-fast);
        width: var(--size-11);
    }

    @media (hover: hover) and (pointer: fine) {
        .narrowBtn:hover {
            background: var(--color-bg-frosted-selected);
            box-shadow: none;
            color: var(--blue-50);
        }
    }

    .narrowBtnSelections {
        box-shadow: inset 0 0 0 2px var(--color-bg-frosted-selected);
    }

    .narrowBtnActive {
        background: var(--color-bg-frosted-selected);
        box-shadow: none;
        color: var(--blue-50);
    }

    .narrowFilterBadge {
        background: var(--green-300);
        box-shadow: 0 0 0 0.125rem var(--blue-800);
        color: var(--green-800);
        position: absolute;
        right: calc(var(--size-0-5) * -1);
        top: calc(var(--size-0-5) * -1);
    }

    .narrowFilterIcon {
        align-items: center;
        display: flex;
        justify-content: center;
    }

    .resetBtn {
        color: var(--yellow-400);
    }

    .resetBtn:disabled,
    .resetBtn:disabled:hover {
        background: none;
        color: var(--blue-500);
        cursor: default;
        opacity: 0.4;
    }

    .wideResetBtn {
        align-items: center;
        display: flex;
        font-size: var(--text-xs);
        font-weight: var(--font-weight-bold);
        gap: var(--size-2);
        letter-spacing: var(--tracking-widest);
        line-height: var(--leading-tight);
        margin-left: var(--size-2);
        text-transform: uppercase;
        transition: color var(--transition-fast);
    }

    @media (hover: hover) and (pointer: fine) {
        .wideResetBtn:hover {
            color: var(--yellow-50);
        }
    }

    .wideResetIcon {
        align-items: center;
        display: flex;
        font-size: var(--text-base);
        justify-content: center;
    }

    /* ── Wide nav ── */

    .nav {
        display: none;
        gap: var(--size-9);

        @media (min-width: 64rem) {
            display: flex;
        }
    }

    .navLink {
        align-items: center;
        border-radius: var(--radius-md);
        color: var(--blue-400);
        display: flex;
        flex-direction: column;
        font-size: var(--text-sm);
        gap: var(--size-2);
        padding: var(--size-6) 0;
        transition: color var(--transition-fast), background var(--transition-fast);
    }

    .navIcon {
        align-items: center;
        display: flex;
        font-size: var(--text-2xl);
        justify-content: center;
        transition: color var(--transition-fast);
    }

    .navAvatar {
        filter: grayscale(100%) brightness(1.1) sepia(100%) hue-rotate(155deg) saturate(2.5);
        font-size: var(--text-2xl);
        opacity: 0.7;
        transition: filter var(--transition-fast), opacity var(--transition-fast);
    }

    .navLabel {
        font-size: var(--text-xs);
        font-weight: var(--font-weight-bold);
        letter-spacing: var(--tracking-widest);
        line-height: var(--leading-tighter);
        text-transform: uppercase;
        transition: color var(--transition-fast);
    }

    .navLink:hover {
        color: var(--blue-200);

        .navAvatar {
            opacity: 1;
        }
    }

    .navLinkActive {
        color: var(--blue-50);
        position: relative;

        &:before {
            background-color: var(--red-400);
            border-bottom-left-radius: var(--radius-md);
            border-bottom-right-radius: var(--radius-md);
            content: '';
            height: var(--size-1);
            inset: 0 0 auto 0;
            position: absolute;
        }

        .navIcon {
            color: var(--color-list-400);
        }

        .navAvatar {
            filter: none;
            opacity: 1;
        }
    }

    /* ── Filter area ── */

    .filterArea {
        border-bottom-left-radius: var(--radius-xl);
        border-bottom-right-radius: var(--radius-xl);
        display: flex;
        flex-direction: column;
        gap: var(--size-5);
        padding: 0 var(--content-padding);

        @media (min-width: 64rem) {
            align-items: center;
            border-top: 1px solid var(--color-divider-frosted);
            flex-direction: row;
            flex-wrap: wrap;
            gap: var(--size-4) var(--size-2);
            padding: var(--size-4) var(--content-padding);
        }
    }

    /* ── Search ── */

    .searchInputWrap {
        max-width: 100%;
        position: relative;

        @media (min-width: 64rem) {
            max-width: 16rem;
        }

        &:focus-within {
            .searchIcon {
                color: var(--blue-300);
            }
        }
    }

    .searchIcon {
        align-items: center;
        color: var(--blue-500);
        display: flex;
        justify-content: center;
        left: var(--size-4);
        pointer-events: none;
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        transition: color var(--transition-fast);
    }

    .searchInput {
        background: var(--color-frosted-input);
        border: none;
        border-radius: var(--radius-full);
        color: var(--blue-50);
        font-size: var(--text-sm);
        height: 100%;
        outline: none;
        padding: var(--size-4) var(--size-4) var(--size-4) var(--size-10);
        transition: background var(--transition-fast);
        width: 100%;

        @media (min-width: 64rem) {
            width: 16rem;
        }
    }

    .searchInput::placeholder {
        color: var(--blue-100);
    }

    .searchInput:focus {
        background: var(--color-frosted-input-focus);
    }

    /* ── Narrow filter panels ── */

    .narrowFilters {
        border-radius: var(--radius-md);
        display: flex;
        flex-direction: column;
        flex: 1;
        gap: var(--size-1);
        min-height: 0;
        overflow-y: auto;
        overscroll-behavior: contain;
        padding-bottom: var(--size-2);
        scrollbar-width: thin;

        @media (min-width: 64rem) {
            display: none;
        }
    }

    .narrowToggles {
        display: flex;
        gap: var(--size-2);
        margin-top: var(--size-4);
    }

    .sortIcon {
        align-items: center;
        color: var(--blue-400);
        display: flex;
        justify-content: center;
    }

    /* ── Wide inline filter controls ── */

    .wideFilters {
        display: none;

        @media (min-width: 64rem) {
            display: flex;
            gap: var(--size-2);
        }
    }

    .wideFilter {
        display: contents;
    }

    .wideFilterBtn {
        align-items: center;
        background: var(--color-bg-frosted-unselected);
        border-radius: var(--radius-full);
        color: var(--blue-100);
        display: inline-flex;
        font-size: var(--text-sm);
        font-weight: var(--font-weight-medium);
        gap: var(--size-1);
        justify-content: center;
        line-height: var(--leading-tight);
        padding: var(--size-2) var(--size-4);
        transition: background-color var(--transition-fast), color var(--transition-fast);
    }

    .wideFilterBtn:hover {
        background: var(--color-bg-frosted-selected);
        color: var(--blue-50);
    }

    .wideFilterBtn:has(+ .widePanel:popover-open) {
        background: var(--color-bg-frosted-selected);
        color: var(--blue-50);
    }

    .wideFilterIcon {
        align-items: center;
        color: var(--blue-400);
        display: flex;
        font-size: var(--text-base);
        justify-content: center;
    }

    .wideRandomBtn {
        display: none;

        @media (min-width: 64rem) {
            display: flex;
            margin-right: auto;
        }
    }

    .filterBadge {
        background: var(--green-300);
        color: var(--green-800);
        margin-left: var(--size-1);
    }

    .sortBtn {
        anchor-name: --filter-sort;
    }

    .genreBtn {
        anchor-name: --filter-genre;
    }

    .mpaaBtn {
        anchor-name: --filter-mpaa;
    }

    .yearBtn {
        anchor-name: --filter-year;
    }

    .runtimeBtn {
        anchor-name: --filter-runtime;
    }

    .chevron {
        align-items: center;
        color: var(--blue-500);
        display: flex;
        font-size: var(--text-base);
        justify-content: center;
        transition: transform var(--transition-fast);
    }

    .wideFilterBtn:has(+ .widePanel:popover-open) .chevron {
        color: var(--blue-300);
        transform: rotate(180deg);
    }

    .widePanel {
        background: var(--color-bg-frosted);
        backdrop-filter: var(--bg-frosted-3xl);
        border: none;
        border-radius: var(--radius-xl);
        box-shadow: var(--shadow-2xl);
        inset: auto;
        margin: 0;
        margin-top: var(--size-2);
        position-area: bottom span-left;
    }

    .widePanelContent {
        background: var(--color-bg-frosted-selected);
        padding: var(--size-2);
        max-height: 22rem;
        min-width: 14rem;
        overflow-y: auto;
        overscroll-behavior: contain;
        scrollbar-width: thin;
    }

    .sortPanel {
        position-anchor: --filter-sort;
    }

    .genrePanel {
        position-anchor: --filter-genre;
    }

    .mpaaPanel {
        position-anchor: --filter-mpaa;
    }

    .yearPanel {
        min-width: 14rem;
        position-anchor: --filter-year;
    }

    .runtimePanel {
        min-width: 14rem;
        position-anchor: --filter-runtime;
    }

    /* ── Narrow backdrop (blocks content interaction when filters open) ── */

    .narrowBackdrop {
        inset: 0;
        position: fixed;
        z-index: 99;

        @media (min-width: 64rem) {
            display: none;
        }
    }

    /* ── Narrow footer (View movies + Reset) ── */

    .narrowFooter {
        margin-top: calc(-1 * var(--size-2));

        @media (min-width: 64rem) {
            display: none;
        }
    }

    .viewBtn {
        background: var(--green-300);
        border: none;
        border-radius: var(--radius-full);
        color: var(--green-800);
        font-size: var(--text-xs);
        font-weight: var(--font-weight-bold);
        letter-spacing: var(--tracking-widest);
        padding: var(--size-4);
        text-transform: uppercase;
        transition: background var(--transition-fast), color var(--transition-fast);
        width: 100%;
    }

    .viewBtn:hover {
        background: var(--green-400);
        color: var(--green-900);
    }

    .viewBtn:disabled {
        background: var(--color-bg-frosted-selected);
        border: none;
        color: var(--blue-400);
        cursor: default;
    }

    .narrowResetIcon {
        align-items: center;
        display: flex;
        justify-content: center;
    }
</style>
