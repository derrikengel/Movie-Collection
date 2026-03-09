import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '@/lib/supabase'
import Fuse from 'fuse.js'

export const useMoviesStore = defineStore('movies', () => {
  const movies = ref([])
  const loading = ref(false)
  const error = ref(null)
  let fuse = null

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
      fuse = new Fuse(data, {
        keys: ['title', 'search_keywords'],
        threshold: 0.3,
        minMatchCharLength: 2,
      })
    }

    loading.value = false
  }

  function search(query) {
    if (!query || !fuse) return movies.value
    return fuse.search(query).map(r => r.item)
  }

  return { movies, loading, error, fetchMovies, search }
})
