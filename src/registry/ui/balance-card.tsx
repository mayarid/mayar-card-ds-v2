import { mergeProps } from '@base-ui/react/merge-props'
import { Toggle } from '@base-ui/react/toggle'
import { useRender } from '@base-ui/react/use-render'
import { AlertCircleIcon, ArrowDownLeft01Icon, ArrowUpRight01Icon, ViewIcon, ViewOffIcon } from '@hugeicons/core-free-icons'
import { cva, type VariantProps } from 'class-variance-authority'
import { createContext, use, useCallback, useMemo, useState } from 'react'

import { AnimatedNumber } from '@/components/ui/animated-number'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

/*
 * Mayar v2 BalanceCard (pattern). App code first, Wonder Dashboard › "Balance Card Tab Saldo Akun v2" and
 * "Balance Card Hidden v2" (Metric Tabs), plus the app: Beranda stat tiles (routes/+page.svelte
 * `.tile`) and the top-up balance strip (routes/top-up/+page.svelte `.topup-strip`, code-only).
 * card: white, radius 2xl, control shadow, 16px padding, 12px gap.
 * tile: the same box with no chrome, for a BalanceCardGroup (hairline right and bottom edges).
 * strip: one row, 16×20 padding, label + value on the left, actions on the right.
 * Label body-sm medium ink-2 (icon 16 muted) · value title-md semibold ink, tabular ·
 * caption caption-lg muted, 20px min height, 12px under the value (the card gap) · delta chip 20px,
 * radius sm, 4/6 padding, 14px arrow, 6px to its period · hide toggle: the ghost icon Button
 * (32px, radius lg, ink-2 glyph), as the app's `Button variant="ghost" size="md" icon`.
 * The source of truth is the app code (decision 2026-11-12); Wonder is the visual reference.
 * Hidden balance: a mask "Rp ••••••••" that screen readers hear as "saldo disembunyikan".
 */

/** The mask the app shows in place of a hidden money figure. */
const BALANCE_MASK = 'Rp ••••••••'
/** What a screen reader hears in place of the mask. */
const BALANCE_HIDDEN_LABEL = 'saldo disembunyikan'

const RUPIAH = new Intl.NumberFormat('id-ID')

/** "Rp 48.250.000". A negative value gets a true minus: "−Rp 1.000". Other currencies: "USD 1.000". */
function formatRupiah(value: number, currency = 'IDR'): string {
  const sign = value < 0 ? '−' : ''
  const body = RUPIAH.format(Math.abs(value))
  return currency === 'IDR' ? `${sign}Rp ${body}` : `${sign}${currency} ${body}`
}

interface BalanceCardContextValue {
  hidden: boolean
  setHidden: (hidden: boolean) => void
  loading: boolean
  variant: BalanceCardVariant
}

const BalanceCardContext = createContext<BalanceCardContextValue>({
  hidden: false,
  setHidden: () => {},
  loading: false,
  variant: 'card',
})

/** The hidden and loading state of the nearest BalanceCard (or BalanceCardGroup). */
function useBalanceCard() {
  return use(BalanceCardContext)
}

/** Controlled + uncontrolled `hidden` state. */
function useHiddenState(hidden: boolean | undefined, defaultHidden: boolean, onHiddenChange?: (hidden: boolean) => void) {
  const [inner, setInner] = useState(defaultHidden)
  const value = hidden ?? inner
  const setValue = useCallback(
    (next: boolean) => {
      if (hidden === undefined) setInner(next)
      onHiddenChange?.(next)
    },
    [hidden, onHiddenChange],
  )
  return [value, setValue] as const
}

