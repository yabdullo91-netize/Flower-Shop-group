/* Service Worker — Цветочный 🌸 */

self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', e => e.waitUntil(clients.claim()))

self.addEventListener('push', e => {
  const data = e.data?.json() ?? {}
  e.waitUntil(
    self.registration.showNotification(data.title ?? 'Цветочный 🌸', {
      body:    data.body   ?? '',
      icon:    '/favicon.ico',
      badge:   '/favicon.ico',
      tag:     data.tag    ?? 'order',
      vibrate: [100, 50, 100],
      data:    { url: data.url ?? '/account' },
    })
  )
})

self.addEventListener('notificationclick', e => {
  e.notification.close()
  const url = e.notification.data?.url ?? '/'
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      const existing = list.find(c => c.url.includes(url))
      if (existing) return existing.focus()
      return clients.openWindow(url)
    })
  )
})
