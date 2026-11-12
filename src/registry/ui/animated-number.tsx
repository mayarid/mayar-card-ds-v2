'use client'

import NumberFlow from '@number-flow/react'
import { useSyncExternalStore } from 'react'

import { cn } from '@/lib/utils'

/*
 * Mayar v2 AnimatedNumber. Code-only: no specimen on the Wonder Design System page.
 * Port of foundations/AnimatedNumber.svelte: NumberFlow rolls the changed digits (an odometer).
 * Same timing as the app: transform and spin 350ms, opacity 150ms, on the smooth-out curve.
 */

/** The same curve as --ease-smooth-out. */
const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)'
const TRANSFORM_TIMING = { duration: 350, easing: EASE }
const OPACITY_TIMING = { duration: 150, easing: EASE }

/*
 * Whether this browser can run NumberFlow (it needs CSS mod()). Checked here, not with NumberFlow's
 * useCanAnimate: in a browser without mod() support that hook reads `.matches` of null and throws.
 */
const noSubscribe = () => () => {}
const supportsNumberFlow = () =>
  typeof CSS !== 'undefined' &&
  CSS.supports?.('line-height', 'mod(1,1)') === true &&
  // The <number-flow-react> element registers itself only where it can run.
  typeof customElements !== 'undefined' &&
  customElements.get('number-flow-react') !== undefined
function useCanAnimate() {
  return useSyncExternalStore(noSubscribe, supportsNumberFlow, () => false)
}

/** One cached formatter per locale and options, so a render does not rebuild it. */
const formatters = new Map<string, Intl.NumberFormat>()
function getFormatter(locale: Intl.LocalesArgument, format?: Intl.NumberFormatOptions) {
  const key = `${String(locale)}|${JSON.stringify(format ?? null)}`
  let formatter = formatters.get(key)
  if (!formatter) {
    formatter = new Intl.NumberFormat(locale, format)
    formatters.set(key, formatter)
  }
  return formatter
}

/** The prefix the app puts before an amount: "Rp " for IDR, else the currency code. */
const moneyPrefix = (currency: string): string => (currency === 'IDR' ? 'Rp ' : `${currency} `)

interface AnimatedNumberProps extends Omit<React.ComponentProps<'span'>, 'children' | 'prefix'> {
  value: number
  /** Text before the number, e.g. `moneyPrefix("IDR")` → "Rp ". */
  prefix?: string
  /** Text after the number, e.g. `"%"`. */
  suffix?: string
  /** `Intl.NumberFormat` options. Default: grouped, up to 3 fraction digits. */
  format?: Intl.NumberFormatOptions
  /** Default `"id-ID"`: "48.250.000". */
  locale?: Intl.LocalesArgument
  /** Masks the value (a hidden balance). The real value is not rendered. */
  hidden?: boolean
  /** The mask text. Default "•••". */
  hiddenText?: string
  /** Spoken in place of the mask, e.g. "Saldo disembunyikan". */
  hiddenLabel?: string
}

function Mask({ text, label }: { text: string; label?: string }) {
  return label ? (
    <>
      <span aria-hidden>{text}</span>
      <span className="sr-only">{label}</span>
    </>
  ) : (
    <>{text}</>
  )
}

/**
 * A summary number that rolls its changed digits when the value changes.
 *
 * It never counts up on mount: the first render shows the real value. NumberFlow honours reduced
 * motion (the value snaps) and gives screen readers the whole formatted value as one label. Where it
 * cannot animate (an old browser, jsdom), the same text renders in a plain span.
 * Use it for summary figures only (stat tiles, totals), not for every row of a table.
 */
function AnimatedNumber({
  value,
  prefix = '',
  suffix = '',
  format,
  locale = 'id-ID',
  hidden = false,
  hiddenText = '•••',
  hiddenLabel,
  className,
  ...props
}: AnimatedNumberProps) {
  // Render NumberFlow wherever the browser can run it; NumberFlow then decides per user whether to
  // animate (it respects prefers-reduced-motion on its own).
  const canAnimate = useCanAnimate()
  const classes = cn('tabular-nums', className)

  if (hidden && canAnimate) {
    // The mask sits over an invisible NumberFlow of 0, so the box keeps NumberFlow's height and
    // hiding the balance does not move the page. The real value is not rendered.
    return (
      <span data-slot="animated-number" data-hidden="" {...props} className={cn('inline-grid items-center', classes)}>
        <NumberFlow
          value={0}
          locales={locale}
          prefix={prefix}
          suffix={suffix}
          aria-hidden
          className="invisible [grid-area:1/1]"
        />
        <span className="[grid-area:1/1]">
          <Mask text={hiddenText} label={hiddenLabel} />
        </span>
      </span>
    )
  }

  if (hidden) {
    return (
      <span data-slot="animated-number" data-hidden="" {...props} className={classes}>
        <Mask text={hiddenText} label={hiddenLabel} />
      </span>
    )
  }

  if (canAnimate) {
    return (
      <span data-slot="animated-number" {...props} className={classes}>
        <NumberFlow
          value={value}
          locales={locale}
          format={format as React.ComponentProps<typeof NumberFlow>['format']}
          prefix={prefix}
          suffix={suffix}
          transformTiming={TRANSFORM_TIMING}
          spinTiming={TRANSFORM_TIMING}
          opacityTiming={OPACITY_TIMING}
        />
      </span>
    )
  }

  return (
    <span data-slot="animated-number" {...props} className={classes}>
      {`${prefix}${getFormatter(locale, format).format(value)}${suffix}`}
    </span>
  )
}

export { AnimatedNumber, moneyPrefix, type AnimatedNumberProps }
