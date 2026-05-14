<template>
    <div :class="s.page">

        <!-- TMDB Search (add mode only) -->
        <section v-if="!isEditMode && !formReady" :class="s.section">

            <div :class="s.field">
                <label for="tmbdSearch" :class="s.fieldLabel">Search TMDB</label>
                <div :class="s.tmbdSearch">
                    <input id="tmbdSearch" v-model="tmdbQuery" type="search" placeholder="Search by title and year"
                        :class="s.input" @keydown.enter.prevent="searchTmdb" />

                    <button :class="s.tmbdSearchBtn" @click="searchTmdb" :disabled="tmdbSearching || !tmdbQuery"
                        :aria-label="tmdbSearching ? 'Searching' : 'Search'">
                        <span :class="[s.tmdbSearchIcon, tmdbSearching && s.isLoading]" v-html="searchIcon" />
                    </button>
                </div>
            </div>

            <div v-if="tmdbResults.length" :class="s.tmdbResults">
                <button v-for="result in tmdbResults" :key="result.id"
                    :class="[s.tmdbResult, selectingId && result.id !== selectingId && s.tmdbResultDimmed]"
                    :disabled="!!selectingId"
                    @click="libraryByTmdbId[result.id] ? router.push({ name: 'edit-movie', params: { slug: libraryByTmdbId[result.id] } }) : selectTmdb(result)">

                    <div :class="s.tmdbResultPoster">
                        <img v-if="result.poster_path" :src="posterUrl(result.poster_path, 'w92')"
                            :alt="`${result.title} ${result.release_date?.slice(0, 4)}`"
                            :class="s.tmdbResultPosterImg" />
                    </div>

                    <p :class="s.tmdbResultInfo">
                        <span :class="s.tmdbResultTitle">{{ result.title }}</span>
                        <span :class="s.tmdbResultYear">{{ result.release_date?.slice(0, 4) }}</span>
                        <span v-if="libraryByTmdbId[result.id]" :class="s.tmdbResultLibraryBadge">Already in your
                            library</span>
                    </p>

                    <span v-html="libraryByTmdbId[result.id] ? pencilIcon : plusIcon" aria-hidden="true"
                        :class="result.id === selectingId ? [s.tmdbSearchIcon, s.isLoading] : [s.tmdbResultIcon, libraryByTmdbId[result.id] && s.tmdbResultIconEdit]" />
                </button>
            </div>

            <p v-if="tmdbResults.length === 0 && tmdbSearched" :class="[s.errorMsg, s.emptyMsg]">
                No results found.
            </p>
        </section>

        <!-- Movie Form -->
        <form v-if="formReady" @submit.prevent="handleSubmit" :class="s.form" novalidate>

            <!-- Selected movie -->
            <div :class="s.selectedMovie">
                <div v-if="form.poster_path" :class="s.selectedPoster">
                    <img :src="posterUrl(form.poster_path, 'w92')"
                        :alt="`${form.title} ${releaseYear(form.release_date)}`" :class="s.selectedPosterImg" />
                </div>

                <div :class="s.selectedContent">
                    <p :class="s.selectedDetails">
                        <span :class="s.selectedTitle">{{ form.title }}</span>
                        <span :class="s.selectedYear">{{ releaseYear(form.release_date) }}</span>
                    </p>

                    <button v-if="!isEditMode" type="button" :class="s.btnChange" @click="resetTmdb">
                        <span v-html="pencilIcon" :class="s.changeIcon" />
                        Change
                    </button>

                    <RouterLink v-else :to="{ name: 'movie', params: { slug: route.params.slug } }" :class="s.btnView">
                        View
                        <span v-html="rightArrowIcon" :class="s.viewIcon" />
                    </RouterLink>
                </div>
            </div>

            <!-- Services -->
            <div id="watch-options">
                <span :class="s.fieldLabel">Watch Options</span>
                <p v-if="fieldErrors['watch-options']" :class="s.errorMsg">{{ fieldErrors['watch-options'] }}</p>

                <div :class="s.services">
                    <details v-for="svc in serviceOptions" :key="svc.value"
                        :class="[s.serviceCard, svc.brandClass, isServiceActive(svc.value) && s.serviceCardActive]">
                        <summary :class="s.serviceCardTrigger">
                            <span v-html="serviceIcons[svc.value]" :class="s.serviceIcon" aria-hidden="true" />

                            {{ isServiceActive(svc.value) ? svc.label : `Add ${svc.label}` }}

                            <span v-if="getService(svc.value)?.quality" class="badge" :class="s.summaryBadge">
                                {{ getService(svc.value).quality }}
                            </span>

                            <span :class="s.serviceTriggerIcon" aria-hidden="true" v-html="plusIcon" />
                        </summary>

                        <div :class="s.serviceCardBody">
                            <a v-if="serviceSearchUrl(svc.value)" :href="serviceSearchUrl(svc.value)" target="_blank"
                                rel="noopener noreferrer" :class="s.helperLink"
                                aria-label="Search for this movie on the service">
                                Find on {{ svc.label }}
                                <span :class="s.helperLinkIcon" v-html="newWindowIcon" />
                            </a>

                            <div :class="s.field">
                                <label :for="`svc-${svc.value}-url`" :class="s.fieldLabel">Link</label>
                                <input :id="`svc-${svc.value}-url`" v-model="getService(svc.value).url" type="url"
                                    :class="[s.input, s.mutedPlaceholder]"
                                    :placeholder="servicePlaceholderUrl(svc.value)" />
                                <p v-if="fieldErrors[`svc-${svc.value}-url`]" :class="s.errorMsg">{{
                                    fieldErrors[`svc-${svc.value}-url`] }}</p>
                            </div>

                            <div :class="s.field">
                                <span :id="`svc-${svc.value}-quality-label`" :class="s.fieldLabel">Quality</span>
                                <div :class="s.pills" :aria-labelledby="`svc-${svc.value}-quality-label`">
                                    <button v-for="q in ['4K', 'HD', 'SD']" :key="q" type="button"
                                        :class="[s.pill, getService(svc.value)?.quality === q && s.pillActive]"
                                        @click="getService(svc.value).quality = getService(svc.value).quality === q ? '' : q">
                                        {{ q }}
                                    </button>
                                </div>
                                <p v-if="fieldErrors[`svc-${svc.value}-quality-label`]" :class="s.errorMsg">{{
                                    fieldErrors[`svc-${svc.value}-quality-label`] }}</p>
                            </div>
                        </div>
                    </details>

                    <!-- Disc copy (rare — native uncontrolled disclosure) -->
                    <details :class="[s.serviceCard, form.disc_format && s.serviceCardActive]">
                        <summary :class="s.serviceCardTrigger">
                            <span v-html="serviceIcons.disc" :class="s.serviceIcon" aria-hidden="true" />

                            {{ form.disc_format ? 'Physical disc' : 'Add physical disc' }}

                            <span v-if="form.disc_format" class="badge" :class="s.summaryBadge">
                                {{ form.disc_format }}
                            </span>

                            <span :class="s.serviceTriggerIcon" aria-hidden="true" v-html="plusIcon" />
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


            <!-- Movie Details -->
            <details :open="isEditMode || undefined" :class="s.movieDetails">

                <summary :class="[s.movieDetailsHeader, s.fieldLabel]">
                    <span>Movie Details</span>
                    <span :class="s.detailsHeaderIcon" aria-hidden="true" v-html="chevronDownIcon" />
                </summary>

                <div :class="s.movieDetailsContent">

                    <div :class="s.field">
                        <label for="title" :class="s.fieldLabel">Title <span :class="s.required">*</span></label>
                        <input id="title" v-model="form.title" type="text" :class="s.input" required />
                        <p v-if="fieldErrors['title']" :class="s.errorMsg">{{ fieldErrors['title'] }}</p>
                    </div>

                    <div :class="s.field">
                        <label for="search-keywords" :class="s.fieldLabel">Search Keywords</label>
                        <div :class="s.tagInput">
                            <button type="button" v-for="(keyword, i) in form.search_keywords" :key="keyword"
                                @click="removeKeyword(i)" :class="s.tag" :title="`Remove &ldquo;${keyword}&rdquo;`">
                                {{ keyword }}
                                <span :class="s.tagRemove" v-html="xIcon" />
                            </button>
                            <input id="search-keywords" v-model="keywordInput" type="text" :class="s.tagTextInput"
                                placeholder="Add keyword…" enterkeyhint="done" @keydown.enter.prevent="addKeyword"
                                @keyup.enter.prevent="addKeyword" @keydown.comma.prevent="addKeyword" />
                        </div>
                    </div>

                    <div :class="s.fieldRow">
                        <div :class="s.field">
                            <label for="release-date" :class="s.fieldLabel">Release Date <span
                                    :class="s.required">*</span></label>
                            <input id="release-date" v-model="form.release_date" type="date" :class="s.input"
                                required />
                            <p v-if="fieldErrors['release-date']" :class="s.errorMsg">{{ fieldErrors['release-date'] }}
                            </p>
                        </div>
                        <div :class="s.field">
                            <span :class="s.fieldLabel">Runtime <span :class="s.required">*</span></span>
                            <div :class="s.runtimeFields">
                                <div :class="s.runtimeField">
                                    <input id="runtime-hours" v-model.number="runtimeHours" type="number" min="0"
                                        step="1" :class="s.input" aria-label="Runtime hours" />
                                    <span :class="[s.runtimeUnit, s.fieldLabel]">h</span>
                                </div>
                                <div :class="s.runtimeField">
                                    <input id="runtime-minutes" v-model.number="runtimeMinutes" type="number" min="0"
                                        max="59" step="1" :class="s.input" aria-label="Runtime minutes" />
                                    <span :class="[s.runtimeUnit, s.fieldLabel]">m</span>
                                </div>
                            </div>
                            <p v-if="fieldErrors['runtime-hours']" :class="s.errorMsg">{{ fieldErrors['runtime-hours']
                                }}</p>
                        </div>
                    </div>

                    <div :class="s.fieldRow">
                        <div :class="s.field">
                            <label for="mpaa-rating" :class="s.fieldLabel">
                                Rating
                                <span :class="s.required">*</span>
                            </label>
                            <select id="mpaa-rating" v-model="form.mpaa_rating" :class="s.input" required>
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
                            <p v-if="fieldErrors['mpaa-rating']" :class="s.errorMsg">{{ fieldErrors['mpaa-rating'] }}
                            </p>
                        </div>
                        <div :class="s.field">
                            <label for="tmdb-rating" :class="s.fieldLabel">TMDB Rating</label>
                            <input id="tmdb-rating" v-model="form.tmdb_rating" type="number" step="0.1" min="0" max="10"
                                :class="[s.input, s.mutedPlaceholder]" placeholder="e.g. 7.2" />
                        </div>
                    </div>

                    <div :class="s.field">
                        <label for="genres" :class="s.fieldLabel">Genres <span :class="s.required">*</span></label>
                        <div :class="s.genreWrapper" ref="genreWrapperEl" @focusout="onGenreBlur"
                            @keydown.escape="closeGenreDropdown">
                            <div :class="s.tagInput">
                                <button type="button" v-for="(genre, i) in form.genres" :key="genre"
                                    @click="removeGenre(i)" :class="s.tag" :title="`Remove &ldquo;${genre}&rdquo;`">
                                    {{ genre }}
                                    <span :class="s.tagRemove" v-html="xIcon" />
                                </button>
                                <input id="genres" v-model="genreInput" type="text" :class="s.tagTextInput"
                                    placeholder="Add genre…" enterkeyhint="done" @keydown.enter.prevent="addGenre"
                                    @keyup.enter.prevent="addGenre" @keydown.comma.prevent="addGenre"
                                    @focus="genreFocused = true" />
                            </div>
                            <div v-if="genreFocused && filteredGenreSuggestions.length" :class="s.genreDropdown">
                                <div :class="s.genreDropdownContent">
                                    <button type="button" v-for="genre in filteredGenreSuggestions" :key="genre"
                                        :class="s.genreOption" @click="selectGenre(genre)">
                                        {{ genre }}
                                    </button>
                                </div>
                            </div>
                        </div>
                        <p v-if="fieldErrors['genres']" :class="s.errorMsg">{{ fieldErrors['genres'] }}</p>
                    </div>

                    <div :class="s.field">
                        <label for="description" :class="s.fieldLabel">Description <span
                                :class="s.required">*</span></label>
                        <textarea id="description" v-model="form.description" :class="[s.input, s.textarea]" rows="4"
                            required />
                        <p v-if="fieldErrors['description']" :class="s.errorMsg">{{ fieldErrors['description'] }}</p>
                    </div>

                    <div :class="s.field">
                        <div :class="s.fieldLabelRow">
                            <label for="trailer-youtube-id" :class="s.fieldLabel">YouTube Trailer ID</label>
                            <a :href="trailerSearchUrl" target="_blank" rel="noopener noreferrer" :class="s.helperLink">
                                Find on YouTube
                                <span :class="s.helperLinkIcon" v-html="newWindowIcon" />
                            </a>
                            <button type="button" v-if="form.trailer_youtube_id" :class="s.previewLink"
                                @click="openPreview('trailer', 'YouTube Trailer')">
                                <span :class="s.previewLinkIcon" v-html="eyeIcon" />
                                Preview
                            </button>
                        </div>
                        <input id="trailer-youtube-id" v-model="form.trailer_youtube_id" type="text"
                            :class="[s.input, s.mutedPlaceholder]" placeholder="e.g. dQw4w9WgXcQ"
                            @blur="handleTrailerInput" />
                        <p v-if="trailerIdError" :class="s.errorMsg">{{ trailerIdError }}</p>
                    </div>

                    <div :class="s.field">
                        <div :class="s.fieldLabelRow">
                            <label for="poster-path" :class="s.fieldLabel">
                                Poster Image (TMDB Path or URL)
                                <span :class="s.required">*</span>
                            </label>
                            <button type="button" v-if="form.poster_path" :class="s.previewLink"
                                @click="openPreview('poster', 'Movie Poster')">
                                <span :class="s.previewLinkIcon" v-html="eyeIcon" />
                                Preview
                            </button>
                        </div>
                        <input id="poster-path" v-model="form.poster_path" type="text"
                            :class="[s.input, s.mutedPlaceholder]" placeholder="e.g. /abc123.jpg" />
                        <p v-if="fieldErrors['poster-path']" :class="s.errorMsg">{{ fieldErrors['poster-path'] }}</p>
                    </div>

                    <div :class="s.field">
                        <div :class="s.fieldLabelRow">
                            <label for="backdrop-path" :class="s.fieldLabel">Hero Image (TMDB Path or URL)</label>
                            <button type="button" v-if="form.backdrop_path" :class="s.previewLink"
                                @click="openPreview('backdrop', 'Hero Image')">
                                <span :class="s.previewLinkIcon" v-html="eyeIcon" />
                                Preview
                            </button>
                        </div>
                        <input id="backdrop-path" v-model="form.backdrop_path" type="text"
                            :class="[s.input, s.mutedPlaceholder]" placeholder="e.g. /abc123.jpg" />
                    </div>

                    <!-- Cast Members -->
                    <div>
                        <span id="cast" :class="s.fieldLabel">Cast</span>

                        <TransitionGroup v-if="form.cast_members.length" tag="div" :class="s.castList"
                            :move-class="s.castMove" aria-labelledby="cast">
                            <div v-for="(member, i) in form.cast_members" :key="member._key" :class="s.castMember">
                                <div :class="s.castPhoto">
                                    <img v-if="member.profile_path" :src="profileUrl(member.profile_path)"
                                        :alt="member.name" :class="s.castThumb" />
                                    <div v-else :class="s.silhouette" v-html="silhouette" />
                                </div>

                                <div :class="s.castContent">
                                    <div :class="s.castField">
                                        <label :for="`cast-name-${i}`" :class="s.fieldLabel">
                                            Actor
                                            <span :class="s.required">*</span>
                                        </label>
                                        <input :id="`cast-name-${i}`" v-model="member.name" type="text"
                                            :class="s.castInput" placeholder="Actor's name" />
                                    </div>
                                    <div :class="s.castField">
                                        <label :for="`cast-character-${i}`" :class="s.fieldLabel">Character</label>
                                        <input :id="`cast-character-${i}`" v-model="member.character" type="text"
                                            :class="s.castInput" placeholder="Character name" />
                                    </div>
                                    <div :class="s.castField">
                                        <label :for="`cast-photo-${i}`" :class="s.fieldLabel">Photo</label>
                                        <input :id="`cast-photo-${i}`" v-model="member.profile_path" type="text"
                                            :class="s.castInput" placeholder="TMDB Path or URL" />
                                    </div>

                                    <div :class="s.castUtilities">
                                        <button type="button" :class="[s.castUtility, s.castMoveUp]" :disabled="i === 0"
                                            @click="moveCastMember(i, -1)">
                                            <span :class="s.castUtilityIcon" v-html="arrowUpIcon" />
                                            Move Up
                                        </button>

                                        <button type="button" :class="[s.castUtility, s.castMoveDown]"
                                            :disabled="i === form.cast_members.length - 1"
                                            @click="moveCastMember(i, 1)">
                                            <span :class="s.castUtilityIcon" v-html="arrowDownIcon" />
                                            Move Down
                                        </button>

                                        <button type="button" :class="[s.castUtility, s.castRemove]"
                                            @click="removeCastMember(i)">
                                            <span :class="s.castUtilityIcon" v-html="trashIcon" />
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </TransitionGroup>

                        <button type="button" :class="s.btnSecondary" @click="addCastMember"
                            v-if="form.cast_members.length < 10">
                            <span :class="s.btnIcon" v-html="plusIcon" />
                            Add Cast Member
                        </button>
                    </div>

                    <!-- Date Acquired -->
                    <div :class="s.field">
                        <label for="acquired-at" :class="s.fieldLabel">Date Acquired <span
                                :class="s.required">*</span></label>
                        <input id="acquired-at" v-model="form.acquired_at" type="datetime-local" :class="s.input"
                            required />
                        <p v-if="fieldErrors['acquired-at']" :class="s.errorMsg">{{ fieldErrors['acquired-at'] }}</p>
                    </div>

                    <!-- Notes -->
                    <div :class="s.field">
                        <label for="notes" :class="s.fieldLabel">Optional Notes</label>
                        <input id="notes" v-model="form.notes" type="text" :class="s.input" />
                    </div>
                </div>
            </details>

            <p v-if="submitError" :class="s.errorMsg">{{ submitError }}</p>

            <div :class="s.submit">
                <button type="submit" :class="s.btnSubmit" :disabled="submitting">
                    {{
                        submitting ? (isEditMode ? 'Saving…' : 'Adding…') :
                            (isEditMode ? 'Save Changes' : 'Add Movie')
                    }}
                </button>
            </div>
        </form>

        <Teleport to="body">
            <div ref="previewPopoverEl" popover :class="s.previewPopover">
                <div :class="s.previewModal">
                    <button :class="s.previewCloseBtn" v-html="xIcon" @click="previewPopoverEl?.hidePopover()" />
                    <iframe :src="`https://www.youtube.com/embed/${form.trailer_youtube_id}?mute=1&autoplay=1`"
                        allow="autoplay; encrypted-media" allowfullscreen v-if="previewType === 'trailer'"
                        :class="s.previewEmbed" width="768" />
                    <img v-else-if="previewType === 'poster'" :src="posterUrl(form.poster_path, 'w342')"
                        :class="s.previewImg" />
                    <img v-else-if="previewType === 'backdrop'" :src="backdropUrl(form.backdrop_path, 'w1280')"
                        :class="s.previewImg" />
                    <p v-if="previewCaption" :class="s.previewCaption">{{ previewCaption }}</p>
                </div>
            </div>
        </Teleport>
    </div>
