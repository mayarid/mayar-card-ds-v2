import { Tabs as BaseTabs } from '@base-ui/react/tabs'
import { cva } from 'class-variance-authority'
import { createContext, useContext, useMemo, type ComponentProps, type ReactNode } from 'react'

import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

/*
 * Mayar v2 Tabs. Wonder "Mayar Card Design System" › Selection › Tabs Segmented and Tabs Line.
 * Segmented: a component track (2px padding and gap, radius xl), MD triggers 32px radius lg,
 * SM triggers 28px radius md on a radius lg track. A white pill with the control shadow slides
 * under the active tab. Line: 36px triggers, 20px gap, a 2px ink underline slides under the
 * active tab. Selection changes the colour, never the weight.
 * The indicator is Base UI `Tabs.Indicator`: it reads `--active-tab-*` and tweens with
 * `--motion-tabs` + `ease-smooth-out`, so reduced motion turns the slide off.
 */
type TabsVariant = 'segmented' | 'line'
type TabsSize = 'sm' | 'md'
type TabsTone = 'neutral' | 'primary'
type TabsCountTone = 'neutral' | 'primary' | 'tint'

interface TabsContextValue {
  variant: TabsVariant
  size: TabsSize
  tone: TabsTone
  countTone: TabsCountTone
  fill: boolean
}

const TabsContext = createContext<TabsContextValue>({
  variant: 'segmented',
  size: 'md',
  tone: 'neutral',
  countTone: 'neutral',
  fill: false,
})

interface TabsProps extends ComponentProps<typeof BaseTabs.Root> {
  /** `segmented`: peer views of the same data. `line`: sections of one page. */
  variant?: TabsVariant
  /** Segmented only. Line ignores it. */
  size?: TabsSize
  /** Line only: a primary underline and round count pills (the admin nav look). */
  tone?: TabsTone
  /** `primary`: every count is a primary-light pill (unread). `tint`: a quieter primary-tint pill. */
  countTone?: TabsCountTone
  /** Segmented only: the track spans its container and the tabs share it equally. */
  fill?: boolean
}

/**
 * Switches between related panels on the same page.
 *
 * Compose `TabsList` › `TabsTab` (with an optional `TabsCount`) and one `TabsPanel` per tab.
 * For a filter that does not switch panels use `ToggleGroup`.
 */
function Tabs({
  className,
  variant = 'segmented',
  size = 'md',
  tone = 'neutral',
  countTone = 'neutral',
  fill = false,
  ...props
}: TabsProps) {
  const context = useMemo(() => ({ variant, size, tone, countTone, fill }), [variant, size, tone, countTone, fill])
  return (
    <TabsContext.Provider value={context}>
      <BaseTabs.Root
        data-slot="tabs"
        data-variant={variant}
        data-size={size}
        className={cn('flex min-w-0 flex-col data-[orientation=vertical]:flex-row', className)}
        {...props}
      />
    </TabsContext.Provider>
  )
}

const listVariants = cva('relative', {
  variants: {
    variant: {
      segmented: 'inline-flex items-center gap-0.5 self-start bg-component p-0.5',
      line: [
        'flex w-full items-end gap-5 shadow-[inset_0_-1px_0_var(--color-border-subtle)]',
        'data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col data-[orientation=vertical]:items-stretch data-[orientation=vertical]:gap-0 data-[orientation=vertical]:shadow-[inset_-1px_0_0_var(--color-border-subtle)]',
      ],
    },
    size: { sm: '', md: '' },
    fill: { true: '', false: '' },
    scrollable: {
      true: 'overflow-x-auto overflow-y-hidden overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden *:shrink-0',
      false: '',
    },
  },
  compoundVariants: [
    { variant: 'segmented', size: 'md', className: 'rounded-xl' },
    { variant: 'segmented', size: 'sm', className: 'rounded-lg' },
    { variant: 'segmented', fill: true, className: 'flex self-stretch' },
  ],
})

const indicatorVariants = cva(
  'pointer-events-none absolute top-0 left-0 z-0 transition-[translate,width,height] duration-(--motion-tabs) ease-smooth-out',
  {
    variants: {
      variant: {
        segmented:
          'h-(--active-tab-height) w-(--active-tab-width) translate-x-(--active-tab-left) translate-y-(--active-tab-top) bg-surface shadow-control',
        line: [
          'top-auto bottom-0 h-0.5 w-(--active-tab-width) translate-x-(--active-tab-left) rounded-pill',
          'data-[orientation=vertical]:top-0 data-[orientation=vertical]:right-0 data-[orientation=vertical]:bottom-auto data-[orientation=vertical]:left-auto data-[orientation=vertical]:h-(--active-tab-height) data-[orientation=vertical]:w-0.5 data-[orientation=vertical]:translate-x-0 data-[orientation=vertical]:translate-y-(--active-tab-top)',
        ],
      },
      size: { sm: '', md: '' },
      tone: { neutral: '', primary: '' },
    },
    compoundVariants: [
      { variant: 'segmented', size: 'md', className: 'rounded-lg' },
      { variant: 'segmented', size: 'sm', className: 'rounded-md' },
      { variant: 'line', tone: 'neutral', className: 'bg-ink' },
      { variant: 'line', tone: 'primary', className: 'bg-primary' },
    ],
  },
)

