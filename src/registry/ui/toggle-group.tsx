import { Toggle } from '@base-ui/react/toggle'
import { ToggleGroup as BaseToggleGroup } from '@base-ui/react/toggle-group'
import { cva } from 'class-variance-authority'
import {
  Children,
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ComponentProps,
  type CSSProperties,
  type Ref,
} from 'react'

import { cn } from '@/lib/utils'

/*
 * Mayar v2 Toggle Group. Wonder "Mayar Card Design System" › Selection › Toggle Group (Chips).
 * chips: 32px pill chips, 8px gap, wraps; selected = primary tint + 1px primary ring + primary text.
 *   SM: 28px radius md, caption-lg text, hairline ring; selected fill primary-light.
 * segmented (code-only): equal grid columns, 6px gap, radius lg items on component; selected white
 *   + control shadow.
 * track (code-only): the Tabs Segmented look for a filter: one component track, a white pill slides
 *   to the pressed item with `--motion-tabs`.
 * icon size (code-only): 28px square icon items (the grid/list view switch).
 * Exactly one item stays pressed: a press on the pressed item does nothing.
 */
type ToggleGroupVariant = 'chips' | 'segmented' | 'track'
type ToggleGroupSize = 'md' | 'sm' | 'icon'

const ToggleGroupContext = createContext<{ variant: ToggleGroupVariant; size: ToggleGroupSize }>({
  variant: 'chips',
  size: 'md',
})

const groupVariants = cva('relative min-w-0', {
  variants: {
    variant: {
      chips: 'inline-flex flex-wrap items-center gap-2',
      segmented: 'grid w-full grid-cols-[repeat(var(--toggle-columns),minmax(0,1fr))] gap-1.5',
      track: 'inline-flex flex-nowrap items-center gap-0.5 bg-component p-0.5',
    },
    size: { md: '', sm: '', icon: '' },
    fill: { true: '', false: '' },
  },
  compoundVariants: [
    { variant: 'chips', size: 'sm', className: 'gap-x-1.5 gap-y-3' },
    { variant: 'track', size: 'md', className: 'rounded-xl' },
    { variant: 'track', size: 'sm', className: 'rounded-lg' },
    { variant: 'track', size: 'icon', className: 'rounded-lg' },
    { variant: 'track', fill: true, className: 'flex w-full' },
  ],
})

const itemVariants = cva(
  [
    'relative z-1 hit-44 inline-flex items-center justify-center border-0 whitespace-nowrap',
    'font-sans text-body-sm font-medium outline-none select-none touch-manipulation',
    'transition-[color,background-color,box-shadow] duration-(--motion-quick) ease-smooth-out',
    'focus-ring:outline-focus',
    'disabled:cursor-not-allowed data-disabled:cursor-not-allowed',
    '[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  ],
  {
    variants: {
      variant: {
        chips: [
          'rounded-pill bg-surface text-ink-2 shadow-control',
          'hover-fine:not-data-pressed:bg-canvas hover-fine:not-data-pressed:text-ink',
          'data-pressed:bg-primary-tint data-pressed:text-primary data-pressed:shadow-[0_0_0_1px_var(--color-primary)]',
          'data-disabled:bg-disabled! data-disabled:text-disabled-foreground! data-disabled:shadow-none!',
        ],
        segmented: [
          'min-w-0 rounded-lg bg-component px-2 text-ink-2 tabular-nums',
          'before:h-[calc(100%+8px)]! before:w-full!',
          'hover-fine:not-data-pressed:bg-component-hover hover-fine:not-data-pressed:text-ink',
          'data-pressed:bg-surface data-pressed:text-ink data-pressed:shadow-control',
          'data-disabled:bg-disabled! data-disabled:text-disabled-foreground! data-disabled:shadow-none!',
        ],
        track: [
          'bg-transparent text-ink-2 tabular-nums',
          'before:h-[calc(100%+8px)]! before:w-full!',
          'hover-fine:text-ink data-pressed:text-ink',
          'data-disabled:text-disabled-foreground!',
        ],
      },
      size: {
        md: 'h-8',
        sm: 'h-7',
        icon: 'size-7 rounded-md px-0 before:h-[calc(100%+16px)]! before:w-full!',
      },
    },
    compoundVariants: [
      { variant: 'chips', size: 'md', className: 'px-3.5' },
      {
        variant: 'chips',
        size: 'sm',
        className: [
          'rounded-md px-2.5 text-caption-lg shadow-ring before:h-[max(100%,40px)]!',
          'data-pressed:bg-primary-light',
        ],
      },
      { variant: 'chips', size: 'icon', className: 'rounded-md' },
      { variant: 'segmented', size: 'sm', className: 'rounded-md' },
      { variant: 'track', size: 'md', className: 'rounded-lg px-3' },
      { variant: 'track', size: 'sm', className: 'rounded-md px-2.5' },
      { variant: 'track', size: 'icon', className: 'not-data-pressed:not-data-disabled:text-muted hover-fine:text-ink!' },
    ],
  },
)

interface ToggleGroupProps
  extends Omit<ComponentProps<typeof BaseToggleGroup>, 'value' | 'defaultValue' | 'onValueChange' | 'multiple'> {
  variant?: ToggleGroupVariant
  /** `icon`: 28px square items for icon-only views (give each item an `aria-label`). */
  size?: ToggleGroupSize
  /** Track only: the track spans its container and the items share it equally. */
  fill?: boolean
  /** The pressed item (controlled). */
  value?: string
  /** The pressed item at first render (uncontrolled). */
  defaultValue?: string
  /** Called with the newly pressed item. A press on the pressed item does not call it. */
  onValueChange?: (value: string) => void
  /** Name the group: what does it filter? */
  'aria-label'?: string
}

function mergeRefs<T>(...refs: (Ref<T> | undefined)[]) {
  return (node: T | null) => {
    for (const ref of refs) {
      if (typeof ref === 'function') ref(node)
      else if (ref) ref.current = node
    }
  }
}

/** Moves the track pill to the pressed item. Measures in local layout px; the CSS owns the tween. */
function useTrackPill(enabled: boolean, value: string | undefined) {
  const rootRef = useRef<HTMLDivElement | null>(null)
  const [ready, setReady] = useState(false)

  const measure = useCallback(() => {
    const root = rootRef.current
    if (!root) return
    const item = root.querySelector<HTMLElement>('[data-slot="toggle-group-item"][data-pressed]')
    root.toggleAttribute('data-has-pressed', Boolean(item))
    if (!item) return
    root.style.setProperty('--active-item-left', `${item.offsetLeft}px`)
    root.style.setProperty('--active-item-top', `${item.offsetTop}px`)
    root.style.setProperty('--active-item-width', `${item.offsetWidth}px`)
    root.style.setProperty('--active-item-height', `${item.offsetHeight}px`)
  }, [])

  useLayoutEffect(() => {
    if (enabled) measure()
  }, [enabled, value, measure])

  useLayoutEffect(() => {
    const root = rootRef.current
    if (!enabled || !root) return
    const frame = requestAnimationFrame(() => setReady(true))
    if (typeof ResizeObserver === 'undefined') return () => cancelAnimationFrame(frame)
    const observer = new ResizeObserver(() => {
      // A resize snaps: suspend the tween for one frame.
      root.setAttribute('data-snap', '')
      measure()
      requestAnimationFrame(() => root.removeAttribute('data-snap'))
    })
    observer.observe(root)
    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
    }
  }, [enabled, measure])

  return { rootRef, ready }
}

