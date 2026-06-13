import { useRef, useEffect, useState } from 'react'
import { useReducedMotion } from 'framer-motion'

interface Props {
  value: number
  duration?: number
  formatter?: (v: number) => string
  className?: string
}

function easeOutQuart(t: number) {
  return 1 - Math.pow(1 - t, 4)
}

/**
 * Smoothly counts from the previous value to `value` on every change.
 * Respects prefers-reduced-motion — jumps instantly when motion is reduced.
 */
export function AnimatedNumber({ value, duration = 380, formatter = String, className }: Props) {
  const reduced = useReducedMotion()
  const [displayed, setDisplayed] = useState(value)
  const rafRef = useRef<number | null>(null)
  const fromRef = useRef(value)
  const startRef = useRef(0)

  useEffect(() => {
    if (reduced) {
      setDisplayed(value)
      return
    }

    fromRef.current = displayed
    startRef.current = performance.now()

    const tick = (now: number) => {
      const elapsed = now - startRef.current
      const progress = Math.min(elapsed / duration, 1)
      const eased = easeOutQuart(progress)
      setDisplayed(fromRef.current + (value - fromRef.current) * eased)
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick)
      }
    }

    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(tick)

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  return <span className={className}>{formatter(Math.round(displayed))}</span>
}