interface TabsListProps extends ComponentProps<typeof BaseTabs.List> {
  /** Line, horizontal: the row scrolls sideways on a narrow screen (no scrollbar). */
  scrollable?: boolean
}

/** The tab row. It renders the sliding indicator itself. */
function TabsList({ className, scrollable = false, activateOnFocus = true, children, ...props }: TabsListProps) {
  const { variant, size, tone, fill } = useContext(TabsContext)
  return (
    <BaseTabs.List
      data-slot="tabs-list"
      activateOnFocus={activateOnFocus}
      className={cn(listVariants({ variant, size, fill, scrollable: scrollable && variant === 'line' }), className)}
      {...props}
    >
      <BaseTabs.Indicator data-slot="tabs-indicator" className={cn(indicatorVariants({ variant, size, tone }))} />
      {children}
    </BaseTabs.List>
  )
}

const tabVariants = cva(
  [
    'group/tab relative z-1 hit-44 inline-flex items-center gap-1.5 border-0 bg-transparent whitespace-nowrap',
    'font-sans text-body-sm font-medium text-ink-2 no-underline outline-none select-none touch-manipulation',
    'transition-colors duration-(--motion-tabs) ease-smooth-out',
    'focus-ring:outline-focus',
    'data-active:text-ink hover-fine:text-ink',
    'data-disabled:cursor-not-allowed data-disabled:text-disabled-foreground',
  ],
  {
    variants: {
      variant: {
        segmented: 'justify-center',
        line: 'h-9 rounded-sm px-0',
      },
      size: { sm: '', md: '' },
      fill: { true: '', false: '' },
    },
    compoundVariants: [
      { variant: 'segmented', size: 'md', className: 'h-8 rounded-lg px-3' },
      { variant: 'segmented', size: 'sm', className: 'h-7 rounded-md px-2.5' },
      { variant: 'segmented', fill: true, className: 'min-w-0 flex-1 basis-0' },
    ],
  },
)

/** One tab. Put the label and an optional `TabsCount` in `children`. */
function TabsTab({ className, ...props }: ComponentProps<typeof BaseTabs.Tab>) {
  const { variant, size, fill } = useContext(TabsContext)
  return (
    <BaseTabs.Tab data-slot="tabs-tab" className={cn(tabVariants({ variant, size, fill }), className)} {...props} />
  )
}

const countVariants = cva('inline-flex items-center text-caption-lg font-medium tabular-nums', {
  variants: {
    variant: {
      segmented: 'text-muted',
      line: 'h-5 rounded-sm bg-component px-1.5 text-ink-2',
    },
    tone: { neutral: '', primary: '' },
    countTone: {
      neutral: '',
      primary: 'h-5 min-w-5 justify-center rounded-pill bg-primary-light px-1.5 font-semibold text-primary',
      tint: 'h-5 min-w-5 justify-center rounded-pill bg-primary-tint px-1.5 text-primary',
    },
  },
  compoundVariants: [
    {
      variant: 'line',
      tone: 'primary',
      countTone: 'neutral',
      className: [
        'min-w-5 justify-center rounded-pill bg-well px-2 text-ink-2',
        'transition-colors duration-(--motion-quick) ease-smooth-out',
        'group-data-active/tab:bg-primary-tint group-data-active/tab:text-primary',
      ],
    },
  ],
})

interface TabsCountProps extends ComponentProps<'span'> {
  /** Read after the number by screen readers, e.g. "pengajuan" → "Menunggu, 12 pengajuan". */
  label?: string
  /** Shows a static bone in place of the number while counts load. */
  loading?: boolean
  children?: ReactNode
}

/** A number after the tab label. */
function TabsCount({ className, label, loading = false, children, ...props }: TabsCountProps) {
  const { variant, tone, countTone } = useContext(TabsContext)
  if (loading) {
    return variant === 'line' ? (
      <Skeleton data-slot="tabs-count" data-loading="" width={28} height={20} radius="full" className={className} />
    ) : (
      <Skeleton data-slot="tabs-count" data-loading="" width={16} height={12} radius="sm" className={className} />
    )
  }
  return (
    <span data-slot="tabs-count" className={cn(countVariants({ variant, tone, countTone }), className)} {...props}>
      {label ? <span className="sr-only">, </span> : null}
      {children}
      {label ? <span className="sr-only"> {label}</span> : null}
    </span>
  )
}

/** The content of one tab. Hidden while its tab is not active. */
function TabsPanel({ className, ...props }: ComponentProps<typeof BaseTabs.Panel>) {
  return (
    <BaseTabs.Panel
      data-slot="tabs-panel"
      className={cn('min-w-0 rounded-sm outline-none focus-ring:outline-focus', className)}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTab, TabsCount, TabsPanel, type TabsProps, type TabsListProps, type TabsCountProps }