/**
 * A single-select set of toggle buttons for a filter, a period or a view switch.
 *
 * Compose `ToggleGroupItem`s. Exactly one item stays pressed. For panels use `Tabs`.
 */
function ToggleGroup({
  className,
  variant = 'chips',
  size = 'md',
  fill = false,
  value,
  defaultValue,
  onValueChange,
  children,
  style,
  ref,
  ...props
}: ToggleGroupProps) {
  const [innerValue, setInnerValue] = useState(defaultValue)
  const current = value !== undefined ? value : innerValue
  const isTrack = variant === 'track'
  const { rootRef, ready } = useTrackPill(isTrack, current)

  function handleValueChange(next: string[]) {
    const picked = next.find((v) => v !== current)
    // Pressing the pressed item empties the array: keep it pressed.
    if (picked === undefined) return
    if (value === undefined) setInnerValue(picked)
    onValueChange?.(picked)
  }

  const context = useMemo(() => ({ variant, size }), [variant, size])
  const columns = { '--toggle-columns': Children.count(children) } as CSSProperties

  return (
    <ToggleGroupContext.Provider value={context}>
      <BaseToggleGroup
        data-slot="toggle-group"
        data-variant={variant}
        data-size={size}
        data-ready={ready ? '' : undefined}
        ref={mergeRefs(ref, rootRef)}
        value={current !== undefined ? [current] : []}
        onValueChange={handleValueChange}
        className={cn('group/toggle', groupVariants({ variant, size, fill: fill && isTrack }), className)}
        style={typeof style === 'function' ? style : { ...(variant === 'segmented' ? columns : {}), ...style }}
        {...props}
      >
        {isTrack ? (
          <span
            data-slot="toggle-group-pill"
            aria-hidden
            className={cn(
              'pointer-events-none absolute top-0 left-0 z-0 hidden bg-surface shadow-control group-data-has-pressed/toggle:block',
              'h-(--active-item-height) w-(--active-item-width) translate-x-(--active-item-left) translate-y-(--active-item-top)',
              'group-data-ready/toggle:transition-[translate,width,height] group-data-ready/toggle:duration-(--motion-tabs) group-data-ready/toggle:ease-smooth-out group-data-snap/toggle:transition-none!',
              size === 'md' ? 'rounded-lg' : 'rounded-md',
            )}
          />
        ) : null}
        {children}
      </BaseToggleGroup>
    </ToggleGroupContext.Provider>
  )
}

interface ToggleGroupItemProps extends Omit<ComponentProps<typeof Toggle>, 'value'> {
  value: string
}

/** One option. Text in `children`, or an `<Icon />` plus an `aria-label` for an icon-only item. */
function ToggleGroupItem({ className, ...props }: ToggleGroupItemProps) {
  const { variant, size } = useContext(ToggleGroupContext)
  return (
    <Toggle
      data-slot="toggle-group-item"
      className={cn(itemVariants({ variant, size }), className)}
      {...props}
    />
  )
}

export { ToggleGroup, ToggleGroupItem, type ToggleGroupProps, type ToggleGroupItemProps }
