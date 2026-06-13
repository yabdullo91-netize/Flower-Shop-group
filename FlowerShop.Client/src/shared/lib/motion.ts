import type { Transition, Variants } from 'framer-motion'

export const EASE_SPRING = [0.22, 1, 0.36, 1] as const

export const spring: Transition = { type: 'spring', stiffness: 320, damping: 28 }

export const springFast: Transition = { type: 'spring', stiffness: 420, damping: 22 }

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.28, ease: EASE_SPRING } },
}

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show:   { opacity: 1, transition: { duration: 0.2 } },
}

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.92 },
  show:   { opacity: 1, scale: 1, transition: { duration: 0.24, ease: EASE_SPRING } },
}

export const slideUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.32, ease: EASE_SPRING } },
}

export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 40 },
  show:   { opacity: 1, x: 0, transition: { duration: 0.3, ease: EASE_SPRING } },
}

export const staggerContainer = (stagger = 0.06, delayChildren = 0): Variants => ({
  hidden: {},
  show:   { transition: { staggerChildren: stagger, delayChildren } },
})

// Pre-built stagger item pair — use with staggerContainer
export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 14 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.26, ease: EASE_SPRING } },
}

// Drawer / modal exit is intentionally faster than enter (perceived snappiness)
export const drawerTransition = {
  enter: { duration: 0.28, ease: EASE_SPRING },
  exit:  { duration: 0.18, ease: [0.4, 0, 1, 1] },
}
