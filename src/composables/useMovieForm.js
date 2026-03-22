import { ref, reactive, computed, watch } from 'vue'
import { nowLocal, toLocalDatetime } from '@/lib/datetime'
import { releaseYear } from '@/lib/movies'

export const genreSuggestions = [
    'Action', 'Adventure', 'Animation', 'Christmas', 'Comedy',
    'Crime', 'Documentary', 'Drama', 'Fantasy', 'Halloween',
    'History', 'Horror', 'Kids & Family', 'Music', 'Musical',
    'Mystery', 'Romance', 'Science Fiction', 'Thriller',
    'War', 'Western',
]

export const discOptions = ['4K Blu-ray', 'Blu-ray', 'DVD']

export const serviceOptions = [
    { value: 'fandango_at_home', label: 'Fandango at Home', brandClass: 'svc-fandango-at-home' },
    { value: 'movies_anywhere', label: 'Movies Anywhere', brandClass: 'svc-movies-anywhere' },
    { value: 'apple_tv', label: 'Apple TV', brandClass: 'svc-apple-tv' },
    { value: 'youtube', label: 'YouTube', brandClass: 'svc-youtube' },
    { value: 'plex', label: 'Plex', brandClass: 'svc-plex' },
]

export function useMovieForm() {
    const form = reactive({
        tmdb_id: null,
        title: '',
        release_date: '',
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
        services: [
            { service: 'fandango_at_home', quality: '', url: '' },
            { service: 'movies_anywhere', quality: '', url: '' },
            { service: 'apple_tv', quality: '', url: '' },
            { service: 'youtube', quality: '', url: '' },
            { service: 'plex', quality: '', url: '' },
        ],
    })

    const genreInput = ref('')

    const trailerSearchUrl = computed(() => {
        if (!form.title) return 'https://www.youtube.com/results?search_query='
        const q = encodeURIComponent(`${form.title} (${releaseYear(form.release_date)}) trailer`)
        return `https://www.youtube.com/results?search_query=${q}`
    })

    // Auto-add when user picks from datalist
    watch(genreInput, (val) => {
        if (genreSuggestions.includes(val.trim())) addGenre()
    })

    function populateFromMovie(movie) {
        form.tmdb_id = movie.tmdb_id
        form.title = movie.title
        form.release_date = movie.release_date
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
        const existingMap = Object.fromEntries(
            (movie.movie_services ?? []).map(svc => [svc.service, svc])
        )
        form.services = [
            'fandango_at_home', 'movies_anywhere', 'apple_tv', 'youtube', 'plex',
        ].map(key => ({
            id: existingMap[key]?.id,
            service: key,
            quality: existingMap[key]?.quality ?? '',
            url: existingMap[key]?.url ?? '',
        }))
    }

    function addGenre() {
        const val = genreInput.value.trim()
        if (val && !form.genres.includes(val)) form.genres.push(val)
        genreInput.value = ''
    }

    function removeGenre(i) {
        form.genres.splice(i, 1)
    }

    function getService(value) {
        return form.services.find(svc => svc.service === value) ?? null
    }

    function isServiceActive(value) {
        const svc = getService(value)
        return !!(svc?.quality || svc?.url)
    }

    function serviceSearchUrl(service) {
        const q = encodeURIComponent(`${form.title} (${releaseYear(form.release_date)})`)
        const urls = {
            fandango_at_home: `https://athome.fandango.com/content/browse/search?searchString=${q}`,
            apple_tv: `https://tv.apple.com/search?term=${q}`,
            youtube: `https://www.youtube.com/results?search_query=${q}`,
            plex: `https://app.plex.tv/desktop/#!/search?query=${q}`,
            movies_anywhere: `https://moviesanywhere.com/search?q=${q}`,
        }
        return urls[service] ?? null
    }

    return {
        form,
        genreInput,
        trailerSearchUrl,
        populateFromMovie,
        addGenre,
        removeGenre,
        getService,
        isServiceActive,
        serviceSearchUrl,
    }
}
