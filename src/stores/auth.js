import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'

export const useAuthStore = defineStore('auth', () => {
    const user = ref(null)
    const profile = ref(null)
    const allProfiles = ref([])
    const initialized = ref(false)

    const isAdmin = computed(() => profile.value?.is_admin === true)
    const displayName = computed(() => profile.value?.display_name ?? null)

    async function fetchProfile(userId) {
        const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single()
        profile.value = data
    }

    const profileOrder = ['Derrik', 'Mary', 'Grayce', 'Gretchen']

    // The E2E test account is a real profiles row (see CONTEXT.md's "Test Account") so it can log
    // in and use the app normally, but must never appear to anyone else — not in "Other User
    // Lists", the community "X wants to watch this" rows, or the requests filter. Excluding it
    // here, at the single source `allProfiles` everything else reads from, covers all of those at
    // once. It still sees itself, so its own profile page keeps working when it's signed in.
    async function fetchAllProfiles() {
        const { data } = await supabase
            .from('profiles')
            .select('id, display_name, avatar')
        if (data) {
            const testProfileId = import.meta.env.VITE_TEST_PROFILE_ID
            const visible = data.filter(p => p.id !== testProfileId || p.id === user.value?.id)
            allProfiles.value = visible.sort((a, b) => {
                const ai = profileOrder.indexOf(a.display_name)
                const bi = profileOrder.indexOf(b.display_name)
                return (ai === -1 ? Infinity : ai) - (bi === -1 ? Infinity : bi)
            })
        }
    }

    async function updateAvatar(avatarKey) {
        const prev = profile.value?.avatar
        if (profile.value) profile.value.avatar = avatarKey
        const entry = allProfiles.value.find(p => p.id === user.value?.id)
        if (entry) entry.avatar = avatarKey

        const { error } = await supabase
            .from('profiles')
            .update({ avatar: avatarKey })
            .eq('id', user.value.id)

        if (error) {
            if (profile.value) profile.value.avatar = prev
            const rollbackEntry = allProfiles.value.find(p => p.id === user.value?.id)
            if (rollbackEntry) rollbackEntry.avatar = prev
        }
    }

    async function init() {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
            user.value = session.user
            await fetchProfile(session.user.id)
        }
        initialized.value = true

        supabase.auth.onAuthStateChange((event, session) => {
            user.value = session?.user ?? null
            if (event === 'INITIAL_SESSION' || event === 'TOKEN_REFRESHED') return
            if (session?.user) {
                // Defer async Supabase calls via setTimeout to break out of the auth lock context.
                // In Supabase JS v2, onAuthStateChange fires while a navigator.locks lock is held.
                // Awaiting supabase queries inside the callback tries to re-acquire that same lock → deadlock.
                setTimeout(async () => {
                    await fetchProfile(session.user.id)
                    const { useUserMoviesStore } = await import('@/stores/userMovies')
                    const userMovies = useUserMoviesStore()
                    await userMovies.fetchUserMovies(session.user.id)
                    userMovies.fetchAllUserMovies()
                    fetchAllProfiles()
                    const { useRequestsStore } = await import('@/stores/requests')
                    useRequestsStore().fetchRequests()
                }, 0)
            } else {
                profile.value = null
                allProfiles.value = []
                setTimeout(async () => {
                    const { useUserMoviesStore } = await import('@/stores/userMovies')
                    const userMovies = useUserMoviesStore()
                    userMovies.clear()
                }, 0)
            }
        })
    }

    async function login(email, password) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        user.value = data.user
        await fetchProfile(data.user.id)
    }

    async function logout() {
        await supabase.auth.signOut()
    }

    return { user, profile, allProfiles, initialized, isAdmin, displayName, init, fetchAllProfiles, login, logout, updateAvatar }
})
