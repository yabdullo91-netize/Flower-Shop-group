import { useCallback } from 'react'
import { usePushStore } from './store'
import { toast } from '@/shared/ui/toast.store'
import { i18n } from '@/shared/lib/i18n'

const isSupported =
  typeof window !== 'undefined' &&
  'serviceWorker' in navigator &&
  'Notification' in window

export function usePushNotifications() {
  const { isSubscribed, setSubscribed, markAsked } = usePushStore()

  const subscribe = useCallback(async (): Promise<boolean> => {
    markAsked()
    if (!isSupported) {
      toast.error(i18n.t('push.not_supported'))
      return false
    }
    try {
      await navigator.serviceWorker.register('/sw.js', { scope: '/' })
      await navigator.serviceWorker.ready
      const perm = await Notification.requestPermission()
      if (perm !== 'granted') {
        toast.info(i18n.t('push.declined'))
        return false
      }
      setSubscribed(true)
      toast.success(i18n.t('push.enabled'))
      return true
    } catch {
      toast.error(i18n.t('push.enable_failed'))
      return false
    }
  }, [setSubscribed, markAsked])

  const unsubscribe = useCallback(async () => {
    try {
      const reg = await navigator.serviceWorker.getRegistration()
      const sub = await reg?.pushManager?.getSubscription()
      await sub?.unsubscribe()
    } catch { /* ignore */ }
    setSubscribed(false)
    toast.info(i18n.t('push.disabled'))
  }, [setSubscribed])

  /** Показать локальное push-уведомление через Service Worker */
  const notify = useCallback(async (title: string, body: string, url = '/account') => {
    if (!isSubscribed || Notification.permission !== 'granted') return
    try {
      const reg = await navigator.serviceWorker.ready
      await reg.showNotification(title, {
        body,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        data: { url },
      })
    } catch { /* ignore */ }
  }, [isSubscribed])

  return { isSupported, isSubscribed, subscribe, unsubscribe, notify }
}
