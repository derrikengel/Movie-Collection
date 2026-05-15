<template>
    <MovieGrid :movies="movies" :emptyMessage="emptyMessage" defaultWatchedMode="show" defaultIgnoredMode="show"
        whenAddedSortLabel="Recently Watched" />
</template>

<script setup>
    import { computed } from 'vue'
    import MovieGrid from '@/components/grid/MovieGrid.vue'
    import { useMoviesStore } from '@/stores/movies'
    import { useUserMoviesStore } from '@/stores/userMovies'
    import { useResolvedUser } from '@/composables/useResolvedUser'
    import { usePageTitle } from '@/composables/usePageTitle'

    const moviesStore = useMoviesStore()
    const userMoviesStore = useUserMoviesStore()
    const { resolvedProfile } = useResolvedUser()

    const firstName = computed(() => resolvedProfile.value?.display_name?.split(' ')[0] ?? '')

    usePageTitle(computed(() =>
        firstName.value ? `${firstName.value}'s Watched | Movie Collection` : 'Watched | Movie Collection'
    ))

    const emptyMessage = computed(() =>
        firstName.value ? `${firstName.value} hasn't watched anything yet.` : 'No watched movies yet.'
    )

    const movies = computed(() => {
        const userId = resolvedProfile.value?.id
        if (!userId) return []
        return userMoviesStore.allUserMovies
            .filter(um => um.user_id === userId && um.watched)
            .map(um => {
                const movie = moviesStore.movies.find(m => m.id === um.movie_id)
                if (!movie) return null
                return { ...movie, _added_at: um.watched_at }
            })
            .filter(Boolean)
    })
</script>
