import { Collapsible } from '@base-ui/react/collapsible'
import { mergeProps } from '@base-ui/react/merge-props'
import { Tooltip } from '@base-ui/react/tooltip'
import { useRender } from '@base-ui/react/use-render'
import {
  AlertCircleIcon,
  ArrowDown01Icon,
  Cancel01Icon,
  SidebarLeftIcon,
  SquareLock02Icon,
} from '@hugeicons/core-free-icons'
import {
  createContext,
  type ReactElement,
  type ReactNode,
  use,
  useCallback,
  useMemo,
  useState,
  useSyncExternalStore,
} from 'react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Icon } from '@/components/ui/icon'
import { cn } from '@/lib/utils'

/*
 * Mayar v2 Sidebar. Wonder Dashboard page › "Nav Item", "Nav Icon", "Sidebar Collapsed Rail" and the
 * "Beranda" artboards. Source: the shipped app (lib/components/Sidebar.svelte, routes/+layout.svelte).
 * Expanded 264px column, padding 26/12, gap 20, canvas fill. Collapsed rail 68px (desktop only).
 * Below lg (responsive layout) it is an off-canvas drawer over an overlay.
 * Item: 36px, radius xl, gap 10, 17px icon, body-base medium. States: default, hover (state-hover),
 * pressed (state-pressed), focus, active (surface + control shadow, aria-current="page"),
 * locked (placeholder ink, lock icon, not focusable) and disabled (code-only).
 */

/* ── State ─────────────────────────────────────────────────────────────── */

const DESKTOP_QUERY = '(min-width: 1024px)'

function subscribeDesktop(onChange: () => void) {
  const query = window.matchMedia(DESKTOP_QUERY)
  query.addEventListener('change', onChange)
  return () => query.removeEventListener('change', onChange)
}

/** `true` at the lg breakpoint and up. The server snapshot assumes desktop. */
function useIsDesktop(): boolean {
  return useSyncExternalStore(
    subscribeDesktop,
    () => window.matchMedia(DESKTOP_QUERY).matches,
    () => true,
  )
}

function useControllableState<T>(value: T | undefined, defaultValue: T, onChange?: (next: T) => void) {
  const [inner, setInner] = useState(defaultValue)
  const controlled = value !== undefined
  const current = controlled ? value : inner
  const set = useCallback(
    (next: T) => {
      if (!controlled) setInner(next)
      onChange?.(next)
    },
    [controlled, onChange],
  )
  return [current, set] as const
}

interface SidebarContextValue {
  /** The collapsed preference, as set by the toggle. */
  collapsed: boolean
  setCollapsed: (next: boolean) => void
  /** The 68px icon rail shows: collapsed and not a mobile drawer. */
  rail: boolean
  /** The sidebar is an off-canvas drawer (responsive layout below lg). */
  drawer: boolean
  mobileOpen: boolean
  setMobileOpen: (next: boolean) => void
}

const SidebarContext = createContext<SidebarContextValue>({
  collapsed: false,
  setCollapsed: () => {},
  rail: false,
  drawer: false,
  mobileOpen: false,
  setMobileOpen: () => {},
})

/** Reads the sidebar state: `rail`, `drawer`, `collapsed`, `mobileOpen` and their setters. */
function useSidebar(): SidebarContextValue {
  return use(SidebarContext)
}

/* ── Tooltip (collapsed rail only) ─────────────────────────────────────── */

const tooltipClass =
  'flex h-7 items-center rounded-lg bg-surface px-2.5 font-sans text-body-sm font-medium whitespace-nowrap text-ink shadow-popover origin-(--transform-origin) animate-fade-in [animation-duration:var(--motion-quick)]'

const tooltipWideClass =
  'flex w-58 flex-col items-start gap-1 rounded-xl bg-surface px-3 py-2.5 font-sans text-ink shadow-popover origin-(--transform-origin) animate-fade-in [animation-duration:var(--motion-quick)]'

function RailTooltip({ label, wide = false, children }: { label: ReactNode; wide?: boolean; children: ReactElement }) {
  const { rail } = useSidebar()
  return (
    <Tooltip.Root disabled={!rail}>
      <Tooltip.Trigger render={children} />
      <Tooltip.Portal>
        <Tooltip.Positioner side="right" sideOffset={12} className="z-(--z-popover)">
          <Tooltip.Popup data-slot="sidebar-tooltip" className={wide ? tooltipWideClass : tooltipClass}>
            {label}
          </Tooltip.Popup>
        </Tooltip.Positioner>
      </Tooltip.Portal>
    </Tooltip.Root>
  )
}

