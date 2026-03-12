import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/lib/supabase'
import { useMoviesStore } from '@/stores/movies'

export function useMovieSubmit(form, isEditMode, getRouteSlug) {
    const submitting = ref(false)
    const submitError = ref('')
    const router = useRouter()
    const moviesStore = useMoviesStore()

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
        if (!form.mpaa_rating) return submitError.value = 'MPAA Rating is required — open Movie Details to set it.'
        if (form.genres.length === 0) return submitError.value = 'At least one genre is required — open Movie Details to add genres.'
        if (!form.description.trim()) return submitError.value = 'Description is required — open Movie Details to add it.'
        if (!form.acquired_at) return submitError.value = 'Date acquired is required.'

        const activeServices = form.services.filter(svc => svc.quality || svc.url)
        const hasDisc = !!form.disc_format
        if (!activeServices.length && !hasDisc) {
            return submitError.value = 'Add at least one digital service or a disc format.'
        }

        for (const svc of activeServices) {
            if (!svc.quality) return submitError.value = `Quality is required for ${svc.service}.`
            if (!svc.url) return submitError.value = `URL is required for ${svc.service}.`
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
                const existing = moviesStore.movies.find(m => m.slug === getRouteSlug())
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

            const validServices = form.services.filter(svc => svc.quality || svc.url)
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
            console.error('Movie submit failed:', err)
            submitError.value = err.message || err.details || String(err)
        } finally {
            submitting.value = false
        }
    }

    return { submitting, submitError, handleSubmit }
}
