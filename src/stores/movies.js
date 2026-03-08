import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '@/lib/supabase'

export const useMoviesStore = defineStore('movies', () => {
  const movies = ref([])
  const loading = ref(false)
  const error = ref(null)

  async function fetchMovies() {
    loading.value = true
    error.value = null

    const { data, error: err } = await supabase
      .from('movies')
      .select('*, movie_services(*)')
      .order('title')

    if (err) {
      error.value = err.message
    } else {
      movies.value = data
    }

    loading.value = false
  }

  return { movies, loading, error, fetchMovies }
})
