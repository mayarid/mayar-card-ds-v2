import { Menu } from '@base-ui/react/menu'
import { ArrowDown01Icon } from '@hugeicons/core-free-icons'
import { cva, type VariantProps } from 'class-variance-authority'
import type { ReactNode } from 'react'

import { Icon } from '@/components/ui/icon'
import { cn } from '@/lib/utils'

/*
 * Mayar v2 ActionMenu. Code-only: no specimen on the Wonder Design System page.
 * Source: the shipped app (foundations/ActionMenu.svelte): the "…" / "Aksi lain" menu of
 * Detail Kartu, the Kartu rows and tiles, Tim member rows and the sidebar account menu.
 * Trigger: text 36px (radius xl, shadow-control), icon 32px square (radius lg) or ghost icon
 * (radius md, no fill until hover or open). Menu: 260px, 6px padding, radius xl, shadow-popover,
 * 6px from the trigger, right edges aligned. Items: min 44px, 8px 10px padding, radius lg,
 * 16px icon in ink-2, label body-sm medium; hover/highlight state-hover, pressed state-pressed;
 * danger in danger-text; disabled in disabled-foreground and still focusable.
 * Motion: menu-in (opacity + scale 0.97 from the trigger corner) at --motion-quick.
 */

/**
 * A menu of actions behind one button: "…" on a row, "Aksi lain" in a header.
 *
 * Compose it: `<ActionMenu><ActionMenuTrigger variant="icon" aria-label="Aksi lain">
 * <Icon icon={MoreHorizontalIcon} /></ActionMenuTrigger><ActionMenuContent>
 * <ActionMenuItem onClick={…}><Icon icon={Edit02Icon} />Ubah nama</ActionMenuItem>…
 * </ActionMenuContent></ActionMenu>`.
 * Arrow keys move, Home/End jump, Esc closes and returns focus, choosing an item closes the menu.
 */
function ActionMenu(props: Menu.Root.Props) {
  return <Menu.Root {...props} />
}

