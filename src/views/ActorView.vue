<template>
    <MovieGrid :movies="movies" emptyMessage="No movies found." defaultIgnoredMode="show" defaultSort="billing-asc"
        defaultSortLabel="Top Billing" />
</template>

<script setup>
    import { computed, watch } from 'vue'
    import { useRouter } from 'vue-router'
    import MovieGrid from '@/components/grid/MovieGrid.vue'
    import { useResolvedActor } from '@/composables/useResolvedActor'
    import { usePageTitle } from '@/composables/usePageTitle'

    const router = useRouter()
    const { actorName, movies, notFound } = useResolvedActor()

    usePageTitle(computed(() =>
        actorName.value ? `${actorName.value} | Movie Collection` : 'Movie Collection'
    ))

    watch(notFound, (isNotFound) => {
        if (isNotFound) router.push({ name: 'home' })
    })
</script>
