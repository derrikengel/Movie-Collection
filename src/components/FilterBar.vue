<!-- src/components/FilterBar.vue -->
<template>
    <div :class="s.filterBar">

        <!-- Search -->
        <div :class="s.searchInputWrap">
            <span :class="s.searchIcon" v-html="searchIcon" />
            <input v-model="filters.search" type="text" inputmode="search" placeholder="Search by title"
                :class="s.searchInput" aria-label="Search movies" />
        </div>

        <!-- Narrow buttons -->
        <div :class="s.mobileRow">
            <button :class="[s.mobileBtn, filters.activeFilterCount > 0 && s.mobileBtnActive]" @click="sheetOpen = true"
                aria-label="Open filters" v-html="filterIcon" />

            <button :class="s.mobileBtn" @click="handleRandom" aria-label="Random movie" v-html="randomIcon" />
        </div>

        <!-- Wide filters -->
        <div :class="s.desktopRow">
            <!-- Sort -->
            <div :class="s.desktopFilter">
                <button :class="[s.desktopFilterBtn, s.sortBtn]" popovertarget="filter-sort">
                    Sort: {{sortOptions.find(o => o.value === filters.sort)?.label}}
                    <span :class="s.chevron" v-html="chevronIcon" />
                </button>
                <div id="filter-sort" popover="auto" :class="[s.desktopPanel, s.sortPanel]">
                    <FilterOptionList :options="sortOptions" :active-values="[filters.sort]"
                        @toggle="filters.sort = $event" />
                </div>
            </div>

            <!-- Genre -->
            <div :class="s.desktopFilter">
                <button :class="[s.desktopFilterBtn, s.genreBtn, filters.genres.length && s.desktopFilterBtnActive]"
                    popovertarget="filter-genre">
                    Genre
                    <span v-if="filters.genres.length" class="badge" :class="s.desktopBadge">{{ filters.genres.length
                        }}</span>
                    <span :class="s.chevron" v-html="chevronIcon" />
                </button>
                <div id="filter-genre" popover="auto" :class="[s.desktopPanel, s.genrePanel]">
                    <FilterOptionList :options="genreOptions" :active-values="filters.genres" @toggle="toggleGenre" />
                </div>
            </div>

            <!-- MPAA -->
            <div :class="s.desktopFilter">
                <button :class="[s.desktopFilterBtn, s.mpaaBtn, filters.mpaaGroups.length && s.desktopFilterBtnActive]"
                    popovertarget="filter-mpaa">
                    Rating
                    <span v-if="filters.mpaaGroups.length" class="badge" :class="s.desktopBadge">{{
                        filters.mpaaGroups.length
                        }}</span>
                    <span :class="s.chevron" v-html="chevronIcon" />
                </button>
                <div id="filter-mpaa" popover="auto" :class="[s.desktopPanel, s.mpaaPanel]">
                    <FilterOptionList :options="mpaaOptions" :active-values="filters.mpaaGroups" @toggle="toggleMpaa" />
                </div>
            </div>

            <!-- Year -->
            <div :class="s.desktopFilter">
                <button
                    :class="[s.desktopFilterBtn, s.yearBtn, (Number.isFinite(filters.yearMin) || Number.isFinite(filters.yearMax)) && s.desktopFilterBtnActive]"
                    popovertarget="filter-year">
                    Year
                    <span :class="s.chevron" v-html="chevronIcon" />
                </button>
                <div id="filter-year" popover="auto" :class="[s.desktopPanel, s.yearPanel]">
                    <FilterRangeSlider :min="filters.yearBounds.min ?? 1900" :max="filters.yearBounds.max ?? 2025"
                        :model-value-min="filters.yearMin" :model-value-max="filters.yearMax" label-min="From"
                        label-max="To" aria-label-min="Minimum year" aria-label-max="Maximum year"
                        @update:model-value-min="filters.yearMin = $event"
                        @update:model-value-max="filters.yearMax = $event" />
                </div>
            </div>

            <!-- Runtime -->
            <div :class="s.desktopFilter">
                <button
                    :class="[s.desktopFilterBtn, s.runtimeBtn, (Number.isFinite(filters.runtimeMin) || Number.isFinite(filters.runtimeMax)) && s.desktopFilterBtnActive]"
                    popovertarget="filter-runtime">
                    Runtime
                    <span :class="s.chevron" v-html="chevronIcon" />
                </button>
                <div id="filter-runtime" popover="auto" :class="[s.desktopPanel, s.runtimePanel]">
                    <FilterRangeSlider :min="filters.runtimeBounds.min ?? 0" :max="filters.runtimeBounds.max ?? 300"
                        :model-value-min="filters.runtimeMin" :model-value-max="filters.runtimeMax" label-min="Min"
                        label-max="Max" aria-label-min="Minimum runtime in minutes"
                        aria-label-max="Maximum runtime in minutes"
                        @update:model-value-min="filters.runtimeMin = $event"
                        @update:model-value-max="filters.runtimeMax = $event" />
                </div>
            </div>

            <!-- Watched toggle -->
            <div :class="s.inlineToggle">
                <span :class="s.inlineToggleLabel">Fade Watched</span>
                <ToggleSwitch :model-value="filters.watchedMode === 'fade'"
                    @update:model-value="filters.watchedMode = $event ? 'fade' : 'show'" />
            </div>

            <!-- Ignored toggle -->
            <div :class="s.inlineToggle">
                <span :class="s.inlineToggleLabel">Hide Ignored</span>
                <ToggleSwitch :model-value="filters.ignoredMode === 'hide'"
                    @update:model-value="filters.ignoredMode = $event ? 'hide' : 'show'" />
            </div>

            <!-- Randomize -->
            <button :class="s.randomBtn" @click="handleRandom" aria-label="Random movie">
                <svg width="20" height="20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
                    <path
                        d="M205.4 66.3C167 56 127.5 78.8 117.3 117.2L66.5 306.7C56.2 345.1 79 384.6 117.4 394.9L306.9 445.7C345.3 456 384.8 433.2 395.1 394.8L445.9 205.3C456.2 166.9 433.4 127.4 395 117.1L205.4 66.3zM228.4 272C222.3 262.1 222.1 249.6 227.8 239.5C233.5 229.4 244.3 223.2 256 223.3C267.6 223.4 278.2 229.8 283.8 240C289.9 249.9 290.1 262.4 284.4 272.5C278.7 282.6 267.9 288.8 256.2 288.7C244.6 288.6 234 282.2 228.4 272zM143.2 284.3C153.1 278.2 165.6 278 175.7 283.7C185.8 289.4 192 300.2 191.9 311.9C191.8 323.5 185.4 334.1 175.2 339.7C165.3 345.8 152.8 346 142.7 340.3C132.6 334.6 126.4 323.8 126.5 312.1C126.6 300.5 133 289.9 143.2 284.3zM328.2 380.7C318.3 386.8 305.8 387 295.7 381.3C285.6 375.6 279.4 364.8 279.5 353.1C279.6 341.5 286 330.9 296.2 325.3C306.1 319.2 318.6 319 328.7 324.7C338.8 330.4 345 341.2 344.9 352.9C344.8 364.5 338.4 375.1 328.2 380.7zM337.2 172.3C347.1 166.2 359.6 166 369.7 171.7C379.8 177.4 386 188.2 385.9 199.9C385.8 211.5 379.4 222.1 369.2 227.7C359.3 233.8 346.8 234 336.7 228.3C326.6 222.6 320.4 211.8 320.5 200.1C320.6 188.5 327 177.9 337.2 172.3zM216.2 186.7C206.3 192.8 193.8 193 183.7 187.3C173.6 181.6 167.4 170.8 167.5 159.1C167.6 147.5 174 136.9 184.2 131.3C194.1 125.2 206.6 125 216.7 130.7C226.8 136.4 233 147.2 232.9 158.9C232.8 170.5 226.4 181.1 216.2 186.7zM482 256L441.4 407.2C424.2 471.2 358.4 509.2 294.4 492.1L256.1 481.8L256.1 512C256.1 547.3 284.8 576 320.1 576L512.1 576C547.4 576 576.1 547.3 576.1 512L576.1 320C576.1 284.7 547.4 256 512.1 256L482 256z" />
                </svg>
            </button>

            <!-- Reset -->
            <button v-if="filters.activeFilterCount > 0 || filters.search" :class="s.resetBtn" @click="filters.reset()"
                v-html="resetIcon" />
        </div>

        <!-- Mobile bottom sheet backdrop -->
        <Teleport to="body">
            <Transition name="fade">
                <div v-if="sheetOpen" :class="s.backdrop" @click="sheetOpen = false" aria-hidden="true" />
            </Transition>

            <!-- Mobile filter sheet -->
            <Transition name="sheet">
                <div v-if="sheetOpen" :class="s.sheet" role="dialog" aria-modal="true" aria-label="Filter movies">
                    <div :class="s.sheetScroll">

                        <!-- Sort -->
                        <FilterSection label="Sort">
                            <FilterOptionList :options="sortOptions" :active-values="[filters.sort]"
                                @toggle="filters.sort = $event" />
                        </FilterSection>

                        <!-- Genre -->
                        <FilterSection label="Genre" :count="filters.genres.length">
                            <FilterOptionList :options="genreOptions" :active-values="filters.genres"
                                @toggle="toggleGenre" />
                        </FilterSection>

                        <!-- MPAA -->
                        <FilterSection label="Rating" :count="filters.mpaaGroups.length">
                            <FilterOptionList :options="mpaaOptions" :active-values="filters.mpaaGroups"
                                @toggle="toggleMpaa" />
                        </FilterSection>

                        <!-- Year -->
                        <FilterSection label="Year"
                            :active="Number.isFinite(filters.yearMin) || Number.isFinite(filters.yearMax)">
                            <FilterRangeSlider :min="filters.yearBounds.min ?? 1900"
                                :max="filters.yearBounds.max ?? 2025" :model-value-min="filters.yearMin"
                                :model-value-max="filters.yearMax" label-min="From" label-max="To"
                                aria-label-min="Minimum year" aria-label-max="Maximum year"
                                @update:model-value-min="filters.yearMin = $event"
                                @update:model-value-max="filters.yearMax = $event" />
                        </FilterSection>

                        <!-- Runtime -->
                        <FilterSection label="Runtime"
                            :active="Number.isFinite(filters.runtimeMin) || Number.isFinite(filters.runtimeMax)">
                            <FilterRangeSlider :min="filters.runtimeBounds.min ?? 0"
                                :max="filters.runtimeBounds.max ?? 300" :model-value-min="filters.runtimeMin"
                                :model-value-max="filters.runtimeMax" label-min="Min" label-max="Max"
                                aria-label-min="Minimum runtime in minutes" aria-label-max="Maximum runtime in minutes"
                                @update:model-value-min="filters.runtimeMin = $event"
                                @update:model-value-max="filters.runtimeMax = $event" />
                        </FilterSection>

                        <!-- Watched / Ignored quick toggles -->
                        <div :class="s.mobileToggles">
                            <div :class="s.inlineToggle">
                                <span :class="s.inlineToggleLabel">Fade Watched</span>
                                <ToggleSwitch :model-value="filters.watchedMode === 'fade'"
                                    @update:model-value="filters.watchedMode = $event ? 'fade' : 'show'" />
                            </div>
                            <div :class="s.inlineToggle">
                                <span :class="s.inlineToggleLabel">Hide Ignored</span>
                                <ToggleSwitch :model-value="filters.ignoredMode === 'hide'"
                                    @update:model-value="filters.ignoredMode = $event ? 'hide' : 'show'" />
                            </div>
                        </div>

                    </div>

                    <div :class="s.sheetFooter">
                        <button :class="s.sheetDone" :disabled="filters.visibleMovies.length === 0"
                            @click="sheetOpen = false">
                            Show {{ filters.visibleMovies.length }}
                            {{ filters.visibleMovies.length === 1 ? 'movie' : 'movies' }}
                        </button>
                        <button v-if="filters.activeFilterCount > 0 || filters.search" :class="s.sheetReset"
                            @click="filters.reset()">
                            <span :class="s.sheetResetIcon" v-html="resetIcon" />
                            Reset
                        </button>
                    </div>
                </div>
            </Transition>
        </Teleport>
    </div>
