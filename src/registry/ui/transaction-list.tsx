import { mergeProps } from '@base-ui/react/merge-props'
import { useRender } from '@base-ui/react/use-render'
import {
  Alert02Icon,
  ArrowDataTransferHorizontalIcon,
  ArrowDownLeft01Icon,
  ArrowLeft01Icon,
  Briefcase01Icon,
  Car01Icon,
  ChartBarIncreasingIcon,
  CheckmarkCircle02Icon,
  Clock01Icon,
  CancelCircleIcon,
  CodeIcon,
  CreditCardIcon,
  File01Icon,
  GitBranchIcon,
  Globe02Icon,
  Invoice01Icon,
  Megaphone01Icon,
  Message01Icon,
  MoreHorizontalIcon,
  PaintBoardIcon,
  PenTool01Icon,
  ServerStack01Icon,
  ShoppingBag01Icon,
  SlidersHorizontalIcon,
  TruckIcon,
  Wallet01Icon,
} from '@hugeicons/core-free-icons'
import type { IconSvgElement } from '@hugeicons/react'
import { cva } from 'class-variance-authority'
import { createContext, use, useId } from 'react'

import { Badge } from '@/components/ui/badge'
import { Icon } from '@/components/ui/icon'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

/*
 * Mayar v2 TransactionList (pattern). The shipped app is the source of truth; Wonder Dashboard ›
 * "Transaksi C Default v2" (Day Grouped List) is the visual reference. App sources: lib/components/TransactionList.svelte (the Transaksi "day feed" and
 * the QRIS "day cards"), CardRecentTransactions.svelte, lib/transaction-style.ts and
 * lib/category-style.ts (ported below as data).
 * feed: one white panel (radius 2xl, control shadow). Day header 36px min, component fill,
 * caption-lg; rows 56px, 16px side padding, 12px gap, hairline between rows.
 * cards: a 32px day header above a card per day (radius xl, ring + ambient shadow), no hairlines.
 * Row: 36px disc (32 in cards) · title body-sm medium ink · meta caption-lg muted
 * ("kategori · kartu · 08:15", the time never truncates) · amount body-sm semibold tabular,
 * "− Rp" out / "+ Rp" in (success-text), struck through and muted when declined or reversed.
 * The row status is the status Badge (md) 2px under the amount, only when it is not Berhasil.
 */

// ── Data: types, statuses, category and merchant styles ─────────────────────

type TransactionType = 'PURCHASE' | 'TOPUP_CREDIT' | 'REFUND' | 'REVERSAL' | 'ADJUSTMENT' | 'REJECTION_FEE'
type TransactionStatus = 'SETTLED' | 'PENDING' | 'DECLINED' | 'REVERSED'
type TransactionDirection = 'CREDIT' | 'DEBIT'
type TransactionStatusTone = 'success' | 'warning' | 'danger' | 'neutral'

/** The Indonesian label of each type (the meta line falls back to it with no category). */
const TRANSACTION_TYPE_LABEL: Record<TransactionType, string> = {
  PURCHASE: 'Pembayaran',
  TOPUP_CREDIT: 'Top-up Saldo',
  REFUND: 'Pengembalian Dana',
  REVERSAL: 'Pembalikan',
  ADJUSTMENT: 'Penyesuaian',
  REJECTION_FEE: 'Biaya Penolakan',
}

interface TransactionStatusMeta {
  label: string
  tone: TransactionStatusTone
  icon: IconSvgElement
  badge: 'success' | 'warning' | 'danger' | 'default'
}

/** Status → label, tone, glyph and Badge variant (V2 vocabulary: Menunggu, Ditolak, Dibalik). */
const TRANSACTION_STATUS: Record<TransactionStatus, TransactionStatusMeta> = {
  SETTLED: { label: 'Berhasil', tone: 'success', icon: CheckmarkCircle02Icon, badge: 'success' },
  PENDING: { label: 'Menunggu', tone: 'warning', icon: Clock01Icon, badge: 'warning' },
  DECLINED: { label: 'Ditolak', tone: 'danger', icon: CancelCircleIcon, badge: 'danger' },
  REVERSED: { label: 'Dibalik', tone: 'neutral', icon: ArrowDataTransferHorizontalIcon, badge: 'default' },
}

