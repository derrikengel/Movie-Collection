import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { slugifyName } from '@/lib/movies'

export function useResolvedUser() {
    const route = useRoute()
    const auth = useAuthStore()

    const resolvedProfile = computed(() => {
        const nameParam = route.params.name
        if (!nameParam) return null
        return auth.allProfiles.find(p => slugifyName(p.display_name) === nameParam) ?? null
    })

    const notFound = computed(() =>
        auth.initialized &&
        auth.allProfiles.length > 0 &&
        resolvedProfile.value === null
    )

    return { resolvedProfile, notFound }
}
