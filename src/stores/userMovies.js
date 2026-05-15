import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '@/lib/supabase'

const timestampField = {
    watchlist: 'watchlist_added_at',
    watched: 'watched_at',
    favorite: 'favorited_at',
    ignored: 'ignored_at',
}

export const useUserMoviesStore = defineStore('userMovies', () => {
    const userMovies = ref([])
    const allUserMovies = ref([])

    async function fetchUserMovies(userId) {
        const { data, error } = await supabase
            .from('user_movies')
            .select('*')
            .eq('user_id', userId)

        if (!error) userMovies.value = data
    }

    async function fetchAllUserMovies() {
        const { data, error } = await supabase
            .from('user_movies')
            .select('user_id, movie_id, watchlist, watched, favorite, ignored')

        if (!error) allUserMovies.value = data
    }

    function getForMovie(movieId) {
        return userMovies.value.find(m => m.movie_id === movieId) ?? null
    }

    async function toggle(userId, movieId, field) {
        const existing = getForMovie(movieId)
        const currentValue = existing?.[field] ?? false
        const newValue = !currentValue
        const tsField = timestampField[field]

        // Build the full row to upsert
        const row = {
            user_id: userId,
            movie_id: movieId,
            watchlist: existing?.watchlist ?? false,
            watched: existing?.watched ?? false,
            favorite: existing?.favorite ?? false,
            ignored: existing?.ignored ?? false,
            watchlist_added_at: existing?.watchlist_added_at ?? null,
            watched_at: existing?.watched_at ?? null,
            favorited_at: existing?.favorited_at ?? null,
            ignored_at: existing?.ignored_at ?? null,
            updated_at: new Date().toISOString(),
            [field]: newValue,
            [tsField]: newValue ? new Date().toISOString() : null,
        }

        // Optimistic update
        if (existing) {
            existing[field] = newValue
        } else {
            userMovies.value.push({ ...row })
        }

        const { data, error } = await supabase
            .from('user_movies')
            .upsert(row, { onConflict: 'user_id,movie_id' })
            .select()
            .single()

        if (error) {
            if (existing) {
                existing[field] = currentValue
            } else {
                userMovies.value = userMovies.value.filter(m => m.movie_id !== movieId)
            }
            throw error
        }

        if (!existing) {
            const optimistic = getForMovie(movieId)
            if (optimistic) Object.assign(optimistic, data)
        }
    }

    function clear() {
        userMovies.value = []
        allUserMovies.value = []
    }

    return { userMovies, allUserMovies, fetchUserMovies, fetchAllUserMovies, getForMovie, toggle, clear }
})
