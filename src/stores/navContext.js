import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

const SOURCE_LABELS = {
    home: 'Movies',
    watchlist: 'Watchlist',
    watched: 'Watched',
    favorites: 'Favorites',
    ignored: 'Ignored',
    requests: 'Requests',
}

export const useNavContextStore = defineStore('navContext', () => {
    const contextMovies = ref([])
    const sourceList = ref(null)
    const sourceParams = ref({})

    const sourceLabel = computed(() => SOURCE_LABELS[sourceList.value] ?? null)

    function setContext(movies, routeName, routeParams = {}) {
        contextMovies.value = movies
        sourceList.value = routeName ?? null
        sourceParams.value = routeParams
    }

    return { contextMovies, sourceList, sourceParams, sourceLabel, setContext }
})
