import { mergeProps } from '@base-ui/react/merge-props'
import { useRender } from '@base-ui/react/use-render'
import { createContext, use, useMemo } from 'react'

import { Button, type ButtonProps } from '@/components/ui/button'
import { UsageBar, type UsageBarProps } from '@/components/ui/usage-bar'
import { cn } from '@/lib/utils'

/*
 * Mayar v2 Plan Quota. Wonder Dashboard page › "Plan Quota Card" Normal / Near Limit / Full v2.
 * A tinted card (radius 14, 4px inset, border-subtle) holds the tier line (caption-lg semibold) and a
 * surface body (radius xl, padding 12, gap 10, ambient shadow) with the description (body-sm, ink-2),
 * a 6px bar on a well track, and the legend: "3 terpakai" left, "7 tersedia" right, numbers semibold.
 * Normal: well card, primary tier and fill. Near limit (80%+): warning-light card, warning-text tier
 * and number, warning fill. Full: danger-light card, danger-text tier and number, danger fill, and a
 * full-width primary "Upgrade paket" button. Over, unlimited, unknown and suspended are code-only.
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

/** The share of the quota (in %) at which the card turns to the near-limit tone. */
const NEAR_LIMIT_PERCENT = 80

/** Works out the status, bar percent and legend text for a card quota. */
function getPlanQuota({ max, used = null, suspended = false }: PlanQuotaInput): PlanQuotaSummary {
  const base = { used, available: null, percent: null }
  if (suspended) return { ...base, status: 'suspended', legend: 'Paket berakhir' }
  if (max === null) return { ...base, status: 'unlimited', legend: 'Kartu tanpa batas' }
  if (used === null) return { ...base, status: 'unknown', legend: `${fmt(max)} kartu` }
  const percent = max === 0 ? 100 : Math.round((used / max) * 100)
  if (used > max) {
    return { status: 'over', percent, used, available: 0, legend: `${fmt(used)} terpakai · ${fmt(used - max)} di atas kuota` }
  }
  const legend = `${fmt(used)} terpakai · ${fmt(max - used)} tersedia`
  const status = used === max ? 'at' : percent >= NEAR_LIMIT_PERCENT ? 'near' : 'ok'
  return { status, percent, used, available: max - used, legend }
}

type Tone = 'normal' | 'warning' | 'danger'

function toneOf(status: PlanQuotaStatus): Tone {
  if (status === 'near' || status === 'suspended') return 'warning'
  if (status === 'at' || status === 'over') return 'danger'
  return 'normal'
}

const cardTone: Record<Tone, string> = {
  normal: 'bg-well',
  warning: 'bg-warning-light',
  danger: 'bg-danger-light',
}
const inkTone: Record<Tone, string> = {
  normal: 'text-primary',
  warning: 'text-warning-text',
  danger: 'text-danger-text',
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
 * A card that shows how much of the plan's card quota is used, and turns warning near the limit
 * and danger when it is full.
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
      'flex min-w-0 flex-col gap-1 rounded-[14px] border border-border-subtle p-1 font-sans text-ink-2 no-underline',
      cardTone[toneOf(context.status)],
      isLink &&
        'outline-none transition-[border-color] duration-(--motion-quick) ease-smooth-out focus-ring:outline-focus hover-fine:border-ghost-hover-border',
      className,
    ),
  } as useRender.ElementProps<'div'>

  const element = useRender({ defaultTagName: 'div', render, props: mergeProps<'div'>(defaultProps, props) })
  return <PlanQuotaContext value={context}>{element}</PlanQuotaContext>
}

/** The tier line above the body, e.g. "Paket Starter". Its ink follows the status. */
function PlanQuotaTier({ className, ...props }: React.ComponentProps<'span'>) {
  const { status } = use(PlanQuotaContext)
  return (
    <span
      data-slot="plan-quota-tier"
      className={cn('px-2 pt-1 text-caption-lg font-semibold', inkTone[toneOf(status)], className)}
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

const DESCRIPTIONS: Record<PlanQuotaStatus, string> = {
  ok: 'Kuota kartu aktif paket Anda.',
  unknown: 'Kuota kartu aktif paket Anda.',
  unlimited: 'Kuota kartu aktif paket Anda.',
  near: 'Kuota kartu hampir penuh.',
  at: 'Kuota kartu penuh. Upgrade paket untuk menambah kartu.',
  over: 'Kartu aktif melebihi kuota. Upgrade paket atau nonaktifkan kartu.',
  suspended: 'Paket Anda sudah berakhir. Kartu dan anggota dibekukan.',
}

/** One line under the tier. Its default text follows the status; pass `children` to replace it. */
function PlanQuotaDescription({ className, children, ...props }: React.ComponentProps<'span'>) {
  const { status } = use(PlanQuotaContext)
  return (
    <span data-slot="plan-quota-description" className={cn('text-body-sm text-ink-2', className)} {...props}>
      {children ?? DESCRIPTIONS[status]}
    </span>
  )
}

/**
 * The usage bar on a well track. Hidden when there is nothing to measure (unlimited, unknown or
 * suspended). Decorative: the legend prints the numbers.
 */
function PlanQuotaBar({ className, ...props }: Omit<UsageBarProps, 'value'>) {
  const { status, percent } = use(PlanQuotaContext)
  if (percent === null) return null
  const tone = toneOf(status)
  return (
    <UsageBar
      data-slot="plan-quota-bar"
      value={percent}
      track="well"
      tone={tone === 'danger' ? 'over' : 'p4'}
      color={tone === 'warning' ? 'var(--color-warning)' : undefined}
      className={className}
      {...props}
    />
  )
}

function LegendPart({ value, label, tone }: { value: number; label: string; tone?: string }) {
  return (
    <span className="inline-flex items-baseline gap-1">
      <span className={cn('font-semibold text-ink', tone)}>{fmt(value)}</span>
      <span>{label}</span>
    </span>
  )
}

/**
 * The numbers: "3 terpakai" and "7 tersedia" on one row. With no usage it prints one line
 * ("10 kartu", "Kartu tanpa batas", "Paket berakhir"). Pass `children` to replace it.
 */
function PlanQuotaLegend({ className, children, ...props }: React.ComponentProps<'span'>) {
  const { status, used, available, max, legend } = use(PlanQuotaContext)
  const tone = toneOf(status)
  const counted = used !== null && available !== null && max !== null
  return (
    <span
      data-slot="plan-quota-legend"
      data-status={status}
      className={cn(
        'flex items-center justify-between gap-2 text-caption-lg text-muted tabular-nums',
        status === 'suspended' && 'font-semibold text-warning-text',
        className,
      )}
      {...props}
    >
      {children ??
        (counted ? (
          <>
            <LegendPart value={used} label="terpakai" />
            {status === 'over' ? (
              <LegendPart value={used - max} label="di atas kuota" tone={inkTone.danger} />
            ) : (
              <LegendPart value={available} label="tersedia" tone={tone === 'normal' ? undefined : inkTone[tone]} />
            )}
          </>
        ) : (
          legend
        ))}
    </span>
  )
}

/**
 * The upgrade action: a full-width primary MD Button at the end of the body.
 * `<PlanQuotaAction render={<a href="mailto:…" />}>Upgrade paket</PlanQuotaAction>`.
 */
function PlanQuotaAction({ className, children = 'Upgrade paket', ...props }: ButtonProps) {
  return (
    <Button data-slot="plan-quota-action" size="md" className={cn('w-full font-semibold', className)} {...props}>
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
