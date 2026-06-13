import { useEffect } from 'react'
import { useCartFlyStore } from '@/features/cart/flyStore'
import { useReducedMotion } from '@/shared/hooks/useReducedMotion'

function getCartTargetEl(): HTMLElement | null {
  if (window.innerWidth < 768) {
    return document.querySelector('[data-cart-target="bottom"]') as HTMLElement | null
  }
  return document.querySelector('[data-cart-target="header"]') as HTMLElement | null
}

export function CartFlyAnimator() {
  const { flyState, clearFly, triggerPulse } = useCartFlyStore()
  const reduced = useReducedMotion()

  useEffect(() => {
    if (!flyState) return

    const target = getCartTargetEl()
    if (!target) { clearFly(); return }

    const targetRect = target.getBoundingClientRect()
    const { src, startRect } = flyState

    const el = document.createElement('img')
    el.src = src
    el.style.cssText = `
      position:fixed;
      left:${startRect.left}px;
      top:${startRect.top}px;
      width:${startRect.width}px;
      height:${startRect.height}px;
      border-radius:12px;
      object-fit:cover;
      pointer-events:none;
      z-index:9999;
      will-change:transform,opacity;
      transform-origin:center;
    `
    document.body.appendChild(el)

    const dx = targetRect.left + targetRect.width / 2 - (startRect.left + startRect.width / 2)
    const dy = targetRect.top + targetRect.height / 2 - (startRect.top + startRect.height / 2)
    const targetScale = Math.max((targetRect.width / startRect.width) * 0.5, 0.05)

    let cancelled = false

    if (reduced) {
      // Functional feedback even with reduced motion — instant flash
      el.style.opacity = '0.5'
      const t = setTimeout(() => {
        if (cancelled) return
        el.remove()
        clearFly()
        triggerPulse()
      }, 120)
      return () => {
        cancelled = true
        clearTimeout(t)
        el.remove()
      }
    }

    const anim = el.animate(
      [
        { transform: 'translate(0,0) scale(1)', opacity: 1, borderRadius: '12px' },
        {
          transform: `translate(${dx * 0.55}px,${dy * 0.55}px) scale(${1 + (targetScale - 1) * 0.4})`,
          opacity: 0.85,
          borderRadius: '50%',
          offset: 0.55,
        },
        { transform: `translate(${dx}px,${dy}px) scale(${targetScale})`, opacity: 0, borderRadius: '50%' },
      ],
      { duration: 500, easing: 'cubic-bezier(0.4,0,0.2,1)', fill: 'forwards' }
    )

    anim.onfinish = () => {
      if (cancelled) return
      el.remove()
      clearFly()
      triggerPulse()
    }

    return () => {
      cancelled = true
      anim.cancel()
      if (el.parentNode) el.remove()
    }
  }, [flyState]) // eslint-disable-line react-hooks/exhaustive-deps

  return null
}
