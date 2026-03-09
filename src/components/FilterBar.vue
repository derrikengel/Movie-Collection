<template>
  <div :class="s.wrap" data-filter-bar>
    <!-- Search -->
    <div :class="s.searchRow">
      <div :class="s.searchInputWrap">
        <svg :class="s.searchIcon" width="16" height="16" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fill-rule="evenodd" d="M8 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM2 8a6 6 0 1 1 10.89 3.476l4.817 4.817a1 1 0 0 1-1.414 1.414l-4.816-4.816A6 6 0 0 1 2 8z" clip-rule="evenodd"/>
        </svg>
        <input
          v-model="filters.search"
          type="search"
          placeholder="Search by movie title…"
          :class="s.searchInput"
          aria-label="Search movies"
        />
      </div>
    </div>

    <!-- Mobile button row -->
    <div :class="s.mobileRow">
      <button
        :class="[s.mobileBtn, filters.activeFilterCount > 0 && s.mobileBtnActive]"
        @click="sheetOpen = true"
        aria-label="Open filters"
      >
        <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fill-rule="evenodd" d="M3 5a1 1 0 0 1 1-1h12a1 1 0 1 1 0 2H4a1 1 0 0 1-1-1zm3 5a1 1 0 0 1 1-1h6a1 1 0 1 1 0 2H7a1 1 0 0 1-1-1zm2 5a1 1 0 0 1 1-1h2a1 1 0 1 1 0 2h-2a1 1 0 0 1-1-1z" clip-rule="evenodd"/>
        </svg>
        <span v-if="filters.activeFilterCount > 0" :class="s.mobileBtnBadge">
          {{ filters.activeFilterCount }}
        </span>
      </button>

      <button :class="s.mobileBtn" @click="filters.reset()" aria-label="Reset filters">
        <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fill-rule="evenodd" d="M4 2a1 1 0 0 1 1 1v2.101a7.002 7.002 0 0 1 11.601 2.566 1 1 0 1 1-1.885.666A5.002 5.002 0 0 0 5.999 7H9a1 1 0 0 1 0 2H4a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1zm.008 9.057a1 1 0 0 1 1.276.61A5.002 5.002 0 0 0 14.001 13H11a1 1 0 1 1 0-2h5a1 1 0 0 1 1 1v5a1 1 0 1 1-2 0v-2.101a7.002 7.002 0 0 1-11.601-2.566 1 1 0 0 1 .61-1.276z" clip-rule="evenodd"/>
        </svg>
      </button>

      <button :class="s.mobileBtn" @click="handleRandom" aria-label="Random movie">
        <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path d="M10 3a7 7 0 1 0 0 14A7 7 0 0 0 10 3zm0 2a5 5 0 1 1 0 10A5 5 0 0 1 10 5zm-1 3a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm2 3a1 1 0 1 0 0 2 1 1 0 0 0 0-2z"/>
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
      <div :class="s.desktopFilter" ref="genreAnchor">
        <button
          :class="[s.desktopFilterBtn, filters.genres.length && s.desktopFilterBtnActive]"
          @click="toggleDesktopPanel('genre')"
        >
          Genre
          <span v-if="filters.genres.length" :class="s.desktopBadge">{{ filters.genres.length }}</span>
          <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" :class="[s.chevron, activePanel === 'genre' && s.chevronOpen]">
            <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 0 1 1.414 0L10 10.586l3.293-3.293a1 1 0 1 1 1.414 1.414l-4 4a1 1 0 0 1-1.414 0l-4-4a1 1 0 0 1 0-1.414z" clip-rule="evenodd"/>
          </svg>
        </button>
        <div v-if="activePanel === 'genre'" :class="s.desktopPanel">
          <button
            v-for="genre in filters.allGenres"
            :key="genre"
            :class="[s.genreOption, filters.genres.includes(genre) && s.genreOptionActive]"
            @click="toggleGenre(genre)"
          >
            <span>{{ genre }}</span>
            <span :class="s.genreCount">{{ filters.genreCounts[genre] ?? 0 }}</span>
          </button>
        </div>
      </div>

      <!-- MPAA -->
      <div :class="s.desktopFilter" ref="mpaaAnchor">
        <button
          :class="[s.desktopFilterBtn, filters.mpaaGroups.length && s.desktopFilterBtnActive]"
          @click="toggleDesktopPanel('mpaa')"
        >
          Rating
          <span v-if="filters.mpaaGroups.length" :class="s.desktopBadge">{{ filters.mpaaGroups.length }}</span>
          <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" :class="[s.chevron, activePanel === 'mpaa' && s.chevronOpen]">
            <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 0 1 1.414 0L10 10.586l3.293-3.293a1 1 0 1 1 1.414 1.414l-4 4a1 1 0 0 1-1.414 0l-4-4a1 1 0 0 1 0-1.414z" clip-rule="evenodd"/>
          </svg>
        </button>
        <div v-if="activePanel === 'mpaa'" :class="s.desktopPanel">
          <button
            v-for="group in mpaaGroupOptions"
            :key="group.value"
            :class="[s.genreOption, filters.mpaaGroups.includes(group.value) && s.genreOptionActive]"
            @click="toggleMpaa(group.value)"
          >
            <span>{{ group.label }}</span>
            <span :class="s.genreCount">{{ group.ratings.join(', ') }}</span>
          </button>
        </div>
      </div>

      <!-- Year -->
      <div :class="s.desktopFilter" ref="yearAnchor">
        <button
          :class="[s.desktopFilterBtn, (filters.yearMin !== null || filters.yearMax !== null) && s.desktopFilterBtnActive]"
          @click="toggleDesktopPanel('year')"
        >
          Year
          <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" :class="[s.chevron, activePanel === 'year' && s.chevronOpen]">
            <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 0 1 1.414 0L10 10.586l3.293-3.293a1 1 0 1 1 1.414 1.414l-4 4a1 1 0 0 1-1.414 0l-4-4a1 1 0 0 1 0-1.414z" clip-rule="evenodd"/>
          </svg>
        </button>
        <div v-if="activePanel === 'year'" :class="s.desktopPanel">
          <div :class="s.rangeRow">
            <input v-model.number="filters.yearMin" type="number" placeholder="From" :class="s.rangeInput" />
            <span :class="s.rangeSep">to</span>
            <input v-model.number="filters.yearMax" type="number" placeholder="To" :class="s.rangeInput" />
          </div>
        </div>
      </div>

      <!-- Runtime -->
      <div :class="s.desktopFilter" ref="runtimeAnchor">
        <button
          :class="[s.desktopFilterBtn, (filters.runtimeMin !== null || filters.runtimeMax !== null) && s.desktopFilterBtnActive]"
          @click="toggleDesktopPanel('runtime')"
        >
          Runtime
          <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" :class="[s.chevron, activePanel === 'runtime' && s.chevronOpen]">
            <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 0 1 1.414 0L10 10.586l3.293-3.293a1 1 0 1 1 1.414 1.414l-4 4a1 1 0 0 1-1.414 0l-4-4a1 1 0 0 1 0-1.414z" clip-rule="evenodd"/>
          </svg>
        </button>
        <div v-if="activePanel === 'runtime'" :class="s.desktopPanel">
          <div :class="s.rangeRow">
            <input v-model.number="filters.runtimeMin" type="number" placeholder="Min (min)" :class="s.rangeInput" />
            <span :class="s.rangeSep">to</span>
            <input v-model.number="filters.runtimeMax" type="number" placeholder="Max (min)" :class="s.rangeInput" />
          </div>
        </div>
      </div>

      <!-- TMDB Rating -->
      <div :class="s.desktopFilter" ref="ratingAnchor">
        <button
          :class="[s.desktopFilterBtn, (filters.ratingMin !== null || filters.ratingMax !== null) && s.desktopFilterBtnActive]"
          @click="toggleDesktopPanel('rating')"
        >
          TMDB Rating
          <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" :class="[s.chevron, activePanel === 'rating' && s.chevronOpen]">
            <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 0 1 1.414 0L10 10.586l3.293-3.293a1 1 0 1 1 1.414 1.414l-4 4a1 1 0 0 1-1.414 0l-4-4a1 1 0 0 1 0-1.414z" clip-rule="evenodd"/>
          </svg>
        </button>
        <div v-if="activePanel === 'rating'" :class="s.desktopPanel">
          <div :class="s.rangeRow">
            <input v-model.number="filters.ratingMin" type="number" step="0.1" min="0" max="10" placeholder="Min" :class="s.rangeInput" />
            <span :class="s.rangeSep">to</span>
            <input v-model.number="filters.ratingMax" type="number" step="0.1" min="0" max="10" placeholder="Max" :class="s.rangeInput" />
          </div>
        </div>
      </div>

      <!-- Watched / Ignored toggles -->
      <div :class="s.desktopFilter" ref="viewAnchor">
        <button
          :class="[s.desktopFilterBtn, (filters.watchedMode !== 'fade' || filters.ignoredMode !== 'hide') && s.desktopFilterBtnActive]"
          @click="toggleDesktopPanel('view')"
        >
          View
          <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" :class="[s.chevron, activePanel === 'view' && s.chevronOpen]">
            <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 0 1 1.414 0L10 10.586l3.293-3.293a1 1 0 1 1 1.414 1.414l-4 4a1 1 0 0 1-1.414 0l-4-4a1 1 0 0 1 0-1.414z" clip-rule="evenodd"/>
          </svg>
        </button>
        <div v-if="activePanel === 'view'" :class="s.desktopPanel">
          <div :class="s.viewGroup">
            <span :class="s.viewLabel">Watched</span>
            <div :class="s.viewToggle">
              <button v-for="opt in watchedOptions" :key="opt.value"
                :class="[s.viewToggleBtn, filters.watchedMode === opt.value && s.viewToggleBtnActive]"
                @click="filters.watchedMode = opt.value">{{ opt.label }}</button>
            </div>
          </div>
          <div :class="s.viewGroup">
            <span :class="s.viewLabel">Ignored</span>
            <div :class="s.viewToggle">
              <button v-for="opt in ignoredOptions" :key="opt.value"
                :class="[s.viewToggleBtn, filters.ignoredMode === opt.value && s.viewToggleBtnActive]"
                @click="filters.ignoredMode = opt.value">{{ opt.label }}</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Randomize -->
      <button :class="s.randomBtn" @click="handleRandom" aria-label="Random movie">
        <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path d="M10 3a7 7 0 1 0 0 14A7 7 0 0 0 10 3zm0 2a5 5 0 1 1 0 10A5 5 0 0 1 10 5zm-1 3a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm2 3a1 1 0 1 0 0 2 1 1 0 0 0 0-2z"/>
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
              <button
                v-for="opt in sortOptions" :key="opt.value"
                :class="[s.sortOption, filters.sort === opt.value && s.sortOptionActive]"
                @click="filters.sort = opt.value"
              >{{ opt.label }}</button>
            </div>
          </FilterSection>

          <!-- Genre -->
          <FilterSection label="Genre" :count="filters.genres.length">
            <button
              v-for="genre in filters.allGenres"
              :key="genre"
              :class="[s.genreOption, filters.genres.includes(genre) && s.genreOptionActive]"
              @click="toggleGenre(genre)"
            >
              <span>{{ genre }}</span>
              <span :class="s.genreCount">{{ filters.genreCounts[genre] ?? 0 }}</span>
            </button>
          </FilterSection>

          <!-- MPAA -->
          <FilterSection label="Rating" :count="filters.mpaaGroups.length">
            <button
              v-for="group in mpaaGroupOptions"
              :key="group.value"
              :class="[s.genreOption, filters.mpaaGroups.includes(group.value) && s.genreOptionActive]"
              @click="toggleMpaa(group.value)"
            >
              <span>{{ group.label }}</span>
              <span :class="s.genreCount">{{ group.ratings.join(', ') }}</span>
            </button>
          </FilterSection>

          <!-- Year -->
          <FilterSection label="Year" :active="filters.yearMin !== null || filters.yearMax !== null">
            <div :class="s.rangeRow">
              <input v-model.number="filters.yearMin" type="number" placeholder="From" :class="s.rangeInput" />
              <span :class="s.rangeSep">to</span>
              <input v-model.number="filters.yearMax" type="number" placeholder="To" :class="s.rangeInput" />
            </div>
          </FilterSection>

          <!-- Runtime -->
          <FilterSection label="Runtime" :active="filters.runtimeMin !== null || filters.runtimeMax !== null">
            <div :class="s.rangeRow">
              <input v-model.number="filters.runtimeMin" type="number" placeholder="Min (min)" :class="s.rangeInput" />
              <span :class="s.rangeSep">to</span>
              <input v-model.number="filters.runtimeMax" type="number" placeholder="Max (min)" :class="s.rangeInput" />
            </div>
          </FilterSection>

          <!-- TMDB Rating -->
          <FilterSection label="TMDB Rating" :active="filters.ratingMin !== null || filters.ratingMax !== null">
            <div :class="s.rangeRow">
              <input v-model.number="filters.ratingMin" type="number" step="0.1" min="0" max="10" placeholder="Min" :class="s.rangeInput" />
              <span :class="s.rangeSep">to</span>
              <input v-model.number="filters.ratingMax" type="number" step="0.1" min="0" max="10" placeholder="Max" :class="s.rangeInput" />
            </div>
          </FilterSection>

          <!-- Watched / Ignored -->
          <FilterSection label="View" :active="filters.watchedMode !== 'fade' || filters.ignoredMode !== 'hide'">
            <div :class="s.viewGroup">
              <span :class="s.viewLabel">Watched</span>
              <div :class="s.viewToggle">
                <button v-for="opt in watchedOptions" :key="opt.value"
                  :class="[s.viewToggleBtn, filters.watchedMode === opt.value && s.viewToggleBtnActive]"
                  @click="filters.watchedMode = opt.value">{{ opt.label }}</button>
              </div>
            </div>
            <div :class="s.viewGroup">
              <span :class="s.viewLabel">Ignored</span>
              <div :class="s.viewToggle">
                <button v-for="opt in ignoredOptions" :key="opt.value"
                  :class="[s.viewToggleBtn, filters.ignoredMode === opt.value && s.viewToggleBtnActive]"
                  @click="filters.ignoredMode = opt.value">{{ opt.label }}</button>
              </div>
            </div>
          </FilterSection>

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
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useFiltersStore } from '@/stores/filters'
import FilterSection from '@/components/FilterSection.vue'

