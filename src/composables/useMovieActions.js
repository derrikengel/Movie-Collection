import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useUserMoviesStore } from '@/stores/userMovies'
import { useToastStore } from '@/stores/toast'
import watchedIcon from '@/assets/icons/eye.svg?raw'
import watchlistIcon from '@/assets/icons/bookmark.svg?raw'
import favoriteIcon from '@/assets/icons/heart.svg?raw'
import ignoredIcon from '@/assets/icons/ignore.svg?raw'
import userIcon from '@/assets/icons/user.svg?raw'

const listLabels = {
    watched: 'Watched',
    watchlist: 'Watchlist',
    favorite: 'Favorites',
    ignored: 'Ignored',
}

const listRoutes = {
    watched: { name: 'watched' },
    watchlist: { name: 'watchlist' },
    favorite: { name: 'favorites' },
    ignored: { name: 'ignored' },
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
            icon: watchedIcon,
            listClass: 'list-watched',
        },
        {
            field: 'watchlist',
            label: 'Watchlist',
            icon: watchlistIcon,
            listClass: 'list-watchlist',
        },
        {
            field: 'favorite',
            label: 'Favorite',
            icon: favoriteIcon,
            listClass: 'list-favorite',
        },
        {
            field: 'ignored',
            label: 'Ignore',
            icon: ignoredIcon,
            listClass: 'list-ignored',
        },
    ]

    function isActive(field) {
        return userMovie.value?.[field] === true
    }


    async function handleAction(field) {
        if (!auth.user) {
            toast.error('to save movies to your lists', {
                icon: userIcon,
                action: { label: 'Sign in', to: { name: 'login' }, before: true }
            })
            return
        }

        const wasActive = isActive(field)
        const title = movieRef.value?.title ?? 'Movie'
        const list = listLabels[field] ?? field
        const route = listRoutes[field]
        const icon = actions.find(a => a.field === field)?.icon

        try {
            await userMoviesStore.toggle(auth.user.id, movieRef.value.id, field)
            if (wasActive) {
                toast.success(`${title} removed from`, {
                    icon: icon,
                    action: { label: list, to: route }
                })
            } else {
                toast.success(`${title} added to`, {
                    icon: icon,
                    action: { label: list, to: route }
                })
            }
        } catch {
            toast.error('Something went wrong — try again', { type: 'error' })
        }
    }

    return { actions, isActive, handleAction }
}
