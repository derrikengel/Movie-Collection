import { ref } from 'vue'

export function useTmdbSearch() {
    const tmdbQuery = ref('')
    const tmdbResults = ref([])
    const tmdbSearching = ref(false)
    const tmdbSearched = ref(false)

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

    // Returns a populated data object — caller merges into form via Object.assign
    async function selectTmdb(result) {
        const [details, releases, videos, credits] = await Promise.all([
            fetch(`https://api.themoviedb.org/3/movie/${result.id}?language=en-US`, {
                headers: { Authorization: `Bearer ${import.meta.env.VITE_TMDB_TOKEN}` }
            }).then(r => r.json()),
            fetch(`https://api.themoviedb.org/3/movie/${result.id}/release_dates`, {
                headers: { Authorization: `Bearer ${import.meta.env.VITE_TMDB_TOKEN}` }
            }).then(r => r.json()),
            fetch(`https://api.themoviedb.org/3/movie/${result.id}/videos?language=en-US`, {
                headers: { Authorization: `Bearer ${import.meta.env.VITE_TMDB_TOKEN}` }
            }).then(r => r.json()),
            fetch(`https://api.themoviedb.org/3/movie/${result.id}/credits`, {
                headers: { Authorization: `Bearer ${import.meta.env.VITE_TMDB_TOKEN}` }
            }).then(r => r.json()),
        ])

        const cast_members = (credits.cast ?? []).slice(0, 10).map(({ name, character, profile_path }) => ({
            name,
            character,
            profile_path: profile_path ?? '',
        }))

        const usRelease = releases.results?.find(r => r.iso_3166_1 === 'US')
        const certification = usRelease?.release_dates?.find(d => d.certification)?.certification ?? ''
        const trailer = videos.results?.find(v => v.type === 'Trailer' && v.site === 'YouTube')

        return {
            tmdb_id: details.id,
            title: details.title,
            release_date: details.release_date ?? '',
            runtime_minutes: details.runtime,
            mpaa_rating: certification,
            tmdb_rating: parseFloat(details.vote_average.toFixed(1)),
            description: details.overview,
            poster_path: details.poster_path ?? '',
            backdrop_path: details.backdrop_path ?? '',
            genres: details.genres.map(g => g.name).filter(g => g !== 'TV Movie'),
            trailer_youtube_id: trailer?.key ?? '',
            cast_members,
        }
    }

    // Resets only TMDB state — formReady stays in the view
    function resetTmdb() {
        tmdbQuery.value = ''
        tmdbResults.value = []
        tmdbSearched.value = false
    }

    return { tmdbQuery, tmdbResults, tmdbSearching, tmdbSearched, searchTmdb, selectTmdb, resetTmdb }
}
