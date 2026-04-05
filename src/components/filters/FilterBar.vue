<!-- src/components/FilterBar.vue -->
<template>
    <div :class="s.filterBar">

        <!-- Search -->
        <div :class="s.searchInputWrap">
            <label for="search" class="visually-hidden">Search</label>
            <input v-model="filters.search" id="search" type="search" inputmode="search" placeholder="Search by title"
                :class="s.searchInput" aria-label="Search movies" />
            <span :class="s.searchIcon" v-html="searchIcon" />
        </div>

        <!-- Narrow buttons -->
        <div :class="s.narrowRow">
            <button :class="[s.narrowBtn, filters.activeFilterCount > 0 && s.narrowBtnActive]" @click="sheetOpen = true"
                aria-label="Open filters" v-html="filterIcon" />

            <button :class="s.narrowBtn" @click="handleRandom" aria-label="Random movie" v-html="randomIcon" />
        </div>

        <!-- Wide filters -->
        <div :class="s.wideRow">
            <!-- Sort -->
            <div :class="s.wideFilter">
                <button :class="[s.wideFilterBtn, s.sortBtn]" popovertarget="filter-sort">
                    <span>
                        Sort:
                        <span :class="s.sortCurrent">{{sortOptions.find(o => o.value === filters.sort)?.label}}</span>
                    </span>
                    <span :class="s.chevron" v-html="chevronIcon" />
                </button>
                <div id="filter-sort" popover="auto" :class="[s.widePanel, s.sortPanel]">
                    <FilterOptionList :options="sortOptions" :active-values="[filters.sort]"
                        @toggle="filters.sort = $event" />
                </div>
            </div>

            <!-- Genre -->
            <div :class="s.wideFilter">
                <button :class="[s.wideFilterBtn, s.genreBtn, filters.genres.length && s.wideFilterBtnActive]"
                    popovertarget="filter-genre">
                    Genre
                    <span v-if="filters.genres.length" class="badge" :class="s.wideBadge">{{ filters.genres.length
                        }}</span>
                    <span :class="s.chevron" v-html="chevronIcon" />
                </button>
                <div id="filter-genre" popover="auto" :class="[s.widePanel, s.genrePanel]">
                    <FilterOptionList :options="genreOptions" :active-values="filters.genres" @toggle="toggleGenre" />
                </div>
            </div>

            <!-- MPAA -->
            <div :class="s.wideFilter">
                <button :class="[s.wideFilterBtn, s.mpaaBtn, filters.mpaaGroups.length && s.wideFilterBtnActive]"
                    popovertarget="filter-mpaa">
                    Rating
                    <span v-if="filters.mpaaGroups.length" class="badge" :class="s.wideBadge">{{
                        filters.mpaaGroups.length
                        }}</span>
                    <span :class="s.chevron" v-html="chevronIcon" />
                </button>
                <div id="filter-mpaa" popover="auto" :class="[s.widePanel, s.mpaaPanel]">
                    <FilterOptionList :options="mpaaOptions" :active-values="filters.mpaaGroups" @toggle="toggleMpaa" />
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
                    <FilterRangeSlider :min="filters.yearBounds.min ?? 1900" :max="filters.yearBounds.max ?? 2025"
                        :model-value-min="filters.yearMin" :model-value-max="filters.yearMax" label-min="From"
                        label-max="To" aria-label-min="Minimum year" aria-label-max="Maximum year"
                        @update:model-value-min="filters.yearMin = $event"
                        @update:model-value-max="filters.yearMax = $event" />
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
                    <FilterRangeSlider :min="filters.runtimeBounds.min ?? 0" :max="filters.runtimeBounds.max ?? 300"
                        :model-value-min="filters.runtimeMin" :model-value-max="filters.runtimeMax" label-min="Min"
                        label-max="Max" unit="time" aria-label-min="Minimum runtime" aria-label-max="Maximum runtime"
                        @update:model-value-min="filters.runtimeMin = $event"
                        @update:model-value-max="filters.runtimeMax = $event" />
                </div>
            </div>

            <!-- Watched toggle -->
            <ToggleSwitch variant="wide" label="Fade Watched" :model-value="filters.watchedMode === 'fade'"
                @update:model-value="filters.watchedMode = $event ? 'fade' : 'show'" />

            <!-- Ignored toggle -->
            <ToggleSwitch variant="wide" label="Hide Ignored" :model-value="filters.ignoredMode === 'hide'"
                @update:model-value="filters.ignoredMode = $event ? 'hide' : 'show'" />

            <!-- Randomize -->
            <button :class="s.randomBtn" @click="handleRandom" aria-label="Random movie" v-html="randomIcon" />

            <!-- Reset -->
            <button :class="s.resetBtn" @click="filters.reset()" v-html="resetIcon" />
        </div>

        <Teleport to="body">
            <Transition name="fade">
                <div v-if="sheetOpen" :class="s.backdrop" @click="sheetOpen = false" aria-hidden="true" />
            </Transition>

            <Transition name="sheet">
                <div v-if="sheetOpen" :class="s.sheet" role="dialog" aria-modal="true" aria-label="Filter movies">
                    <div :class="s.sheetScroll">

                        <!-- Sort -->
                        <FilterPanel :label="`Sort: ${sortOptions.find(o => o.value === filters.sort)?.label}`">
                            <FilterOptionList :options="sortOptions" :active-values="[filters.sort]"
                                @toggle="filters.sort = $event" />
                        </FilterPanel>

                        <!-- Genre -->
                        <FilterPanel label="Genre" :count="filters.genres.length">
                            <FilterOptionList :options="genreOptions" :active-values="filters.genres"
                                @toggle="toggleGenre" />
                        </FilterPanel>

                        <!-- MPAA -->
                        <FilterPanel label="Rating" :count="filters.mpaaGroups.length">
                            <FilterOptionList :options="mpaaOptions" :active-values="filters.mpaaGroups"
                                @toggle="toggleMpaa" />
                        </FilterPanel>

                        <!-- Year -->
                        <FilterPanel label="Year"
                            :active="Number.isFinite(filters.yearMin) || Number.isFinite(filters.yearMax)">
                            <FilterRangeSlider :min="filters.yearBounds.min ?? 1900"
                                :max="filters.yearBounds.max ?? 2025" :model-value-min="filters.yearMin"
                                :model-value-max="filters.yearMax" label-min="From" label-max="To"
                                aria-label-min="Minimum year" aria-label-max="Maximum year"
                                @update:model-value-min="filters.yearMin = $event"
                                @update:model-value-max="filters.yearMax = $event" />
                        </FilterPanel>

                        <!-- Runtime -->
                        <FilterPanel label="Runtime"
                            :active="Number.isFinite(filters.runtimeMin) || Number.isFinite(filters.runtimeMax)">
                            <FilterRangeSlider :min="filters.runtimeBounds.min ?? 0"
                                :max="filters.runtimeBounds.max ?? 300" :model-value-min="filters.runtimeMin"
                                :model-value-max="filters.runtimeMax" label-min="Min" label-max="Max" unit="time"
                                aria-label-min="Minimum runtime" aria-label-max="Maximum runtime"
                                @update:model-value-min="filters.runtimeMin = $event"
                                @update:model-value-max="filters.runtimeMax = $event" />
                        </FilterPanel>

                        <!-- Watched / Ignored quick toggles -->
                        <div :class="s.toggle">
                            <ToggleSwitch label="Fade Watched" :model-value="filters.watchedMode === 'fade'"
                                @update:model-value="filters.watchedMode = $event ? 'fade' : 'show'" />
                        </div>

                        <div :class="s.toggle">
                            <ToggleSwitch label="Hide Ignored" :model-value="filters.ignoredMode === 'hide'"
                                @update:model-value="filters.ignoredMode = $event ? 'hide' : 'show'" />
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
    import FilterPanel from '@/components/filters/NarrowFilterPanel.vue'
    import FilterOptionList from '@/components/filters/FilterOptionList.vue'
    import FilterRangeSlider from '@/components/filters/FilterRangeSlider.vue'
    import ToggleSwitch from '@/components/filters/ToggleSwitch.vue'

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
        margin: calc(var(--content-padding) * -1);
        margin-bottom: var(--content-padding);
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

    .narrowRow {
        align-items: center;
        display: flex;
        gap: var(--size-1);
        justify-content: space-between;

        @media (min-width: 64rem) {
            display: none;
        }
    }

    .narrowBtn {
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

    .narrowBtn:hover {
        border-color: var(--color-border-strong);
        color: var(--color-text);
    }

    .narrowBtnActive {
        border-color: var(--color-accent-muted);
        color: var(--color-accent);
        background: var(--color-accent-subtle);
    }

    .narrowBtnBadge {
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

    .wideRow {
        display: none;
        align-items: center;
        gap: var(--size-2);
        flex-wrap: wrap;

        @media (min-width: 64rem) {
            display: flex;
        }
    }

    .wideFilter {
        display: contents;
    }

    .wideFilterBtn {
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

    .wideFilterBtn:hover {
        border-color: var(--color-border-strong);
        color: var(--color-text);
    }

    .wideFilterBtn:has(+ .widePanel:popover-open) {
        background: var(--color-surface-raised);
    }


    .wideFilterBtnActive {
        /* border-color: var(--color-accent-muted); */
        color: var(--color-heading);
        /* background: var(--color-accent-subtle); */
    }

    .sortBtn {
        anchor-name: --filter-sort;
    }

    .sortPanel {
        min-width: 10rem;
        position-anchor: --filter-sort;
    }

    .sortCurrent {
        color: var(--color-heading);
        /* font-size: var(--text-xs); */
    }

    .chevron {
        align-items: center;
        color: var(--blue-400);
        display: flex;
        justify-content: center;
        transition: transform var(--transition-fast);
    }

    /* Rotate chevron when its popover is open */
    .wideFilterBtn:has(+ .widePanel:popover-open) .chevron {
        transform: rotate(180deg);
        color: var(--blue-300);
    }

    .widePanel {
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
        display: none;
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

    .toggle {
        border-bottom: 1px solid var(--color-border);
        display: flex;
        flex-direction: column;
        gap: var(--size-4);
        padding: var(--size-4) var(--content-padding);
    }

    .backdrop {
        position: fixed;
        inset: 0;
        background: var(--color-bg-frosted-subtle);
        z-index: 199;
        backdrop-filter: var(--bg-frosted-xl);
    }

    .sheet {
        background: var(--color-bg-frosted);
        backdrop-filter: var(--bg-frosted-lg);
        border-radius: var(--radius-xl) var(--radius-xl) 0 0;
        bottom: 0;
        display: flex;
        flex-direction: column;
        left: 0;
        margin: calc(var(--header-height) + 10rem) auto 0 auto;
        max-width: 30rem;
        position: fixed;
        right: 0;
        top: 0;
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
