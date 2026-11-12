import { Meter } from '@base-ui/react/meter'
import { createContext, use, useMemo } from 'react'

import { cn } from '@/lib/utils'

/*
 * Mayar v2 UsageBar. Code-only: no specimen on the Wonder Design System page.
 * Source: the shipped app (foundations/UsageBar.svelte, lib/usage-tone.ts).
 * One blue ramp: the fill gets darker as usage grows and turns red at 100% or more.
 * Height 6 (default) or 8. Track component (default) or well. The fill grows from the left once.
 */

type UsageTone = 'none' | 'p1' | 'p2' | 'p3' | 'p4' | 'over'

/** The ramp bucket for a usage percent (`null` = nothing to measure). */
function getUsageTone(percent: number | null): UsageTone {
  if (percent === null || !Number.isFinite(percent)) return 'none'
  if (percent >= 100) return 'over'
  if (percent >= 90) return 'p4'
  if (percent >= 75) return 'p3'
  if (percent >= 50) return 'p2'
  return 'p1'
}

const toneClass: Record<UsageTone, string> = {
  none: 'bg-component',
  p1: 'bg-[color-mix(in_oklch,var(--color-primary)_45%,var(--color-surface))]',
  p2: 'bg-[color-mix(in_oklch,var(--color-primary)_65%,var(--color-surface))]',
  p3: 'bg-[color-mix(in_oklch,var(--color-primary)_82%,var(--color-surface))]',
  p4: 'bg-primary',
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
  /** Ramp bucket override. Default: from the percent (`p4` = flat primary, `over` = danger). */
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
            'block h-full origin-left rounded-pill animate-bar-fill [animation-delay:var(--bar-delay,0ms)]',
            color === undefined && toneClass[tone],
          )}
          style={color === undefined ? undefined : { background: color }}
        />
      )}
    </Meter.Track>
  )
}

/** The label. It names the meter for assistive tech. */
function UsageBarLabel({ className, ...props }: Meter.Label.Props) {
  return (
    <Meter.Label
      data-slot="usage-bar-label"
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

export { getUsageTone, UsageBar, UsageBarLabel, UsageBarTrack, UsageBarValue, type UsageBarProps, type UsageTone }
