import { mergeProps } from '@base-ui/react/merge-props'
import { Tabs as BaseTabs } from '@base-ui/react/tabs'
import { useRender } from '@base-ui/react/use-render'
import { cva } from 'class-variance-authority'
import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ComponentProps,
  type MouseEvent,
  type ReactNode,
  type Ref,
} from 'react'

import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

/*
 * Mayar v2 Tabs. Values from the shipped app (`Tabs.svelte`); Wonder "Mayar Card Design System" ›
 * Selection › Tabs Segmented and Tabs Line is the visual reference.
 * Segmented: a component track (2px padding and gap, radius xl), MD triggers 32px radius lg,
 * SM triggers 28px radius md on a radius lg track. A white pill with the control shadow slides
 * under the active tab. Line: 36px triggers, 20px gap, a 2px ink underline slides under the
 * active tab (the line gap is `--tabs-gap`, default 20px; set it on an ancestor).
 * Selection changes the colour, never the weight.
 * The indicator is Base UI `Tabs.Indicator`: it reads `--active-tab-*` and tweens with
 * `--motion-tabs` + `ease-smooth-out`, so reduced motion turns the slide off.
 * `TabsNav` + `TabsLink` give the same look to links (the selection lives in the URL).
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
  fullHeight: boolean
}

const TabsContext = createContext<TabsContextValue>({
  variant: 'segmented',
  size: 'md',
  tone: 'neutral',
  countTone: 'neutral',
  fill: false,
  fullHeight: false,
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
  /**
   * Line, horizontal: the nav-bar look. The list fills the parent's height, each tab stretches to
   * it and the underline sits on the bottom edge. The list drops its own hairline (the bar draws it).
   */
  fullHeight?: boolean
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
  fullHeight = false,
  ...props
}: TabsProps) {
  const context = useMemo(
    () => ({ variant, size, tone, countTone, fill, fullHeight }),
    [variant, size, tone, countTone, fill, fullHeight],
  )
  return (
    <TabsContext.Provider value={context}>
      <BaseTabs.Root
        data-slot="tabs"
        data-variant={variant}
        data-size={size}
        className={cn(
          'flex min-w-0 flex-col data-[orientation=vertical]:flex-row',
          // With a header the panels start 12px below the header row.
          'has-[>[data-slot=tabs-header]]:gap-3',
          fullHeight && 'self-stretch',
          className,
        )}
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
        'flex w-full items-end gap-[var(--tabs-gap,20px)] shadow-[inset_0_-1px_0_var(--color-border-subtle)]',
        'data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col data-[orientation=vertical]:items-stretch data-[orientation=vertical]:gap-0 data-[orientation=vertical]:shadow-[inset_-1px_0_0_var(--color-border-subtle)]',
      ],
    },
    size: { sm: '', md: '' },
    fill: { true: '', false: '' },
    scrollable: {
      true: 'overflow-x-auto overflow-y-hidden overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden *:shrink-0',
      false: '',
    },
    fullHeight: { true: '', false: '' },
  },
  compoundVariants: [
    { variant: 'line', fullHeight: true, className: 'flex-1 items-stretch shadow-none' },
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

/** The tab row. It renders the sliding indicator itself. Arrow keys stop at the ends, as in the app. */
function TabsList({
  className,
  scrollable = false,
  activateOnFocus = true,
  loopFocus = false,
  children,
  ...props
}: TabsListProps) {
  const { variant, size, tone, fill, fullHeight } = useContext(TabsContext)
  const scrolls = scrollable && variant === 'line'
  return (
    <BaseTabs.List
      data-slot="tabs-list"
      data-scrollable={scrolls ? '' : undefined}
      activateOnFocus={activateOnFocus}
      loopFocus={loopFocus}
      className={cn(
        listVariants({ variant, size, fill, scrollable: scrolls, fullHeight: fullHeight && variant === 'line' }),
        className,
      )}
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
    'transition-[color] duration-(--motion-tabs) ease-smooth-out',
    'focus-ring:outline-focus',
    // A scrollable list clips its overflow, so the ring goes inside the tab.
    'in-data-scrollable:focus-ring:-outline-offset-2',
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
      fullHeight: { true: '', false: '' },
    },
    compoundVariants: [
      { variant: 'line', fullHeight: true, className: 'h-auto' },
      { variant: 'segmented', size: 'md', className: 'h-8 rounded-lg px-3' },
      { variant: 'segmented', size: 'sm', className: 'h-7 rounded-md px-2.5' },
      { variant: 'segmented', fill: true, className: 'min-w-0 flex-1 basis-0' },
    ],
  },
)

