<template>
  <div :class="s.page">
    <h1 :class="s.pageTitle">{{ isEditMode ? 'Edit Movie' : 'Add Movie' }}</h1>

    <!-- TMDB Search (add mode only) -->
    <section v-if="!isEditMode && !formReady" :class="s.section">
      <label :class="s.fieldLabel">Search TMDB</label>
      <div :class="s.searchRow">
        <input
          v-model="tmdbQuery"
          type="search"
          placeholder="Search for a movie…"
          :class="s.input"
          @keydown.enter.prevent="searchTmdb"
          :disabled="tmdbSearching"
        />
        <button :class="s.btnPrimary" @click="searchTmdb" :disabled="tmdbSearching || !tmdbQuery">
          {{ tmdbSearching ? 'Searching…' : 'Search' }}
        </button>
      </div>

      <div v-if="tmdbResults.length" :class="s.tmdbResults">
        <button
          v-for="result in tmdbResults"
          :key="result.id"
          :class="s.tmdbResult"
          @click="selectTmdb(result)"
        >
          <img
            v-if="result.poster_path"
            :src="`https://image.tmdb.org/t/p/w92${result.poster_path}`"
            :alt="result.title"
            :class="s.tmdbResultPoster"
          />
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

      <div :class="s.selectedBar">
        <img
          v-if="form.poster_path"
          :src="`https://image.tmdb.org/t/p/w92${form.poster_path}`"
          :class="s.selectedPoster"
        />
        <div :class="s.selectedInfo">
          <strong>{{ form.title }}</strong> ({{ form.year }})
        </div>
        <button v-if="!isEditMode" type="button" :class="s.btnGhost" @click="resetTmdb">Change</button>
        <RouterLink v-else :to="`/${route.params.slug}`" :class="s.btnGhost">View</RouterLink>
      </div>

      <div :class="s.field">
        <label :class="s.fieldLabel">Title <span :class="s.required">*</span></label>
        <input v-model="form.title" type="text" :class="s.input" required />
      </div>

      <div :class="s.fieldRow">
        <div :class="s.field">
          <label :class="s.fieldLabel">Year <span :class="s.required">*</span></label>
          <input v-model="form.year" type="number" :class="s.input" required />
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
          <label :class="s.fieldLabel">Disc Format</label>
          <select v-model="form.disc_format" :class="s.input">
            <option value=""></option>
            <option>4K Blu-ray</option>
            <option>Blu-ray</option>
            <option>DVD</option>
          </select>
        </div>
      </div>

      <div :class="s.field">
        <label :class="s.fieldLabel">TMDB Rating</label>
        <input v-model="form.tmdb_rating" type="number" step="0.1" min="0" max="10" :class="s.input" />
      </div>

      <div :class="s.field">
        <label :class="s.fieldLabel">Genres <span :class="s.required">*</span></label>
        <div :class="s.tagInput">
          <span v-for="(genre, i) in form.genres" :key="genre" :class="s.tag">
            {{ genre }}
            <button type="button" :class="s.tagRemove" @click="removeGenre(i)">×</button>
          </span>
          <input
            v-model="genreInput"
            type="text"
            :class="s.tagTextInput"
            placeholder="Add genre…"
            @keydown.enter.prevent="addGenre"
            @keydown.comma.prevent="addGenre"
            list="genre-suggestions"
          />
        </div>
        <datalist id="genre-suggestions">
          <option v-for="g in genreSuggestions" :key="g" :value="g" />
        </datalist>
      </div>

      <div :class="s.field">
        <label :class="s.fieldLabel">Description <span :class="s.required">*</span></label>
        <textarea v-model="form.description" :class="[s.input, s.textarea]" rows="4" required />
      </div>

      <div :class="s.field">
        <label :class="s.fieldLabel">YouTube Trailer ID</label>
        <div :class="s.inputWithLink">
          <input v-model="form.trailer_youtube_id" type="text" :class="s.input" placeholder="e.g. dQw4w9WgXcQ" />
          <a :href="trailerSearchUrl" target="_blank" rel="noopener noreferrer" :class="s.helperLink">
            Search YouTube ↗
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

      <div :class="s.field">
        <label :class="s.fieldLabel">Services <span :class="s.required">*</span></label>

        <div v-for="(service, i) in form.services" :key="i" :class="s.serviceRow">
          <div :class="s.serviceTop">
            <select v-model="service.service" :class="s.input">
              <option value="">— Service —</option>
              <option
                v-for="svc in availableServices(i)"
                :key="svc.value"
                :value="svc.value"
              >{{ svc.label }}</option>
            </select>
            <select v-model="service.quality" :class="[s.input, s.qualitySelect]">
              <option value="">— Quality —</option>
              <option>4K</option>
              <option>HD</option>
              <option>SD</option>
            </select>
            <button type="button" :class="s.btnRemove" @click="removeService(i)">✕</button>
          </div>
          <div :class="s.serviceBottom">
            <input v-model="service.url" type="url" :class="s.input" placeholder="URL" />
            <a
              v-if="serviceSearchUrl(service.service)"
              :href="serviceSearchUrl(service.service)"
              target="_blank"
              rel="noopener noreferrer"
              :class="s.helperLink"
            >↗</a>
          </div>
        </div>

        <button type="button" :class="s.btnGhost" @click="addService">+ Add Service</button>
      </div>

      <div :class="s.field">
        <label :class="s.fieldLabel">Notes</label>
        <input v-model="form.notes" type="text" :class="s.input" />
      </div>

      <div :class="s.field">
        <label :class="s.fieldLabel">Date Acquired <span :class="s.required">*</span></label>
        <input v-model="form.acquired_at" type="datetime-local" :class="s.input" required />
      </div>

      <p v-if="submitError" :class="s.errorMsg">{{ submitError }}</p>

      <button type="submit" :class="[s.btnPrimary, s.btnSubmit]" :disabled="submitting">
        {{ submitting ? (isEditMode ? 'Saving…' : 'Adding…') : (isEditMode ? 'Save Changes' : 'Add Movie') }}
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { supabase } from '@/lib/supabase'
import { useMoviesStore } from '@/stores/movies'

