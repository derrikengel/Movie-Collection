<!-- src/components/FilterBar.vue -->
<template>
    <div :class="s.wrap">
        <!-- Search -->
        <div :class="s.searchRow">
            <div :class="s.searchInputWrap">
                <span :class="s.searchIcon" v-html="magnifyingGlass" />
                <input v-model="filters.search" type="search" placeholder="Search by movie title…"
                    :class="s.searchInput" aria-label="Search movies" />
            </div>
        </div>

        <!-- Mobile button row -->
        <div :class="s.mobileRow">
            <button :class="[s.mobileBtn, filters.activeFilterCount > 0 && s.mobileBtnActive]" @click="sheetOpen = true"
                aria-label="Open filters">
                <svg width="24" height="24" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
                    <path
                        d="M64 480C64 471.2 71.2 464 80 464L145.6 464C153 427.5 185.3 400 224 400C262.7 400 295 427.5 302.4 464L560 464C568.8 464 576 471.2 576 480C576 488.8 568.8 496 560 496L302.4 496C295 532.5 262.7 560 224 560C185.3 560 153 532.5 145.6 496L80 496C71.2 496 64 488.8 64 480zM272 480C272 453.5 250.5 432 224 432C197.5 432 176 453.5 176 480C176 506.5 197.5 528 224 528C250.5 528 272 506.5 272 480zM464 320C464 293.5 442.5 272 416 272C389.5 272 368 293.5 368 320C368 346.5 389.5 368 416 368C442.5 368 464 346.5 464 320zM416 240C454.7 240 487 267.5 494.4 304L560 304C568.8 304 576 311.2 576 320C576 328.8 568.8 336 560 336L494.4 336C487 372.5 454.7 400 416 400C377.3 400 345 372.5 337.6 336L80 336C71.2 336 64 328.8 64 320C64 311.2 71.2 304 80 304L337.6 304C345 267.5 377.3 240 416 240zM256 112C229.5 112 208 133.5 208 160C208 186.5 229.5 208 256 208C282.5 208 304 186.5 304 160C304 133.5 282.5 112 256 112zM334.4 144L560 144C568.8 144 576 151.2 576 160C576 168.8 568.8 176 560 176L334.4 176C327 212.5 294.7 240 256 240C217.3 240 185 212.5 177.6 176L80 176C71.2 176 64 168.8 64 160C64 151.2 71.2 144 80 144L177.6 144C185 107.5 217.3 80 256 80C294.7 80 327 107.5 334.4 144z" />
                </svg>
                <span v-if="filters.activeFilterCount > 0" :class="s.mobileBtnBadge">
                    {{ filters.activeFilterCount }}
                </span>
            </button>

            <button :class="s.mobileBtn" @click="filters.reset()" aria-label="Reset filters">
                <svg width="24" height="24" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
                    <path
                        d="M96.5 305.1C100 252.8 121.7 201.6 161.6 161.6C205.3 117.9 262.6 96 320 96C382 96 441.2 121.5 483.8 166.6L522.9 208L416 208C407.2 208 400 215.2 400 224C400 232.8 407.2 240 416 240L560 240C568.8 240 576 232.8 576 224L576 80C576 71.2 568.8 64 560 64C551.2 64 544 71.2 544 80L544 183.8L507 144.7C458.4 93.2 390.8 64 320 64C254.5 64 189 89 139 139C93.3 184.6 68.5 243.2 64.6 302.9C64 311.8 70.7 319.4 79.5 320C88.3 320.6 95.9 313.9 96.5 305.1zM543.5 335C540 387.3 518.3 438.5 478.4 478.4C434.7 522.1 377.4 544 320 544C258 544 198.8 518.5 156.2 473.4L117.1 432L224 432C232.8 432 240 424.8 240 416C240 407.2 232.8 400 224 400L80 400C71.2 400 64 407.2 64 416L64 560C64 568.8 71.2 576 80 576C88.8 576 96 568.8 96 560L96 456.2L133 495.3C181.6 546.8 249.3 575.9 320 575.9C385.5 575.9 451 550.9 501 500.9C546.6 455.3 571.4 396.6 575.4 336.9C576 328.1 569.3 320.5 560.5 319.9C551.7 319.3 544.1 326 543.5 334.8z" />
                </svg>
            </button>

            <button :class="s.mobileBtn" @click="handleRandom" aria-label="Random movie">
                <svg width="24" height="24" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
                    <path
                        d="M518.7 256.3C551 259.6 576.2 286.8 576.2 320L576.2 512L575.9 518.5C572.8 548.6 548.9 572.6 518.8 575.6L512.3 575.9L320.3 575.9L313.8 575.6C283.7 572.5 259.7 548.6 256.7 518.5L256.4 512L256.4 481.8L288.4 490.4L288.4 512.1C288.4 529.8 302.7 544.1 320.4 544.1L512.4 544.1C530.1 544.1 544.4 529.8 544.4 512.1L544.4 320.1C544.4 302.4 530.1 288.1 512.4 288.1L473.6 288.1L482.2 256.1L512.4 256.1L518.9 256.4zM119.5 110.2C131.6 78.4 164.6 59.3 198.2 64.8L205.4 66.3L394.9 117.1L401.9 119.4C436 132.4 455.4 169.3 445.8 205.3L395 394.8L392.8 401.8C380.7 433.6 347.7 452.7 314.1 447.2L306.9 445.7L117.3 394.9C81.3 385.2 59 349.9 64.9 313.9L66.4 306.7L117.2 117.2L119.4 110.2zM192.5 96.3C174.3 93.6 156.4 103.9 149.6 121.1L148 126.2L97.4 315C91.7 336.3 104.4 358.3 125.7 364L315.2 414.8L315.2 414.8C335.2 420.2 355.7 409.4 362.9 390.4L364.2 386.5L415 197L415.8 193.2C418.9 174.5 408.5 156.2 390.9 149.4L386 147.8L198.3 97.5L192.5 96.3zM316.1 365.8C304.6 372.4 289.9 368.5 283.3 357C276.7 345.5 280.6 330.8 292.1 324.2C303.6 317.6 318.3 321.5 324.9 333C331.5 344.5 327.6 359.2 316.1 365.8zM179.1 324.8C167.6 331.4 152.9 327.5 146.3 316C139.7 304.5 143.6 289.8 155.1 283.2C166.6 276.6 181.3 280.5 187.9 292C194.5 303.5 190.6 318.2 179.1 324.8zM268.1 276.8C260.7 281.6 251.2 281.9 243.4 277.6C235.7 273.3 230.9 265.1 231.1 256.3C231.2 247.4 236.2 239.3 244.1 235.3C251.5 230.5 261 230.2 268.8 234.5C276.5 238.8 281.3 247 281.1 255.8C281 264.7 276 272.8 268.1 276.8zM357.1 228.8C345.6 235.4 330.9 231.5 324.3 220C317.7 208.5 321.6 193.8 333.1 187.2C344.6 180.6 359.3 184.5 365.9 196C372.5 207.5 368.6 222.2 357.1 228.8zM220.1 187.8C208.6 194.4 193.9 190.5 187.3 179C180.7 167.5 184.6 152.8 196.1 146.2C207.6 139.6 222.3 143.5 228.9 155C235.5 166.5 231.6 181.2 220.1 187.8z" />
                </svg>
            </button>
        </div>

        <!-- Desktop filter row -->
        <div :class="s.desktopRow">
            <!-- Sort -->
            <div :class="s.desktopFilter">
                <select v-model="filters.sort" :class="s.desktopSelect" aria-label="Sort">
                    <option value="acquired-desc">Recently Acquired</option>
                    <option value="acquired-asc">Oldest Acquired</option>
                    <option value="title-asc">Title A–Z</option>
                    <option value="title-desc">Title Z–A</option>
                    <option value="year-desc">Newest Release</option>
                    <option value="year-asc">Oldest Release</option>
                    <option value="rating-desc">Highest Rated</option>
                    <option value="rating-asc">Lowest Rated</option>
                </select>
            </div>

            <!-- Genre -->
            <div :class="s.desktopFilter">
                <button :class="[s.desktopFilterBtn, s.genreBtn, filters.genres.length && s.desktopFilterBtnActive]"
                    popovertarget="filter-genre">
                    Genre
                    <span v-if="filters.genres.length" :class="s.desktopBadge">{{ filters.genres.length }}</span>
                    <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"
                        :class="s.chevron">
                        <path fill-rule="evenodd"
                            d="M5.293 7.293a1 1 0 0 1 1.414 0L10 10.586l3.293-3.293a1 1 0 1 1 1.414 1.414l-4 4a1 1 0 0 1-1.414 0l-4-4a1 1 0 0 1 0-1.414z"
                            clip-rule="evenodd" />
                    </svg>
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
                    <span v-if="filters.mpaaGroups.length" :class="s.desktopBadge">{{ filters.mpaaGroups.length
                        }}</span>
                    <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"
                        :class="s.chevron">
                        <path fill-rule="evenodd"
                            d="M5.293 7.293a1 1 0 0 1 1.414 0L10 10.586l3.293-3.293a1 1 0 1 1 1.414 1.414l-4 4a1 1 0 0 1-1.414 0l-4-4a1 1 0 0 1 0-1.414z"
                            clip-rule="evenodd" />
                    </svg>
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
                    <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"
                        :class="s.chevron">
                        <path fill-rule="evenodd"
                            d="M5.293 7.293a1 1 0 0 1 1.414 0L10 10.586l3.293-3.293a1 1 0 1 1 1.414 1.414l-4 4a1 1 0 0 1-1.414 0l-4-4a1 1 0 0 1 0-1.414z"
                            clip-rule="evenodd" />
                    </svg>
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
                    <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"
                        :class="s.chevron">
                        <path fill-rule="evenodd"
                            d="M5.293 7.293a1 1 0 0 1 1.414 0L10 10.586l3.293-3.293a1 1 0 1 1 1.414 1.414l-4 4a1 1 0 0 1-1.414 0l-4-4a1 1 0 0 1 0-1.414z"
                            clip-rule="evenodd" />
                    </svg>
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
            <button v-if="filters.activeFilterCount > 0" :class="s.resetBtn" @click="filters.reset()">
                Reset
            </button>
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
                            <div :class="s.sortOptions">
                                <button v-for="opt in sortOptions" :key="opt.value"
                                    :class="[s.sortOption, filters.sort === opt.value && s.sortOptionActive]"
                                    @click="filters.sort = opt.value">{{ opt.label }}</button>
                            </div>
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
                        <button :class="s.sheetReset" @click="filters.reset()">Reset</button>
                        <button :class="s.sheetDone" @click="sheetOpen = false">
                            Show {{ filters.visibleMovies.length }} movies
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
    import magnifyingGlass from '@/assets/icons/magnifying-glass.svg?raw'
    import { mpaaGroupOptions, sortOptions } from '@/lib/filterOptions'

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
    .wrap {
        position: sticky;
        top: var(--header-height);
        z-index: 40;
        background: var(--color-bg-frosted);
        backdrop-filter: var(--bg-frosted-md);
        border-bottom: 1px solid var(--color-border-frosted);
        padding: var(--space-3) var(--content-padding);
        display: flex;
        flex-direction: column;
        gap: var(--space-2);
    }

    /* ── Search ── */
    .searchRow {
        display: flex;
        gap: var(--space-2);
    }

    .searchInputWrap {
        position: relative;
        flex: 1;
    }

    .searchIcon {
        align-items: center;
        color: var(--color-text-muted);
        display: flex;
        font-size: var(--text-lg);
        justify-content: center;
        left: var(--space-4);
        pointer-events: none;
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
    }

    .searchInput {
        background: var(--color-surface);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-full);
        color: var(--color-text);
        font-size: var(--text-sm);
        outline: none;
        padding: var(--space-3) var(--space-4) var(--space-3) var(--space-10);
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
        gap: var(--space-2);
        justify-content: space-between;
    }

    @media (min-width: 768px) {
        .mobileRow {
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
        gap: var(--space-2);
        flex-wrap: wrap;
    }

    @media (min-width: 768px) {
        .desktopRow {
            display: flex;
        }
    }

    .desktopFilter {
        display: contents;
    }

    .desktopFilterBtn {
        display: inline-flex;
        align-items: center;
        gap: var(--space-2);
        padding: var(--space-2) var(--space-3);
        font-size: var(--text-sm);
        font-weight: var(--font-weight-medium);
        background: var(--color-surface-raised);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-full);
        color: var(--color-text-secondary);
        white-space: nowrap;
        transition: border-color var(--transition-fast), color var(--transition-fast);
    }

    .desktopFilterBtn:hover {
        border-color: var(--color-border-strong);
        color: var(--color-text);
    }

    .desktopFilterBtnActive {
        border-color: var(--color-accent-muted);
        color: var(--color-accent);
        background: var(--color-accent-subtle);
    }

    .desktopSelect {
        padding: var(--space-2) var(--space-3);
        font-size: var(--text-sm);
        font-weight: var(--font-weight-medium);
        background: var(--color-surface-raised);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-full);
        color: var(--color-text-secondary);
        outline: none;
        cursor: pointer;
    }

    .desktopBadge {
        background: var(--color-accent);
        color: var(--color-text-on-accent);
        font-size: 10px;
        font-weight: var(--font-weight-bold);
        border-radius: var(--radius-full);
        min-width: 18px;
        height: 18px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 0 4px;
    }

    .chevron {
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
        padding: var(--space-2);
        background: var(--color-surface-raised);
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-lg);
        min-width: 220px;
        max-height: 360px;
        overflow-y: auto;

        /* Anchor positioning — offset below the trigger button */
        position-area: bottom span-left;
        margin-top: var(--space-2);
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
        padding: var(--space-2) var(--space-3);
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

    /* ── Sort options ── */
    .sortOptions {
        display: flex;
        flex-direction: column;
    }

    .sortOption {
        width: 100%;
        padding: var(--space-2) var(--space-3);
        font-size: var(--text-sm);
        color: var(--color-text-secondary);
        background: none;
        border: none;
        border-radius: var(--radius-md);
        text-align: left;
        transition: background var(--transition-fast), color var(--transition-fast);
    }

    .sortOption:hover {
        background: var(--color-bg-hover);
        color: var(--color-text);
    }

    .sortOptionActive {
        color: var(--color-accent);
        background: var(--color-accent-subtle);
    }

    /* ── Inline label + toggle ── */
    .inlineToggle {
        display: inline-flex;
        align-items: center;
        gap: var(--space-2);
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
        gap: var(--space-3);
        padding: var(--space-3) var(--space-4);
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
        background: oklch(11% 0.006 265 / 0.98);
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
        padding-bottom: var(--space-4);
    }

    .sheetFooter {
        display: flex;
        gap: var(--space-2);
        padding: var(--space-3) var(--content-padding);
        padding-bottom: calc(var(--space-3) + env(safe-area-inset-bottom));
        border-top: 1px solid var(--color-border);
        flex-shrink: 0;
    }

    .sheetReset {
        padding: var(--space-3) var(--space-5);
        font-size: var(--text-sm);
        font-weight: var(--font-weight-medium);
        background: none;
        border: 1px solid var(--color-border);
        border-radius: var(--radius-md);
        color: var(--color-text-secondary);
        transition: border-color var(--transition-fast);
    }

    .sheetReset:hover {
        border-color: var(--color-border-strong);
    }

    .sheetDone {
        flex: 1;
        padding: var(--space-3);
        font-size: var(--text-sm);
        font-weight: var(--font-weight-semibold);
        background: var(--color-accent);
        border: none;
        border-radius: var(--radius-md);
        color: var(--color-text-on-accent);
        transition: background var(--transition-fast);
    }

    .sheetDone:hover {
        background: var(--color-accent-bright);
    }
</style>

<style>

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
