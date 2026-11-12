import { mergeProps } from '@base-ui/react/merge-props'
import { useRender } from '@base-ui/react/use-render'
import { createContext, use, useMemo } from 'react'

import { Button, type ButtonProps } from '@/components/ui/button'
import { UsageBar, type UsageBarProps } from '@/components/ui/usage-bar'
import { cn } from '@/lib/utils'

/*
 * Mayar v2 Plan Quota. Source of truth: the app Sidebar.svelte plan quota card (`.v2-sidebar__quota`).
 * Visual reference: Wonder Dashboard › "Plan Quota Card" Normal / Near Limit / Full v2.
 * A well card (radius 3xl = 16, 4px inset, border-subtle) holds the tier line (caption-lg semibold,
 * primary) and a surface body (radius xl, padding 12, gap 10, ambient shadow) with the description
 * (body-sm, ink-2), the usage bar on a well track (the blue ramp, red at 100%) and the one-line
 * legend "3 terpakai · 7 tersedia" (caption-lg, muted, tabular). Suspended: the legend reads
 * "Paket berakhir" in semibold warning-text. The card does not change colour by status.
 */

type PlanQuotaStatus = 'ok' | 'near' | 'at' | 'over' | 'unlimited' | 'unknown' | 'suspended'

interface PlanQuotaInput {
  /** Card quota. `null` = unlimited (Enterprise custom quota). */
  max: number | null
  /** Cards in use. `null` or absent = unknown, and the legend shows the quota alone. */
  used?: number | null
  /** The plan has lapsed: every quota reads zero. Checked before the numbers. */
  suspended?: boolean
}

interface PlanQuotaSummary {
  status: PlanQuotaStatus
  /** Uncapped usage percent for the bar, or `null` when there is nothing to measure. */
  percent: number | null
  /** Cards in use, when known. */
  used: number | null
  /** Cards left (0 or more), when there is a quota and a usage. */
  available: number | null
  /** The legend as one line, e.g. "7 terpakai · 3 tersedia". Also the plain-text summary. */
  legend: string
}

const numberFormat = new Intl.NumberFormat('id-ID')
const fmt = (n: number) => numberFormat.format(n)

/** The share of the quota (in %) at which `status` becomes `near`. Information only: the card does not change. */
const NEAR_LIMIT_PERCENT = 80

/** Works out the status, bar percent and legend text for a card quota. */
function getPlanQuota({ max, used = null, suspended = false }: PlanQuotaInput): PlanQuotaSummary {
  const base = { used, available: null, percent: null }
  if (suspended) return { ...base, status: 'suspended', legend: 'Paket berakhir' }
  if (max === null) return { ...base, status: 'unlimited', legend: 'Kartu tanpa batas' }
  if (used === null) return { ...base, status: 'unknown', legend: `${fmt(max)} kartu` }
  const percent = max === 0 ? 100 : Math.round((used / max) * 100)
  if (used > max) {
    return { status: 'over', percent, used, available: 0, legend: `${fmt(used)} terpakai · 0 tersedia` }
  }
  const legend = `${fmt(used)} terpakai · ${fmt(max - used)} tersedia`
  const status = used === max ? 'at' : percent >= NEAR_LIMIT_PERCENT ? 'near' : 'ok'
  return { status, percent, used, available: max - used, legend }
}

interface PlanQuotaContextValue extends PlanQuotaSummary {
  max: number | null
}

const PlanQuotaContext = createContext<PlanQuotaContextValue>({
  status: 'unknown',
  percent: null,
  used: null,
  available: null,
  legend: '',
  max: null,
})

interface PlanQuotaProps extends useRender.ComponentProps<'div'>, PlanQuotaInput {}

/**
 * A card that shows how much of the plan's card quota is used, with a usage bar that turns red
 * when the quota is full.
 *
 * `<PlanQuota max={10} used={7}><PlanQuotaTier>Paket Starter</PlanQuotaTier><PlanQuotaBody>`
 * `<PlanQuotaDescription /><PlanQuotaBar /><PlanQuotaLegend /></PlanQuotaBody></PlanQuota>`.
 * Use `render={<a href="/settings" />}` to make the whole card a link (then leave out `PlanQuotaAction`).
 */
