<template>
    <section v-if="rows.length">
        <ul :class="s.community">
            <li v-for="row in rows" :key="row.field" :class="[s.row, row.listClass]">
                <span v-html="row.icon" :class="s.icon" />
                <span :class="s.message">
                    <template v-for="seg in row.segments" :key="seg.key">
                        <span v-if="seg.type === 'name'" :class="s.name">{{ seg.text }}</span>
                        <template v-else>{{ seg.text }}</template>
                    </template>
                </span>
            </li>
        </ul>
    </section>
</template>

<script setup>
    import { computed } from 'vue'
    import { useAuthStore } from '@/stores/auth'
    import { useUserMoviesStore } from '@/stores/userMovies'
    import watchedIcon from '@/assets/icons/eye.svg?raw'
    import watchlistIcon from '@/assets/icons/bookmark.svg?raw'
    import favoriteIcon from '@/assets/icons/heart.svg?raw'
    import ignoredIcon from '@/assets/icons/ignore.svg?raw'

    const props = defineProps({
        movie: {
            type: Object,
            required: true,
        },
    })

    const auth = useAuthStore()
    const userMoviesStore = useUserMoviesStore()

    const listConfig = [
        {
            field: 'watchlist',
            icon: watchlistIcon,
            listClass: 'list-watchlist',
            verbPhrase: count => count === 1 ? ' wants to watch this' : ' want to watch this',
        },
        {
            field: 'watched',
            icon: watchedIcon,
            listClass: 'list-watched',
            verbPhrase: count => count === 1 ? ' has watched this' : ' have watched this',
        },
        {
            field: 'favorite',
            icon: favoriteIcon,
            listClass: 'list-favorite',
            verbPhrase: count => count === 1 ? ' loves this' : ' love this',
        },
        {
            field: 'ignored',
            icon: ignoredIcon,
            listClass: 'list-ignored',
            verbPhrase: count => count === 1 ? ` doesn't want to watch this` : ` don't want to watch this`,
        },
    ]

    function buildSegments(profiles, verbPhrase) {
        const segments = []
        profiles.forEach((p, i) => {
            if (i > 0) {
                if (profiles.length === 2) {
                    segments.push({ type: 'text', key: `sep-${i}`, text: ' and ' })
                } else if (i < profiles.length - 1) {
                    segments.push({ type: 'text', key: `sep-${i}`, text: ', ' })
                } else {
                    segments.push({ type: 'text', key: `sep-${i}`, text: ', and ' })
                }
            }
            segments.push({ type: 'name', key: p.id, text: p.display_name })
        })
        segments.push({ type: 'text', key: 'verb', text: verbPhrase })
        return segments
    }

    const rows = computed(() => {
        if (!auth.user) return []

        return listConfig.flatMap(config => {
            const profiles = auth.allProfiles
                .filter(p => p.id !== auth.user.id)
                .filter(p => {
                    const entry = userMoviesStore.allUserMovies.find(
                        um => um.user_id === p.id && um.movie_id === props.movie.id
                    )
                    return entry?.[config.field] === true
                })

            if (!profiles.length) return []

            return [{
                field: config.field,
                icon: config.icon,
                listClass: config.listClass,
                segments: buildSegments(profiles, config.verbPhrase(profiles.length)),
            }]
        })
    })
</script>

<style module="s">
    .community {
        display: flex;
        flex-direction: column;
        gap: var(--size-4);
        list-style: none;
        margin-top: var(--size-8);
    }

    .row {
        align-items: center;
        color: var(--color-list-500);
        display: flex;
        gap: var(--size-3);
        line-height: var(--leading-tight);
    }

    .icon {
        align-items: center;
        color: var(--color-list-400);
        display: flex;
        flex-shrink: 0;
        font-size: var(--text-xl);
        justify-content: center;
    }

    .name {
        color: var(--color-list-400);
        font-weight: var(--font-weight-bold);
    }
</style>
