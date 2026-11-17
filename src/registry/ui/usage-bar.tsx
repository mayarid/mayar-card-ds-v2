import { Meter } from '@base-ui/react/meter'
import { createContext, use, useMemo } from 'react'

import { cn } from '@/lib/utils'

/*
 * Mayar v2 UsageBar. Code-only: no specimen on the Wonder Design System page.
 * Source: the shipped app (foundations/UsageBar.svelte, lib/usage-tone.ts).
 * Height 6 (default) or 8. Track component (default) or well. The fill fades in once.
 * Audit (17 Nov 2026): three flat tones in place of the app's blue intensity ramp: `fill`
 * (bg-primary) below the near threshold, `warning` (bg-warning) from 85% used, `over` (bg-danger)
 * at 100% or more.
 */

type UsageTone = 'none' | 'fill' | 'warning' | 'over'

/** The share of a limit (in %) at which the bar turns to the warning tone. */
const USAGE_NEAR_PERCENT = 85

/** The tone for a usage percent (`null` = nothing to measure). `near` sets the warning threshold. */
function getUsageTone(percent: number | null, near: number = USAGE_NEAR_PERCENT): UsageTone {
  if (percent === null || !Number.isFinite(percent)) return 'none'
  if (percent >= 100) return 'over'
  if (percent >= near) return 'warning'
  return 'fill'
}

const toneClass: Record<UsageTone, string> = {
  none: 'bg-component',
  fill: 'bg-primary',
  warning: 'bg-warning',
  over: 'bg-danger',
}

interface UsageBarContextValue {
  tone: UsageTone
  color: string | undefined
  height: 6 | 8
  track: 'component' | 'well'
}

const UsageBarContext = createContext<UsageBarContextValue>({
  tone: 'none',
  color: undefined,
  height: 6,
  track: 'component',
})

interface UsageBarProps extends Omit<Meter.Root.Props, 'color'> {
  /**
   * Tone override. Default: from the percent (`fill` = primary, `warning` from 85%, `over` = danger
   * from 100%).
   */
  tone?: UsageTone
  /** Fill colour override, e.g. `var(--color-chart-3)` for a share bar. Wins over `tone`. */
  color?: string
  /** Bar height in px. */
  height?: 6 | 8
  /** Track fill. Use `well` on a tinted surface. */
  track?: 'component' | 'well'
}

/**
 * A bar that shows how much of a limit, budget or quota is used.
 *
 * With no children it renders only the bar and is decorative (`aria-hidden`), because the numbers
 * are printed next to it. Pass `aria-label`, or compose `<UsageBarLabel>`, `<UsageBarValue>` and
 * `<UsageBarTrack>` as children, and it becomes a labelled `role="meter"`.
 */
function UsageBar({
  className,
  value,
  min = 0,
  max = 100,
  tone,
  color,
  height = 6,
  track = 'component',
  children,
  ...props
}: UsageBarProps) {
  const percent = Number.isFinite(value) && max > min ? ((value - min) / (max - min)) * 100 : null
  const resolvedTone = tone ?? getUsageTone(percent)
  const context = useMemo(() => ({ tone: resolvedTone, color, height, track }), [resolvedTone, color, height, track])
  const decorative = children === undefined && !props['aria-label'] && !props['aria-labelledby']

  return (
    <UsageBarContext value={context}>
      <Meter.Root
        data-slot="usage-bar"
        data-tone={resolvedTone}
        aria-hidden={decorative || undefined}
        value={Number.isFinite(value) ? value : min}
        min={min}
        max={max}
        {...props}
        className={(state) =>
          cn(
            'w-full min-w-0 flex-[0_1_auto]',
            children !== undefined && 'grid grid-cols-[1fr_auto] items-baseline gap-x-3 gap-y-2',
            typeof className === 'function' ? className(state) : className,
          )
        }
      >
        {children ?? <UsageBarTrack />}
      </Meter.Root>
    </UsageBarContext>
  )
}

/** The track and its fill. Spans the full row when it sits next to a label and a value. */
function UsageBarTrack({ className, ...props }: Meter.Track.Props) {
  const { tone, color, height, track } = use(UsageBarContext)
  return (
    <Meter.Track
      data-slot="usage-bar-track"
      data-track={track}
      {...props}
      className={(state) =>
        cn(
          'col-span-full block w-full min-w-0 overflow-hidden rounded-pill',
          height === 8 ? 'h-2 min-h-2' : 'h-1.5 min-h-1.5',
          track === 'well' ? 'bg-well' : 'bg-component',
          typeof className === 'function' ? className(state) : className,
        )
      }
    >
      {tone === 'none' ? null : (
        <Meter.Indicator
          data-slot="usage-bar-fill"
          className={cn(
            'block h-full rounded-pill animate-bar-fill',
            color === undefined && toneClass[tone],
          )}
          style={color === undefined ? undefined : { background: color }}
        />
      )}
    </Meter.Track>
  )
}

/** The label. It names the meter for assistive tech. A plain-text label is also its own `title`. */
function UsageBarLabel({ className, ...props }: Meter.Label.Props) {
  return (
    <Meter.Label
      data-slot="usage-bar-label"
      title={typeof props.children === 'string' ? props.children : undefined}
      {...props}
      className={(state) =>
        cn('min-w-0 truncate text-body-sm text-ink-2', typeof className === 'function' ? className(state) : className)
      }
    />
  )
}

/** The value text. Pass a function child to format it: `{(formatted, value) => …}`. */
function UsageBarValue({ className, ...props }: Meter.Value.Props) {
  return (
    <Meter.Value
      data-slot="usage-bar-value"
      {...props}
      className={(state) =>
        cn(
          'col-start-2 text-right text-body-sm font-medium text-ink tabular-nums',
          typeof className === 'function' ? className(state) : className,
        )
      }
    />
  )
}

export { getUsageTone, USAGE_NEAR_PERCENT, UsageBar, UsageBarLabel, UsageBarTrack, UsageBarValue, type UsageBarProps, type UsageTone }