/* ── Root ──────────────────────────────────────────────────────────────── */

interface SidebarProps extends Omit<React.ComponentProps<'aside'>, 'inert'> {
  /** Collapsed rail (68px, icons with tooltips). Controlled. Has no effect on the mobile drawer. */
  collapsed?: boolean
  /** Collapsed rail on first render. Uncontrolled. */
  defaultCollapsed?: boolean
  onCollapsedChange?: (collapsed: boolean) => void
  /** Mobile drawer open. Controlled. Ignored at lg and up. */
  mobileOpen?: boolean
  defaultMobileOpen?: boolean
  onMobileOpenChange?: (open: boolean) => void
  /**
   * `responsive` (default): sticky column at lg and up, off-canvas drawer below.
   * `static`: always an in-flow column, so it can sit inside a card or a docs preview.
   */
  layout?: 'responsive' | 'static'
}

/**
 * The app navigation: logo row, grouped links, then the plan quota and the account row.
 *
 * Compose it: `<Sidebar><SidebarHeader>…</SidebarHeader><SidebarNav><SidebarGroup>`
 * `<SidebarGroupContent><SidebarItem href="/" label="Beranda" active><Icon icon={…} /></SidebarItem>`
 * `</SidebarGroupContent></SidebarGroup></SidebarNav><SidebarFooter>…</SidebarFooter></Sidebar>`.
 * Items render plain links; pass `render={<Link to="/cards" />}` for a router link.
 */
function Sidebar({
  collapsed: collapsedProp,
  defaultCollapsed = false,
  onCollapsedChange,
  mobileOpen: mobileOpenProp,
  defaultMobileOpen = false,
  onMobileOpenChange,
  layout = 'responsive',
  className,
  children,
  onKeyDown,
  ...props
}: SidebarProps) {
  const [collapsed, setCollapsed] = useControllableState(collapsedProp, defaultCollapsed, onCollapsedChange)
  const [mobileOpen, setMobileOpen] = useControllableState(mobileOpenProp, defaultMobileOpen, onMobileOpenChange)
  const isDesktop = useIsDesktop()
  const drawer = layout === 'responsive' && !isDesktop
  const rail = collapsed && !drawer

  const context = useMemo(
    () => ({ collapsed, setCollapsed, rail, drawer, mobileOpen, setMobileOpen }),
    [collapsed, setCollapsed, rail, drawer, mobileOpen, setMobileOpen],
  )

  return (
    <SidebarContext value={context}>
      <Tooltip.Provider delay={300}>
        {drawer && mobileOpen ? (
          <button
            type="button"
            aria-label="Tutup menu"
            data-slot="sidebar-backdrop"
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 z-(--z-dropdown) cursor-default bg-overlay animate-fade-in"
          />
        ) : null}
        <aside
          data-slot="sidebar"
          data-layout={layout}
          data-collapsed={rail ? '' : undefined}
          data-drawer={drawer ? (mobileOpen ? 'open' : 'closed') : undefined}
          // Slid off screen while closed; inert keeps Tab out of the hidden links.
          inert={drawer && !mobileOpen}
          onKeyDown={(event) => {
            onKeyDown?.(event)
            if (drawer && mobileOpen && event.key === 'Escape') setMobileOpen(false)
          }}
          {...props}
          className={cn(
            'flex shrink-0 flex-col gap-5 bg-canvas py-6.5 font-sans text-ink-2',
            'transition-[width,transform] duration-(--motion-fast) ease-smooth-out',
            rail ? 'w-17 items-center px-0' : 'w-66 px-3',
            layout === 'responsive' && 'h-dvh',
            layout === 'responsive' && !drawer && 'sticky top-0',
            drawer && 'fixed inset-y-0 left-0 z-(--z-popover) shadow-popover',
            drawer && !mobileOpen && '-translate-x-full',
            className,
          )}
        >
          {children}
        </aside>
      </Tooltip.Provider>
    </SidebarContext>
  )
}

/* ── Show / hide helpers ───────────────────────────────────────────────── */

/** Renders its children only while the sidebar is expanded (hidden on the collapsed rail). */
function SidebarExpandedOnly({ children }: { children?: ReactNode }) {
  return useSidebar().rail ? null : children
}

/** Renders its children only on the collapsed rail, e.g. the logo mark. */
function SidebarRailOnly({ children }: { children?: ReactNode }) {
  return useSidebar().rail ? children : null
}