/** A declined or reversed row: struck through and left out of the day totals. */
function isVoidTransaction(status: TransactionStatus): boolean {
  return status === 'DECLINED' || status === 'REVERSED'
}

/** A disc style: a glyph, an accent colour and the 16% wash behind it. */
interface CategoryStyle {
  icon: IconSvgElement
  /** A CSS colour (a chart token): the glyph and the category bar. */
  color: string
  /** The 16% wash of `color`: the disc fill. */
  tint: string
}

type ChartToken = 1 | 2 | 3 | 4 | 5 | 6

const chartAccent = (n: ChartToken) => ({
  color: `var(--color-chart-${n})`,
  tint: `color-mix(in srgb, var(--color-chart-${n}) 16%, transparent)`,
})

/** The label the API gives the no-category bucket. */
const UNCATEGORIZED = 'Uncategorized'

/** Fixed category → chart slot (design/chart.md). A category keeps its colour on every chart. */
const CATEGORY_TOKENS: Record<string, ChartToken> = {
  Pemasaran: 1,
  Operasional: 2,
  'Perjalanan Dinas': 4,
  Perjalanan: 4,
  Lainnya: 6,
  [UNCATEGORIZED]: 6,
  'Iklan & Marketing': 1,
  'Transport & Logistik': 4,
  'Software & Langganan': 3,
  'Perangkat lunak': 3,
  Transportasi: 5,
}

const CATEGORY_ICONS: Record<string, IconSvgElement> = {
  Pemasaran: Megaphone01Icon,
  Operasional: Briefcase01Icon,
  'Perjalanan Dinas': Car01Icon,
  Perjalanan: Car01Icon,
  Lainnya: MoreHorizontalIcon,
  [UNCATEGORIZED]: MoreHorizontalIcon,
  'Software & Langganan': CodeIcon,
  'Iklan & Marketing': Megaphone01Icon,
  'Transport & Logistik': TruckIcon,
}

/** Slots an unknown category may hash into (never 1, 2, 4 or 6). */
const FALLBACK_TOKENS: readonly [ChartToken, ...ChartToken[]] = [3, 5]
/** Generic glyphs for an unknown category. */
const FALLBACK_ICONS: readonly [IconSvgElement, ...IconSvgElement[]] = [
  Invoice01Icon,
  Wallet01Icon,
  CreditCardIcon,
  ChartBarIncreasingIcon,
]

const normalizeName = (name: string) => name.trim().replace(/\s+/g, ' ').toLowerCase()
const TOKENS_BY_KEY = new Map(Object.entries(CATEGORY_TOKENS).map(([k, v]) => [normalizeName(k), v]))
const ICONS_BY_KEY = new Map(Object.entries(CATEGORY_ICONS).map(([k, v]) => [normalizeName(k), v]))

/** FNV-1a (32-bit): an unknown name always gets the same colour and glyph. */
function hashName(key: string): number {
  let hash = 0x811c9dc5
  for (let i = 0; i < key.length; i += 1) {
    hash ^= key.charCodeAt(i)
    hash = Math.imul(hash, 0x01000193)
  }
  return hash >>> 0
}

function pick<T>(items: readonly [T, ...T[]], index: number): T {
  return items[index % items.length] ?? items[0]
}

/** The chart slot (1–6) of a category: its fixed slot, or a stable hash into 3 or 5. */
function categoryToken(name: string): ChartToken {
  const key = normalizeName(name)
  return TOKENS_BY_KEY.get(key) ?? pick(FALLBACK_TOKENS, hashName(key))
}

/** The glyph, colour and wash of a category. Only for category indicators, never for status. */
function categoryStyle(name: string): CategoryStyle {
  const key = normalizeName(name)
  return {
    icon: ICONS_BY_KEY.get(key) ?? pick(FALLBACK_ICONS, hashName(key) >>> 8),
    ...chartAccent(categoryToken(name)),
  }
}