const actionMenuTriggerVariants = cva(
  [
    'relative hit-44 inline-flex shrink-0 cursor-pointer items-center outline-none select-none',
    'transition-[background-color,color] duration-(--motion-quick) ease-smooth-out',
    'focus-ring:outline-focus disabled:cursor-not-allowed disabled:opacity-50',
    '[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  ],
  {
    variants: {
      variant: {
        secondary:
          'h-9 gap-2 rounded-xl bg-surface pr-3 pl-3.5 text-body-base font-medium text-ink shadow-control hover-fine:bg-canvas opened:bg-canvas',
        icon: 'size-8 justify-center rounded-lg bg-surface text-ink-2 shadow-control hover-fine:bg-canvas opened:bg-canvas',
        'icon-ghost':
          'size-8 justify-center rounded-md bg-transparent text-ink-2 hover-fine:bg-state-hover hover-fine:text-ink opened:bg-well opened:text-ink pressed:bg-state-pressed',
      },
    },
    defaultVariants: { variant: 'secondary' },
  },
)

type ActionMenuTriggerProps = Menu.Trigger.Props & VariantProps<typeof actionMenuTriggerVariants>

/**
 * The menu button. `secondary` shows its label and a chevron that turns when open.
 * The icon variants need an `aria-label` and the icon in `children`.
 */
function ActionMenuTrigger({ className, variant = 'secondary', children, ...props }: ActionMenuTriggerProps) {
  return (
    <Menu.Trigger
      data-slot="action-menu-trigger"
      data-variant={variant}
      className={cn(actionMenuTriggerVariants({ variant }), className)}
      {...props}
    >
      {children}
      {variant === 'secondary' ? (
        <Icon
          icon={ArrowDown01Icon}
          data-slot="action-menu-chevron"
          className="text-ink-2 transition-transform duration-(--motion-quick) ease-smooth-out in-data-popup-open:rotate-180 in-data-[force-state~=open]:rotate-180"
        />
      ) : null}
    </Menu.Trigger>
  )
}

const actionMenuPanelClass =
  'flex w-[260px] max-w-[calc(100vw-16px)] flex-col rounded-xl bg-surface p-1.5 shadow-popover outline-none'

interface ActionMenuContentProps extends Menu.Popup.Props {
  side?: 'top' | 'bottom' | 'left' | 'right'
  align?: 'start' | 'center' | 'end'
  /** Gap to the trigger in px. */
  sideOffset?: number
  /** Other props for the positioner (e.g. `collisionPadding`, `positionMethod`). */
  positionerProps?: Omit<Menu.Positioner.Props, 'side' | 'align' | 'sideOffset'>
}

/** The menu panel, in a portal. 260px wide; set `className="w-72"` for another width. */
function ActionMenuContent({
  className,
  side = 'bottom',
  align = 'end',
  sideOffset = 6,
  positionerProps,
  ...props
}: ActionMenuContentProps) {
  return (
    <Menu.Portal>
      <Menu.Positioner
        data-slot="action-menu-positioner"
        side={side}
        align={align}
        sideOffset={sideOffset}
        collisionPadding={8}
        className="z-(--z-dropdown)"
        {...positionerProps}
      >
        <Menu.Popup
          data-slot="action-menu-content"
          className={cn(
            actionMenuPanelClass,
            'origin-(--transform-origin) animate-menu-in [animation-duration:var(--motion-quick)]',
            className,
          )}
          {...props}
        />
      </Menu.Positioner>
    </Menu.Portal>
  )
}

/**
 * The menu panel as a static surface: in the page flow, not portalled, not a live menu.
 * For specimens and docs. Fill it with elements styled by `actionMenuItemVariants`.
 */
function ActionMenuPanel({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="action-menu-panel" className={cn(actionMenuPanelClass, className)} {...props} />
}

const actionMenuItemVariants = cva(
  [
    'relative flex min-h-11 w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-left',
    'text-body-sm font-medium no-underline outline-none select-none',
    'transition-colors duration-(--motion-quick) ease-smooth-out',
    '[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
    'data-highlighted:bg-state-hover hover-fine:bg-state-hover focus-ring:bg-state-hover pressed:bg-state-pressed',
    'data-disabled:cursor-not-allowed data-disabled:text-disabled-foreground data-disabled:[&_svg]:text-disabled-foreground',
  ],
  {
    variants: {
      tone: {
        default: 'text-ink [&_svg]:text-ink-2',
        danger: 'text-danger-text [&_svg]:text-danger-text',
      },
    },
    defaultVariants: { tone: 'default' },
  },
)

interface ItemExtras extends VariantProps<typeof actionMenuItemVariants> {
  /** A caption-lg line under the label. Not used together with an icon. */
  description?: ReactNode
}

function ItemContent({ description, children }: { description?: ReactNode; children?: ReactNode }) {
  if (!description) return children
  return (
    <span className="flex min-w-0 flex-col gap-0.5">
      <span>{children}</span>
      <span data-slot="action-menu-item-description" className="text-caption-lg font-normal text-ink-2">
        {description}
      </span>
    </span>
  )
}

type ActionMenuItemProps = Menu.Item.Props & ItemExtras

/**
 * One action. Put a 16px `<Icon>` and the label in `children`. `tone="danger"` for a destroying
 * action. `disabled` keeps it in the list and focusable; give the reason in `title`.
 */
function ActionMenuItem({ className, tone, description, children, ...props }: ActionMenuItemProps) {
  return (
    <Menu.Item
      data-slot="action-menu-item"
      data-tone={tone ?? 'default'}
      className={cn(actionMenuItemVariants({ tone }), className)}
      {...props}
    >
      <ItemContent description={description}>{children}</ItemContent>
    </Menu.Item>
  )
}

type ActionMenuLinkItemProps = Menu.LinkItem.Props & ItemExtras

/** An item that is a link (`href`). Same look as `ActionMenuItem`. */
function ActionMenuLinkItem({ className, tone, description, children, ...props }: ActionMenuLinkItemProps) {
  return (
    <Menu.LinkItem
      data-slot="action-menu-item"
      data-tone={tone ?? 'default'}
      className={cn(actionMenuItemVariants({ tone }), className)}
      {...props}
    >
      <ItemContent description={description}>{children}</ItemContent>
    </Menu.LinkItem>
  )
}

/** A hairline between groups of items. */
function ActionMenuSeparator({ className, ...props }: Menu.Separator.Props) {
  return (
    <Menu.Separator
      data-slot="action-menu-separator"
      className={cn('mx-1 my-1.5 h-px shrink-0 bg-border-subtle', className)}
      {...props}
    />
  )
}

/** Content above the items, e.g. the account block of the sidebar menu. Follow it with a separator. */
function ActionMenuHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="action-menu-header"
      className={cn('flex min-w-0 items-center gap-2.5 px-2.5 py-2', className)}
      {...props}
    />
  )
}

export {
  ActionMenu,
  ActionMenuContent,
  ActionMenuHeader,
  ActionMenuItem,
  ActionMenuLinkItem,
  ActionMenuPanel,
  ActionMenuSeparator,
  ActionMenuTrigger,
  actionMenuItemVariants,
  actionMenuTriggerVariants,
  type ActionMenuContentProps,
  type ActionMenuItemProps,
  type ActionMenuTriggerProps,
}