/* ── Header ────────────────────────────────────────────────────────────── */

/** The logo row. Put the logo first and `SidebarActions` last. On the rail it stacks. */
function SidebarHeader({ className, ...props }: React.ComponentProps<'div'>) {
  const { rail } = useSidebar()
  return (
    <div
      data-slot="sidebar-header"
      className={cn(
        'flex items-center',
        rail ? 'flex-col gap-2 p-0' : 'justify-between pr-1 pl-2',
        className,
      )}
      {...props}
    />
  )
}

/** The icon buttons in the logo row (notifications, collapse, close). */
function SidebarActions({ className, ...props }: React.ComponentProps<'div'>) {
  const { rail } = useSidebar()
  return (
    <div
      data-slot="sidebar-actions"
      className={cn('flex', rail ? 'flex-col gap-2' : 'gap-1', className)}
      {...props}
    />
  )
}

interface SidebarIconButtonProps extends useRender.ComponentProps<'button'> {
  /** Accessible name, and the tooltip on the rail. */
  label: string
  /** A small primary dot, e.g. unread notifications. */
  dot?: boolean
  /** `ghost` (default) for the logo row. `surface` is the outlined rail search button. */
  variant?: 'ghost' | 'surface'
}

function SidebarIconButtonElement({
  className,
  label,
  dot = false,
  variant = 'ghost',
  render,
  children,
  rail,
  ...props
}: SidebarIconButtonProps & { rail: boolean }) {
  const isNativeButton = render === undefined
  const defaultProps: useRender.ElementProps<'button'> = {
    'data-slot': 'sidebar-icon-button',
    'data-variant': variant,
    'aria-label': label,
    ...(isNativeButton ? { type: 'button' } : {}),
    className: cn(
      'relative hit-44 inline-flex shrink-0 cursor-pointer items-center justify-center outline-none',
      'transition-[background-color,color] duration-(--motion-quick) ease-smooth-out focus-ring:outline-focus',
      '[&_svg]:pointer-events-none [&_svg]:size-4.5',
      variant === 'surface'
        ? 'size-9 rounded-xl border border-border-subtle bg-surface text-muted shadow-[0_1px_2px_var(--color-shadow-ambient)] hover-fine:bg-canvas hover-fine:text-ink-2 pressed:bg-sunken [&_svg]:size-4'
        : cn(
            'bg-transparent text-ink-2 hover-fine:bg-state-hover hover-fine:text-ink pressed:bg-state-pressed pressed:text-ink',
            'aria-expanded:bg-component aria-expanded:text-ink',
            rail ? 'size-9 rounded-xl' : 'size-8 rounded-lg',
          ),
      className,
    ),
    children: (
      <>
        {children}
        {dot ? (
          <span
            data-slot="sidebar-icon-button-dot"
            aria-hidden
            className={cn(
              'absolute box-content size-1.75 rounded-pill border-[1.5px] border-canvas bg-primary',
              rail ? 'top-2 right-2.25' : 'top-1.75 right-2',
            )}
          />
        ) : null}
      </>
    ),
  } as useRender.ElementProps<'button'>
  return useRender({ defaultTagName: 'button', render, props: mergeProps<'button'>(defaultProps, props) })
}

/** An icon-only button in the logo row. Shows its label as a tooltip on the rail. */
function SidebarIconButton(props: SidebarIconButtonProps) {
  const { rail } = useSidebar()
  return (
    <RailTooltip label={props.label}>
      <SidebarIconButtonElement {...props} rail={rail} />
    </RailTooltip>
  )
}

/** Collapses or expands the rail. Desktop only: it renders nothing in the mobile drawer. */
function SidebarCollapseTrigger({ onClick, children, ...props }: Omit<SidebarIconButtonProps, 'label'> & { label?: string }) {
  const { collapsed, setCollapsed, drawer } = useSidebar()
  if (drawer) return null
  return (
    <SidebarIconButton
      data-slot="sidebar-collapse-trigger"
      label={collapsed ? 'Perluas menu' : 'Ciutkan menu'}
      aria-pressed={collapsed}
      onClick={(event) => {
        onClick?.(event)
        setCollapsed(!collapsed)
      }}
      {...props}
    >
      {children ?? <Icon icon={SidebarLeftIcon} size={18} />}
    </SidebarIconButton>
  )
}