const filters = useFiltersStore()
const router = useRouter()

const sheetOpen = ref(false)
const activePanel = ref(null)

const mpaaGroupOptions = [
  { value: 'family',  label: 'Family Friendly', ratings: ['G', 'PG'] },
  { value: 'teens',   label: 'Teens & Up',       ratings: ['PG-13', 'TV-14'] },
  { value: 'mature',  label: 'Mature',            ratings: ['R', 'NC-17', 'TV-MA'] },
  { value: 'unrated', label: 'Unrated',           ratings: ['NR', 'Unrated'] },
]

const sortOptions = [
  { value: 'acquired-desc', label: 'Recently Acquired' },
  { value: 'acquired-asc',  label: 'Oldest Acquired' },
  { value: 'title-asc',     label: 'Title A–Z' },
  { value: 'title-desc',    label: 'Title Z–A' },
  { value: 'year-desc',     label: 'Newest Release' },
  { value: 'year-asc',      label: 'Oldest Release' },
  { value: 'rating-desc',   label: 'Highest Rated' },
  { value: 'rating-asc',    label: 'Lowest Rated' },
]

const watchedOptions = [
  { value: 'fade',  label: 'Fade' },
  { value: 'show',  label: 'Show' },
  { value: 'hide',  label: 'Hide' },
]