/** Known merchants (first match wins). Anything else falls through to the category. */
const MERCHANT_TILES: ReadonlyArray<readonly [RegExp, CategoryStyle]> = [
  [/aws|amazon web|\bec2\b|\bs3\b|google cloud|\bgcp\b|azure/, { icon: ServerStack01Icon, ...chartAccent(2) }],
  [/niagahoster|niaga|hosting|domain|cpanel|\bvps\b/, { icon: Globe02Icon, ...chartAccent(2) }],
  [/tokopedia|shopee|lazada|bukalapak|blibli|belanja|\btoko\b/, { icon: ShoppingBag01Icon, ...chartAccent(4) }],
  [/gojek|grab|gocar|goride|indrive|maxim|\buber\b|transport|taksi|taxi|logistik/, { icon: Car01Icon, ...chartAccent(5) }],
  [/meta ads|google ads|facebook|instagram|tiktok|\bads\b|iklan|marketing/, { icon: Megaphone01Icon, ...chartAccent(1) }],
  [/canva/, { icon: PaintBoardIcon, ...chartAccent(1) }],
  [/figma/, { icon: PenTool01Icon, ...chartAccent(2) }],
  [/notion/, { icon: File01Icon, ...chartAccent(6) }],
  [/slack/, { icon: Message01Icon, ...chartAccent(4) }],
  [/linear|github|gitlab|bitbucket/, { icon: GitBranchIcon, ...chartAccent(2) }],
]

const CREDIT_STYLE: CategoryStyle = { icon: ArrowDownLeft01Icon, ...chartAccent(5) }

/** Per-type discs. PURCHASE is absent: a spend row uses its merchant or category disc. */
const TYPE_STYLE: Partial<Record<TransactionType, CategoryStyle>> = {
  TOPUP_CREDIT: CREDIT_STYLE,
  REFUND: { icon: ArrowLeft01Icon, ...chartAccent(5) },
  REVERSAL: { icon: ArrowDataTransferHorizontalIcon, ...chartAccent(3) },
  ADJUSTMENT: { icon: SlidersHorizontalIcon, ...chartAccent(6) },
  REJECTION_FEE: { icon: Alert02Icon, ...chartAccent(4) },
}

interface TransactionIconInput {
  type: TransactionType
  direction: TransactionDirection
  merchantName?: string | null
  category?: string | null
}

/** The disc for a row: type disc, then credit, then known merchant, then category. */
function transactionIconStyle(tx: TransactionIconInput): CategoryStyle {
  const typed = TYPE_STYLE[tx.type]
  if (typed) return typed
  if (tx.direction === 'CREDIT') return CREDIT_STYLE
  const folded = tx.merchantName?.toLowerCase()
  if (folded) {
    for (const [pattern, style] of MERCHANT_TILES) if (pattern.test(folded)) return style
  }
  return categoryStyle(tx.category || UNCATEGORIZED)
}

// ── Formatting ──────────────────────────────────────────────────────────────

const RUPIAH = new Intl.NumberFormat('id-ID')

/** "− Rp 1.250.000" (U+2212) out, "+ Rp 5.000.000" in. Other currencies: "− USD 12". */
function formatTransactionAmount(amount: number, direction: TransactionDirection, currency = 'IDR'): string {
  const sign = direction === 'CREDIT' ? '+' : '−'
  const body = RUPIAH.format(Math.abs(amount))
  return `${sign} ${currency === 'IDR' ? 'Rp' : currency} ${body}`
}

const timeFormat = (timeZone?: string) =>
  new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZone })

/** "08:15" in the viewer's zone (or `timeZone`). id-ID prints "08.15"; the app uses a colon. */
function formatTransactionTime(iso: string, timeZone?: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  return timeFormat(timeZone)
    .formatToParts(date)
    .map((part) => (part.type === 'literal' ? part.value.replace(/\./g, ':') : part.value))
    .join('')
}

const dayKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

/** "Hari ini · Kamis, 12 Nov", "Kemarin · …", or "Senin, 9 Nov" (a year when it is not this year). */
const dayFormat = new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'short' })
const dayFormatWithYear = new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })

function formatTransactionDay(iso: string, now = new Date()): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return 'Tanggal tidak diketahui'
  const text = (date.getFullYear() !== now.getFullYear() ? dayFormatWithYear : dayFormat).format(date)
  const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1)
  if (dayKey(date) === dayKey(now)) return `Hari ini · ${text}`
  if (dayKey(date) === dayKey(yesterday)) return `Kemarin · ${text}`
  return text
}

/** The fields the day grouping reads. */
interface GroupableTransaction {
  id: string
  occurredAt: string
  amount: number
  direction: TransactionDirection
  status: TransactionStatus
}