/** Closes the mobile drawer. Renders only in the drawer. */
function SidebarCloseTrigger({ onClick, children, ...props }: Omit<SidebarIconButtonProps, 'label'> & { label?: string }) {
  const { drawer, setMobileOpen } = useSidebar()
  if (!drawer) return null
  return (
    <SidebarIconButton
      data-slot="sidebar-close-trigger"
      label="Tutup menu"
      onClick={(event) => {
        onClick?.(event)
        setMobileOpen(false)
      }}
      {...props}
    >
      {children ?? <Icon icon={Cancel01Icon} size={18} />}
    </SidebarIconButton>
  )
}

/* ── Nav and groups ────────────────────────────────────────────────────── */

/** The scrolling list of groups. A `<nav>` named "Utama" by default. */
function SidebarNav({ className, ...props }: React.ComponentProps<'nav'>) {
  const { rail } = useSidebar()
  return (
    <nav
      aria-label="Utama"
      data-slot="sidebar-nav"
      className={cn(
        'flex min-h-0 flex-1 flex-col gap-5',
        // overflow-y clips x as well: 2px of room keeps the active item's ring visible.
        rail ? 'items-center overflow-visible' : '-mx-0.5 overflow-y-auto px-0.5',
        className,
      )}
      {...props}
    />
  )
}

const SidebarGroupContext = createContext<{ collapsible: boolean }>({ collapsible: false })

interface SidebarGroupProps extends Omit<React.ComponentProps<'div'>, 'onToggle'> {
  /** The label opens and closes the group. On the rail the group is always open. */
  collapsible?: boolean
  /** Open (controlled). Only with `collapsible`. */
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
}

/** A set of items with an optional label. */
function SidebarGroup({
  collapsible = false,
  open: openProp,
  defaultOpen = true,
  onOpenChange,
  className,
  children,
  ...props
}: SidebarGroupProps) {
  const { rail } = useSidebar()
  const [open, setOpen] = useControllableState(openProp, defaultOpen, onOpenChange)
  const groupContext = useMemo(() => ({ collapsible }), [collapsible])
  const classes = cn('flex flex-col', rail && 'items-center gap-5', className)

  return (
    <SidebarGroupContext value={groupContext}>
      {collapsible ? (
        <Collapsible.Root
          data-slot="sidebar-group"
          open={rail || open}
          onOpenChange={(next) => {
            if (!rail) setOpen(next)
          }}
          className={classes}
          {...props}
        >
          {children}
        </Collapsible.Root>
      ) : (
        <div data-slot="sidebar-group" className={classes} {...props}>
          {children}
        </div>
      )}
    </SidebarGroupContext>
  )
}

/**
 * The group label (caption-lg medium, muted). In a collapsible group it is the toggle with a chevron.
 * On the rail it is hidden; a collapsible group shows a short divider in its place.
 */
function SidebarGroupLabel({ className, children, ...props }: React.ComponentProps<'div'>) {
  const { rail } = useSidebar()
  const { collapsible } = use(SidebarGroupContext)
  if (rail) {
    return collapsible ? (
      <span data-slot="sidebar-group-divider" aria-hidden className="block h-px w-6 bg-border-subtle" />
    ) : null
  }
  const classes = 'flex items-center justify-between px-2.5 pb-2 text-left font-sans text-caption-lg font-medium text-muted'
  if (!collapsible) {
    return (
      <div data-slot="sidebar-group-label" className={cn(classes, className)} {...props}>
        {children}
      </div>
    )
  }
  return (
    <Collapsible.Trigger
      data-slot="sidebar-group-label"
      className={cn(
        classes,
        'group/label cursor-pointer rounded-md bg-transparent outline-none focus-ring:outline-focus hover-fine:text-ink-2',
        className,
      )}
      {...(props as Collapsible.Trigger.Props)}
    >
      <span>{children}</span>
      <Icon
        icon={ArrowDown01Icon}
        size={15}
        className="-rotate-90 transition-[rotate] duration-(--motion-quick) ease-smooth-out group-data-panel-open/label:rotate-0"
      />
    </Collapsible.Trigger>
  )
}

/** The items of a group. In a collapsible group it is the panel that opens and closes. */
function SidebarGroupContent({ className, ...props }: React.ComponentProps<'div'>) {
  const { rail } = useSidebar()
  const { collapsible } = use(SidebarGroupContext)
  const classes = cn('flex flex-col', rail && 'items-center', className)
  if (collapsible) {
    return <Collapsible.Panel data-slot="sidebar-group-content" className={classes} {...(props as Collapsible.Panel.Props)} />
  }
  return <div data-slot="sidebar-group-content" className={classes} {...props} />
}

