import { Clock01Icon } from '@hugeicons/core-free-icons'
import { createContext, use, useId, useMemo } from 'react'

import { Icon } from '@/components/ui/icon'
import { Skeleton } from '@/components/ui/skeleton'
import { getUsageTone, UsageBar } from '@/components/ui/usage-bar'
import { cn } from '@/lib/utils'

/*
 * Mayar v2 BudgetCard (pattern). Wonder Dashboard › "Budget Card Option B Remaining Rows" (the
 * shipped Beranda module) and "Budget Error v2". Also the app: routes/+page.svelte `.module`.
 * Card: white, radius 2xl, control shadow. Head 16 16 8: title title-sm, period caption-lg muted
 * (clock 14). Item: 12px vertical padding, 6px gap, hairline between items. Top row body-sm (name
 * medium ink, "Sisa"/"Lebih" semibold); the UsageBar (blue ramp, red at 100%+); bottom row
 * caption-lg muted "Rp … dari Rp …" and the percent (medium danger when over).
 * Foot: well fill, hairline, 12×16, "Total sisa" caption-lg medium ink-2, total body-sm semibold.
 * Status (backend budget.service): under < 85% · near 85–99% · at exactly 100% · over > 100%.
 * The app only paints "over" in red; near and at show in the bar ramp and in the spoken status.
 */

const RUPIAH = new Intl.NumberFormat('id-ID')
const PERCENT = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 })

/** "Rp 1.234", "−Rp 1.234" for a negative value (U+2212). */
function formatRupiah(value: number): string {
  return `${value < 0 ? '−' : ''}Rp ${RUPIAH.format(Math.abs(value))}`
}

const BUDGET_MASK = 'Rp ••••••••'

/** At or above this percent a budget is "Hampir habis" (backend NEAR_PERCENT). */
const BUDGET_NEAR_PERCENT = 85

type BudgetStatus = 'none' | 'under' | 'near' | 'at' | 'over'

/** The budget status for an amount spent against a limit. `amount` null or 0: no budget. */
function getBudgetStatus(spent: number, amount: number | null): BudgetStatus {
  if (amount === null || amount <= 0) return 'none'
  if (spent > amount) return 'over'
  if (spent === amount) return 'at'
  return (spent / amount) * 100 >= BUDGET_NEAR_PERCENT ? 'near' : 'under'
}

/** The status in words (the app's Sisa pill vocabulary). */
const BUDGET_STATUS_LABEL: Record<BudgetStatus, string> = {
  none: 'Tanpa anggaran',
  under: 'Sesuai rencana',
  near: 'Hampir habis',
  at: 'Habis',
  over: 'Terlampaui',
}

interface BudgetCardContextValue {
  titleId: string
  hidden: boolean
}

const BudgetCardContext = createContext<BudgetCardContextValue>({ titleId: '', hidden: false })

interface BudgetCardProps extends React.ComponentProps<'section'> {
  /** Masks every money figure (the dashboard hide-balance switch). Percents stay visible. */
  hidden?: boolean
}

/**
 * A card of category budgets: a title with the period, one row per budget with a usage bar, and a
 * total. A named region, labelled by `BudgetCardTitle`.
 *
 * Compose it: `<BudgetCard><BudgetCardHeader><div><BudgetCardTitle>Anggaran November</BudgetCardTitle>
 * <BudgetCardPeriod>Sisa 18 hari</BudgetCardPeriod></div></BudgetCardHeader><BudgetCardList>
 * <BudgetCardItem category="Pemasaran" spent={…} amount={…} /></BudgetCardList></BudgetCard>`.
 * Put an `EmptyState size="sm"` or `BudgetCardSkeleton` in place of the list for those states.
 */
function BudgetCard({ className, hidden = false, ...props }: BudgetCardProps) {
  const titleId = useId()
  const context = useMemo(() => ({ titleId, hidden }), [titleId, hidden])
  return (
    <BudgetCardContext value={context}>
      <section
        data-slot="budget-card"
        aria-labelledby={titleId}
        data-hidden={hidden ? '' : undefined}
        {...props}
        className={cn(
          'flex min-w-0 flex-col overflow-hidden rounded-2xl bg-surface font-sans text-ink shadow-control',
          className,
        )}
      />
    </BudgetCardContext>
  )
}

/** The head row. The first child (title block) takes the row; links or controls wrap under it. */
function BudgetCardHeader({ className, ...props }: React.ComponentProps<'header'>) {
  return (
    <header
      data-slot="budget-card-header"
      {...props}
      className={cn(
        'flex flex-wrap items-start justify-between gap-x-4 gap-y-3 px-4 pt-4 pb-2',
        '[&>:first-child]:min-w-0 [&>:first-child]:flex-[1_1_200px]',
        className,
      )}
    />
  )
}

/** The card title. An `<h2>`; it names the region. */
function BudgetCardTitle({ className, ...props }: React.ComponentProps<'h2'>) {
  const { titleId } = use(BudgetCardContext)
  return (
    <h2 id={titleId} data-slot="budget-card-title" {...props} className={cn('m-0 text-title-sm text-ink', className)} />
  )
}

/** The period line under the title ("Sisa 18 hari"), with a clock icon. */
function BudgetCardPeriod({ className, children, ...props }: React.ComponentProps<'p'>) {
  return (
    <p
      data-slot="budget-card-period"
      {...props}
      className={cn('m-0 flex items-center gap-1 text-caption-lg text-muted', className)}
    >
      <Icon icon={Clock01Icon} size={14} />
      {children}
    </p>
  )
}

/** The list of budget rows. */
function BudgetCardList({ className, ...props }: React.ComponentProps<'ul'>) {
  return <ul data-slot="budget-card-list" role="list" {...props} className={cn('m-0 list-none px-4 py-0', className)} />
}

