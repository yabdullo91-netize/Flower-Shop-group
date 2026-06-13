import { Suspense, useEffect } from 'react'
import { Outlet, ScrollRestoration, useLocation } from 'react-router-dom'
import { AnimatePresence, MotionConfig, motion, useScroll, useSpring } from 'framer-motion'
import { Header } from './Header'
import { Footer } from './Footer'
import { BottomNav } from './BottomNav'
import { BackToTop } from './BackToTop'
import { CartDrawer } from '@/features/cart/CartDrawer'
import { CartFlyAnimator } from './CartFlyAnimator'
import { AuthModal } from '@/features/auth/AuthModal'
import { QuickView } from '@/features/quickView/QuickView'
import { CookieConsent } from '@/features/cookieConsent/CookieConsent'
import { ToastContainer } from '@/shared/ui/Toast'
import { useThemeStore, applyTheme } from '@/features/theme/store'

function PageLoader() {
  return (
    <div className="flex-1 flex items-center justify-center min-h-[60svh]">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        className="w-8 h-8 rounded-full border-2 border-border border-t-green-deep"
      />
    </div>
  )
}

function ScrollProgressBar() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 200, damping: 30, restDelta: 0.001 })
  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-0.75 bg-green-deep origin-left z-200 pointer-events-none"
      style={{ scaleX }}
    />
  )
}

export function Layout() {
  const location = useLocation()
  const theme = useThemeStore(s => s.theme)

  // Keep <html> class in sync with store (covers system theme changes too)
  useEffect(() => {
    applyTheme(theme)

    if (theme === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)')
      const handler = () => applyTheme('system')
      mq.addEventListener('change', handler)
      return () => mq.removeEventListener('change', handler)
    }
  }, [theme])

  return (
    <MotionConfig reducedMotion="user">
      <ScrollProgressBar />
      <div className="flex flex-col min-h-svh bg-cream text-ink">
        <Header />

        <AnimatePresence mode="wait" initial={false}>
          <motion.main
            key={location.pathname}
            className="flex-1 pb-14 md:pb-0"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
          >
            <Suspense fallback={<PageLoader />}>
              <Outlet />
            </Suspense>
          </motion.main>
        </AnimatePresence>

        <Footer />
        <BottomNav />
        <BackToTop />
        <CartDrawer />
        <AuthModal />
        <QuickView />
        <CookieConsent />
        <CartFlyAnimator />
        <ToastContainer />
        <ScrollRestoration />
      </div>
    </MotionConfig>
  )
}
