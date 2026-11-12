import { Popover as PopoverPrimitive } from '@base-ui/react/popover'

import { cn } from '@/lib/utils'

/*
 * Mayar v2 Popover. Code-only: no specimen on the Wonder Design System page.
 * Source: the shipped app (foundations/Popover.svelte): filter panels, search results,
 * notification panels. The panel owns only the mechanics; the content owns its layout.
 * Panel: surface, radius 2xl (12px), shadow-popover, z --z-popover, no padding, 8px from the
 * anchor, max width viewport − 32px. Open motion: menu-in (opacity + scale 0.97 from the anchor
 * corner) at --motion-quick. Reduced motion zeroes the token.
 */

const popoverPanelClass =
  'flex max-w-[calc(100vw-32px)] flex-col overflow-clip rounded-2xl bg-surface text-ink shadow-popover outline-none'

/**
 * An anchored panel that opens from a trigger: filters, search results, notifications.
 *
 * Compose it: `<Popover><PopoverTrigger render={<Button variant="secondary" />}>Status
 * </PopoverTrigger><PopoverContent aria-label="Filter status">…</PopoverContent></Popover>`.
 * A press outside or Esc closes it, and Esc puts focus back on the trigger.
 * `open` / `defaultOpen` / `onOpenChange` work as in Base UI.
 */
function Popover(props: PopoverPrimitive.Root.Props) {
  return <PopoverPrimitive.Root {...props} />
}

/** The toggle. It gets `aria-expanded` and `data-popup-open`. Use `render={<Button />}` for the look. */
function PopoverTrigger(props: PopoverPrimitive.Trigger.Props) {
  return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />
}

type PopoverSide = 'top' | 'bottom' | 'left' | 'right'
type PopoverAlign = 'start' | 'center' | 'end'

interface PopoverContentProps extends PopoverPrimitive.Popup.Props {
  /** Side of the anchor. Flips when there is no room. */
  side?: PopoverSide
  /** Edge of the anchor the panel lines up with. */
  align?: PopoverAlign
  /** Gap to the anchor in px. */
  sideOffset?: number
  /** `absolute` (default) or `fixed` (for a trigger in a scroll container or a transformed canvas). */
  positionMethod?: 'absolute' | 'fixed'
  /** An external anchor instead of the trigger: an element, a ref or a virtual element. */
  anchor?: PopoverPrimitive.Positioner.Props['anchor']
  /** Other props for the positioner (e.g. `collisionPadding`). */
  positionerProps?: Omit<PopoverPrimitive.Positioner.Props, 'side' | 'align' | 'sideOffset' | 'anchor'>
}

/** The anchored panel, in a portal. Give it an `aria-label` or a `<PopoverTitle>`. */
function PopoverContent({
  className,
  side = 'bottom',
  align = 'end',
  sideOffset = 8,
  positionMethod,
  anchor,
  positionerProps,
  ...props
}: PopoverContentProps) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Positioner
        data-slot="popover-positioner"
        side={side}
        align={align}
        sideOffset={sideOffset}
        collisionPadding={8}
        positionMethod={positionMethod}
        anchor={anchor}
        className="z-(--z-popover)"
        {...positionerProps}
      >
        <PopoverPrimitive.Popup
          data-slot="popover-content"
          className={cn(
            popoverPanelClass,
            'origin-(--transform-origin) animate-menu-in [animation-duration:var(--motion-quick)]',
            className,
          )}
          {...props}
        />
      </PopoverPrimitive.Positioner>
    </PopoverPrimitive.Portal>
  )
}

/**
 * The popover panel as a static surface: in the page flow, not portalled, not anchored.
 * For specimens and docs that show an open panel next to other content.
 */
function PopoverPanel({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="popover-panel" className={cn(popoverPanelClass, className)} {...props} />
}

/** A heading that names the panel (`aria-labelledby`). */
function PopoverTitle({ className, ...props }: PopoverPrimitive.Title.Props) {
  return (
    <PopoverPrimitive.Title
      data-slot="popover-title"
      className={cn('m-0 text-body-sm font-semibold text-ink', className)}
      {...props}
    />
  )
}

/** A muted line that describes the panel (`aria-describedby`). */
function PopoverDescription({ className, ...props }: PopoverPrimitive.Description.Props) {
  return (
    <PopoverPrimitive.Description
      data-slot="popover-description"
      className={cn('m-0 text-body-sm text-ink-2', className)}
      {...props}
    />
  )
}

/** A button that closes the popover and returns focus to the trigger. */
function PopoverClose(props: PopoverPrimitive.Close.Props) {
  return <PopoverPrimitive.Close data-slot="popover-close" {...props} />
}

export {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverDescription,
  PopoverPanel,
  PopoverTitle,
  PopoverTrigger,
  type PopoverAlign,
  type PopoverContentProps,
  type PopoverSide,
}