interface TransactionDayGroup<T extends GroupableTransaction> {
  key: string
  label: string
  /** "Keluar Rp 1.250.000 · Masuk Rp 5.000.000" (declined and reversed rows left out). */
  summary: string
  rows: T[]
}

/** Groups rows (newest first) under day labels with the money out and in for each day. */
function groupTransactionsByDay<T extends GroupableTransaction>(rows: readonly T[], now = new Date()): TransactionDayGroup<T>[] {
  const groups = new Map<string, TransactionDayGroup<T> & { out: number; in: number }>()
  for (const tx of rows) {
    const date = new Date(tx.occurredAt)
    const key = Number.isNaN(date.getTime()) ? 'unknown' : dayKey(date)
    let group = groups.get(key)
    if (!group) {
      group = { key, label: formatTransactionDay(tx.occurredAt, now), summary: '', rows: [], out: 0, in: 0 }
      groups.set(key, group)
    }
    group.rows.push(tx)
    if (!isVoidTransaction(tx.status)) {
      if (tx.direction === 'CREDIT') group.in += tx.amount
      else group.out += tx.amount
    }
  }
  return [...groups.values()].map(({ out, in: incoming, ...group }) => ({
    ...group,
    summary: [out > 0 && `Keluar Rp ${RUPIAH.format(out)}`, incoming > 0 && `Masuk Rp ${RUPIAH.format(incoming)}`]
      .filter(Boolean)
      .join(' · '),
  }))
}

// ── Components ──────────────────────────────────────────────────────────────

type TransactionListVariant = 'feed' | 'cards'

const TransactionListContext = createContext<TransactionListVariant>('feed')

const listVariants = cva('grid min-w-0 grid-cols-[minmax(0,1fr)] font-sans text-ink', {
  variants: {
    variant: {
      feed: 'overflow-clip rounded-2xl bg-surface shadow-control',
      cards: 'gap-3',
    },
  },
  defaultVariants: { variant: 'feed' },
})

interface TransactionListProps extends React.ComponentProps<'div'> {
  /** `feed`: one panel with day headers (Transaksi). `cards`: a card per day (QRIS detail). */
  variant?: TransactionListVariant
}

/**
 * Transactions grouped by day. Each row is a button (or a link through `render`) that opens a
 * detail, e.g. a `Dialog` drawer.
 *
 * Compose it: `<TransactionList><TransactionGroup label="Hari ini · Kamis, 12 Nov" summary="Keluar
 * Rp 1.250.000"><TransactionRow onClick={…}><TransactionRowIcon …/><TransactionRowContent>…
 * </TransactionRowContent><TransactionRowEnd>…</TransactionRowEnd></TransactionRow></TransactionGroup>
 * </TransactionList>`. `groupTransactionsByDay`, `transactionIconStyle` and the format helpers
 * turn API rows into that shape.
 */
function TransactionList({ className, variant = 'feed', ...props }: TransactionListProps) {
  return (
    <TransactionListContext value={variant}>
      <div
        data-slot="transaction-list"
        data-variant={variant}
        {...props}
        className={cn(listVariants({ variant }), className)}
      />
    </TransactionListContext>
  )
}

interface TransactionGroupProps extends Omit<React.ComponentProps<'div'>, 'children'> {
  /** The day label ("Hari ini · Kamis, 12 Nov"). It names the group. */
  label: React.ReactNode
  /** The day totals on the right ("Keluar Rp … · Masuk Rp …"). */
  summary?: React.ReactNode
  /** The rows. */
  children?: React.ReactNode
}

/** One day: a header with the label and totals, then its rows as a list. A `role="group"` named by the day. */
function TransactionGroup({ className, label, summary, children, ...props }: TransactionGroupProps) {
  const variant = use(TransactionListContext)
  const labelId = useId()
  const cards = variant === 'cards'
  return (
    <div
      role="group"
      data-slot="transaction-group"
      aria-labelledby={labelId}
      {...props}
      className={cn('flex min-w-0 flex-col', !cards && 'border-t border-border-subtle first:border-t-0', className)}
    >
      <div
        data-slot="transaction-group-header"
        className={cn(
          'flex items-center justify-between gap-4 text-caption-lg',
          cards ? 'h-8' : 'min-h-9 bg-component px-4 py-2',
        )}
      >
        <h3 id={labelId} className={cn('m-0 shrink-0 text-caption-lg font-semibold', cards ? 'text-muted' : 'text-ink-2')}>
          {label}
        </h3>
        {summary ? <span className="min-w-0 text-right text-muted tabular-nums">{summary}</span> : null}
      </div>
      <ul
        role="list"
        className={cn(
          'm-0 flex list-none flex-col p-0',
          cards &&
            'overflow-clip rounded-xl bg-surface shadow-[0_0_0_1px_var(--color-shadow-ring),0_1px_2px_var(--color-shadow-ambient)]',
        )}
      >
        {children}
      </ul>
    </div>
  )
}

