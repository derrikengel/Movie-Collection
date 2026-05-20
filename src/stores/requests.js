import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'
import { generateSlug, releaseYear } from '@/lib/movies'

export const useRequestsStore = defineStore('requests', () => {
    const requests = ref([])
    const loading = ref(false)
    const fetched = ref(false)

    const requestByTmdbId = computed(() =>
        Object.fromEntries(requests.value.filter(r => r.tmdb_id).map(r => [r.tmdb_id, r]))
    )

    async function fetchRequests() {
        loading.value = true
        try {
            const { data, error } = await supabase
                .from('movie_requests')
                .select('*, request_wants(user_id, created_at)')
                .order('created_at', { ascending: true })
            if (error) throw error
            requests.value = (data ?? []).map(r => ({
                ...r,
                wants: (r.request_wants ?? []).sort(
                    (a, b) => new Date(a.created_at) - new Date(b.created_at)
                ),
            }))
            fetched.value = true
        } finally {
            loading.value = false
        }
    }

    async function addRequest(tmdbData) {
        const { useAuthStore } = await import('@/stores/auth')
        const { useToastStore } = await import('@/stores/toast')
        const auth = useAuthStore()
        const toast = useToastStore()
        const userId = auth.user?.id
        if (!userId) return

        const existing = requestByTmdbId.value[tmdbData.tmdb_id]
        if (existing) {
            if (existing.wants.some(w => w.user_id === userId)) {
                toast.show('You already requested this movie', { type: 'info' })
                return
            }
            const firstWanterName = auth.allProfiles.find(
                p => p.id === existing.wants[0]?.user_id
            )?.display_name ?? 'someone'

            const want = { user_id: userId, created_at: new Date().toISOString() }
            existing.wants.push(want)

            const { error } = await supabase
                .from('request_wants')
                .insert({ request_id: existing.id, user_id: userId })
            if (error) {
                existing.wants = existing.wants.filter(w => w.user_id !== userId)
                toast.error('Failed to add request')
                throw error
            }
            toast.show(`Already requested by ${firstWanterName}. Added your want.`, { type: 'info' })
            return
        }

        const slug = generateSlug(tmdbData.title, releaseYear(tmdbData.release_date))
        const { data: newRequest, error: reqError } = await supabase
            .from('movie_requests')
            .insert({
                tmdb_id: tmdbData.tmdb_id,
                slug,
                title: tmdbData.title,
                release_date: tmdbData.release_date || null,
                runtime_minutes: tmdbData.runtime_minutes || null,
                description: tmdbData.description || null,
                genres: tmdbData.genres ?? [],
                mpaa_rating: tmdbData.mpaa_rating || null,
                tmdb_rating: tmdbData.tmdb_rating || null,
                poster_path: tmdbData.poster_path || null,
                backdrop_path: tmdbData.backdrop_path || null,
                trailer_youtube_id: tmdbData.trailer_youtube_id || null,
                cast_members: tmdbData.cast_members?.length ? tmdbData.cast_members : null,
            })
            .select()
            .single()
        if (reqError) {
            toast.error('Failed to add request')
            throw reqError
        }

        const { error: wantError } = await supabase
            .from('request_wants')
            .insert({ request_id: newRequest.id, user_id: userId })
        if (wantError) {
            await supabase.from('movie_requests').delete().eq('id', newRequest.id)
            toast.error('Failed to add want')
            throw wantError
        }

        requests.value.push({
            ...newRequest,
            wants: [{ user_id: userId, created_at: new Date().toISOString() }],
        })
        toast.success(`${tmdbData.title} added to requests`)
    }

    async function toggleWant(requestId) {
        const { useAuthStore } = await import('@/stores/auth')
        const { useToastStore } = await import('@/stores/toast')
        const auth = useAuthStore()
        const toast = useToastStore()
        const userId = auth.user?.id
        if (!userId) return

        const request = requests.value.find(r => r.id === requestId)
        if (!request) return

        const isWanted = request.wants.some(w => w.user_id === userId)
        const prevWants = [...request.wants]

        if (isWanted) {
            request.wants = request.wants.filter(w => w.user_id !== userId)

            if (request.wants.length === 0) {
                const reqIndex = requests.value.findIndex(r => r.id === requestId)
                requests.value.splice(reqIndex, 1)

                const { error } = await supabase
                    .from('movie_requests')
                    .delete()
                    .eq('id', requestId)
                if (error) {
                    requests.value.splice(reqIndex, 0, { ...request, wants: prevWants })
                    toast.error('Failed to delete request')
                    throw error
                }
            } else {
                const { error } = await supabase
                    .from('request_wants')
                    .delete()
                    .eq('request_id', requestId)
                    .eq('user_id', userId)
                if (error) {
                    request.wants = prevWants
                    toast.error('Failed to remove want')
                    throw error
                }
            }
        } else {
            request.wants.push({ user_id: userId, created_at: new Date().toISOString() })

            const { error } = await supabase
                .from('request_wants')
                .insert({ request_id: requestId, user_id: userId })
            if (error) {
                request.wants = prevWants
                toast.error('Failed to add want')
                throw error
            }
        }
    }

    async function removeRequest(requestId, { silent = false } = {}) {
        const { useToastStore } = await import('@/stores/toast')
        const toast = useToastStore()
        const reqIndex = requests.value.findIndex(r => r.id === requestId)
        const prevRequest = reqIndex !== -1 ? { ...requests.value[reqIndex] } : null
        if (reqIndex !== -1) requests.value.splice(reqIndex, 1)

        const { error } = await supabase
            .from('movie_requests')
            .delete()
            .eq('id', requestId)
        if (error) {
            if (prevRequest) requests.value.splice(reqIndex, 0, prevRequest)
            toast.error('Failed to remove request')
            throw error
        }
        if (!silent) toast.show('Request removed', { type: 'success' })
    }

    return { requests, loading, fetched, requestByTmdbId, fetchRequests, addRequest, toggleWant, removeRequest }
})
