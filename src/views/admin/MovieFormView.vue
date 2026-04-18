<template>
    <div :class="s.page">

        <!-- TMDB Search (add mode only) -->
        <section v-if="!isEditMode && !formReady" :class="s.section">
            <label class="visually-hidden" for="tmbdSearch">Search TMDB</label>
            <div :class="s.searchRow">
                <input id="tmbdSearch" v-model="tmdbQuery" type="search" placeholder="Search for a movie…"
                    :class="s.input" @keydown.enter.prevent="searchTmdb" :disabled="tmdbSearching" />

                <button :class="s.btnPrimary" @click="searchTmdb" :disabled="tmdbSearching || !tmdbQuery">
                    {{ tmdbSearching ? 'Searching…' : 'Search' }}
                </button>
            </div>

            <div v-if="tmdbResults.length" :class="s.tmdbResults">
                <button v-for="result in tmdbResults" :key="result.id" :class="s.tmdbResult"
                    @click="selectTmdb(result)">
                    <img v-if="result.poster_path" :src="posterUrl(result.poster_path, 'w92')" :alt="result.title"
                        :class="s.tmdbResultPoster" />
                    <div v-else :class="[s.tmdbResultPoster, s.tmdbResultPosterEmpty]" />
                    <div :class="s.tmdbResultInfo">
                        <span :class="s.tmdbResultTitle">{{ result.title }}</span>
                        <span :class="s.tmdbResultYear">{{ result.release_date?.slice(0, 4) }}</span>
                    </div>
                </button>
            </div>

            <p v-if="tmdbResults.length === 0 && tmdbSearched" :class="s.emptyMsg">
                No results found. Try a different search.
            </p>
        </section>

        <!-- Movie Form -->
        <form v-if="formReady" @submit.prevent="handleSubmit" :class="s.form">

            <!-- Selected movie bar -->
            <div :class="s.selectedBar">
                <img v-if="form.poster_path" :src="posterUrl(form.poster_path, 'w92')" :class="s.selectedPoster" />

                <div :class="s.selectedInfo">
                    <span :class="s.selectedTitle">{{ form.title }}</span>
                    <span :class="s.selectedYear">{{ releaseYear(form.release_date) }}</span>
                </div>

                <button v-if="!isEditMode" type="button" :class="s.btnChange" @click="resetTmdb">
                    <span v-html="pencilIcon" :class="s.changeIcon" />
                    Change
                </button>

                <RouterLink v-else :to="{ name: 'movie', params: { slug: route.params.slug } }" :class="s.btnView">
                    View
                    <span v-html="rightArrowIcon" :class="s.viewIcon" />
                </RouterLink>
            </div>

            <!-- Services -->
            <div :class="s.field">
                <label :class="s.fieldLabel">How to Watch</label>

                <div :class="s.servicesStack">
                    <details v-for="svc in serviceOptions" :key="svc.value"
                        :class="[s.serviceCard, svc.brandClass, isServiceActive(svc.value) && s.serviceCardActive]">
                        <summary :class="s.serviceCardTrigger">
                            <span :class="s.summaryStart">
                                <span v-html="serviceIcons[svc.value]" :class="s.serviceIcon" aria-hidden="true" />
                                {{ isServiceActive(svc.value) ? svc.label : `Add ${svc.label}` }}
                                <span v-if="getService(svc.value)?.quality" class="badge" :class="s.summaryBadge">{{
                                    getService(svc.value).quality }}</span>
                            </span>
                            <span :class="s.serviceTriggerIcon" aria-hidden="true">+</span>
                        </summary>

                        <div :class="s.serviceCardBody">
                            <span :class="s.cardLabel">Quality</span>
                            <div :class="s.pills">
                                <button v-for="q in ['4K', 'HD', 'SD']" :key="q" type="button"
                                    :class="[s.pill, getService(svc.value)?.quality === q && s.pillActive]"
                                    @click="getService(svc.value).quality = getService(svc.value).quality === q ? '' : q">{{
                                        q }}</button>
                            </div>

                            <span :class="s.cardLabel">URL</span>
                            <div :class="s.urlRow">
                                <input v-model="getService(svc.value).url" type="url" :class="s.input"
                                    placeholder="Paste link…" />
                                <a v-if="serviceSearchUrl(svc.value)" :href="serviceSearchUrl(svc.value)"
                                    target="_blank" rel="noopener noreferrer" :class="s.helperLink"
                                    aria-label="Search for this movie on the service">↗</a>
                            </div>
                        </div>
                    </details>

                    <!-- Disc copy (rare — native uncontrolled disclosure) -->
                    <details :class="[s.serviceCard, form.disc_format && s.serviceCardActive]">
                        <summary :class="s.serviceCardTrigger">
                            <span :class="s.summaryStart">
                                <span v-html="serviceIcons.disc" :class="s.serviceIcon" aria-hidden="true" />
                                {{ form.disc_format ? 'Physical disc' : 'Add physical disc' }}
                                <span v-if="form.disc_format" class="badge" :class="s.summaryBadge">{{ form.disc_format
                                    }}</span>
                            </span>
                            <span :class="s.serviceTriggerIcon" aria-hidden="true">+</span>
                        </summary>
                        <div :class="s.serviceCardBody">
                            <div :class="s.pills">
                                <button v-for="opt in discOptions" :key="opt" type="button"
                                    :class="[s.pill, form.disc_format === opt && s.pillActive]"
                                    @click="form.disc_format = form.disc_format === opt ? '' : opt">{{ opt }}</button>
                            </div>
                        </div>
                    </details>
                </div>
            </div>

            <!-- Date Acquired -->
            <div :class="s.field">
                <label :class="s.fieldLabel">Date Acquired <span :class="s.required">*</span></label>
                <input v-model="form.acquired_at" type="datetime-local" :class="s.input" required />
            </div>

            <!-- Notes -->
            <div :class="s.field">
                <label :class="s.fieldLabel">Notes</label>
                <input v-model="form.notes" type="text" :class="s.input" placeholder="Optional notes…" />
            </div>

            <!-- TMDB Data (collapsible) -->
            <details :class="s.tmdbDetails">
                <!-- <details :open="isEditMode || undefined" :class="s.tmdbDetails"> -->
                <summary :class="s.tmdbSummary">
                    <span>Movie Details</span>
                    <span :class="s.chevron" aria-hidden="true">▾</span>
                </summary>
                <div :class="s.tmdbBody">

                    <!-- Media Preview -->
                    <div v-if="form.trailer_youtube_id || form.poster_path || form.backdrop_path"
                        :class="s.mediaPreview">
                        <div v-if="form.trailer_youtube_id" :class="s.trailerWrap">
                            <iframe :src="`https://www.youtube.com/embed/${form.trailer_youtube_id}?mute=1&autoplay=1`"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowfullscreen :class="s.trailerFrame" />
                        </div>
                        <div v-if="form.poster_path || form.backdrop_path" :class="s.mediaImages">
                            <img v-if="form.poster_path" :src="posterUrl(form.poster_path)"
                                :alt="`${form.title} poster`" :class="s.previewPoster" />
                            <img v-if="form.backdrop_path" :src="backdropUrl(form.backdrop_path, 'w780')"
                                :alt="`${form.title} backdrop`" :class="s.previewBackdrop" />
                        </div>
                    </div>

                    <div :class="s.field">
                        <label :class="s.fieldLabel">Title <span :class="s.required">*</span></label>
                        <input v-model="form.title" type="text" :class="s.input" required />
                    </div>

                    <div :class="s.field">
                        <label :class="s.fieldLabel">Search Keywords</label>
                        <div :class="s.tagInput">
                            <span v-for="(kw, i) in form.search_keywords" :key="kw" :class="s.tag">
                                {{ kw }}
                                <button type="button" :class="s.tagRemove" @click="removeKeyword(i)">×</button>
                            </span>
                            <input v-model="keywordInput" type="text" :class="s.tagTextInput" placeholder="Add keyword…"
                                enterkeyhint="done" @keydown.enter.prevent="addKeyword"
                                @keyup.enter.prevent="addKeyword" @keydown.comma.prevent="addKeyword" />
                        </div>
                    </div>

                    <div :class="s.fieldRow">
                        <div :class="s.field">
                            <label :class="s.fieldLabel">Release Date <span :class="s.required">*</span></label>
                            <input v-model="form.release_date" type="date" :class="s.input" required />
                        </div>
                        <div :class="s.field">
                            <label :class="s.fieldLabel">Runtime (min) <span :class="s.required">*</span></label>
                            <input v-model="form.runtime_minutes" type="number" :class="s.input" required />
                        </div>
                    </div>

                    <div :class="s.fieldRow">
                        <div :class="s.field">
                            <label :class="s.fieldLabel">MPAA Rating <span :class="s.required">*</span></label>
                            <select v-model="form.mpaa_rating" :class="s.input" required>
                                <option value=""></option>
                                <option>G</option>
                                <option>PG</option>
                                <option>PG-13</option>
                                <option>R</option>
                                <option>NC-17</option>
                                <option>NR</option>
                                <option>TV-G</option>
                                <option>TV-PG</option>
                                <option>TV-14</option>
                                <option>TV-MA</option>
                            </select>
                        </div>
                        <div :class="s.field">
                            <label :class="s.fieldLabel">TMDB Rating</label>
                            <input v-model="form.tmdb_rating" type="number" step="0.1" min="0" max="10"
                                :class="s.input" />
                        </div>
                    </div>

                    <div :class="s.field">
                        <label :class="s.fieldLabel">Genres <span :class="s.required">*</span></label>
                        <div :class="s.genreWrapper">
                            <div :class="s.tagInput">
                                <span v-for="(genre, i) in form.genres" :key="genre" :class="s.tag">
                                    {{ genre }}
                                    <button type="button" :class="s.tagRemove" @click="removeGenre(i)">×</button>
                                </span>
                                <input v-model="genreInput" type="text" :class="s.tagTextInput" placeholder="Add genre…"
                                    enterkeyhint="done" @keydown.enter.prevent="addGenre"
                                    @keyup.enter.prevent="addGenre" @keydown.comma.prevent="addGenre"
                                    @focus="genreFocused = true" @blur="onGenreBlur" />
                            </div>
                            <ul v-if="genreFocused && filteredGenreSuggestions.length" :class="s.genreDropdown">
                                <li v-for="g in filteredGenreSuggestions" :key="g">
                                    <button type="button" :class="s.genreOption" @click="selectGenre(g)">
                                        {{ g }}
                                    </button>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div :class="s.field">
                        <label :class="s.fieldLabel">Description <span :class="s.required">*</span></label>
                        <textarea v-model="form.description" :class="[s.input, s.textarea]" rows="4" required />
                    </div>

                    <div :class="s.field">
                        <label :class="s.fieldLabel">YouTube Trailer ID</label>
                        <div :class="s.inputWithLink">
                            <input v-model="form.trailer_youtube_id" type="text" :class="s.input"
                                placeholder="e.g. dQw4w9WgXcQ" />
                            <a :href="trailerSearchUrl" target="_blank" rel="noopener noreferrer" :class="s.helperLink">
                                Search ↗
                            </a>
                        </div>
                    </div>

                    <div :class="s.field">
                        <label :class="s.fieldLabel">Poster Path <span :class="s.required">*</span></label>
                        <input v-model="form.poster_path" type="text" :class="s.input" placeholder="/abc123.jpg" />
                    </div>

                    <div :class="s.field">
                        <label :class="s.fieldLabel">Backdrop Path</label>
                        <input v-model="form.backdrop_path" type="text" :class="s.input" placeholder="/abc123.jpg" />
                    </div>

                    <!-- Cast Members -->
                    <div :class="s.field">
                        <label :class="s.fieldLabel">Cast</label>

                        <div v-if="form.cast_members.length" :class="s.castList">
                            <div v-for="(member, i) in form.cast_members" :key="i" :class="s.castRow">
                                <div :class="s.castOrder">
                                    <button type="button" :class="s.castOrderBtn" :disabled="i === 0"
                                        aria-label="Move up" @click="moveCastMember(i, -1)">▲</button>
                                    <button type="button" :class="s.castOrderBtn"
                                        :disabled="i === form.cast_members.length - 1" aria-label="Move down"
                                        @click="moveCastMember(i, 1)">▼</button>
                                </div>

                                <img v-if="member.profile_path" :src="profileUrl(member.profile_path)"
                                    :alt="member.name" :class="s.castThumb" />
                                <div v-else :class="[s.castThumb, s.castThumbEmpty]" />

                                <div :class="s.castFields">
                                    <input v-model="member.name" type="text" :class="s.input"
                                        placeholder="Actor name" />
                                    <input v-model="member.character" type="text" :class="s.input"
                                        placeholder="Character name" />
                                    <input v-model="member.profile_path" type="text" :class="s.input"
                                        placeholder="/path.jpg (optional)" />
                                </div>

                                <button type="button" :class="s.castRemove" @click="removeCastMember(i)"
                                    aria-label="Remove cast member">×</button>
                            </div>
                        </div>

                        <button type="button" :class="s.btnSecondary" @click="addCastMember"
                            :disabled="form.cast_members.length >= 10">
                            + Add Cast Member
                        </button>
                    </div>

                </div>
            </details>

            <p v-if="submitError" :class="s.errorMsg">{{ submitError }}</p>

            <div :class="s.submit">
                <button type="submit" :class="s.btnSubmit" :disabled="submitting">
                    <!-- <span :class="s.submitIcon" v-html="checkmarkIcon" /> -->
                    {{
                        submitting ? (isEditMode ? 'Saving…' : 'Adding…') :
                            (isEditMode ? 'Save Changes' : 'Add Movie')
                    }}
                </button>
            </div>
        </form>
    </div>
