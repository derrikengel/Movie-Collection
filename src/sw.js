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
            badge: data.badge,
            actions,
            data: data.data,
        })
    )
})

self.addEventListener('notificationclick', (event) => {
    event.notification.close()
    const data = event.notification.data ?? {}
    const path = event.action === 'watch' && data.watchUrl
        ? data.watchUrl
        : (data.url ?? '/')

    const absoluteUrl = path.startsWith('http') ? path : self.location.origin + path
    const isExternal = !absoluteUrl.startsWith(self.location.origin)

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
            if (isExternal) return clients.openWindow(absoluteUrl)
            const existing = windowClients.find(c => c.url.startsWith(self.location.origin))
            if (existing) return existing.navigate(absoluteUrl).then(() => existing.focus())
            return clients.openWindow(absoluteUrl)
        })
    )
})
