import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useMoviesStore } from '@/stores/movies'
import { slugifyActor } from '@/lib/movies'

export function useResolvedActor() {
    const route = useRoute()
    const moviesStore = useMoviesStore()

    const canonical = computed(() => {
        const slug = route.params.actorSlug
        if (!slug) return null
        for (const movie of moviesStore.movies) {
            for (const member of movie.cast_members ?? []) {
                if (slugifyActor(member.name, member.profile_path) === slug) {
                    return { name: member.name, profilePath: member.profile_path }
                }
            }
        }
        return null
    })

    const actorName = computed(() => canonical.value?.name ?? null)
    const actorProfilePath = computed(() => canonical.value?.profilePath ?? null)

    // A movie belongs to this actor if it has a cast credit with the same profile_path
    // (when the actor has a photo), or the same name (fallback for actors with no photo).
    const movies = computed(() => {
        if (!canonical.value) return []
        const { name, profilePath } = canonical.value
        return moviesStore.movies
            .map(movie => {
                const index = (movie.cast_members ?? []).findIndex(member =>
                    profilePath ? member.profile_path === profilePath : (member.name === name && !member.profile_path)
                )
                if (index === -1) return null
                return { ...movie, _billing_rank: index }
            })
            .filter(Boolean)
    })

    const notFound = computed(() =>
        !!route.params.actorSlug && moviesStore.movies.length > 0 && canonical.value === null
    )

    return { actorName, actorProfilePath, movies, notFound }
}