</template>

<script setup>
    import { ref, computed, watch, watchEffect, nextTick, onMounted, onBeforeUnmount } from 'vue'
    import { useRoute, useRouter, onBeforeRouteLeave } from 'vue-router'
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
    import searchIcon from '@/assets/icons/magnifying-glass.svg?raw'
    import plusIcon from '@/assets/icons/plus-simple.svg?raw'
    import newWindowIcon from '@/assets/icons/new-window.svg?raw'
    import chevronDownIcon from '@/assets/icons/chevron-down.svg?raw'
    import xIcon from '@/assets/icons/x-mark.svg?raw'
    import eyeIcon from '@/assets/icons/eye.svg?raw'
    import trashIcon from '@/assets/icons/trash.svg?raw'
    import arrowUpIcon from '@/assets/icons/arrow-up.svg?raw'
    import arrowDownIcon from '@/assets/icons/arrow-down.svg?raw'
    import silhouette from '@/assets/icons/user.svg?raw'

    const route = useRoute()
    const router = useRouter()
    const moviesStore = useMoviesStore()

    const libraryByTmdbId = computed(() =>
        Object.fromEntries(moviesStore.movies.filter(m => m.tmdb_id).map(m => [m.tmdb_id, m.slug]))
    )

    const isEditMode = computed(() => !!route.params.slug)
    const formReady = ref(false)
    const formSnapshot = ref(null)

    const { tmdbQuery, tmdbResults, tmdbSearching, tmdbSearched, searchTmdb, selectTmdb: _selectTmdb, resetTmdb: _resetTmdb } = useTmdbSearch()
    const { form, genreInput, keywordInput, trailerSearchUrl, populateFromMovie, setCastMembers, addCastMember, removeCastMember, moveCastMember, addGenre, removeGenre, addKeyword, removeKeyword, getService, isServiceActive, serviceSearchUrl, servicePlaceholderUrl } = useMovieForm()

    const runtimeHours = ref(0)
    const runtimeMinutes = ref(0)
    const trailerIdError = ref('')
    const previewPopoverEl = ref(null)
    const previewType = ref(null)
    const previewCaption = ref(null)

    function openPreview(type, caption = null) {
        previewType.value = type
        previewCaption.value = caption
        previewPopoverEl.value?.showPopover()
    }

    function handleTrailerInput() {
        const val = form.trailer_youtube_id?.trim()
        if (!val) { trailerIdError.value = ''; return }
        // Looks like a URL if it contains a dot or slash
        if (!val.includes('.') && !val.includes('/')) { trailerIdError.value = ''; return }
        try {
            const url = new URL(val.startsWith('http') ? val : `https://${val}`)
            let id = null
            if (url.hostname === 'youtu.be') {
                id = url.pathname.slice(1).split('?')[0]
            } else if (url.searchParams.has('v')) {
                id = url.searchParams.get('v')
            }
            if (id && /^[A-Za-z0-9_-]{11}$/.test(id)) {
                form.trailer_youtube_id = id
                trailerIdError.value = ''
            } else {
                trailerIdError.value = 'Could not get trailer ID from YouTube URL.'
            }
        } catch {
            trailerIdError.value = 'Could not get trailer ID from YouTube URL.'
        }
    }

    watch([runtimeHours, runtimeMinutes], () => {
        form.runtime_minutes = (Number(runtimeHours.value) || 0) * 60 + (Number(runtimeMinutes.value) || 0)
    })

    function syncRuntimeFromForm() {
        const mins = form.runtime_minutes
        runtimeHours.value = (mins != null && mins !== '') ? Math.floor(mins / 60) : 0
        runtimeMinutes.value = (mins != null && mins !== '') ? mins % 60 : 0
    }

    const genreFocused = ref(false)
    const genreWrapperEl = ref(null)
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
    function closeGenreDropdown() {
        genreFocused.value = false
    }
    function onGenreBlur(event) {
        if (genreWrapperEl.value?.contains(event.relatedTarget)) return
        closeGenreDropdown()
    }
    const { submitting, submitted, submitError, fieldErrors, handleSubmit: _submit } = useMovieSubmit(form, isEditMode, () => route.params.slug)


    async function handleSubmit() {
        handleTrailerInput()
        await _submit()
        const firstErrorId = Object.keys(fieldErrors)[0]
        if (!firstErrorId) return
        await nextTick()
        const el = document.getElementById(firstErrorId)
        if (!el) return
        const closedDetails = el.closest('details:not([open])')
        if (closedDetails) {
            closedDetails.setAttribute('open', '')
            await new Promise(r => setTimeout(r, 260))
        }
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }

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
            if (movie) { populateFromMovie(movie); syncRuntimeFromForm(); formReady.value = true; takeSnapshot() }
        }
    })

    const selectingId = ref(null)

    async function selectTmdb(result) {
        selectingId.value = result.id
        try {
            const { cast_members, ...rest } = await _selectTmdb(result)
            Object.assign(form, rest)
            setCastMembers(cast_members)
            syncRuntimeFromForm()
            formReady.value = true
            takeSnapshot()
        } finally {
            selectingId.value = null
        }
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
        max-width: 45rem;
        padding-top: var(--size-6);
    }

    .section {
        background: var(--blue-800);
        border-radius: var(--radius-xl);
        display: flex;
        flex-direction: column;
        gap: var(--size-6);
        padding: var(--size-4);

        @media (min-width: 30rem) {
            padding: var(--size-6);
        }

        @media (min-width: 40rem) {
            padding: var(--size-8);
        }

        @media (min-width: 64rem) {
            padding: var(--size-12);
        }
    }

    /* TMDB Search */
    .tmbdSearch {
        display: flex;
        gap: var(--size-2);
        position: relative;

        .input {
            padding-right: var(--size-12);
        }
    }

    .tmbdSearchBtn {
        align-items: center;
        color: var(--blue-50);
        display: flex;
        justify-content: center;
        font-size: var(--text-xl);
        height: 100%;
        position: absolute;
        right: 0;
        top: 0;
        width: var(--size-12);
    }

    .tmdbSearchIcon {
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

    .tmdbResults {
        display: flex;
        flex-direction: column;
        gap: var(--size-1);
    }

    .tmdbResult {
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
    }

    .tmdbResult:hover {
        background: var(--color-bg-frosted-selected);
    }

    .tmdbResultPoster {
        aspect-ratio: 2 / 3;
        background: var(--blue-900);
        border-radius: var(--radius-md);
        box-shadow: var(--shadow-xl);
        flex-shrink: 0;
        overflow: hidden;
        width: 3rem;

        @media (min-width: 48rem) {
            box-shadow: var(--shadow-2xl);
        }

        img {
            display: block;
            object-fit: cover;
            height: 100%;
            width: 100%;
        }
    }

    .tmdbResultInfo {
        display: flex;
        flex: 1;
        flex-direction: column;
        gap: var(--size-1);
    }

    .tmdbResultTitle {
        font-size: var(--text-sm);
        text-wrap: balance;
    }

    .tmdbResultYear {
        color: var(--blue-400);
    }

    .tmdbResultLibraryBadge {
        color: var(--yellow-400);
        font-size: var(--text-2xs);
    }

    .tmdbResultIcon {
        align-items: center;
        display: flex;
        font-size: var(--text-2xl);
        flex-shrink: 0;
    }

    .tmdbResultIconEdit {
        color: var(--yellow-400);
        font-size: var(--text-lg);
    }

    .tmdbResultDimmed {
        opacity: 0.35;
        transition: opacity var(--transition-fast);
    }

    /* Selected bar */
    .selectedMovie {
        align-items: center;
        background: var(--blue-800);
        border-radius: var(--radius-xl);
        color: var(--blue-50);
        display: flex;
        font-size: var(--text-xs);
        font-weight: var(--font-weight-bold);
        gap: var(--size-4);
        letter-spacing: var(--tracking-widest);
        line-height: var(--leading-tighter);
        padding: var(--size-4);
        text-transform: uppercase;

        @media (min-width: 30rem) {
            gap: var(--size-6);
            padding: var(--size-6);
        }

        @media (min-width: 40rem) {
            padding-inline: var(--size-8);
        }
    }

    .selectedPoster {
        aspect-ratio: 2 / 3;
        background: var(--blue-900);
        border-radius: var(--radius-md);
        box-shadow: var(--shadow-xl);
        flex-shrink: 0;
        overflow: hidden;
        width: 5rem;

        @media (min-width: 48rem) {
            box-shadow: var(--shadow-2xl);
            width: 6rem;
        }

        img {
            display: block;
            object-fit: cover;
            height: 100%;
            width: 100%;
        }
    }

    .selectedContent {
        display: flex;
        flex: 1;
        flex-direction: column;
        gap: var(--size-6);

        @media (min-width: 30rem) {
            align-items: center;
            flex-direction: row;
            gap: var(--size-10);
        }
    }

    .selectedDetails {
        display: flex;
        flex: 1;
        flex-direction: column;
        gap: var(--size-0-5);

        @media (min-width: 30rem) {
            gap: var(--size-1);
        }
    }

    .selectedTitle {
        font-size: var(--text-base);
        text-wrap: balance;

        @media (min-width: 30rem) {
            font-size: var(--text-lg);
        }

        @media (min-width: 40rem) {
            font-size: var(--text-xl);
        }
    }

    .selectedYear {
        color: var(--blue-200);
        font-size: var(--text-xs);
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

        &:focus-within .fieldLabel {
            color: var(--blue-50);
        }
    }

    .fieldRow {
        display: grid;
        gap: var(--size-6);

        @media (min-width: 25rem) {
            gap: var(--size-3);
            grid-template-columns: 1fr 1fr;
        }

        @media (min-width: 40rem) {
            gap: var(--size-6);
        }
    }

    .runtimeFields {
        display: flex;
        gap: var(--size-2);
    }

    .runtimeField {
        align-items: center;
        display: flex;
        flex: 1;
        gap: var(--size-2);

        .input {
            flex: 1;
            min-width: 0;
            text-align: center;
        }
    }

    .runtimeUnit {
        flex-shrink: 0;
    }

    .fieldLabelRow {
        align-items: center;
        display: flex;
        flex-wrap: wrap;
        gap: var(--size-2) var(--size-4);

        .previewLink {
            flex: 100%;

            @media (min-width: 30rem) {
                flex: 0 0 auto;
                margin-left: auto;
            }
        }
    }

    .fieldLabel {
        color: var(--blue-400);
        display: block;
        font-size: var(--text-xs);
        font-weight: var(--font-weight-bold);
        letter-spacing: var(--tracking-widest);
        text-transform: uppercase;
        transition: color var(--transition-fast);
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
        background: none;
        border-radius: var(--radius-full);
        color: var(--blue-200);
        cursor: pointer;
        flex-shrink: 0;
        font-size: var(--text-xs);
        font-weight: var(--font-weight-bold);
        letter-spacing: var(--tracking-widest);
        line-height: var(--leading-tighter);
        padding: var(--size-3) var(--size-4);
        text-transform: uppercase;
        transition: background var(--transition-fast), color var(--transition-fast);

        @media (hover: hover) and (pointer: fine) {
            &:not(:disabled):hover {
                background: var(--blue-700);
                color: var(--blue-50);
            }
        }

        &:disabled {
            cursor: not-allowed;
            opacity: 0.3;
        }
    }

    .pillActive {
        background: var(--green-300);
        color: var(--green-800);

        @media (hover: hover) and (pointer: fine) {
            &:not(:disabled):hover {
                background: var(--green-400);
                color: var(--green-900);
            }
        }
    }

    /* Services */
    .services {
        display: flex;
        flex-direction: column;
        gap: var(--size-1);
        margin-top: var(--size-2);
    }

    .serviceCard {
        background: var(--blue-900);
        border-radius: var(--radius-lg);
        overflow: hidden;
        transition: background var(--transition-fast);
    }

    .serviceCard::details-content {
        height: 0;
        overflow: clip;
        transition: height var(--transition-normal), content-visibility var(--transition-normal) allow-discrete;
    }

    @supports (interpolate-size: allow-keywords) {
        .serviceCard {
            interpolate-size: allow-keywords;
        }

        .serviceCard[open]::details-content {
            height: auto;
        }
    }

    .serviceCardTrigger {
        align-items: center;
        border-radius: var(--radius-lg);
        color: var(--blue-50);
        cursor: pointer;
        display: flex;
        font-size: var(--text-sm);
        font-weight: var(--font-weight-semibold);
        line-height: var(--leading-tight);
        gap: var(--size-2);
        padding: var(--size-4);
        text-align: left;
        transition: color var(--transition-fast), background var(--transition-fast);

        @media (min-width: 30rem) {
            gap: var(--size-3);
            padding-inline: var(--size-6);
        }

        @media (min-width: 40rem) {
            padding: var(--size-6) var(--size-8);
        }
    }

    .serviceCardTrigger::-webkit-details-marker {
        display: none;
    }

    .serviceCardActive {
        background: var(--blue-800);
    }

    .serviceIcon {
        align-items: center;
        display: flex;
        flex-shrink: 0;
        font-size: var(--text-2xl);
        justify-content: center;
    }

    .serviceIcon :global(.brand-fg) {
        fill: var(--brand-fg, currentColor);
    }

    .serviceIcon :global(.brand-bg) {
        fill: var(--brand-bg, transparent);
    }

    .serviceTriggerIcon {
        align-items: center;
        display: flex;
        flex-shrink: 0;
        font-size: var(--text-xl);
        margin-left: auto;
        transition: rotate var(--transition-fast);
    }

    .serviceCardBody {
        display: flex;
        flex-direction: column;
        gap: var(--size-6);
        padding: var(--size-1) var(--size-4) var(--size-4) var(--size-4);

        @media (min-width: 30rem) {
            padding-inline: var(--size-6);
        }

        @media (min-width: 40rem) {
            padding: 0 var(--size-8) var(--size-6) var(--size-8);
        }
    }

    .serviceCardBody .field {
        @media (min-width: 40rem) {
            align-items: center;
            flex-direction: row;

            .fieldLabel {
                flex: 0 0 10ch;
            }
        }

    }

    .summaryBadge {
        background: var(--green-300);
        color: var(--green-800);
        padding-inline: var(--size-2);
        letter-spacing: var(--tracking-widest);
        text-transform: uppercase;
    }



    .serviceCard[open] {
        background: var(--blue-800);

        /* .header {
            color: var(--blue-50);
        } */

        .serviceTriggerIcon {
            rotate: 45deg;
        }
    }

    /* Inputs */
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

        @media (min-width: 40rem) {
            padding-inline: var(--size-5);
        }

        &::-webkit-inner-spin-button,
        &::-webkit-outer-spin-button {
            appearance: none;
        }
    }

    .input::placeholder {
        color: var(--blue-100);
    }

    .mutedPlaceholder::placeholder {
        color: var(--blue-600);
    }

    .input:focus {
        background: var(--color-frosted-input-focus);
    }

    .input:disabled {
        opacity: 0.5;
    }

    .textarea {
        font-family: inherit;
        line-height: var(--leading-normal);
        resize: vertical;
    }

    /* Tag input (genres) */
    .tagInput {
        align-items: center;
        background: var(--color-frosted-input);
        border-radius: var(--radius-lg);
        display: flex;
        flex-wrap: wrap;
        gap: var(--size-2) var(--size-1);
        min-height: 44px;
        padding: var(--size-3);

        @media (min-width: 40rem) {
            padding: var(--size-4);
        }
    }

    .tag {
        align-items: center;
        background: var(--blue-300);
        border-radius: var(--radius-full);
        color: var(--blue-800);
        cursor: pointer;
        display: inline-flex;
        flex-shrink: 0;
        font-size: var(--text-sm);
        font-weight: var(--font-weight-medium);
        gap: var(--size-1);
        line-height: var(--leading-snug);
        padding: var(--size-1) var(--size-3);
        transition: background var(--transition-fast), color var(--transition-fast);
    }

    @media (hover: hover) and (pointer: fine) {
        .tag:hover {
            background: var(--blue-400);
            color: var(--blue-900);
        }
    }

    .tagRemove {
        align-items: center;
        display: flex;
    }

    .tagTextInput {
        color: var(--blue-50);
        background: transparent;
        border: none;
        flex: 1;
        font-size: var(--text-sm);
        font-weight: var(--font-weight-medium);
        line-height: var(--leading-snug);
        min-width: 18ch;
        outline: none;
        padding: var(--size-1);
    }

    .tagTextInput::placeholder {
        color: var(--blue-100);
    }

    .genreWrapper {
        position: relative;
    }

    .genreDropdown {
        background: var(--color-bg-frosted);
        backdrop-filter: var(--bg-frosted-3xl);
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-2xl);
        left: 0;
        margin-top: var(--size-1);
        overflow: hidden;
        position: absolute;
        right: 0;
        top: 100%;
        z-index: 100;
    }

    .genreDropdownContent {
        background: var(--color-bg-frosted-selected);
        height: fit-content;
        max-height: 16rem;
        overflow-y: auto;
        overscroll-behavior: contain;
        padding: var(--size-2);
        scrollbar-width: thin;
    }

    .genreOption {
        align-items: center;
        background: none;
        border: none;
        border-radius: var(--radius-lg);
        color: var(--blue-100);
        display: flex;
        font-size: var(--text-sm);
        font-weight: var(--font-weight-medium);
        justify-content: space-between;
        padding: var(--size-3);
        text-align: left;
        transition: background var(--transition-fast), color var(--transition-fast);
        width: 100%;
    }

    @media (hover: hover) and (pointer: fine) {
        .genreOption:hover {
            background: var(--color-bg-frosted-unselected);
            color: var(--blue-50);
        }
    }

    /* movie details collapsible */
    .movieDetails {
        background: var(--blue-900);
        border-radius: var(--radius-xl);
        overflow: hidden;
        transition: background var(--transition-fast);
    }

    .movieDetails::details-content {
        height: 0;
        overflow: clip;
        transition: height var(--transition-normal), content-visibility var(--transition-normal) allow-discrete;
    }

    @supports (interpolate-size: allow-keywords) {
        .movieDetails {
            interpolate-size: allow-keywords;
        }

        .movieDetails[open]::details-content {
            height: auto;
        }
    }

    .movieDetailsHeader {
        align-items: center;
        cursor: pointer;
        display: flex;
        gap: var(--size-6);
        justify-content: space-between;
        padding: var(--size-4) var(--size-6);
        transition: background var(--transition-fast), color var(--transition-fast);

        @media (min-width: 30rem) {
            padding: var(--size-6);
        }

        @media (min-width: 40rem) {
            padding: var(--size-8);
        }
    }

    .movieDetailsHeader::-webkit-details-marker {
        display: none;
    }

    @media (hover: hover) and (pointer: fine) {
        .movieDetailsHeader:hover {
            /* background: var(--blue-800); */
            color: var(--blue-50);
        }
    }

    .detailsHeaderIcon {
        align-items: center;
        display: flex;
        font-size: var(--text-xl);
        transition: rotate var(--transition-fast);
    }

    .movieDetails[open] {
        background: var(--blue-800);

        .movieDetailsHeader {
            color: var(--blue-50);
        }

        .detailsHeaderIcon {
            rotate: 180deg;
        }
    }

    .movieDetailsContent {
        display: flex;
        flex-direction: column;
        gap: var(--size-6);
        padding: var(--size-1) var(--size-4) var(--size-4) var(--size-4);

        @media (min-width: 30rem) {
            padding: var(--size-1) var(--size-6) var(--size-6) var(--size-6);
        }

        @media (min-width: 40rem) {
            padding: 0 var(--size-8) var(--size-8) var(--size-8);
        }
    }

    /* Helper links */
    .helperLink {
        align-items: center;
        color: var(--blue-200);
        display: flex;
        font-size: var(--text-xs);
        gap: var(--size-1);
        line-height: var(--leading-tighter);
        text-decoration-line: underline;
        text-decoration-thickness: 0.0625em;
        text-underline-offset: 0.25em;
        transition: color var(--transition-fast);

        @media (hover: hover) and (pointer: fine) {
            &:hover {
                color: var(--blue-50);
            }
        }
    }

    .helperLinkIcon {
        align-items: center;
        display: flex;
        font-size: var(--text-sm);
    }

    .previewLink {
        align-items: center;
        display: flex;
        color: var(--blue-200);
        font-size: var(--text-2xs);
        font-weight: var(--font-weight-bold);
        gap: var(--size-1);
        letter-spacing: var(--tracking-widest);
        line-height: var(--leading-tighter);
        text-transform: uppercase;
        transition: color var(--transition-fast);

        @media (hover: hover) and (pointer: fine) {
            &:hover {
                color: var(--blue-50);
            }
        }
    }

    .previewLinkIcon {
        align-items: center;
        display: flex;
        font-size: var(--text-xs);
    }

    .btnView,
    .btnChange {
        align-items: center;
        align-self: start;
        background: var(--blue-300);
        border-radius: var(--radius-full);
        color: var(--blue-800);
        display: flex;
        flex-shrink: 0;
        font-size: var(--text-2xs);
        font-weight: var(--font-weight-bold);
        gap: var(--size-1);
        letter-spacing: var(--tracking-widest);
        line-height: var(--leading-tighter);
        padding: var(--size-2) var(--size-5);
        text-transform: uppercase;
        transition: background-color var(--transition-fast), color var(--transition-fast);

        @media (min-width: 30rem) {
            align-self: auto;
        }
    }

    .btnChange {
        background: var(--yellow-300);
        color: var(--yellow-800);
    }

    .viewIcon,
    .changeIcon {
        align-items: center;
        display: flex;
    }

    @media (hover: hover) and (pointer: fine) {
        .btnView:hover {
            background: var(--blue-400);
            color: var(--blue-900);
        }

        .btnChange:hover {
            background: var(--yellow-400);
            color: var(--yellow-900);
        }
    }

    .submit {
        background: linear-gradient(transparent, oklch(from var(--blue-950) l c h / 0.75));
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
        background: var(--green-300);
        border-radius: var(--radius-full);
        box-shadow: var(--shadow-lg);
        color: var(--green-800);
        display: flex;
        font-weight: var(--font-weight-bold);
        font-size: var(--text-xs);
        gap: var(--size-2);
        justify-content: center;
        letter-spacing: var(--tracking-widest);
        line-height: var(--leading-tighter);
        padding: var(--size-5) var(--size-6);
        text-transform: uppercase;
        transition: background var(--transition-fast), color var(--transition-fast);
        width: 100%;

        @media (hover: hover) and (pointer: fine) {
            &:not(:disabled):hover {
                background: var(--green-400);
                color: var(--green-900);
            }
        }
    }

    .btnSubmit:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    /* Messages */
    .errorMsg {
        color: var(--color-error);
        font-size: var(--text-sm);
        margin: 0;
    }

    .emptyMsg {
        margin-top: var(--size-2);
    }

    /* Cast editor */
    .castList {
        display: flex;
        flex-direction: column;
        gap: var(--size-1);
        margin-top: var(--size-2);
    }

    .castMove {
        transition: transform var(--transition-slow);
    }

    .castList+.btnSecondary {
        margin-top: var(--size-2);
    }

    .castMember {
        background: var(--color-frosted-input);
        border-radius: var(--radius-lg);
        display: flex;
        flex-direction: column;
        gap: var(--size-4);
        padding: var(--size-3);

        @media (min-width: 30rem) {
            align-items: start;
            flex-direction: row;
            padding: var(--size-4);
        }

        @media (min-width: 40rem) {
            gap: var(--size-5);
            padding: var(--size-5);
        }
    }

    .castPhoto {
        background-color: var(--blue-700);
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-xl);
        display: block;
        flex-shrink: 0;
        overflow: hidden;
        width: 4.5rem;

        img {
            aspect-ratio: 3 / 4;
            object-fit: cover;
            object-position: 0 25%;
            width: 100%;
        }
    }

    .silhouette {
        aspect-ratio: 3 / 4;
        align-items: center;
        color: var(--blue-800);
        display: flex;
        font-size: var(--text-6xl);
        justify-content: center;
    }

    .castContent {
        @media (min-width: 30rem) {
            flex: 1;
            margin-top: calc(var(--size-2) * -1);
        }
    }

    .castField {
        border-bottom: 1px solid var(--blue-800);
        display: flex;
        flex-direction: column;
        transition: border-color var(--transition-fast);

        &:focus-within .fieldLabel {
            color: var(--blue-50);
        }

        &:has(.castInput:focus) {
            border-color: var(--blue-600);
        }

        @media (min-width: 30rem) {
            align-items: center;
            flex-direction: row;
        }

        .fieldLabel {
            font-size: var(--text-2xs);

            @media (min-width: 30rem) {
                flex: 0 0 14ch;
            }
        }
    }

    .castField+.castField {
        margin-top: var(--size-2);

        @media (min-width: 30rem) {
            margin-top: 0;
        }
    }

    .castInput {
        appearance: auto;
        background: none;
        border: none;
        color: var(--blue-50);
        font-size: var(--text-sm);
        outline: none;
        padding: var(--size-2) 0;

        @media (min-width: 30rem) {
            flex: 1;
            padding-block: var(--size-3);
        }
    }

    .castInput::placeholder {
        color: var(--blue-700);
    }

    .castUtilities {
        display: flex;
        flex-wrap: wrap;
        gap: var(--size-4) var(--size-6);
        margin-top: var(--size-4);
    }

    .castUtility {
        align-items: center;
        background: transparent;
        border: none;
        color: var(--yellow-400);
        cursor: pointer;
        display: flex;
        font-size: var(--text-2xs);
        font-weight: var(--font-weight-bold);
        gap: var(--size-1);
        line-height: var(--leading-tighter);
        letter-spacing: var(--tracking-widest);
        text-transform: uppercase;
        transition: color var(--transition-fast);

        @media (hover:hover) and (pointer: fine) {
            &:not(:disabled):hover {
                color: var(--yellow-300);
            }
        }

        &:disabled {
            cursor: default;
            opacity: 0.5;
        }
    }

    .castMoveDown {
        margin-right: auto;
    }

    .castRemove {
        color: var(--red-400);

        @media (hover:hover) and (pointer: fine) {
            &:not(:disabled):hover {
                color: var(--red-300);
            }
        }
    }

    .castUtilityIcon {
        align-items: center;
        display: flex;
        font-size: var(--text-xs);
    }

    .btnSecondary {
        align-items: center;
        background: var(--blue-300);
        border-radius: var(--radius-full);
        color: var(--blue-800);
        display: flex;
        font-weight: var(--font-weight-bold);
        font-size: var(--text-2xs);
        gap: var(--size-2);
        justify-content: center;
        letter-spacing: var(--tracking-widest);
        line-height: var(--leading-tighter);
        padding: var(--size-4) var(--size-5);
        text-transform: uppercase;
        transition: background var(--transition-fast), color var(--transition-fast);
        width: 100%;

        @media (hover: hover) and (pointer: fine) {
            &:not(:disabled):hover {
                background: var(--blue-400);
                color: var(--blue-900);
            }
        }

        &:disabled {
            background: var(--blue-700);
            color: var(--blue-500);
            cursor: not-allowed;
            opacity: 0.5;
        }
    }

    .btnIcon {
        align-items: center;
        display: flex;
    }

    .fieldLabel+.btnSecondary {
        margin-top: var(--size-2);
    }

    /* ─── Preview Popover ─── */
    .previewPopover {
        background: none;
        border: none;
        inset: 0;
        margin: auto;
        max-width: min(48rem, calc(100dvw - 2rem));
        opacity: 0;
        overflow: visible;
        padding: 0;
        position: fixed;
        translate: 0 var(--size-8);
        transition:
            display var(--transition-normal) allow-discrete,
            opacity var(--transition-normal),
            overlay var(--transition-normal) allow-discrete,
            translate var(--transition-normal);
        width: fit-content;
    }

    .previewPopover:popover-open {
        opacity: 1;
        translate: 0 0;
    }

    @starting-style {
        .previewPopover:popover-open {
            opacity: 0;
            translate: 0 var(--size-4);
        }
    }

    .previewPopover::backdrop {
        backdrop-filter: var(--bg-frosted-sm);
        background: oklch(from var(--blue-950) l c h / 0.75);
        opacity: 0;
        transition:
            display allow-discrete,
            opacity var(--transition-slow),
            overlay allow-discrete;
    }

    .previewPopover:popover-open::backdrop {
        opacity: 1;
    }

    @starting-style {
        .previewPopover:popover-open::backdrop {
            opacity: 0;
        }
    }

    .previewModal {
        overflow: hidden;
        position: relative;
    }

    .previewCloseBtn {
        align-items: center;
        background: oklch(from var(--blue-950) l c h / 0.6);
        border-radius: var(--radius-full);
        color: var(--blue-200);
        display: flex;
        font-size: var(--text-xl);
        height: var(--size-9);
        justify-content: center;
        position: absolute;
        right: var(--size-3);
        top: var(--size-3);
        transition: color var(--transition-fast);
        width: var(--size-9);
        z-index: 1;
    }

    @media (hover: hover) and (pointer: fine) {
        .previewCloseBtn:hover {
            color: var(--blue-50);
        }
    }

    .previewEmbed {
        aspect-ratio: 16 / 9;
        border: none;
        box-shadow: var(--shadow-2xl);
        max-width: 100%;
    }

    .previewImg {
        box-shadow: var(--shadow-2xl);
        display: block;
    }

    .previewCaption {
        color: var(--blue-200);
        font-size: var(--text-xs);
        font-weight: var(--font-weight-bold);
        letter-spacing: var(--tracking-widest);
        margin-top: var(--size-6);
        text-transform: uppercase;
        text-align: center;
    }
</style>
