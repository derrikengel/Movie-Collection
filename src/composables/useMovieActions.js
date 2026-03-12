import { ref, computed, onUnmounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useUserMoviesStore } from '@/stores/userMovies'

export function useMovieActions(movieRef) {
    const auth = useAuthStore()
    const userMoviesStore = useUserMoviesStore()

    const userMovie = computed(() =>
        movieRef.value ? userMoviesStore.getForMovie(movieRef.value.id) : null
    )

    const sheetOpen = ref(false)
    const loginPrompt = ref(false)
    let loginPromptTimer = null

    const actions = [
        {
            field: 'watched',
            label: 'Watched',
            icon: `<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path d="M10 3C5.5 3 1.73 5.61 0 9.5 1.73 13.39 5.5 16 10 16s8.27-2.61 10-6.5C18.27 5.61 14.5 3 10 3zm0 11a4.5 4.5 0 1 1 0-9 4.5 4.5 0 0 1 0 9zm0-7a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5z"/></svg>`,
        },
        {
            field: 'watchlist',
            label: 'Watchlist',
            icon: `<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path d="M5 2a2 2 0 0 0-2 2v14l7-3 7 3V4a2 2 0 0 0-2-2H5z"/></svg>`,
        },
        {
            field: 'favorite',
            label: 'Favorite',
            icon: `<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 0 0 .95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.368 2.448a1 1 0 0 0-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118l-3.368-2.448a1 1 0 0 0-1.175 0l-3.368 2.448c-.784.57-1.838-.197-1.539-1.118l1.287-3.957a1 1 0 0 0-.364-1.118L2.063 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 0 0 .95-.69l1.286-3.957z"/></svg>`,
        },
        {
            field: 'ignored',
            label: 'Ignore',
            icon: `<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM8.28 7.22a.75.75 0 0 0-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 1 0 1.06 1.06L10 11.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L11.06 10l1.72-1.72a.75.75 0 0 0-1.06-1.06L10 8.94 8.28 7.22z" clip-rule="evenodd"/></svg>`,
        },
    ]

    function isActive(field) {
        return userMovie.value?.[field] === true
    }

    async function handleAction(field) {
        if (!auth.user) {
            showLoginPrompt()
            return
        }
        await userMoviesStore.toggle(auth.user.id, movieRef.value.id, field)
    }

    function showLoginPrompt() {
        loginPrompt.value = true
        clearTimeout(loginPromptTimer)
        loginPromptTimer = setTimeout(() => { loginPrompt.value = false }, 3000)
    }

    onUnmounted(() => clearTimeout(loginPromptTimer))

    return { sheetOpen, loginPrompt, actions, isActive, handleAction }
}
