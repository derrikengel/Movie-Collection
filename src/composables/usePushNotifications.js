import { ref } from 'vue'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth'

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY

function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
    const rawData = atob(base64)
    return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)))
}

function getPermission() {
    if (!('Notification' in window)) return 'unsupported'
    return Notification.permission
}

const isSubscribed = ref(false)
const permissionStatus = ref(getPermission())

export function usePushNotifications() {
    const auth = useAuthStore()

    async function loadSubscriptionState() {
        if (!auth.user) return
        const { data } = await supabase
            .from('push_subscriptions')
            .select('id')
            .eq('user_id', auth.user.id)
            .maybeSingle()
        isSubscribed.value = !!data
    }

    async function subscribe() {
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) return
        if (!auth.user) return

        const permission = await Notification.requestPermission()
        permissionStatus.value = permission
        if (permission !== 'granted') return

        const registration = await navigator.serviceWorker.ready
        const existingSub = await registration.pushManager.getSubscription()
        const subscription = existingSub ?? await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
        })

        const subJson = subscription.toJSON()
        const { data: savedRow } = await supabase
            .from('push_subscriptions')
            .select('id')
            .eq('user_id', auth.user.id)
            .filter('subscription->>endpoint', 'eq', subJson.endpoint)
            .maybeSingle()
        if (!savedRow) {
            await supabase.from('push_subscriptions').insert({
                user_id: auth.user.id,
                subscription: subJson,
            })
        }

        isSubscribed.value = true
    }

    async function unsubscribe() {
        if (!('serviceWorker' in navigator)) return
        if (!auth.user) return

        const registration = await navigator.serviceWorker.ready
        const subscription = await registration.pushManager.getSubscription()
        if (subscription) {
            const endpoint = subscription.toJSON().endpoint
            await subscription.unsubscribe()
            await supabase
                .from('push_subscriptions')
                .delete()
                .eq('user_id', auth.user.id)
                .filter('subscription->>endpoint', 'eq', endpoint)
        }

        isSubscribed.value = false
    }

    return { permissionStatus, isSubscribed, loadSubscriptionState, subscribe, unsubscribe }
}
