import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useNavContextStore = defineStore('navContext', () => {
    const contextMovies = ref([])
    const sourceList = ref(null)
    const sourceParams = ref({})

    function setContext(movies, routeName, routeParams = {}) {
        contextMovies.value = movies
        sourceList.value = routeName ?? null
        sourceParams.value = routeParams
    }

    return { contextMovies, sourceList, sourceParams, setContext }
})