const balanceCardVariants = cva('group/balance flex min-w-0 font-sans text-ink', {
  variants: {
    variant: {
      card: 'flex-col gap-3 rounded-2xl bg-surface p-4 shadow-control',
      tile: [
        'flex-col gap-3 bg-transparent p-4 text-start',
        'shadow-[1px_0_0_var(--color-border-subtle),0_1px_0_var(--color-border-subtle)]',
        // A tile that is a tab or a button: hover wash, selected fill, inset focus outline.
        '[&:is(button,a,[role=tab])]:cursor-pointer [&:is(button,a,[role=tab])]:outline-none',
        '[&:is(button,a,[role=tab])]:transition-[background-color] [&:is(button,a,[role=tab])]:duration-(--motion-quick) [&:is(button,a,[role=tab])]:ease-smooth-out',
        '[&:is(button,a,[role=tab])]:hover-fine:bg-state-hover',
        '[&:is(button,a,[role=tab])]:pressed:bg-state-pressed',
        'aria-selected:bg-component',
        'focus-ring:outline-focus focus-ring:outline-offset-[-1px]!',
      ],
      strip: 'flex-row items-center justify-between gap-6 max-md:gap-4 rounded-2xl bg-surface px-5 py-4 shadow-control',
    },
  },
  defaultVariants: { variant: 'card' },
})

type BalanceCardVariant = NonNullable<VariantProps<typeof balanceCardVariants>['variant']>

interface BalanceCardProps extends useRender.ComponentProps<'div'>, VariantProps<typeof balanceCardVariants> {
  /** Masks every money figure inside. Controlled. */
  hidden?: boolean
  /** Masks every money figure inside. Uncontrolled start value. */
  defaultHidden?: boolean
  /** Called when `BalanceCardHideToggle` changes the hidden state. Persist it here (e.g. localStorage). */
  onHiddenChange?: (hidden: boolean) => void
  /** Shows skeleton bones in place of the value and the caption, and sets `aria-busy`. */
  loading?: boolean
}

/**
 * A saldo summary: a label, a large animated Rupiah figure, a caption or a delta, and actions.
 *
 * Compose it: `<BalanceCard><BalanceCardHeader><BalanceCardLabel>…</BalanceCardLabel>
 * <BalanceCardHideToggle /></BalanceCardHeader><BalanceCardValue value={48250000} />
 * <BalanceCardCaption>…</BalanceCardCaption></BalanceCard>`.
 * `hidden` / `defaultHidden` / `onHiddenChange` mask every figure inside (sighted users see dots,
 * screen readers hear "saldo disembunyikan"). Inside a `BalanceCardGroup` the group owns that state.
 */
function BalanceCard({
  className,
  variant,
  hidden,
  defaultHidden = false,
  onHiddenChange,
  loading = false,
  render,
  ...props
}: BalanceCardProps) {
  const parent = use(BalanceCardContext)
  const inGroup = use(BalanceCardGroupContext)
  const [ownHidden, setOwnHidden] = useHiddenState(hidden, defaultHidden, onHiddenChange)
  const resolvedVariant = variant ?? (inGroup ? 'tile' : 'card')
  // In a group, the group owns `hidden` unless this card is controlled itself.
  const useParent = inGroup && hidden === undefined
  const context = useMemo<BalanceCardContextValue>(
    () => ({
      hidden: useParent ? parent.hidden : ownHidden,
      setHidden: useParent ? parent.setHidden : setOwnHidden,
      loading: loading || (inGroup && parent.loading),
      variant: resolvedVariant,
    }),
    [useParent, parent, ownHidden, setOwnHidden, loading, inGroup, resolvedVariant],
  )

  const defaultProps: useRender.ElementProps<'div'> = {
    'data-slot': 'balance-card',
    'data-variant': resolvedVariant,
    'data-hidden': context.hidden ? '' : undefined,
    'aria-busy': context.loading || undefined,
    className: cn(balanceCardVariants({ variant: resolvedVariant }), className),
  } as useRender.ElementProps<'div'>

  const element = useRender({ defaultTagName: 'div', render, props: mergeProps<'div'>(defaultProps, props) })
  return <BalanceCardContext value={context}>{element}</BalanceCardContext>
}