const route = useRoute()
const router = useRouter()
const moviesStore = useMoviesStore()

const isEditMode = computed(() => !!route.params.slug)
const formReady = ref(false)

// TMDB search state
const tmdbQuery = ref('')
const tmdbResults = ref([])
const tmdbSearching = ref(false)
const tmdbSearched = ref(false)

const form = reactive({
  tmdb_id: null,
  title: '',
  year: '',
  runtime_minutes: '',
  mpaa_rating: '',
  disc_format: '',
  tmdb_rating: '',
  description: '',
  trailer_youtube_id: '',
  poster_path: '',
  backdrop_path: '',
  genres: [],
  notes: '',
  acquired_at: nowLocal(),
  services: [],
})

const genreInput = ref('')
const submitting = ref(false)
const submitError = ref('')

const genreSuggestions = [
  'Action', 'Adventure', 'Animation', 'Christmas', 'Comedy',
  'Crime', 'Documentary', 'Drama', 'Fantasy', 'Halloween',
  'History', 'Horror', 'Kids & Family', 'Music', 'Musical',
  'Mystery', 'Romance', 'Science Fiction', 'Thriller',
  'War', 'Western',
]

const allServices = [
  { value: 'fandango_at_home', label: 'Fandango at Home' },
  { value: 'apple_tv',         label: 'Apple TV' },
  { value: 'youtube',          label: 'YouTube' },
  { value: 'plex',             label: 'Plex' },
  { value: 'movies_anywhere',  label: 'Movies Anywhere' },
]

function nowLocal() {
  const d = new Date()
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
  return d.toISOString().slice(0, 16)
}

function toLocalDatetime(isoString) {
  if (!isoString) return nowLocal()
  const d = new Date(isoString)
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
  return d.toISOString().slice(0, 16)
}

onMounted(() => {
  if (isEditMode.value) {
    const movie = moviesStore.movies.find(m => m.slug === route.params.slug)
    if (movie) populateFromMovie(movie)
  }
})

