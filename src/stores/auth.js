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

    async function fetchAllProfiles() {
        const { data } = await supabase
            .from('profiles')
            .select('id, display_name')
        if (data) allProfiles.value = data
    }

    async function init() {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
            user.value = session.user
            await fetchProfile(session.user.id)
        }
        initialized.value = true

        supabase.auth.onAuthStateChange((_event, session) => {
            user.value = session?.user ?? null
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
        await fetchProfile(data.user.id)
    }

    async function logout() {
        await supabase.auth.signOut()
    }

    return { user, profile, allProfiles, initialized, isAdmin, displayName, init, fetchAllProfiles, login, logout }
})