/* ── Item ──────────────────────────────────────────────────────────────── */

type SidebarItemState = 'default' | 'active' | 'locked' | 'disabled'

interface SidebarItemProps extends useRender.ComponentProps<'a'> {
  /** The destination name. Printed next to the icon, and the accessible name and tooltip on the rail. */
  label: string
  /** The current page: surface fill, control shadow and `aria-current="page"`. */
  active?: boolean
  /** Not available. Muted, not focusable, clicks do nothing. */
  disabled?: boolean
  /** Locked until the account is verified: like disabled, plus a lock icon and a hint. */
  locked?: boolean
  /** The hint on a locked item (its `title`). */
  lockedHint?: string
  /** Trailing content after the label, e.g. `<SidebarItemCount>3</SidebarItemCount>`. A dot on the rail. */
  badge?: ReactNode
}

const sidebarItemClass = [
  'relative flex h-9 min-w-0 shrink-0 items-center gap-2.5 rounded-xl border border-transparent',
  'font-sans text-body-base font-medium text-ink-2 no-underline outline-none select-none',
  'transition-[background-color,color,box-shadow] duration-(--motion-quick) ease-smooth-out',
  'focus-ring:outline-focus [&>svg]:size-[17px] [&>svg]:shrink-0',
  'data-[state=default]:cursor-pointer data-[state=default]:hover-fine:bg-state-hover data-[state=default]:hover-fine:text-ink',
  'data-[state=default]:pressed:bg-state-pressed data-[state=default]:pressed:text-ink',
  'data-[state=active]:bg-surface data-[state=active]:text-ink',
  'data-[state=locked]:cursor-not-allowed data-[state=locked]:text-placeholder',
  'data-[state=disabled]:cursor-not-allowed data-[state=disabled]:text-disabled-foreground',
]

function SidebarItemElement({
  className,
  label,
  active = false,
  disabled = false,
  locked = false,
  lockedHint = 'Selesaikan verifikasi untuk membuka menu',
  badge,
  render,
  children,
  onClick,
  ...props
}: SidebarItemProps) {
  const { rail, drawer, setMobileOpen } = useSidebar()
  const state: SidebarItemState = locked ? 'locked' : disabled ? 'disabled' : active ? 'active' : 'default'
  const inactive = state === 'locked' || state === 'disabled'

  const defaultProps: useRender.ElementProps<'a'> = {
    'data-slot': 'sidebar-item',
    'data-state': state,
    'aria-current': state === 'active' ? 'page' : undefined,
    'aria-disabled': inactive || undefined,
    'aria-label': rail ? label : undefined,
    title: state === 'locked' ? lockedHint : undefined,
    className: cn(
      sidebarItemClass,
      rail ? 'w-9 justify-center px-0 [&>svg]:size-4.5' : 'w-full px-2.5',
      state === 'active' &&
        (rail ? 'border-border-subtle shadow-[0_1px_2px_var(--color-shadow-ambient)]' : 'shadow-control'),
      className,
    ),
    children: (
      <>
        {children}
        {rail ? null : (
          <span data-slot="sidebar-item-label" className="min-w-0 flex-1 truncate">
            {label}
          </span>
        )}
        {state === 'locked' && !rail ? <Icon icon={SquareLock02Icon} size={14} data-slot="sidebar-item-lock" /> : null}
        {badge !== undefined && badge !== null && !inactive ? (
          rail ? (
            <span
              data-slot="sidebar-item-dot"
              aria-hidden
              className="absolute top-[7px] right-[7px] size-1.75 rounded-pill border-[1.5px] border-canvas bg-primary"
            />
          ) : (
            badge
          )
        ) : null}
      </>
    ),
  } as useRender.ElementProps<'a'>

  // Inactive items drop the href and leave the Tab order. role="link" keeps them named and announced as
  // an unavailable link (an <a> with no href is a generic element, which cannot take aria-label).
  const inactiveProps: useRender.ElementProps<'a'> = inactive ? { href: undefined, tabIndex: -1, role: 'link' } : {}

  return useRender({
    defaultTagName: 'a',
    render,
    props: {
      ...mergeProps<'a'>(defaultProps, props, {
        onClick: (event) => {
          if (inactive) {
            event.preventDefault()
            return
          }
          onClick?.(event)
          if (drawer) setMobileOpen(false)
        },
      }),
      ...inactiveProps,
    },
  })
}

/**
 * One destination. The icon goes in `children`; `label` is the text.
 * `<SidebarItem href="/cards" label="Kartu" active><Icon icon={CreditCardIcon} /></SidebarItem>`.
 */
