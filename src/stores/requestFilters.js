import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useRequestsStore } from '@/stores/requests'

export const useRequestFiltersStore = defineStore('requestFilters', () => {
    const sortBy = ref('date-requested')
    const filterUserId = ref(null)
    const search = ref('')

    const filteredRequests = computed(() => {
        const requestsStore = useRequestsStore()
        let list = requestsStore.requests

        if (search.value.trim()) {
            const q = search.value.trim().toLowerCase()
            list = list.filter(r => r.title.toLowerCase().includes(q))
        }

        if (filterUserId.value) {
            list = list.filter(r => r.wants.some(w => w.user_id === filterUserId.value))
        }

        if (sortBy.value === 'title') {
            return [...list].sort((a, b) => a.title.localeCompare(b.title))
        }
        if (sortBy.value === 'most-wanted') {
            return [...list].sort((a, b) => b.wants.length - a.wants.length)
        }
        // date-requested: newest first
        return [...list].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    })

    function setSort(value) {
        sortBy.value = value
    }

    function setFilterUser(userId) {
        filterUserId.value = userId ?? null
    }

    return { sortBy, filterUserId, search, filteredRequests, setSort, setFilterUser }
})