</template>

<script setup>
    import { ref, computed, watchEffect, onMounted, onBeforeUnmount } from 'vue'
    import { useRoute, onBeforeRouteLeave } from 'vue-router'

    import { useMoviesStore } from '@/stores/movies'
    import { serviceIcons } from '@/lib/icons'
    import { usePageTitle } from '@/composables/usePageTitle'
    import { posterUrl, backdropUrl, profileUrl } from '@/lib/tmdb'
    import { releaseYear } from '@/lib/movies'
    import { useTmdbSearch } from '@/composables/useTmdbSearch'
    import { useMovieForm, genreSuggestions, discOptions, serviceOptions } from '@/composables/useMovieForm'
    import { useMovieSubmit } from '@/composables/useMovieSubmit'
    import rightArrowIcon from '@/assets/icons/arrow-right.svg?raw'
    import pencilIcon from '@/assets/icons/pencil.svg?raw'

    const route = useRoute()
    const moviesStore = useMoviesStore()

    const isEditMode = computed(() => !!route.params.slug)
    const formReady = ref(false)
    const formSnapshot = ref(null)

    const { tmdbQuery, tmdbResults, tmdbSearching, tmdbSearched, searchTmdb, selectTmdb: _selectTmdb, resetTmdb: _resetTmdb } = useTmdbSearch()
    const { form, genreInput, keywordInput, trailerSearchUrl, populateFromMovie, addCastMember, removeCastMember, moveCastMember, addGenre, removeGenre, addKeyword, removeKeyword, getService, isServiceActive, serviceSearchUrl } = useMovieForm()

    const genreFocused = ref(false)
    const filteredGenreSuggestions = computed(() => {
        const q = genreInput.value.trim().toLowerCase()
        return genreSuggestions.filter(g =>
            !form.genres.includes(g) && (!q || g.toLowerCase().includes(q))
        )
    })
    function selectGenre(genre) {
        genreInput.value = genre
        addGenre()
    }
    function onGenreBlur() {
        setTimeout(() => { genreFocused.value = false }, 150)
    }
    const { submitting, submitted, submitError, handleSubmit } = useMovieSubmit(form, isEditMode, () => route.params.slug)

    const isDirty = computed(() => {
        if (!formSnapshot.value) return false
        return JSON.stringify(form) !== formSnapshot.value
    })

    function takeSnapshot() {
        formSnapshot.value = JSON.stringify(form)
    }

    usePageTitle(computed(() => {
        const base = form.title ? `${form.title}${form.release_date ? ` (${releaseYear(form.release_date)})` : ''}` : null
        if (isEditMode.value) return base ? `Edit ${base} | Movie Collection` : 'Edit Movie | Movie Collection'
        return base ? `Add ${base} | Movie Collection` : 'Add Movie | Movie Collection'
    }))

    watchEffect(() => {
        if (isEditMode.value && !formReady.value && moviesStore.movies.length) {
            const movie = moviesStore.movies.find(m => m.slug === route.params.slug)
            if (movie) { populateFromMovie(movie); formReady.value = true; takeSnapshot() }
        }
    })

    async function selectTmdb(result) {
        const data = await _selectTmdb(result)
        Object.assign(form, data)
        formReady.value = true
        takeSnapshot()
    }

    function resetTmdb() {
        _resetTmdb()
        formReady.value = false
        formSnapshot.value = null
    }

    onBeforeRouteLeave(() => {
        if (submitted.value || !formReady.value || !isDirty.value) return true
        return window.confirm('You have unsaved changes. Leave anyway?')
    })

    function onBeforeUnload(e) {
        if (!submitted.value && formReady.value && isDirty.value) e.preventDefault()
    }
    onMounted(() => window.addEventListener('beforeunload', onBeforeUnload))
    onBeforeUnmount(() => window.removeEventListener('beforeunload', onBeforeUnload))