const BalanceCardGroupContext = createContext(false)

interface BalanceCardGroupProps extends React.ComponentProps<'div'> {
  /** Tiles per row from 1280px up. Below: one column, two from 640px. */
  columns?: number
  hidden?: boolean
  defaultHidden?: boolean
  onHiddenChange?: (hidden: boolean) => void
  loading?: boolean
}

/**
 * One card that holds several balance tiles (Beranda: Saldo akun, Saldo kartu, Saldo QRIS…).
 * It owns one hidden state for every tile, so one `BalanceCardHideToggle` masks them all.
 * For tiles that switch a chart, give the group `role="tablist"` and each tile
 * `render={<button role="tab" aria-selected={…} />}`.
 */
function BalanceCardGroup({
  className,
  columns = 4,
  hidden,
  defaultHidden = false,
  onHiddenChange,
  loading = false,
  style,
  children,
  ...props
}: BalanceCardGroupProps) {
  const [value, setValue] = useHiddenState(hidden, defaultHidden, onHiddenChange)
  const context = useMemo<BalanceCardContextValue>(
    () => ({ hidden: value, setHidden: setValue, loading, variant: 'tile' }),
    [value, setValue, loading],
  )
  return (
    <BalanceCardContext value={context}>
      <BalanceCardGroupContext value>
        <div
          data-slot="balance-card-group"
          data-hidden={value ? '' : undefined}
          aria-busy={loading || undefined}
          {...props}
          style={{ '--tile-count': columns, ...style } as React.CSSProperties}
          className={cn(
            'grid min-w-0 grid-cols-1 overflow-hidden rounded-2xl bg-surface font-sans text-ink shadow-control',
            'sm:grid-cols-2 xl:grid-cols-[repeat(var(--tile-count),minmax(0,1fr))]',
            className,
          )}
        >
          {children}
        </div>
      </BalanceCardGroupContext>
    </BalanceCardContext>
  )
}

/** The top row: the label on the left, the hide toggle or a menu on the right. */
function BalanceCardHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="balance-card-header"
      {...props}
      className={cn('flex min-h-5 min-w-0 items-center justify-between gap-2', className)}
    />
  )
}

