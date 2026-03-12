import { computed } from 'vue'
import { useUserMoviesStore } from '@/stores/userMovies'

export function useListCounts() {
    const userMoviesStore = useUserMoviesStore()
    const watchlistCount = computed(() => userMoviesStore.userMovies.filter(m => m.watchlist).length)
    const favoritesCount = computed(() => userMoviesStore.userMovies.filter(m => m.favorite).length)
    return { watchlistCount, favoritesCount }
}
