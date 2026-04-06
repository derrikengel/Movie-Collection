import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useNavContextStore = defineStore('navContext', () => {
    const contextMovies = ref([])
    const sourceList = ref(null)

    function setContext(movies, routeName) {
        contextMovies.value = movies
        sourceList.value = routeName ?? null
    }

    return { contextMovies, sourceList, setContext }
})