const ignoredOptions = [
  { value: 'hide', label: 'Hide' },
  { value: 'show', label: 'Show' },
]

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

function toggleDesktopPanel(name) {
  activePanel.value = activePanel.value === name ? null : name
}

function handleRandom() {
  const movie = filters.randomMovie()
  if (movie) router.push(`/${movie.slug}`)
}

function handleClickOutside(e) {
  if (activePanel.value && !e.target.closest('[data-filter-bar]')) {
    activePanel.value = null
  }
}

onMounted(() => document.addEventListener('click', handleClickOutside))
onUnmounted(() => document.removeEventListener('click', handleClickOutside))
</script>

<style module="s">
.wrap {
  position: sticky;
  top: var(--header-height);
  z-index: 40;
  background: rgba(13, 13, 15, 0.85);
  backdrop-filter: blur(16px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
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
  position: absolute;
  left: var(--space-3);
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-text-muted);
  pointer-events: none;
}

.searchInput {
  width: 100%;
  padding: var(--space-2) var(--space-3) var(--space-2) var(--space-8);
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  color: var(--color-text-primary);
  font-size: var(--text-sm);
  outline: none;
  transition: border-color var(--transition-fast);
}

.searchInput::placeholder { color: var(--color-text-muted); }
.searchInput:focus { border-color: var(--color-border-strong); }