/** Groups the label and the value of a `strip` card. */
function BalanceCardContent({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="balance-card-content" {...props} className={cn('flex min-w-0 flex-col gap-0.5', className)} />
}

/** The name of the balance, with an optional leading `<Icon />`. */
function BalanceCardLabel({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      data-slot="balance-card-label"
      {...props}
      className={cn(
        'flex min-w-0 items-center gap-1.5 text-body-sm font-medium text-ink-2',
        '[&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-muted',
        'in-aria-selected:text-ink',
        'group-data-[variant=strip]/balance:font-normal group-data-[variant=strip]/balance:text-muted',
        className,
      )}
    />
  )
}

interface BalanceCardValueProps extends Omit<React.ComponentProps<'span'>, 'children' | 'prefix'> {
  /** A word after the figure in body-sm ink-2, e.g. "terpakai" (Wonder Anggaran tab). */
  children?: React.ReactNode
  /** The amount in Rupiah (whole units). `null`: not available, shows "—". */
  value: number | null
  /** ISO currency. IDR prints "Rp ". Ignored when `money` is false. */
  currency?: string
  /** Text after the number, e.g. `"%"` for a budget tile. */
  suffix?: string
  /** Money is masked when the card is hidden. Set `false` for a figure that is not money (a percent). */
  money?: boolean
}

/** The large figure. Animates to a new value, masks when hidden, shows a bone while loading. */
function BalanceCardValue({ children, ...props }: BalanceCardValueProps) {
  const { loading } = useBalanceCard()
  if (children === undefined || loading) return <BalanceCardFigure {...props} />
  return (
    <span data-slot="balance-card-value" className="flex min-w-0 items-baseline gap-1">
      <BalanceCardFigure {...props} data-slot="balance-card-figure" />
      <span className="shrink-0 text-body-sm text-ink-2">{children}</span>
    </span>
  )
}

function BalanceCardFigure({ className, value, currency = 'IDR', suffix, money = true, ...props }: Omit<BalanceCardValueProps, 'children'>) {
  const { hidden, loading } = useBalanceCard()
  const classes = cn('block min-w-0 truncate text-title-md font-semibold text-ink tabular-nums', className)
  if (loading) {
    return (
      <span data-slot="balance-card-value" data-loading="" className="flex h-7 items-center">
        <Skeleton fill="component" width={160} height={24} radius="md" />
      </span>
    )
  }
  if (value === null) {
    return (
      <span data-slot="balance-card-value" {...props} className={classes}>
        —
      </span>
    )
  }
  return (
    <AnimatedNumber
      data-slot="balance-card-value"
      value={value}
      prefix={money ? (currency === 'IDR' ? 'Rp ' : `${currency} `) : ''}
      suffix={suffix}
      format={{ maximumFractionDigits: 0 }}
      hidden={money && hidden}
      hiddenText={BALANCE_MASK}
      hiddenLabel={BALANCE_HIDDEN_LABEL}
      {...props}
      className={cn(classes, 'font-sans')}
    />
  )
}

interface BalanceCardAmountProps extends Omit<React.ComponentProps<'span'>, 'children'> {
  value: number
  currency?: string
}

/** A money figure inside running text ("Rp 2.000.000 tersisa"). Masked when the card is hidden. */
function BalanceCardAmount({ className, value, currency, ...props }: BalanceCardAmountProps) {
  const { hidden } = useBalanceCard()
  return (
    <span data-slot="balance-card-amount" {...props} className={cn('tabular-nums', className)}>
      {hidden ? (
        <>
          <span aria-hidden>{BALANCE_MASK}</span>
          <span className="sr-only">{BALANCE_HIDDEN_LABEL}</span>
        </>
      ) : (
        formatRupiah(value, currency)
      )}
    </span>
  )
}

const captionVariants = cva('flex min-h-5 min-w-0 flex-wrap items-center gap-x-1.5 gap-y-1 text-caption-lg', {
  variants: {
    tone: {
      muted: 'text-muted',
      warning: 'font-medium text-warning-text',
      danger: 'text-danger-text',
    },
  },
  defaultVariants: { tone: 'muted' },
})

interface BalanceCardCaptionProps extends React.ComponentProps<'p'>, VariantProps<typeof captionVariants> {}

/**
 * The line under the value: context ("Total saldo di 12 kartu") or a delta and its period.
 * `tone="danger"` for an overspend; `tone="warning"` for a low balance.
 */
function BalanceCardCaption({ className, tone, children, ...props }: BalanceCardCaptionProps) {
  const { loading } = useBalanceCard()
  return (
    <p
      data-slot="balance-card-caption"
      data-tone={tone ?? 'muted'}
      {...props}
      className={cn(
        'm-0',
        captionVariants({ tone }),
        '[&>svg]:size-3.5 [&>svg]:shrink-0',
        className,
      )}
    >
      {loading ? <Skeleton fill="component" width={120} height={12} /> : children}
    </p>
  )
}

const deltaVariants = cva(
  'inline-flex h-5 shrink-0 items-center gap-0.5 rounded-sm ps-1 pe-1.5 text-caption-lg font-medium tabular-nums [&_svg]:size-3.5',
  {
    variants: {
      tone: {
        positive: 'bg-success-light text-success-text',
        negative: 'bg-danger-light text-danger-text',
        warning: 'bg-warning-light text-warning-text',
        neutral: 'bg-component text-ink-2',
      },
    },
    defaultVariants: { tone: 'neutral' },
  },
)

interface BalanceCardDeltaProps extends React.ComponentProps<'span'>, VariantProps<typeof deltaVariants> {
  /** Which way the figure moved. Sets the arrow and the spoken word. Colour comes from `tone`. */
  direction: 'up' | 'down'
}

/**
 * The change chip ("↗ 12,5%"). `direction` is the arrow; `tone` is good or bad, so spend going up
 * can be `direction="up" tone="negative"` while a balance going up is `tone="positive"`.
 */
function BalanceCardDelta({ className, tone, direction, children, ...props }: BalanceCardDeltaProps) {
  return (
    <span
      data-slot="balance-card-delta"
      data-tone={tone ?? 'neutral'}
      data-direction={direction}
      {...props}
      className={cn(deltaVariants({ tone }), className)}
    >
      <Icon icon={direction === 'down' ? ArrowDownLeft01Icon : ArrowUpRight01Icon} size={14} />
      <span className="sr-only">{direction === 'down' ? 'Turun ' : 'Naik '}</span>
      {children}
    </span>
  )
}

/** A read error in place of the caption ("Gagal memuat saldo QRIS."). It is a live alert. */
function BalanceCardError({ className, children, ...props }: React.ComponentProps<'p'>) {
  return (
    <p
      data-slot="balance-card-error"
      role="alert"
      {...props}
      className={cn('m-0 flex min-h-5 items-center gap-1 text-caption-lg font-medium text-danger-text', className)}
    >
      <Icon icon={AlertCircleIcon} />
      {children}
    </p>
  )
}

interface BalanceCardHideToggleProps extends Omit<Toggle.Props, 'defaultPressed'> {
  /** Accessible name. It stays the same; `aria-pressed` tells whether the balance is hidden. */
  'aria-label'?: string
}

/**
 * The eye button that hides and shows every money figure in the card or group.
 * A toggle button: `aria-pressed="true"` while the balance is hidden.
 * Outside a card (e.g. in a chart header), pass `pressed` and `onPressedChange` yourself.
 */
function BalanceCardHideToggle({
  className,
  pressed,
  onPressedChange,
  'aria-label': ariaLabel = 'Sembunyikan saldo',
  ...props
}: BalanceCardHideToggleProps) {
  const card = useBalanceCard()
  const hidden = pressed ?? card.hidden
  return (
    <Toggle
      data-slot="balance-card-hide-toggle"
      pressed={hidden}
      onPressedChange={(next, details) => {
        if (pressed === undefined) card.setHidden(next)
        onPressedChange?.(next, details)
      }}
      aria-label={ariaLabel}
      title={hidden ? 'Tampilkan saldo' : 'Sembunyikan saldo'}
      render={<Button variant="ghost" size="icon-md" />}
      className={(state) =>
        cn('-my-1.5 -me-1.5', typeof className === 'function' ? className(state) : className)
      }
      {...props}
    >
      <Icon icon={hidden ? ViewIcon : ViewOffIcon} />
    </Toggle>
  )
}

/** The buttons (Top up, Perbarui…). In a `strip` card they sit at the end of the row. */
function BalanceCardActions({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="balance-card-actions"
      {...props}
      className={cn(
        'flex flex-wrap items-center gap-2',
        'group-data-[variant=strip]/balance:shrink-0',
        'group-data-[variant=card]/balance:mt-1',
        className,
      )}
    />
  )
}

export {
  BALANCE_HIDDEN_LABEL,
  BALANCE_MASK,
  BalanceCard,
  BalanceCardActions,
  BalanceCardAmount,
  BalanceCardCaption,
  BalanceCardContent,
  BalanceCardDelta,
  BalanceCardError,
  BalanceCardGroup,
  BalanceCardHeader,
  BalanceCardHideToggle,
  BalanceCardLabel,
  BalanceCardValue,
  balanceCardVariants,
  formatRupiah,
  useBalanceCard,
  type BalanceCardProps,
  type BalanceCardVariant,
}
