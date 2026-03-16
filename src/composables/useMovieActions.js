import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useUserMoviesStore } from '@/stores/userMovies'
import { useToastStore } from '@/stores/toast'
import watchedIcon from '@/assets/icons/eye.svg?raw'
import watchlistIcon from '@/assets/icons/bookmark.svg?raw'
import favoriteIcon from '@/assets/icons/heart.svg?raw'
import ignoredIcon from '@/assets/icons/ignore.svg?raw'

const listLabels = {
    watched: 'Watched',
    watchlist: 'Watchlist',
    favorite: 'Favorites',
    ignored: 'Ignored',
}

const listRoutes = {
    watched: '/profile/watched',
    watchlist: '/profile/watchlist',
    favorite: '/profile/favorites',
    ignored: '/profile/ignored',
}

export function useMovieActions(movieRef) {
    const auth = useAuthStore()
    const userMoviesStore = useUserMoviesStore()
    const toast = useToastStore()

    const userMovie = computed(() =>
        movieRef.value ? userMoviesStore.getForMovie(movieRef.value.id) : null
    )

    const actions = [
        {
            field: 'watched',
            label: 'Watched',
            icon: watchedIcon
        },
        {
            field: 'watchlist',
            label: 'Watchlist',
            icon: watchlistIcon
        },
        {
            field: 'favorite',
            label: 'Favorite',
            icon: favoriteIcon
        },
        {
            field: 'ignored',
            label: 'Ignore',
            icon: ignoredIcon
        }
    ]

    function isActive(field) {
        return userMovie.value?.[field] === true
    }

    async function handleAction(field) {
        if (!auth.user) {
            toast.show('to save movies to your lists', {
                action: { label: 'Sign in', to: '/login', before: true }
            })
            return
        }

        const wasActive = isActive(field)
        const title = movieRef.value?.title ?? 'Movie'
        const list = listLabels[field] ?? field
        const route = listRoutes[field]

        try {
            await userMoviesStore.toggle(auth.user.id, movieRef.value.id, field)
            if (wasActive) {
                toast.show(`${title} removed from`, { action: { label: list, to: route } })
            } else {
                toast.show(`${title} added to`, { action: { label: list, to: route } })
            }
        } catch {
            toast.show('Something went wrong — try again', { type: 'error' })
        }
    }

    return { actions, isActive, handleAction }
}