function Money({ value, signed = false }: { value: number; signed?: boolean }) {
  const { hidden } = use(BudgetCardContext)
  if (hidden) {
    return (
      <>
        <span aria-hidden>{BUDGET_MASK}</span>
        <span className="sr-only">disembunyikan</span>
      </>
    )
  }
  return <>{signed ? formatRupiah(value) : formatRupiah(Math.abs(value))}</>
}

interface BudgetCardItemProps extends Omit<React.ComponentProps<'li'>, 'children'> {
  /** The category name. */
  category: string
  /** Spent this period, in Rupiah. */
  spent: number
  /** The limit, in Rupiah. */
  amount: number
  /** The row position. Staggers the bar fill by 40ms per row. */
  index?: number
}

/**
 * One category budget: the name and what is left (or over), the usage bar, then "spent / limit"
 * and the percent. Red only when the budget is over. The status is spoken before the amount left.
 */
function BudgetCardItem({ className, category, spent, amount, index = 0, style, ...props }: BudgetCardItemProps) {
  const status = getBudgetStatus(spent, amount)
  const remaining = amount - spent
  const over = status === 'over'
  const percent = amount > 0 ? (spent / amount) * 100 : 0
  return (
    <li
      data-slot="budget-card-item"
      data-status={status}
      {...props}
      style={{ '--bar-delay': `${index * 40}ms`, ...style } as React.CSSProperties}
      className={cn(
        'flex flex-col gap-1.5 border-b border-border-subtle py-3 last:border-b-0',
        className,
      )}
    >
      <span className="flex items-baseline justify-between gap-2 text-body-sm">
        <span className="min-w-0 truncate font-medium text-ink">{category}</span>
        <span className={cn('shrink-0 font-semibold tabular-nums', over ? 'text-danger-text' : 'text-ink')}>
          <span className="sr-only">{BUDGET_STATUS_LABEL[status]}, </span>
          {over ? 'Lebih' : 'Sisa'} <Money value={remaining} />
        </span>
      </span>
      <UsageBar value={Math.max(0, percent)} max={100} tone={getUsageTone(Math.round(percent))} />
      <span className="flex items-baseline justify-between gap-2 text-caption-lg text-muted tabular-nums">
        <span>
          <Money value={spent} /> dari <Money value={amount} />
        </span>
        <span className={cn(over && 'font-medium text-danger-text')}>{PERCENT.format(percent)}%</span>
      </span>
    </li>
  )
}

/** The foot row: a label on the left ("Total sisa"), the total on the right. */
function BudgetCardFooter({ className, ...props }: React.ComponentProps<'footer'>) {
  return (
    <footer
      data-slot="budget-card-footer"
      {...props}
      className={cn(
        'mt-auto flex items-center justify-between gap-3 border-t border-border-subtle bg-well px-4 py-3 text-ink-2',
        '[&>:first-child]:text-caption-lg [&>:first-child]:font-medium',
        '[&>:last-child]:text-body-sm [&>:last-child]:font-semibold [&>:last-child]:text-ink [&>:last-child]:tabular-nums',
        className,
      )}
    />
  )
}

interface BudgetCardTotalProps extends Omit<React.ComponentProps<'span'>, 'children'> {
  /** Left of the plan, in Rupiah. Negative when the plan is over. */
  remaining: number
  /** The plan total, in Rupiah. */
  total: number
}

/** "Rp 4.150.000 dari Rp 12.000.000" for the foot. Negative remainders read "−Rp …" in red. */
function BudgetCardTotal({ className, remaining, total, ...props }: BudgetCardTotalProps) {
  return (
    <span data-slot="budget-card-total" {...props} className={cn(className)}>
      <span className={cn(remaining < 0 && 'text-danger-text')}>
        <Money value={remaining} signed />
      </span>{' '}
      dari <Money value={total} />
    </span>
  )
}

interface BudgetCardSkeletonProps extends React.ComponentProps<'div'> {
  /** Number of placeholder rows. */
  rows?: number
  /** Spoken while loading. */
  label?: string
}

/** Placeholder rows at the real row height, for the loading state. Announces itself once. */
function BudgetCardSkeleton({ className, rows = 4, label = 'Memuat anggaran', ...props }: BudgetCardSkeletonProps) {
  const widths = [120, 96, 132, 108, 88]
  return (
    <div
      data-slot="budget-card-skeleton"
      role="status"
      aria-busy="true"
      {...props}
      className={cn('flex flex-col px-4', className)}
    >
      <span className="sr-only">{label}</span>
      {Array.from({ length: rows }, (_, i) => (
        <span key={i} className="flex flex-col gap-2 border-b border-border-subtle py-3 last:border-b-0">
          <span className="flex justify-between gap-2">
            <Skeleton fill="component" width={widths[i % widths.length]} height={12} />
            <Skeleton fill="component" width={96} height={12} />
          </span>
          <Skeleton fill="component" height={6} radius="full" />
          <span className="flex justify-between gap-2">
            <Skeleton fill="component" width={150} height={10} />
            <Skeleton fill="component" width={28} height={10} />
          </span>
        </span>
      ))}
    </div>
  )
}

export {
  BUDGET_NEAR_PERCENT,
  BUDGET_STATUS_LABEL,
  BudgetCard,
  BudgetCardFooter,
  BudgetCardHeader,
  BudgetCardItem,
  BudgetCardList,
  BudgetCardPeriod,
  BudgetCardSkeleton,
  BudgetCardTitle,
  BudgetCardTotal,
  getBudgetStatus,
  type BudgetCardItemProps,
  type BudgetCardProps,
  type BudgetStatus,
}
