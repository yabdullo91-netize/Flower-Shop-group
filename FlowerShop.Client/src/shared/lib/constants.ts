export const ANIM = {
  micro: { duration: 0.15, ease: 'easeOut' },
  normal: { duration: 0.28, ease: [0.22, 1, 0.36, 1] as const },
  slow: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
  stagger: 0.05,
} as const

export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
} as const

export const API_BASE = import.meta.env.VITE_API_URL || 'https://api.flowerhouse.tj'