</script>

<style module="s">
    .page {
        container-type: inline-size;
        margin-inline: auto;
        max-width: 40rem;
        padding-top: var(--size-6);
    }

    .pageTitle {
        font-size: var(--text-2xl);
        font-weight: var(--font-weight-bold);
        color: var(--color-text);
        margin-bottom: var(--size-6);
    }

    .section {
        margin-bottom: var(--size-6);
    }

    /* TMDB Search */
    .searchRow {
        display: flex;
        gap: var(--size-2);
    }

    .tmdbResults {
        margin-top: var(--size-3);
        display: flex;
        flex-direction: column;
        gap: var(--size-2);
    }

    .tmdbResult {
        display: flex;
        align-items: center;
        gap: var(--size-3);
        padding: var(--size-3);
        background: var(--color-surface);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-md);
        cursor: pointer;
        text-align: left;
        width: 100%;
        transition: border-color var(--transition-fast), background var(--transition-fast);
    }

    .tmdbResult:hover {
        background: var(--color-surface-raised);
        border-color: var(--color-border-strong);
    }

    .tmdbResultPoster {
        width: 40px;
        height: 60px;
        object-fit: cover;
        border-radius: var(--radius-sm);
        flex-shrink: 0;
        background: var(--color-surface-raised);
    }

    .tmdbResultPosterEmpty {
        display: block;
    }

    .tmdbResultInfo {
        display: flex;
        flex-direction: column;
        gap: var(--size-1);
    }

    .tmdbResultTitle {
        font-size: var(--text-sm);
        font-weight: var(--font-weight-bold);
        color: var(--color-text);
    }

    .tmdbResultYear {
        font-size: var(--text-xs);
        color: var(--color-text-muted);
    }

    /* Selected bar */
    .selectedBar {
        display: flex;
        align-items: center;
        gap: var(--size-3);
        padding: var(--size-4);
        background: var(--color-surface);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-md);
        margin-bottom: var(--size-5);

        @container (min-width: 32rem) {
            gap: var(--size-4);
        }
    }

    .selectedPoster {
        aspect-ratio: 2 / 3;
        border-radius: var(--radius-sm);
        object-fit: cover;
        flex-shrink: 0;
        width: var(--size-12);

        @container (min-width: 32rem) {
            width: var(--size-16);
        }
    }

    .selectedInfo {
        color: var(--color-text);
        flex: 1;
    }

    .selectedTitle {
        color: var(--blue-50);
        display: block;
        font-weight: var(--font-weight-bold);
        line-height: var(--leading-tight);
        text-wrap: pretty;

        @container (min-width: 32rem) {
            font-size: var(--text-xl);
        }
    }

    .selectedYear {
        color: var(--blue-200);
        font-size: var(--text-xs);
    }

    /* Media Preview */
    .mediaPreview {
        display: flex;
        flex-direction: column;
        gap: var(--size-3);
    }

    .trailerWrap {
        position: relative;
        aspect-ratio: 16 / 9;
        background: #000;
        border-radius: var(--radius-md);
        overflow: hidden;
    }

    .trailerFrame {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        border: none;
    }

    .mediaImages {
        display: grid;
        grid-template-columns: 80px 1fr;
        gap: var(--size-3);
        align-items: start;
    }

    .previewPoster {
        width: 80px;
        aspect-ratio: 2 / 3;
        object-fit: cover;
        border-radius: var(--radius-sm);
    }

    .previewBackdrop {
        width: 100%;
        aspect-ratio: 16 / 9;
        object-fit: cover;
        border-radius: var(--radius-sm);
    }

    /* Form layout */
    .form {
        display: flex;
        flex-direction: column;
        gap: var(--size-5);
    }

    .field {
        display: flex;
        flex-direction: column;
        gap: var(--size-2);
    }

    .fieldRow {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: var(--size-3);
    }

    .fieldLabel {
        font-size: var(--text-xs);
        font-weight: var(--font-weight-bold);
        color: var(--color-text-secondary);
        text-transform: uppercase;
        letter-spacing: 0.06em;
    }

    .required {
        color: var(--color-error);
    }

    /* Pill buttons */
    .pills {
        display: flex;
        flex-wrap: wrap;
        gap: var(--size-2);
    }

    .pill {
        padding: var(--size-2) var(--size-3);
        font-size: var(--text-sm);
        font-weight: var(--font-weight-medium);
        background: none;
        border: 1px solid var(--color-border);
        border-radius: var(--radius-full);
        color: var(--color-text-secondary);
        cursor: pointer;
        transition: border-color var(--transition-fast), background var(--transition-fast), color var(--transition-fast);
        flex-shrink: 0;
        min-height: 36px;
    }

    .pill:hover:not(:disabled) {
        border-color: var(--color-border-strong);
        color: var(--color-text);
    }

    .pillActive {
        background: var(--color-accent);
        border-color: var(--color-accent);
        color: var(--color-text-on-accent);
    }

    .pillActive:hover:not(:disabled) {
        background: var(--color-accent-bright);
        border-color: var(--color-accent-bright);
        color: var(--color-text-on-accent);
    }

    .pill:disabled {
        opacity: 0.3;
        cursor: not-allowed;
    }

    /* Services */
    .servicesStack {
        display: flex;
        flex-direction: column;
        gap: var(--size-1);
    }

    .serviceCard {
        display: flex;
        flex-direction: column;
        border: 1px solid var(--color-surface-raised);
        background: var(--color-surface-raised);
        border-radius: var(--radius-xl);
        overflow: hidden;
    }

    /* .serviceCard:open {
    background: var(--color-bg-hover);
} */

    .serviceCardTrigger {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
        padding: var(--size-3) var(--size-4);
        background: none;
        border: none;
        color: var(--color-text-secondary);
        font-size: var(--text-sm);
        cursor: pointer;
        text-align: left;
        transition: color var(--transition-fast), background var(--transition-fast);
        min-height: 44px;
        list-style: none;
    }

    .serviceCardTrigger::-webkit-details-marker {
        display: none;
    }

    .serviceCardTrigger:hover {
        color: var(--color-text);
        background: var(--color-bg-hover);
    }

    .serviceCardActive>.serviceCardTrigger {
        color: var(--color-text);
    }

    .summaryStart {
        display: flex;
        align-items: center;
        gap: var(--size-3);
    }

    .serviceIcon {
        align-items: center;
        display: flex;
        flex-shrink: 0;
        font-size: var(--text-2xl);
        justify-content: center;
    }

    /* .serviceIcon :global(svg) {
        width: 100%;
        height: 100%;
    } */

    .serviceIcon :global(.brand-fg) {
        fill: var(--brand-fg, currentColor);
    }

    .serviceIcon :global(.brand-bg) {
        fill: var(--brand-bg, transparent);
    }

    .serviceTriggerIcon {
        font-size: var(--text-xl);
        color: var(--color-text-muted);
        line-height: 1;
        flex-shrink: 0;
        transition: transform var(--transition-fast);
    }

    :global(details[open]) .serviceTriggerIcon {
        transform: rotate(45deg);
    }

    .serviceCardActive .serviceTriggerIcon {
        color: var(--color-accent);
    }

    .cardLabel {
        font-size: var(--text-xs);
        font-weight: var(--font-weight-bold);
        text-transform: uppercase;
        letter-spacing: 0.06em;
        color: var(--color-text-muted);
    }

    .serviceCardActive {
        border-color: var(--color-border-strong);
    }

    .serviceCardBody {
        display: flex;
        flex-direction: column;
        gap: var(--size-3);
        padding: var(--size-3) var(--size-4) var(--size-4);
        border-top: 1px solid var(--color-border-subtle);
    }

    .summaryBadge {
        font-size: var(--text-xs);
        font-weight: var(--font-weight-semibold);
        padding: var(--size-0-5) var(--size-2);
    }

    .urlRow {
        display: flex;
        align-items: center;
        gap: var(--size-2);
    }

    .urlRow .input {
        flex: 1;
    }

    /* Inputs */
    .input {
        appearance: auto;
        background: var(--blue-900);
        border: 2px solid var(--blue-800);
        border-radius: var(--radius-full);
        color: var(--blue-50);
        font-size: var(--text-base);
        outline: none;
        padding: var(--size-3) var(--size-5);
        transition: border-color var(--transition-fast);
        width: 100%;
    }

    .input::placeholder {
        color: var(--blue-100);
    }

    .input:focus {
        border-color: var(--blue-600);
    }

    .textarea {
        border-radius: var(--radius-lg);
        font-family: inherit;
        line-height: var(--leading-normal);
        resize: vertical;
    }

    /* Tag input (genres) */
    .tagInput {
        display: flex;
        flex-wrap: wrap;
        gap: var(--size-2);
        padding: var(--size-2) var(--size-3);
        background: var(--color-surface);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-md);
        min-height: 44px;
        align-items: center;
        cursor: text;
    }

    .tag {
        display: inline-flex;
        align-items: center;
        gap: var(--size-1);
        background: var(--color-accent-subtle);
        border: 1px solid var(--color-accent-muted);
        color: var(--color-accent);
        border-radius: var(--radius-full);
        padding: var(--size-1) var(--size-3);
        font-size: var(--text-xs);
        font-weight: var(--font-weight-medium);
    }

    .tagRemove {
        background: none;
        border: none;
        color: var(--color-accent-muted);
        cursor: pointer;
        padding: 0;
        font-size: var(--text-base);
        line-height: 1;
        display: flex;
        align-items: center;
    }

    .tagRemove:hover {
        color: var(--color-accent);
    }

    .tagTextInput {
        border: none;
        outline: none;
        background: transparent;
        font-size: var(--text-sm);
        color: var(--color-text);
        min-width: 120px;
        flex: 1;
    }

    .tagTextInput::placeholder {
        color: var(--color-text-muted);
    }

    .genreWrapper {
        position: relative;
    }

    .genreDropdown {
        background: var(--color-surface-raised);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-md);
        box-shadow: var(--shadow-md);
        height: 16rem;
        left: 0;
        list-style: none;
        margin: var(--size-1) 0 0;
        max-height: 75vh;
        overflow-y: auto;
        padding: var(--size-1) 0;
        position: absolute;
        right: 0;
        top: 100%;
        z-index: 10;
    }

    .genreOption {
        background: none;
        border: none;
        color: var(--color-text);
        cursor: pointer;
        font-size: var(--text-sm);
        padding: var(--size-2) var(--size-3);
        text-align: left;
        width: 100%;
    }

    .genreOption:hover,
    .genreOption:active {
        background: var(--color-bg-hover);
    }

    /* TMDB Details collapsible */
    .tmdbDetails {
        border: 1px solid var(--color-border-subtle);
        border-radius: var(--radius-lg);
        overflow: hidden;
    }

    .tmdbSummary {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: var(--size-3) var(--size-4);
        font-size: var(--text-sm);
        font-weight: var(--font-weight-bold);
        color: var(--color-text-secondary);
        cursor: pointer;
        list-style: none;
        user-select: none;
        transition: color var(--transition-fast);
    }

    .tmdbSummary::-webkit-details-marker {
        display: none;
    }

    .tmdbSummary:hover {
        color: var(--color-text);
    }

    .chevron {
        font-size: var(--text-base);
        transition: transform var(--transition-fast);
        color: var(--color-text-muted);
    }

    .tmdbDetails[open] .chevron {
        transform: rotate(180deg);
    }

    .tmdbBody {
        display: flex;
        flex-direction: column;
        gap: var(--size-4);
        padding: var(--size-4);
        border-top: 1px solid var(--color-border-subtle);
    }

    /* Helper links */
    .helperLink {
        font-size: var(--text-sm);
        color: var(--color-accent);
        white-space: nowrap;
        transition: color var(--transition-fast);
        flex-shrink: 0;
    }

    .helperLink:hover {
        color: var(--color-accent-bright);
    }

    .inputWithLink {
        display: flex;
        align-items: center;
        gap: var(--size-3);
    }

    .inputWithLink .input {
        flex: 1;
    }

    .btnView,
    .btnChange {
        align-items: center;
        background: var(--blue-800);
        border-radius: var(--radius-md);
        color: var(--blue-300);
        display: flex;
        font-size: var(--text-sm);
        font-weight: var(--font-weight-medium);
        gap: var(--size-1);
        padding: var(--size-2) var(--size-4);
        transition: border-color var(--transition-fast), color var(--transition-fast);
    }

    .viewIcon,
    .changeIcon {
        align-items: center;
        display: flex;
    }

    .btnView:hover,
    .btnChange:hover {
        color: var(--color-text);
    }

    .submit {
        background: linear-gradient(transparent, var(--color-bg));
        bottom: calc(var(--tab-bar-height) + env(safe-area-inset-bottom));
        margin-inline: calc(-1 * var(--content-padding));
        padding: var(--size-2) var(--content-padding);
        position: sticky;

        @media (min-width: 64rem) {
            bottom: 0;
            margin: 0;
            padding: var(--size-6) 0;
        }
    }

    .btnSubmit {
        align-items: center;
        display: flex;
        background: var(--green-600);
        box-shadow: var(--shadow-lg);
        gap: var(--size-2);
        border-radius: var(--radius-lg);
        color: var(--green-50);
        font-weight: var(--font-weight-semibold);
        /* border: none; */
        justify-content: center;
        padding: var(--size-3) var(--size-4);
        transition: background var(--transition-fast);
        width: 100%;
    }

    .btnSubmit:hover:not(:disabled) {
        background: var(--green-700);
    }

    .btnSubmit:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    .submitIcon {
        align-items: center;
        display: flex;
    }

    /* Messages */
    .errorMsg {
        font-size: var(--text-sm);
        color: var(--color-error);
    }

    .emptyMsg {
        font-size: var(--text-sm);
        color: var(--color-text-muted);
        margin-top: var(--size-2);
    }

    /* Cast editor */
    .castList {
        display: flex;
        flex-direction: column;
        gap: var(--size-3);
        margin-bottom: var(--size-2);
    }

    .castRow {
        align-items: flex-start;
        background: var(--color-surface);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-md);
        display: flex;
        gap: var(--size-3);
        padding: var(--size-3);
    }

    .castThumb {
        aspect-ratio: 1;
        border-radius: var(--radius-full);
        flex-shrink: 0;
        object-fit: cover;
        width: var(--size-10);
    }

    .castThumbEmpty {
        background: var(--color-surface-raised);
        display: block;
    }

    .castFields {
        display: flex;
        flex: 1;
        flex-direction: column;
        gap: var(--size-2);
        min-width: 0;
    }

    .castFields .input {
        font-size: var(--text-sm);
        padding: var(--size-2) var(--size-3);
    }

    .castOrder {
        display: flex;
        flex-direction: column;
        flex-shrink: 0;
        gap: var(--size-1);
        justify-content: center;
    }

    .castOrderBtn {
        background: transparent;
        border: none;
        color: var(--color-text-muted);
        cursor: pointer;
        font-size: var(--text-2xs);
        line-height: 1;
        padding: var(--size-1);
        transition: color var(--transition-fast);
    }

    .castOrderBtn:hover:not(:disabled) {
        color: var(--color-text);
    }

    .castOrderBtn:disabled {
        cursor: default;
        opacity: 0.2;
    }

    .castRemove {
        background: transparent;
        border: none;
        color: var(--color-text-muted);
        cursor: pointer;
        flex-shrink: 0;
        font-size: var(--text-xl);
        line-height: 1;
        padding: var(--size-1);
        transition: color var(--transition-fast);
    }

    .castRemove:hover {
        color: var(--color-text);
    }

    .btnSecondary {
        background: var(--color-surface);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-md);
        color: var(--color-text-secondary);
        cursor: pointer;
        font-size: var(--text-sm);
        font-weight: var(--font-weight-medium);
        padding: var(--size-2) var(--size-4);
        transition: border-color var(--transition-fast), color var(--transition-fast);
    }

    .btnSecondary:hover:not(:disabled) {
        border-color: var(--color-border-strong);
        color: var(--color-text);
    }

    .btnSecondary:disabled {
        cursor: not-allowed;
        opacity: 0.4;
    }
</style>
