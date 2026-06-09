import { precacheAndRoute } from 'workbox-precaching'

precacheAndRoute(self.__WB_MANIFEST)

self.addEventListener('push', (event) => {
    const data = event.data?.json() ?? {}
    const actions = data.actions ?? []

    event.waitUntil(
        self.registration.showNotification(data.title ?? 'Movie Collection', {
            body: data.body ?? '',
            icon: data.icon,
            image: data.image,
            badge: '/icon-192.png',
            actions,
            data: data.data,
        })
    )
})

self.addEventListener('notificationclick', (event) => {
    event.notification.close()
    const data = event.notification.data ?? {}
    const url = event.action === 'watch' && data.watchUrl
        ? data.watchUrl
        : (data.url ?? '/')

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
            const existing = windowClients.find(c => c.url.includes(url))
            if (existing) return existing.focus()
            return clients.openWindow(url)
        })
    )
})