const rowVariants = cva(
  [
    'relative flex w-full min-w-0 items-center gap-3 px-4 text-start font-sans outline-none select-none',
    'transition-[background-color] duration-(--motion-quick) ease-smooth-out',
    'cursor-pointer no-underline',
    'hover-fine:bg-canvas pressed:bg-sunken',
    'focus-ring:z-[1] focus-ring:outline-focus focus-ring:outline-offset-[-2px]!',
    'data-selected:bg-primary-tint hover-fine:data-selected:bg-primary-tint',
    'disabled:cursor-default aria-disabled:cursor-default',
  ],
  {
    variants: {
      variant: {
        feed: 'h-14 border-b border-border-subtle bg-surface [li:last-child>&]:border-b-0',
        cards: 'h-14 bg-transparent',
      },
    },
    defaultVariants: { variant: 'feed' },
  },
)

interface TransactionRowProps extends useRender.ComponentProps<'button'> {
  /** The row whose detail is open. Tints the row and sets `aria-current`. */
  selected?: boolean
}

/**
 * One transaction. A `<button>` in a list item by default; `render={<a href="…" />}` makes it a
 * link. Give it an `aria-label` such as "Lihat detail: Tokopedia".
 */
function TransactionRow({ className, selected = false, render, ...props }: TransactionRowProps) {
  const variant = use(TransactionListContext)
  const isNativeButton = render === undefined
  const defaultProps: useRender.ElementProps<'button'> = {
    'data-slot': 'transaction-row',
    ...(isNativeButton ? { type: 'button' } : {}),
    'data-selected': selected ? '' : undefined,
    'aria-current': selected ? 'true' : undefined,
    className: cn(rowVariants({ variant }), className),
  } as useRender.ElementProps<'button'>
  const element = useRender({ defaultTagName: 'button', render, props: mergeProps<'button'>(defaultProps, props) })
  return <li className="flex min-w-0">{element}</li>
}

const iconVariants = cva(
  'inline-flex shrink-0 items-center justify-center rounded-pill text-caption-lg font-semibold [&_svg]:size-4',
  {
    variants: {
      tone: {
        neutral: 'bg-component text-ink-2',
        credit: 'bg-success-light text-success-text',
        accent: '',
      },
    },
    defaultVariants: { tone: 'neutral' },
  },
)

interface TransactionRowIconProps extends React.ComponentProps<'span'> {
  /** The glyph. Leave it out and pass a letter as `children` for a merchant initial. */
  icon?: IconSvgElement
  /** `neutral` (feed default), `credit` (money in), `accent` (paints with `style`, e.g. a category). */
  tone?: 'neutral' | 'credit' | 'accent'
  /** For `tone="accent"`: a CategoryStyle from `transactionIconStyle` or `categoryStyle`. */
  accent?: Pick<CategoryStyle, 'color' | 'tint'>
}

/** The disc at the start of the row: 36px in a feed, 32px in cards. Decorative. */
function TransactionRowIcon({ className, icon, tone = 'neutral', accent, style, children, ...props }: TransactionRowIconProps) {
  const variant = use(TransactionListContext)
  const accentStyle =
    tone === 'accent' && accent
      ? { background: accent.tint, color: `color-mix(in srgb, ${accent.color} 80%, var(--color-ink))` }
      : undefined
  return (
    <span
      data-slot="transaction-row-icon"
      data-tone={tone}
      aria-hidden
      {...props}
      style={{ ...accentStyle, ...style }}
      className={cn(iconVariants({ tone }), variant === 'cards' ? 'size-8' : 'size-9', className)}
    >
      {icon ? <Icon icon={icon} /> : children}
    </span>
  )
}

