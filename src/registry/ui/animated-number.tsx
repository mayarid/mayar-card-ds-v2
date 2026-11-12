import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react'

import { cn } from '@/lib/utils'

/*
 * Mayar v2 AnimatedNumber. Code-only: no specimen on the Wonder Design System page.
 * Source: the shipped app (foundations/AnimatedNumber.svelte, which uses NumberFlow). This port has
 * no extra package: it tweens the value over 350ms (--motion-medium) with a smooth-out curve.
 * No count-up on mount. Reduced motion: the value snaps.
 */

const REDUCED_MOTION = '(prefers-reduced-motion: reduce)'

function subscribeReducedMotion(onChange: () => void) {
  if (typeof window === 'undefined' || !window.matchMedia) return () => {}
  const query = window.matchMedia(REDUCED_MOTION)
  query.addEventListener('change', onChange)
  return () => query.removeEventListener('change', onChange)
}

function getReducedMotion() {
  return typeof window !== 'undefined' && Boolean(window.matchMedia?.(REDUCED_MOTION).matches)
}

/** `true` when the user asks for reduced motion. */
function usePrefersReducedMotion() {
  return useSyncExternalStore(subscribeReducedMotion, getReducedMotion, () => false)
}

/** Close to cubic-bezier(0.22, 1, 0.36, 1), the --ease-smooth-out curve. */
const easeOut = (t: number) => 1 - Math.pow(1 - t, 4)

/**
 * The value to paint this frame. It starts at `value` (no count-up on mount) and moves to each new
 * `value` over `duration` ms. Under reduced motion it returns `value` at once.
 */
function useTweenedNumber(value: number, duration: number) {
  const reduced = usePrefersReducedMotion()
  const [display, setDisplay] = useState(value)
  const current = useRef(value)

  useEffect(() => {
    const from = current.current
    if (reduced || duration <= 0 || from === value || !Number.isFinite(from) || !Number.isFinite(value)) {
      current.current = value
      return
    }
    let frame = 0
    let start: number | undefined
    const tick = (now: number) => {
      start ??= now
      const t = Math.min(1, (now - start) / duration)
      const next = t === 1 ? value : from + (value - from) * easeOut(t)
      current.current = next
      setDisplay(next)
      if (t < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [value, duration, reduced])

  return reduced || duration <= 0 ? value : display
}

interface AnimatedNumberProps extends Omit<React.ComponentProps<'span'>, 'children' | 'prefix'> {
  value: number
  /** Text before the number, e.g. `"Rp "`. */
  prefix?: string
  /** Text after the number, e.g. `"%"`. */
  suffix?: string
  /** `Intl.NumberFormat` options. Default: grouped, up to 3 fraction digits. */
  format?: Intl.NumberFormatOptions
  /** Default `"id-ID"`: "48.250.000". */
  locale?: Intl.LocalesArgument
  /** Tween length in ms. Default 350 (--motion-medium). */
  duration?: number
  /** Masks the value (a hidden balance). The real value is not rendered. */
  hidden?: boolean
  /** The mask text. Default "•••". */
  hiddenText?: string
  /** Spoken in place of the mask, e.g. "Saldo disembunyikan". */
  hiddenLabel?: string
}

/**
 * A summary number that moves to its new value when it changes.
 *
 * Tabular, monospaced digits, so the width does not jump. It never counts up on mount. Screen
 * readers get the final formatted value once, not every frame.
 * Use it for summary figures only (stat tiles, totals), not for every row of a table.
 */
function AnimatedNumber({
  value,
  prefix = '',
  suffix = '',
  format,
  locale = 'id-ID',
  duration = 350,
  hidden = false,
  hiddenText = '•••',
  hiddenLabel,
  className,
  ...props
}: AnimatedNumberProps) {
  const shown = useTweenedNumber(value, duration)
  // `format` is often an inline object; key the cache on its contents, not its identity.
  const formatKey = JSON.stringify(format ?? null)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const formatter = useMemo(() => new Intl.NumberFormat(locale, format), [locale, formatKey])
  const text = (n: number) => `${prefix}${formatter.format(n)}${suffix}`

  return (
    <span
      data-slot="animated-number"
      data-hidden={hidden ? '' : undefined}
      {...props}
      className={cn('font-mono tabular-nums', className)}
    >
      {hidden ? (
        hiddenLabel ? (
          <>
            <span aria-hidden>{hiddenText}</span>
            <span className="sr-only">{hiddenLabel}</span>
          </>
        ) : (
          hiddenText
        )
      ) : (
        <>
          <span aria-hidden>{text(shown)}</span>
          <span className="sr-only">{text(value)}</span>
        </>
      )}
    </span>
  )
}

export { AnimatedNumber, usePrefersReducedMotion, useTweenedNumber, type AnimatedNumberProps }