</template>

<script setup>
    import { ref, computed } from 'vue'
    import { useRouter } from 'vue-router'
    import { useFiltersStore } from '@/stores/filters'
    import FilterSection from '@/components/FilterSection.vue'
    import FilterOptionList from '@/components/FilterOptionList.vue'
    import FilterRangeSlider from '@/components/FilterRangeSlider.vue'
    import ToggleSwitch from '@/components/ToggleSwitch.vue'

    import searchIcon from '@/assets/icons/magnifying-glass.svg?raw'
    import filterIcon from '@/assets/icons/filters.svg?raw'
    import resetIcon from '@/assets/icons/reset.svg?raw'
    import randomIcon from '@/assets/icons/dice.svg?raw'
    import chevronIcon from '@/assets/icons/chevron-down.svg?raw'
    import { mpaaGroupOptions } from '@/lib/filterOptions'

    const sortOptions = [
        { value: 'acquired-desc', label: 'Recently Added' },
        { value: 'year-desc', label: 'Latest Release' },
        { value: 'rating-desc', label: 'Top Rated' },
    ]

    const filters = useFiltersStore()
    const router = useRouter()

    const sheetOpen = ref(false)

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

    function handleRandom() {
        const movie = filters.randomMovie()
        if (movie) router.push(`/${movie.slug}`)
    }