function SidebarItem(props: SidebarItemProps) {
  return (
    <RailTooltip label={props.label}>
      <SidebarItemElement {...props} />
    </RailTooltip>
  )
}

/** A count after the item label (Wonder "Nav Item Badge"): primary-light pill, caption-sm semibold. */
function SidebarItemCount({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      data-slot="sidebar-item-count"
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-pill bg-primary-light px-1.5 py-0.5 text-caption-sm font-semibold text-primary tabular-nums',
        className,
      )}
      {...props}
    />
  )
}

/* ── Footer ────────────────────────────────────────────────────────────── */

/** The bottom block: plan quota (or a notice) and the account row. */
function SidebarFooter({ className, ...props }: React.ComponentProps<'div'>) {
  const { rail } = useSidebar()
  return (
    <div
      data-slot="sidebar-footer"
      className={cn('relative flex flex-col gap-5', rail && 'items-center', className)}
      {...props}
    />
  )
}

interface SidebarNoticeProps extends Omit<React.ComponentProps<'div'>, 'title'> {
  /** The heading, e.g. "Verifikasi diperlukan". */
  title: string
}

/**
 * A warning card in the footer, e.g. the KYC card while the nav is locked. `children` is the body text.
 * On the rail it becomes a 36px warning square with the text in a tooltip.
 */
function SidebarNotice({ title, className, children, ...props }: SidebarNoticeProps) {
  const { rail } = useSidebar()
  if (rail) {
    return (
      <RailTooltip
        wide
        label={
          <>
            <span className="text-body-sm font-semibold">{title}</span>
            <span className="text-caption-lg text-ink-2">{children}</span>
          </>
        }
      >
        <div
          role="note"
          tabIndex={0}
          aria-label={title}
          data-slot="sidebar-notice"
          className={cn(
            'inline-flex size-9 items-center justify-center rounded-xl border border-border-subtle bg-warning-light text-warning-text outline-none focus-ring:outline-focus',
            className,
          )}
          {...props}
        >
          <Icon icon={AlertCircleIcon} size={18} />
        </div>
      </RailTooltip>
    )
  }
  return (
    <div
      role="note"
      data-slot="sidebar-notice"
      className={cn('flex flex-col gap-1 rounded-3xl border border-border-subtle bg-warning-light p-1', className)}
      {...props}
    >
      <p className="m-0 flex items-center gap-1.5 px-2 pt-1 text-caption-lg font-semibold text-warning-text">
        <Icon icon={AlertCircleIcon} size={14} />
        {title}
      </p>
      <p className="m-0 rounded-xl border border-border-subtle bg-surface p-3 text-body-sm text-ink-2 shadow-[0_1px_2px_var(--color-shadow-ambient)]">
        {children}
      </p>
    </div>
  )
}

interface SidebarAccountProps extends React.ComponentProps<'div'> {
  /** Display name. Falls back to the email when empty. */
  name?: string | null
  email: string
  /** Profile picture URL. Initials show without it. */
  avatarSrc?: string
}

/** The account row: avatar, name and email. Put the account menu in `children`. On the rail it stacks. */
function SidebarAccount({ name, email, avatarSrc, className, children, ...props }: SidebarAccountProps) {
  const { rail } = useSidebar()
  const displayName = name?.trim() || email
  return (
    <div
      data-slot="sidebar-account"
      className={cn('flex items-center gap-2.5', rail ? 'flex-col p-0' : 'px-1.5', className)}
      {...props}
    >
      <Avatar size={32}>
        {avatarSrc ? <AvatarImage src={avatarSrc} alt="" /> : null}
        <AvatarFallback name={name || email} />
      </Avatar>
      {rail ? null : (
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-body-base font-semibold text-ink">{displayName}</span>
          <span className="truncate text-caption-lg text-muted">{email}</span>
        </span>
      )}
      {children}
    </div>
  )
}

export {
  Sidebar,
  SidebarAccount,
  SidebarActions,
  SidebarCloseTrigger,
  SidebarCollapseTrigger,
  SidebarExpandedOnly,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarIconButton,
  SidebarItem,
  SidebarItemCount,
  SidebarNav,
  SidebarNotice,
  SidebarRailOnly,
  useSidebar,
  type SidebarAccountProps,
  type SidebarGroupProps,
  type SidebarIconButtonProps,
  type SidebarItemProps,
  type SidebarItemState,
  type SidebarNoticeProps,
  type SidebarProps,
}