/* ── Mobile row ── */
.mobileRow {
  display: flex;
  gap: var(--space-2);
}

@media (min-width: 768px) {
  .mobileRow { display: none; }
}

.mobileBtn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  color: var(--color-text-secondary);
  position: relative;
  transition: border-color var(--transition-fast), color var(--transition-fast);
}

.mobileBtn:hover {
  border-color: var(--color-border-strong);
  color: var(--color-text-primary);
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
  color: #000;
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
  .desktopRow { display: flex; }
}

.desktopFilter {
  position: relative;
}

.desktopFilterBtn {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  color: var(--color-text-secondary);
  white-space: nowrap;
  transition: border-color var(--transition-fast), color var(--transition-fast);
}

.desktopFilterBtn:hover {
  border-color: var(--color-border-strong);
  color: var(--color-text-primary);
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
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  color: var(--color-text-secondary);
  outline: none;
  cursor: pointer;
}

.desktopBadge {
  background: var(--color-accent);
  color: #000;
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

.chevronOpen {
  transform: rotate(180deg);
}

.desktopPanel {
  position: absolute;
  top: calc(100% + var(--space-2));
  left: 0;
  min-width: 220px;
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-2);
  box-shadow: 0 8px 24px rgba(0,0,0,0.4);
  z-index: 50;
  max-height: 360px;
  overflow-y: auto;
}