/** The text column: title over meta. Takes the free width and truncates. */
function TransactionRowContent({ className, ...props }: React.ComponentProps<'span'>) {
  return <span data-slot="transaction-row-content" {...props} className={cn('flex min-w-0 flex-1 flex-col', className)} />
}

/** The merchant (or description, or type label). */
function TransactionRowTitle({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      data-slot="transaction-row-title"
      {...props}
      className={cn('min-w-0 truncate text-body-sm font-medium text-ink', className)}
    />
  )
}

/**
 * The meta line: "kategori · kartu" truncates, then a `TransactionRowTime` that never shrinks.
 * Separate parts with `<TransactionRowSeparator />`.
 */
function TransactionRowMeta({ className, children, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      data-slot="transaction-row-meta"
      {...props}
      className={cn('flex min-w-0 gap-x-1 text-caption-lg text-muted', className)}
    >
      {children}
    </span>
  )
}

/** The part of the meta line that may truncate (category, card name, masked number). */
function TransactionRowDetail({ className, ...props }: React.ComponentProps<'span'>) {
  return <span data-slot="transaction-row-detail" {...props} className={cn('min-w-0 truncate', className)} />
}

/** A "·" between meta parts, hidden from screen readers. */
function TransactionRowSeparator({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span data-slot="transaction-row-separator" aria-hidden {...props} className={cn('shrink-0', className)}>
      ·
    </span>
  )
}

interface TransactionRowTimeProps extends Omit<React.ComponentProps<'time'>, 'children'> {
  /** ISO instant. */
  dateTime: string
  /** Pin a zone (e.g. "Asia/Jakarta" for server rendering). Default: the viewer's zone. */
  timeZone?: string
}

/** "08:15", never truncated. A `<time>` element. */
function TransactionRowTime({ className, dateTime, timeZone, ...props }: TransactionRowTimeProps) {
  return (
    <time
      data-slot="transaction-row-time"
      dateTime={dateTime}
      {...props}
      className={cn('shrink-0 whitespace-nowrap tabular-nums', className)}
    >
      {formatTransactionTime(dateTime, timeZone)}
    </time>
  )
}

/** The end column: amount over the status badge. */
function TransactionRowEnd({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      data-slot="transaction-row-end"
      {...props}
      className={cn('flex shrink-0 flex-col items-end gap-0.5', className)}
    />
  )
}

interface TransactionAmountProps extends Omit<React.ComponentProps<'span'>, 'children'> {
  /** The amount, positive, in whole currency units. */
  amount: number
  direction: TransactionDirection
  currency?: string
  /** Declined or reversed: struck through and muted. Pass `isVoidTransaction(status)`. */
  void?: boolean
}

/** The signed amount: "− Rp …" in ink, "+ Rp …" in success-text, struck through when void. */
function TransactionAmount({ className, amount, direction, currency, void: isVoid = false, ...props }: TransactionAmountProps) {
  return (
    <span
      data-slot="transaction-amount"
      data-direction={direction}
      data-void={isVoid ? '' : undefined}
      {...props}
      className={cn(
        'text-body-sm font-semibold whitespace-nowrap tabular-nums',
        isVoid ? 'text-muted line-through' : direction === 'CREDIT' ? 'text-success-text' : 'text-ink',
        className,
      )}
    >
      {formatTransactionAmount(amount, direction, currency)}
    </span>
  )
}

interface TransactionStatusBadgeProps extends Omit<React.ComponentProps<typeof Badge>, 'variant' | 'children'> {
  status: TransactionStatus
  /** Show the glyph before the label (detail drawer, card table). */
  withIcon?: boolean
}

/** The status chip (Berhasil, Menunggu, Ditolak, Dibalik) for a detail drawer or a card table. Rows use `TransactionRowStatus` (the same Badge, hidden for SETTLED). */
function TransactionStatusBadge({ status, withIcon = false, ...props }: TransactionStatusBadgeProps) {
  const meta = TRANSACTION_STATUS[status]
  return (
    <Badge data-slot="transaction-status-badge" data-status={status} variant={meta.badge} {...props}>
      {withIcon ? <Icon icon={meta.icon} size={12} /> : null}
      {meta.label}
    </Badge>
  )
}

interface TransactionRowStatusProps extends Omit<React.ComponentProps<typeof Badge>, 'variant' | 'children'> {
  status: TransactionStatus
}