</script>

<style module="s">
    .filterBar {
        background: var(--color-bg-frosted);
        backdrop-filter: var(--bg-frosted-lg);
        border-bottom: 1px solid var(--color-border-frosted);
        border-bottom-left-radius: var(--radius-xl);
        border-bottom-right-radius: var(--radius-xl);
        /* box-shadow: var(--shadow-lg); */
        display: flex;
        gap: var(--size-2);
        justify-content: space-between;
        padding: 0 var(--content-padding) var(--size-3) var(--content-padding);
        /* padding-top: env(safe-area-inset-bottom); */
        position: sticky;
        top: var(--header-height);
        z-index: 90;
    }

    /* ── Search ── */
    .searchRow {
        display: flex;
        gap: var(--size-2);
    }

    .searchInputWrap {
        flex: 1;
        max-width: 16rem;
        position: relative;
    }

    .searchIcon {
        align-items: center;
        color: var(--color-text-muted);
        display: flex;
        font-size: var(--text-lg);
        justify-content: center;
        left: var(--size-4);
        pointer-events: none;
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
    }

    .searchInput {
        background: var(--color-bg);
        border: 2px solid var(--color-border);
        border-radius: var(--radius-full);
        color: var(--color-text);
        font-size: var(--text-sm);
        height: 100%;
        outline: none;
        padding: var(--size-3) var(--size-4) var(--size-3) var(--size-10);
        transition: border-color var(--transition-fast);
        width: 100%;
    }

    .searchInput::placeholder {
        color: var(--color-text-muted);
    }

    .searchInput:focus {
        border-color: var(--color-border-strong);
    }

    /* ── Mobile row ── */
    .mobileRow {
        align-items: center;
        display: flex;
        gap: var(--size-1);
        justify-content: space-between;

        @media (min-width: 64rem) {
            display: none;
        }
    }


    .mobileBtn {
        align-items: center;
        background: var(--color-surface-raised);
        border: 0.125rem solid var(--color-border);
        border-radius: var(--radius-full);
        color: var(--color-text-secondary);
        display: flex;
        height: 3rem;
        font-size: var(--text-2xl);
        justify-content: center;
        position: relative;
        transition: border-color var(--transition-fast), color var(--transition-fast);
        width: 3rem;
    }

    .mobileBtn:hover {
        border-color: var(--color-border-strong);
        color: var(--color-text);
    }

    .mobileBtnActive {
        border-color: var(--color-accent-muted);
        color: var(--color-accent);
        background: var(--color-accent-subtle);
    }

    .mobileBtnBadge {
        position: absolute;
        top: -4px;
        right: -4px;
        min-width: 16px;
        height: 16px;
        padding: 0 4px;
        background: var(--color-accent);
        color: var(--color-text-on-accent);
        font-size: 9px;
        font-weight: var(--font-weight-bold);
        border-radius: var(--radius-full);
        display: flex;
        align-items: center;
        justify-content: center;
    }

    /* ── Desktop row ── */
    .desktopRow {
        display: none;
        align-items: center;
        gap: var(--size-2);
        flex-wrap: wrap;

        @media (min-width: 64rem) {
            display: flex;
        }
    }

    .desktopFilter {
        display: contents;
    }

    .desktopFilterBtn {
        align-items: center;
        border-radius: var(--radius-full);
        color: var(--color-text-secondary);
        display: inline-flex;
        gap: var(--size-2);
        padding: var(--size-2) var(--size-3);
        font-size: var(--text-sm);
        font-weight: var(--font-weight-medium);
        transition: border-color var(--transition-fast), color var(--transition-fast);
        white-space: nowrap;
    }

    .desktopFilterBtn:hover {
        border-color: var(--color-border-strong);
        color: var(--color-text);
    }

    .desktopFilterBtn:has(+ .desktopPanel:popover-open) {
        background: var(--color-surface-raised);
    }


    .desktopFilterBtnActive {
        /* border-color: var(--color-accent-muted); */
        color: var(--color-primary);
        /* background: var(--color-accent-subtle); */
    }

    .sortBtn {
        anchor-name: --filter-sort;
    }

    .sortPanel {
        min-width: 10rem;
        position-anchor: --filter-sort;
    }

    .chevron {
        align-items: center;
        display: flex;
        justify-content: center;
        color: var(--color-text-muted);
        transition: transform var(--transition-fast);
    }

    /* Rotate chevron when its popover is open */
    .desktopFilterBtn:has(+ .desktopPanel:popover-open) .chevron {
        transform: rotate(180deg);
    }

    /* ── Desktop popovers ── */
    .desktopPanel {
        /* Reset popover UA styles */
        margin: 0;
        inset: auto;
        border: 1px solid var(--color-border);

        /* Appearance */
        padding: var(--size-2);
        background: var(--color-surface-raised);
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-lg);
        min-width: 220px;
        max-height: 360px;
        overflow-y: auto;

        /* Anchor positioning — offset below the trigger button */
        position-area: bottom span-left;
        margin-top: var(--size-2);
    }

    /* Per-filter anchor names */
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

    .genrePanel {
        position-anchor: --filter-genre;
    }

    .mpaaPanel {
        position-anchor: --filter-mpaa;
    }

    .yearPanel {
        position-anchor: --filter-year;
        min-width: 14rem;
    }

    .runtimePanel {
        position-anchor: --filter-runtime;
        min-width: 14rem;
    }

    .randomBtn {
        width: 36px;
        height: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--color-surface-raised);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-full);
        color: var(--color-text-secondary);
        margin-left: auto;
        transition: border-color var(--transition-fast), color var(--transition-fast);
    }

    .randomBtn:hover {
        border-color: var(--color-border-strong);
        color: var(--color-text);
    }

    .resetBtn {
        padding: var(--size-2) var(--size-3);
        font-size: var(--text-sm);
        font-weight: var(--font-weight-medium);
        background: none;
        border: 1px solid var(--color-border);
        border-radius: var(--radius-full);
        color: var(--color-text-muted);
        transition: color var(--transition-fast), border-color var(--transition-fast);
    }

    .resetBtn:hover {
        color: var(--color-text);
        border-color: var(--color-border-strong);
    }

    /* ── Inline label + toggle ── */
    .inlineToggle {
        display: inline-flex;
        align-items: center;
        gap: var(--size-2);
    }

    .inlineToggleLabel {
        font-size: var(--text-sm);
        font-weight: var(--font-weight-medium);
        color: var(--color-text-secondary);
        white-space: nowrap;
    }

    /* ── Mobile watched/ignored toggles ── */
    .mobileToggles {
        display: flex;
        flex-direction: column;
        gap: var(--size-3);
        padding: var(--size-3) var(--size-4);
        border-bottom: 1px solid var(--color-border-subtle);
    }

    /* ── Mobile sheet ── */
    .backdrop {
        position: fixed;
        inset: 0;
        background: var(--color-backdrop);
        z-index: 199;
        backdrop-filter: var(--bg-frosted-xs);
    }

    .sheet {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        top: 0;
        margin-top: calc(var(--header-height) + 120px);
        background: var(--color-bg-frosted);
        backdrop-filter: var(--bg-frosted-lg);
        border-top: 1px solid oklch(100% 0 0 / 0.08);
        border-radius: var(--radius-xl) var(--radius-xl) 0 0;
        display: flex;
        flex-direction: column;
        z-index: 200;
    }

    .sheetScroll {
        flex: 1;
        min-height: 0;
        overflow-y: auto;
        padding-bottom: var(--size-4);
    }

    .sheetFooter {
        display: flex;
        gap: var(--size-2);
        padding: var(--size-3) var(--content-padding);
        padding-bottom: calc(var(--size-3) + env(safe-area-inset-bottom));
        border-top: 1px solid var(--color-border);
        flex-shrink: 0;
    }

    .sheetReset {
        align-items: center;
        background: transparent;
        border: 1px solid var(--color-border);
        border-radius: var(--radius-md);
        color: var(--color-text-secondary);
        display: flex;
        font-size: var(--text-sm);
        gap: var(--size-2);
        justify-content: center;
        padding: var(--size-3) var(--size-5);
        transition: border-color var(--transition-fast);
    }

    .sheetReset:hover {
        border-color: var(--color-border-strong);
    }

    .sheetResetIcon {
        align-items: center;
        display: flex;
        font-size: var(--text-lg);
        justify-content: center;
    }

    .sheetDone {
        background: var(--color-accent);
        border: none;
        border-radius: var(--radius-md);
        color: var(--color-text-on-accent);
        flex: 1;
        font-weight: var(--font-weight-medium);
        font-size: var(--text-sm);
        padding: var(--size-3);
        transition: background var(--transition-fast);
    }

    .sheetDone:hover {
        background: var(--color-accent-bright);
    }

    .sheetDone:disabled {
        background: var(--color-disabled);
        border: none;
        color: var(--color-text-muted);
        cursor: default;
    }

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
