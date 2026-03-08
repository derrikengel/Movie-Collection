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

    // Optimistic update
    if (existing) {
      existing[field] = newValue
    } else {
      userMovies.value.push({ user_id: userId, movie_id: movieId, watchlist: false, watched: false, favorite: false, ignored: false, [field]: newValue })
    }

    const { error } = await supabase
      .from('user_movies')
      .upsert({ user_id: userId, movie_id: movieId, [field]: newValue, updated_at: new Date().toISOString() }, { onConflict: 'user_id,movie_id' })

    // Rollback on failure
    if (error) {
      if (existing) {
        existing[field] = currentValue
      } else {
        userMovies.value = userMovies.value.filter(m => m.movie_id !== movieId)
      }
      throw error
    }
  }

  function clear() {
    userMovies.value = []
  }

  return { userMovies, fetchUserMovies, getForMovie, toggle, clear }
})