/** One tab. Put the label and an optional `TabsCount` in `children`. */
function TabsTab({ className, ...props }: ComponentProps<typeof BaseTabs.Tab>) {
  const { variant, size, fill, fullHeight } = useContext(TabsContext)
  return (
    <BaseTabs.Tab
      data-slot="tabs-tab"
      className={cn(tabVariants({ variant, size, fill, fullHeight: fullHeight && variant === 'line' }), className)}
      {...props}
    />
  )
}

/**
 * A row for a title next to the list (e.g. "Cara transfer ke BCA"). The title sits at the start,
 * the list at the end; on a narrow screen the list wraps under the title.
 */
function TabsHeader({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="tabs-header"
      className={cn('flex min-w-0 flex-wrap items-center justify-between gap-x-4 gap-y-3', className)}
      {...props}
    />
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

function mergeRefs<T>(...refs: (Ref<T> | undefined)[]) {
  return (node: T | null) => {
    for (const ref of refs) {
      if (typeof ref === 'function') ref(node)
      else if (ref) ref.current = node
    }
  }
}

/** Moves the nav indicator to the active link. Measures local offsets; the CSS owns the tween. */
function useNavIndicator(active: string | undefined) {
  const listRef = useRef<HTMLElement | null>(null)
  const [ready, setReady] = useState(false)
  const [hasActive, setHasActive] = useState(false)

  const measure = useCallback(() => {
    const list = listRef.current
    if (!list) return
    const link = list.querySelector<HTMLElement>('[data-slot="tabs-link"][data-active]')
    setHasActive(Boolean(link))
    if (!link) return
    list.style.setProperty('--active-tab-left', `${link.offsetLeft}px`)
    list.style.setProperty('--active-tab-top', `${link.offsetTop}px`)
    list.style.setProperty('--active-tab-width', `${link.offsetWidth}px`)
    list.style.setProperty('--active-tab-height', `${link.offsetHeight}px`)
  }, [])

  useLayoutEffect(() => {
    measure()
  }, [active, measure])

  useLayoutEffect(() => {
    const list = listRef.current
    if (!list) return
    // The first position snaps; only later changes of the active link tween.
    const frame = requestAnimationFrame(() => setReady(true))
    if (typeof ResizeObserver === 'undefined') return () => cancelAnimationFrame(frame)
    const observer = new ResizeObserver(() => {
      list.setAttribute('data-snap', '')
      measure()
      requestAnimationFrame(() => list.removeAttribute('data-snap'))
    })
    observer.observe(list)
    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
    }
  }, [measure])

  return { listRef, ready, hasActive }
}

const TabsNavContext = createContext<{ value: string | undefined; disabled: boolean } | null>(null)

interface TabsNavProps extends Omit<ComponentProps<'nav'>, 'children'> {
  variant?: TabsVariant
  /** Segmented only. */
  size?: TabsSize
  /** Line only: a primary underline and round count pills (the admin nav look). */
  tone?: TabsTone
  countTone?: TabsCountTone
  /** Segmented only: the track spans its container. */
  fill?: boolean
  /** Line: the nav-bar look (fills the parent's height, no own hairline). */
  fullHeight?: boolean
  /** Line: the row scrolls sideways on a narrow screen (no scrollbar). */
  scrollable?: boolean
  /** The `value` of the active link (usually derived from the current URL). */
  value?: string
  /** Disables every link. */
  disabled?: boolean
  children?: ReactNode
}

/**
 * Tabs as navigation links: a `<nav>` with the Tabs look, for a selection that lives in the URL
 * (Back steps through it and a view can be shared). Compose `TabsLink`s; no panels (the page is the panel).
 */
function TabsNav({
  className,
  variant = 'segmented',
  size = 'md',
  tone = 'neutral',
  countTone = 'neutral',
  fill = false,
  fullHeight = false,
  scrollable = false,
  value,
  disabled = false,
  children,
  ref,
  ...props
}: TabsNavProps) {
  const context = useMemo(
    () => ({ variant, size, tone, countTone, fill, fullHeight }),
    [variant, size, tone, countTone, fill, fullHeight],
  )
  const nav = useMemo(() => ({ value, disabled }), [value, disabled])
  const { listRef, ready, hasActive } = useNavIndicator(value)
  const scrolls = scrollable && variant === 'line'
  const isFullHeight = fullHeight && variant === 'line'
  return (
    <TabsContext.Provider value={context}>
      <TabsNavContext.Provider value={nav}>
        <nav
          ref={mergeRefs(ref, listRef)}
          data-slot="tabs-nav"
          data-variant={variant}
          data-size={size}
          data-scrollable={scrolls ? '' : undefined}
          className={cn(
            listVariants({ variant, size, fill, scrollable: scrolls, fullHeight: isFullHeight }),
            isFullHeight && 'self-stretch',
            className,
          )}
          {...props}
        >
          {hasActive ? (
            <span
              aria-hidden
              data-slot="tabs-indicator"
              className={cn(
                indicatorVariants({ variant, size, tone }),
                !ready && 'transition-none',
                'in-data-snap:transition-none',
              )}
            />
          ) : null}
          {children}
        </nav>
      </TabsNavContext.Provider>
    </TabsContext.Provider>
  )
}

interface TabsLinkProps extends useRender.ComponentProps<'a'> {
  /** Matches the `TabsNav` value when this link is the current page. */
  value: string
  /** Forces the active state; by default it is `value === TabsNav value`. */
  active?: boolean
  /** The link does not navigate and reads as disabled. */
  disabled?: boolean
}

/**
 * One link of a `TabsNav`. The active one gets `aria-current="page"`. Pass `href`, or a router
 * link through `render` (e.g. `render={<Link to="/admin/users" />}`).
 */
function TabsLink({ className, value, active, disabled, render, href, onClick, ref, ...props }: TabsLinkProps) {
  const nav = useContext(TabsNavContext)
  const { variant, size, fill, fullHeight } = useContext(TabsContext)
  const isActive = active ?? (nav?.value !== undefined && nav.value === value)
  const isDisabled = Boolean(disabled || nav?.disabled)

  const defaultProps: useRender.ElementProps<'a'> = {
    href: isDisabled ? undefined : href,
    'aria-current': isActive ? 'page' : undefined,
    'aria-disabled': isDisabled ? true : undefined,
    onClick: (event: MouseEvent<HTMLAnchorElement>) => {
      if (isDisabled) {
        event.preventDefault()
        return
      }
      onClick?.(event)
    },
    className: cn(
      tabVariants({ variant, size, fill, fullHeight: fullHeight && variant === 'line' }),
      'cursor-pointer',
      className,
    ),
  }

  return useRender({
    defaultTagName: 'a',
    render,
    ref,
    props: mergeProps<'a'>(defaultProps, {
      ...props,
      'data-slot': 'tabs-link',
      'data-active': isActive ? '' : undefined,
      'data-disabled': isDisabled ? '' : undefined,
    } as useRender.ElementProps<'a'>),
  })
}

export {
  Tabs,
  TabsHeader,
  TabsList,
  TabsTab,
  TabsCount,
  TabsPanel,
  TabsNav,
  TabsLink,
  type TabsProps,
  type TabsListProps,
  type TabsCountProps,
  type TabsNavProps,
  type TabsLinkProps,
}