function populateFromMovie(movie) {
  form.tmdb_id = movie.tmdb_id
  form.title = movie.title
  form.year = movie.year
  form.runtime_minutes = movie.runtime_minutes
  form.mpaa_rating = movie.mpaa_rating ?? ''
  form.disc_format = movie.disc_format ?? ''
  form.tmdb_rating = movie.tmdb_rating
  form.description = movie.description ?? ''
  form.trailer_youtube_id = movie.trailer_youtube_id ?? ''
  form.poster_path = movie.poster_path ?? ''
  form.backdrop_path = movie.backdrop_path ?? ''
  form.genres = [...(movie.genres ?? [])]
  form.notes = movie.notes ?? ''
  form.acquired_at = toLocalDatetime(movie.acquired_at)
  form.services = (movie.movie_services ?? []).map(s => ({
    id: s.id,
    service: s.service,
    quality: s.quality ?? '',
    url: s.url ?? '',
  }))
  formReady.value = true
}

const trailerSearchUrl = computed(() => {
  if (!form.title) return 'https://www.youtube.com/results?search_query='
  const q = encodeURIComponent(`${form.title} (${form.year}) trailer`)
  return `https://www.youtube.com/results?search_query=${q}`
})

async function searchTmdb() {
  if (!tmdbQuery.value) return
  tmdbSearching.value = true
  tmdbSearched.value = false
  tmdbResults.value = []
  try {
    const res = await fetch(
      `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(tmdbQuery.value)}&language=en-US&page=1`,
      { headers: { Authorization: `Bearer ${import.meta.env.VITE_TMDB_TOKEN}` } }
    )
    const data = await res.json()
    tmdbResults.value = data.results?.slice(0, 5) ?? []
    tmdbSearched.value = true
  } finally {
    tmdbSearching.value = false
  }
}

async function selectTmdb(result) {
  const [details, releases, videos] = await Promise.all([
    fetch(`https://api.themoviedb.org/3/movie/${result.id}?language=en-US`, {
      headers: { Authorization: `Bearer ${import.meta.env.VITE_TMDB_TOKEN}` }
    }).then(r => r.json()),
    fetch(`https://api.themoviedb.org/3/movie/${result.id}/release_dates`, {
      headers: { Authorization: `Bearer ${import.meta.env.VITE_TMDB_TOKEN}` }
    }).then(r => r.json()),
    fetch(`https://api.themoviedb.org/3/movie/${result.id}/videos?language=en-US`, {
      headers: { Authorization: `Bearer ${import.meta.env.VITE_TMDB_TOKEN}` }
    }).then(r => r.json()),
  ])

  const usRelease = releases.results?.find(r => r.iso_3166_1 === 'US')
  const certification = usRelease?.release_dates?.find(d => d.certification)?.certification ?? ''
  const trailer = videos.results?.find(v => v.type === 'Trailer' && v.site === 'YouTube')

  form.tmdb_id = details.id
  form.title = details.title
  form.year = new Date(details.release_date).getFullYear()
  form.runtime_minutes = details.runtime
  form.mpaa_rating = certification
  form.tmdb_rating = parseFloat(details.vote_average.toFixed(1))
  form.description = details.overview
  form.poster_path = details.poster_path ?? ''
  form.backdrop_path = details.backdrop_path ?? ''
  form.genres = details.genres.map(g => g.name)
  form.trailer_youtube_id = trailer?.key ?? ''
  formReady.value = true
}

function resetTmdb() {
  formReady.value = false
  tmdbResults.value = []
  tmdbSearched.value = false
  tmdbQuery.value = ''
}

watch(genreInput, (val) => {
  if (genreSuggestions.includes(val.trim())) addGenre()
})

function addGenre() {
  const val = genreInput.value.trim()
  if (val && !form.genres.includes(val)) form.genres.push(val)
  genreInput.value = ''
}

function removeGenre(i) {
  form.genres.splice(i, 1)
}

function addService() {
  form.services.push({ service: '', quality: '', url: '' })
}

function removeService(i) {
  form.services.splice(i, 1)
}

function availableServices(currentIndex) {
  const selected = form.services
    .map((svc, i) => i !== currentIndex ? svc.service : null)
    .filter(Boolean)
  return allServices.filter(svc => !selected.includes(svc.value))
}

