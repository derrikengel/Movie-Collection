import { precacheAndRoute } from 'workbox-precaching'

precacheAndRoute(self.__WB_MANIFEST)

self.addEventListener('push', (event) => {
    const data = event.data?.json() ?? {}
    const payload = data.data ?? {}
    const actions = data.actions ?? []

    event.waitUntil(
        self.registration.showNotification(data.title ?? 'Movie Collection', {
            body: data.body ?? '',
            icon: data.icon,
            image: data.image,
            badge: data.badge,
            actions,
            data: payload,
        })
    )
})

self.addEventListener('notificationclick', (event) => {
    event.notification.close()
    const data = event.notification.data ?? {}

    const moviePath = typeof data.url === 'string' && data.url.startsWith('/') ? data.url : '/'
    const streamUrl = typeof data.watchUrl === 'string' && data.watchUrl.startsWith('http') ? data.watchUrl : null
    const path = event.action === 'watch' && streamUrl ? streamUrl : moviePath

    const absoluteUrl = path.startsWith('http') ? path : self.location.origin + path
    const isExternal = !absoluteUrl.startsWith(self.location.origin)

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
            if (isExternal) return clients.openWindow(absoluteUrl)
            const existing = windowClients.find(c => c.url.startsWith(self.location.origin))
            if (existing) {
                existing.postMessage({ type: 'navigate', url: absoluteUrl })
                return existing.focus()
            }
            return clients.openWindow(absoluteUrl)
        })
    )
})