/**
 * The status under the amount: the status Badge (md, no glyph), as the app's feed rows. Renders
 * nothing for SETTLED, because a row only shows the exceptions.
 */
function TransactionRowStatus({ status, ...props }: TransactionRowStatusProps) {
  if (status === 'SETTLED') return null
  const meta = TRANSACTION_STATUS[status]
  return (
    <Badge data-slot="transaction-row-status" data-status={status} variant={meta.badge} {...props}>
      {meta.label}
    </Badge>
  )
}

/** The foot of a feed: a load-more button and its error. */
function TransactionListFooter({ className, ...props }: React.ComponentProps<'div'>) {
  const variant = use(TransactionListContext)
  return (
    <div
      data-slot="transaction-list-footer"
      {...props}
      className={cn(
        'flex min-h-12 flex-col items-center justify-center gap-1 px-4 py-1',
        variant === 'feed' && 'border-t border-border-subtle',
        className,
      )}
    />
  )
}

interface TransactionListSkeletonProps extends React.ComponentProps<'div'> {
  /** Rows per placeholder day. */
  groups?: readonly number[]
  /** Spoken while loading. */
  label?: string
}

/** Placeholder day headers and rows at the filled heights, so nothing moves when data comes in. */
function TransactionListSkeleton({ className, groups = [4, 6], label = 'Memuat transaksi', ...props }: TransactionListSkeletonProps) {
  const variant = use(TransactionListContext)
  const cards = variant === 'cards'
  const widths = [180, 120, 156, 132, 168, 96]
  return (
    <div
      data-slot="transaction-list-skeleton"
      role="status"
      aria-busy="true"
      {...props}
      className={cn('flex min-w-0 flex-col', cards && 'gap-3', className)}
    >
      <span className="sr-only">{label}</span>
      {groups.map((count, g) => (
        <div key={g} aria-hidden className={cn('flex flex-col', !cards && 'border-t border-border-subtle first:border-t-0')}>
          <span className={cn('flex items-center justify-between gap-4', cards ? 'h-8' : 'min-h-9 bg-component px-4 py-2')}>
            <Skeleton fill="component" width={140} height={10} radius="full" />
            <Skeleton fill="component" width={cards ? 80 : 180} height={10} radius="full" />
          </span>
          <span
            className={cn(
              'flex flex-col',
              cards && 'overflow-clip rounded-xl bg-surface shadow-[0_0_0_1px_var(--color-shadow-ring),0_1px_2px_var(--color-shadow-ambient)]',
            )}
          >
            {Array.from({ length: count }, (_, r) => (
              <span
                key={r}
                className={cn('flex h-14 items-center gap-3 px-4', !cards && 'border-b border-border-subtle last:border-b-0')}
              >
                <Skeleton fill="component" width={cards ? 32 : 36} height={cards ? 32 : 36} radius="full" />
                <span className="flex min-w-0 flex-1 flex-col gap-2">
                  <Skeleton fill="component" width={widths[(g * 3 + r) % widths.length]} height={10} radius="full" />
                  <Skeleton fill="component" width="60%" height={8} radius="full" />
                </span>
                <Skeleton fill="component" width={96} height={10} radius="full" />
              </span>
            ))}
          </span>
        </div>
      ))}
    </div>
  )
}

export {
  CATEGORY_TOKENS,
  TRANSACTION_STATUS,
  TRANSACTION_TYPE_LABEL,
  TransactionAmount,
  TransactionGroup,
  TransactionList,
  TransactionListFooter,
  TransactionListSkeleton,
  TransactionRow,
  TransactionRowContent,
  TransactionRowDetail,
  TransactionRowEnd,
  TransactionRowIcon,
  TransactionRowMeta,
  TransactionRowSeparator,
  TransactionRowStatus,
  TransactionRowTime,
  TransactionRowTitle,
  TransactionStatusBadge,
  UNCATEGORIZED,
  categoryStyle,
  categoryToken,
  formatTransactionAmount,
  formatTransactionDay,
  formatTransactionTime,
  groupTransactionsByDay,
  isVoidTransaction,
  transactionIconStyle,
  type CategoryStyle,
  type GroupableTransaction,
  type TransactionDayGroup,
  type TransactionDirection,
  type TransactionListProps,
  type TransactionListVariant,
  type TransactionRowProps,
  type TransactionStatus,
  type TransactionStatusTone,
  type TransactionType,
}