function PlanQuota({ max, used = null, suspended = false, className, render, ...props }: PlanQuotaProps) {
  const context = useMemo(() => ({ ...getPlanQuota({ max, used, suspended }), max }), [max, used, suspended])
  const isLink = render !== undefined

  const defaultProps: useRender.ElementProps<'div'> = {
    'data-slot': 'plan-quota',
    'data-status': context.status,
    className: cn(
      'flex min-w-0 flex-col gap-1 rounded-3xl border border-border-subtle bg-well p-1 font-sans text-ink-2 no-underline',
      isLink &&
        'outline-none focus-ring:outline-focus',
      className,
    ),
  } as useRender.ElementProps<'div'>

  const element = useRender({ defaultTagName: 'div', render, props: mergeProps<'div'>(defaultProps, props) })
  return <PlanQuotaContext value={context}>{element}</PlanQuotaContext>
}

/** The tier line above the body, e.g. "Paket Starter". */
function PlanQuotaTier({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      data-slot="plan-quota-tier"
      className={cn('px-2 pt-1 text-caption-lg font-semibold text-primary', className)}
      {...props}
    />
  )
}

/** The white inner panel. */
function PlanQuotaBody({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="plan-quota-body"
      className={cn(
        'flex flex-col gap-2.5 rounded-xl border border-border-subtle bg-surface p-3 shadow-[0_1px_2px_var(--color-shadow-ambient)]',
        className,
      )}
      {...props}
    />
  )
}

/** One line under the tier: "Kuota kartu aktif paket Anda." Pass `children` to replace it. */
function PlanQuotaDescription({ className, children, ...props }: React.ComponentProps<'span'>) {
  return (
    <span data-slot="plan-quota-description" className={cn('text-body-sm text-ink-2', className)} {...props}>
      {children ?? 'Kuota kartu aktif paket Anda.'}
    </span>
  )
}

/**
 * The usage bar on a well track: the blue usage ramp, red at 100% or more. Hidden when there is
 * nothing to measure (unlimited, unknown or suspended). Decorative: the legend prints the numbers.
 */
function PlanQuotaBar({ className, ...props }: Omit<UsageBarProps, 'value'>) {
  const { percent } = use(PlanQuotaContext)
  if (percent === null) return null
  return <UsageBar data-slot="plan-quota-bar" value={percent} track="well" className={className} {...props} />
}

/**
 * The numbers as one line: "3 terpakai · 7 tersedia". With no usage it prints "10 kartu",
 * "Kartu tanpa batas" or "Paket berakhir" (semibold warning-text). Pass `children` to replace it.
 */
function PlanQuotaLegend({ className, children, ...props }: React.ComponentProps<'span'>) {
  const { status, legend } = use(PlanQuotaContext)
  return (
    <span
      data-slot="plan-quota-legend"
      data-status={status}
      className={cn(
        'text-caption-lg text-muted tabular-nums',
        status === 'suspended' && 'font-semibold text-warning-text',
        className,
      )}
      {...props}
    >
      {children ?? legend}
    </span>
  )
}

/**
 * Optional upgrade action: a full-width primary MD Button at the end of the body. The app sidebar
 * card has none (the whole card links to the plan settings); use it on a card that is not a link.
 * `<PlanQuotaAction render={<a href="mailto:…" />}>Upgrade paket</PlanQuotaAction>`.
 */
function PlanQuotaAction({ className, children = 'Upgrade paket', ...props }: ButtonProps) {
  return (
    <Button data-slot="plan-quota-action" size="md" className={cn('w-full', className)} {...props}>
      {children}
    </Button>
  )
}

/** Reads the quota summary inside `PlanQuota`, e.g. to show the action only when `status` is at or over. */
function usePlanQuota(): PlanQuotaContextValue {
  return use(PlanQuotaContext)
}

export {
  getPlanQuota,
  NEAR_LIMIT_PERCENT,
  PlanQuota,
  PlanQuotaAction,
  PlanQuotaBar,
  PlanQuotaBody,
  PlanQuotaDescription,
  PlanQuotaLegend,
  PlanQuotaTier,
  usePlanQuota,
  type PlanQuotaInput,
  type PlanQuotaProps,
  type PlanQuotaStatus,
  type PlanQuotaSummary,
}