.randomBtn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  color: var(--color-text-secondary);
  margin-left: auto;
  transition: border-color var(--transition-fast), color var(--transition-fast);
}

.randomBtn:hover {
  border-color: var(--color-border-strong);
  color: var(--color-text-primary);
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
  color: var(--color-text-primary);
  border-color: var(--color-border-strong);
}

/* ── Shared filter options ── */
.genreOption {
  display: flex;
  align-items: center;
  justify-content: space-between;
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

.genreOption:hover {
  background: rgba(255,255,255,0.05);
  color: var(--color-text-primary);
}

.genreOptionActive {
  color: var(--color-accent);
  background: var(--color-accent-subtle);
}

.genreCount {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  font-weight: var(--font-weight-medium);
}

.genreOptionActive .genreCount {
  color: var(--color-accent-muted);
}

/* ── Range inputs ── */
.rangeRow {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
}

.rangeInput {
  width: 80px;
  padding: var(--space-2) var(--space-3);
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-primary);
  font-size: var(--text-sm);
  outline: none;
  transition: border-color var(--transition-fast);
}

.rangeInput:focus { border-color: var(--color-border-strong); }

.rangeSep {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  flex-shrink: 0;
}

/* ── View toggles ── */
.viewGroup {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-2) var(--space-3);
  gap: var(--space-4);
}

.viewLabel {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  flex-shrink: 0;
}

.viewToggle {
  display: flex;
  gap: 2px;
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  padding: 2px;
}

.viewToggleBtn {
  padding: var(--space-1) var(--space-3);
  font-size: var(--text-xs);
  font-weight: var(--font-weight-medium);
  border-radius: var(--radius-full);
  border: none;
  background: none;
  color: var(--color-text-muted);
  transition: background var(--transition-fast), color var(--transition-fast);
}

.viewToggleBtnActive {
  background: var(--color-accent);
  color: #000;
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
  background: rgba(255,255,255,0.05);
  color: var(--color-text-primary);
}

.sortOptionActive {
  color: var(--color-accent);
  background: var(--color-accent-subtle);
}

/* ── Mobile sheet ── */
.backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 199;
  backdrop-filter: blur(4px);
}

.sheet {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  top: 0;
  margin-top: calc(var(--header-height) + 120px);
  background: rgba(22, 22, 26, 0.98);
  backdrop-filter: blur(24px);
  border-top: 1px solid rgba(255, 255, 255, 0.08);
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

.sheetReset:hover { border-color: var(--color-border-strong); }

.sheetDone {
  flex: 1;
  padding: var(--space-3);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-semibold);
  background: var(--color-accent);
  border: none;
  border-radius: var(--radius-md);
  color: #000;
  transition: background var(--transition-fast);
}

.sheetDone:hover { background: var(--color-accent-bright); }
</style>

<style>
.sheet-enter-active, .sheet-leave-active {
  transition: transform 0.3s cubic-bezier(0.32, 0.72, 0, 1);
}
.sheet-enter-from, .sheet-leave-to { transform: translateY(100%); }

.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