function serviceSearchUrl(service) {
  const q = encodeURIComponent(`${form.title} (${form.year})`)
  const urls = {
    fandango_at_home: `https://athome.fandango.com/content/browse/search?searchString=${q}`,
    apple_tv:         `https://tv.apple.com/search?term=${q}`,
    youtube:          `https://www.youtube.com/results?search_query=${q}`,
    plex:             `https://app.plex.tv/desktop/#!/search?query=${q}`,
    movies_anywhere:  `https://moviesanywhere.com/search?q=${q}`,
  }
  return urls[service] ?? null
}

function generateSlug(title, year) {
  return `${title}-${year}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function generateSearchKeywords(title) {
  let kw = title.toLowerCase()
  kw = kw.replace(/[:.,'"\-]/g, ' ')
  kw = kw.replace(/&/g, 'and')
  kw = kw.replace(/\bvs\.?\b/g, 'vs versus')
  kw = kw.replace(/\bthe\b|\ba\b|\ban\b/g, '')
  kw = kw.replace(/\s+/g, ' ').trim()
  return kw
}

async function handleSubmit() {
  submitError.value = ''

  if (!form.title.trim()) return submitError.value = 'Title is required.'
  if (!form.poster_path.trim()) return submitError.value = 'Poster is required.'
  if (!form.year) return submitError.value = 'Year is required.'
  if (!form.runtime_minutes) return submitError.value = 'Runtime is required.'
  if (!form.mpaa_rating) return submitError.value = 'MPAA Rating is required.'
  if (form.genres.length === 0) return submitError.value = 'At least one genre is required.'
  if (!form.description.trim()) return submitError.value = 'Description is required.'
  if (!form.acquired_at) return submitError.value = 'Date acquired is required.'

  const hasService = form.services.some(s => s.service)
  const hasDisc = !!form.disc_format
  if (!hasService && !hasDisc) {
    return submitError.value = 'Add at least one digital service or a disc format.'
  }

  for (const svc of form.services) {
    if (svc.service && !svc.quality) {
      return submitError.value = `Quality is required for ${svc.service}.`
    }
    if (svc.service && !svc.url) {
      return submitError.value = `URL is required for ${svc.service}.`
    }
  }

  submitting.value = true

  try {
    const slug = generateSlug(form.title, form.year)
    const search_keywords = generateSearchKeywords(form.title)
    const movieData = {
      tmdb_id: form.tmdb_id,
      title: form.title,
      slug,
      search_keywords,
      year: form.year || null,
      runtime_minutes: form.runtime_minutes || null,
      mpaa_rating: form.mpaa_rating || null,
      disc_format: form.disc_format || null,
      tmdb_rating: form.tmdb_rating || null,
      description: form.description || null,
      poster_path: form.poster_path || null,
      backdrop_path: form.backdrop_path || null,
      trailer_youtube_id: form.trailer_youtube_id || null,
      genres: form.genres,
      notes: form.notes || null,
      acquired_at: new Date(form.acquired_at).toISOString(),
    }

    let movieId

    if (isEditMode.value) {
      const existing = moviesStore.movies.find(m => m.slug === route.params.slug)
      const { data: movie, error: movieError } = await supabase
        .from('movies')
        .update(movieData)
        .eq('id', existing.id)
        .select()
        .single()
      if (movieError) throw movieError
      movieId = movie.id

      // Replace all service rows
      await supabase.from('movie_services').delete().eq('movie_id', movieId)
    } else {
      const { data: movie, error: movieError } = await supabase
        .from('movies')
        .insert(movieData)
        .select()
        .single()
      if (movieError) throw movieError
      movieId = movie.id
    }

    const validServices = form.services.filter(s => s.service)
    if (validServices.length) {
      const { error: servicesError } = await supabase
        .from('movie_services')
        .insert(validServices.map(svc => ({
          movie_id: movieId,
          service: svc.service,
          quality: svc.quality || null,
          url: svc.url || null,
        })))
      if (servicesError) throw servicesError
    }

    await moviesStore.fetchMovies()
    router.push(`/${slug}`)
  } catch (err) {
    submitError.value = err.message
  } finally {
    submitting.value = false
  }
}
</script>

<style module="s">
.page {
  container-type: inline-size;
  padding: var(--content-padding);
  max-width: 640px;
  margin: 0 auto;
}

.pageTitle {
  font-size: var(--text-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin-bottom: var(--space-6);
}

.section {
  margin-bottom: var(--space-6);
}

.searchRow {
  display: flex;
  gap: var(--space-2);
}

.tmdbResults {
  margin-top: var(--space-3);
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.tmdbResult {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3);
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  cursor: pointer;
  text-align: left;
  width: 100%;
  transition: border-color var(--transition-fast), background var(--transition-fast);
}

.tmdbResult:hover {
  background: var(--color-bg-elevated);
  border-color: var(--color-border-strong);
}

.tmdbResultPoster {
  width: 40px;
  height: 60px;
  object-fit: cover;
  border-radius: var(--radius-sm);
  flex-shrink: 0;
  background: var(--color-bg-elevated);
}

.tmdbResultPosterEmpty {
  display: block;
}

.tmdbResultInfo {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.tmdbResultTitle {
  font-size: var(--text-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.tmdbResultYear {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}

.selectedBar {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  margin-bottom: var(--space-5);
}

.selectedPoster {
  width: 32px;
  height: 48px;
  object-fit: cover;
  border-radius: var(--radius-sm);
  flex-shrink: 0;
}

.selectedInfo {
  flex: 1;
  font-size: var(--text-sm);
  color: var(--color-text-primary);
}

.form {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.field {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.fieldRow {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-3);
}

.fieldLabel {
  font-size: var(--text-xs);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.required {
  color: var(--color-error);
}

.input {
  width: 100%;
  padding: var(--space-3) var(--space-4);
  font-size: var(--text-base);
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-primary);
  outline: none;
  transition: border-color var(--transition-fast);
  appearance: auto;
}

.input::placeholder {
  color: var(--color-text-muted);
}

.input:focus {
  border-color: var(--color-border-strong);
}

.textarea {
  resize: vertical;
  font-family: inherit;
  line-height: var(--leading-normal);
}

.tagInput {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  min-height: 44px;
  align-items: center;
  cursor: text;
}

.tag {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  background: var(--color-accent-subtle);
  border: 1px solid var(--color-accent-muted);
  color: var(--color-accent);
  border-radius: var(--radius-full);
  padding: var(--space-1) var(--space-3);
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
  color: var(--color-text-primary);
  min-width: 120px;
  flex: 1;
}

.tagTextInput::placeholder {
  color: var(--color-text-muted);
}

.serviceRow {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding: var(--space-3);
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  margin-bottom: var(--space-2);
}

.serviceTop {
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: var(--space-2);
  align-items: center;
}

.qualitySelect {
  width: 90px;
}

.serviceBottom {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.serviceBottom .input {
  flex: 1;
}

.inputWithLink {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.inputWithLink .input {
  flex: 1;
}

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

.btnPrimary {
  padding: var(--space-3) var(--space-5);
  font-size: var(--text-base);
  font-weight: var(--font-weight-semibold);
  background: var(--color-accent);
  color: var(--color-text-inverse);
  border: none;
  border-radius: var(--radius-md);
  white-space: nowrap;
  transition: background var(--transition-fast);
}

.btnPrimary:hover:not(:disabled) {
  background: var(--color-accent-bright);
}

.btnPrimary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btnGhost {
  padding: var(--space-2) var(--space-4);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  background: none;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
  transition: border-color var(--transition-fast), color var(--transition-fast);
  display: inline-flex;
  align-items: center;
}

.btnGhost:hover {
  border-color: var(--color-border-strong);
  color: var(--color-text-primary);
}

.btnRemove {
  background: none;
  border: none;
  color: var(--color-text-muted);
  font-size: var(--text-base);
  padding: var(--space-1);
  display: flex;
  align-items: center;
  transition: color var(--transition-fast);
}

.btnRemove:hover {
  color: var(--color-error);
}

.btnSubmit {
  margin-top: var(--space-2);
  width: 100%;
}

.errorMsg {
  font-size: var(--text-sm);
  color: var(--color-error);
}

.emptyMsg {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  margin-top: var(--space-2);
}
</style>
