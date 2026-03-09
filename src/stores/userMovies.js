import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '@/lib/supabase'

export const useUserMoviesStore = defineStore('userMovies', () => {
  const userMovies = ref([])

  async function fetchUserMovies(userId) {
    const { data, error } = await supabase
      .from('user_movies')
      .select('*')
      .eq('user_id', userId)

    if (!error) userMovies.value = data
  }

  function getForMovie(movieId) {
    return userMovies.value.find(m => m.movie_id === movieId) ?? null
  }

  async function toggle(userId, movieId, field) {
    const existing = getForMovie(movieId)
    const currentValue = existing?.[field] ?? false
    const newValue = !currentValue

    // Build the full row to upsert
    const row = {
        user_id: userId,
        movie_id: movieId,
        watchlist: existing?.watchlist ?? false,
        watched: existing?.watched ?? false,
        favorite: existing?.favorite ?? false,
        ignored: existing?.ignored ?? false,
        updated_at: new Date().toISOString(),
        [field]: newValue,
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
  }

  return { userMovies, fetchUserMovies, getForMovie, toggle, clear }
})
