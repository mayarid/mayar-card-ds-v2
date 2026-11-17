import { AlertDialog as AlertDialogPrimitive } from '@base-ui/react/alert-dialog'
import { Dialog as DialogPrimitive } from '@base-ui/react/dialog'
import { Cancel01Icon } from '@hugeicons/core-free-icons'
import { cva, type VariantProps } from 'class-variance-authority'
import {
  createContext,
  use,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'

import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { cn } from '@/lib/utils'

/*
 * Mayar v2 Dialog. Code-only: no specimen on the Wonder Design System page.
 * Source: the shipped app (foundations/Dialog.svelte + DialogFooter.svelte), built from the v2
 * frames (Create Card, Kartu Actions, KYC, PIN Gate, Transaksi detail drawer).
 * Sizes: SM 400 / MD 480 / LG 880. Radius media 20px. Overlay bg-overlay. z --z-modal.
 * Header: plain (36px ghost close, body 0 24 24) · divided (0.5px hairline, 32px close, body 24) ·
 * none (corner close, body 32 24 24). Placement: center or drawer (right edge, 8px inset, 430px).
 * Under 768px (audit) the panel is a bottom sheet: full width, top radius 14px, a grab handle in place
 * of the ×, drag down to close, footer buttons stacked full width.
 * Motion (audit): CSS transitions on data-starting-style / data-ending-style, so the exit runs too.
 * Panel opacity + rise --motion-dialog-rise + blur --motion-dialog-blur, in --motion-dialog-open 240ms,
 * out --motion-dialog-close 200ms. Drawer translateX --motion-drawer-x, no fade. Sheet slides up in
 * --motion-sheet-open 320ms, down in --motion-sheet-close 200ms, solid. Overlay fade + 2px blur.
 * Reduced motion: the tokens drop travel and blur and keep a 150ms crossfade.
 */

type DialogHeaderKind = 'plain' | 'divided' | 'none'
/** Close paths: `auto` all · `no-close-button` Esc + overlay · `none` a mandatory gate. */
type DialogDismiss = 'auto' | 'no-close-button' | 'none'

interface DialogPolicy {
  dismiss: DialogDismiss
  busy: boolean
  /** Closes the dialog (used by the sheet handle and drag). */
  close: () => void
}

interface DialogLayout extends DialogPolicy {
  header: DialogHeaderKind
  closeLabel: string
  showCloseButton: boolean
  /** Under 768px the panel is a bottom sheet. */
  sheet: boolean
}

const noop = () => {}
const DialogPolicyContext = createContext<DialogPolicy>({ dismiss: 'auto', busy: false, close: noop })
const DialogLayoutContext = createContext<DialogLayout>({
  header: 'plain',
  dismiss: 'auto',
  busy: false,
  close: noop,
  closeLabel: 'Tutup',
  showCloseButton: true,
  sheet: false,
})

/** Close reasons that `dismiss="none"` blocks. A `<DialogClose>` you render yourself still closes. */
const BLOCKED_BY_GATE = new Set(['escape-key', 'outside-press', 'focus-out'])

type DialogRootProps = DialogPrimitive.Root.Props & {
  /** Which close paths exist. `auto`: close button, Esc, overlay. `none`: none of them. */
  dismiss?: DialogDismiss
  /** True while a request runs: nothing closes the dialog, the close button is disabled, `aria-busy`. */
  busy?: boolean
}

/**
 * A modal window over the page: a centred panel or a drawer from the right edge.
 *
 * Compose it: `<Dialog><DialogTrigger render={<Button />}>Buka</DialogTrigger><DialogContent>
 * <DialogHeader><DialogTitle>…</DialogTitle></DialogHeader><DialogBody>…</DialogBody>
 * <DialogFooter>…</DialogFooter></DialogContent></Dialog>`.
 * Focus is trapped, Esc and an overlay press close it, and focus goes back to the trigger.
 * `open` / `defaultOpen` / `onOpenChange` work as in Base UI.
 */
function Dialog({
  dismiss = 'auto',
  busy = false,
  onOpenChange,
  disablePointerDismissal,
  actionsRef: actionsRefProp,
  ...props
}: DialogRootProps) {
  const actionsRef = useRef<DialogPrimitive.Root.Actions | null>(null)
  useImperativeHandle(
    actionsRefProp,
    () => ({
      close: () => actionsRef.current?.close(),
      unmount: () => actionsRef.current?.unmount(),
    }),
    [],
  )
  const policy = useMemo(
    () => ({ dismiss, busy, close: () => actionsRef.current?.close() }),
    [dismiss, busy],
  )
  return (
    <DialogPolicyContext value={policy}>
      <DialogPrimitive.Root
        actionsRef={actionsRef}
        disablePointerDismissal={disablePointerDismissal ?? (busy || dismiss === 'none')}
        onOpenChange={(open, details) => {
          if (!open && details.reason !== 'imperative-action') {
            if (busy || (dismiss === 'none' && BLOCKED_BY_GATE.has(details.reason))) {
              details.cancel()
              return
            }
          }
          onOpenChange?.(open, details)
        }}
        {...props}
      />
    </DialogPolicyContext>
  )
}

/** The element that opens the dialog. Use `render={<Button />}` for the Mayar look. */
function DialogTrigger(props: DialogPrimitive.Trigger.Props) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />
}

/** A button that closes the dialog. Use `render={<Button variant="secondary" />}`. */
function DialogClose(props: DialogPrimitive.Close.Props) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />
}

const dialogPanelVariants = cva(
  [
    'group/dialog relative flex flex-col overflow-hidden bg-surface text-ink outline-none',
    'shadow-dialog',
  ],
  {
    variants: {
      size: {
        sm: 'max-w-[400px]',
        md: 'max-w-[480px]',
        lg: 'max-w-[880px]',
      },
      placement: {
        center: 'w-full rounded-media',
        drawer:
          'w-[min(var(--drawer-width,430px),100%)] max-w-none! rounded-media shadow-drawer',
      },
    },
    defaultVariants: { size: 'md', placement: 'center' },
  },
)

type DialogPanelVariantProps = VariantProps<typeof dialogPanelVariants>

interface DialogLayoutProps extends DialogPanelVariantProps {
  /** Header shape. Sets the body padding. `none`: no header row, a close button in the corner. */
  header?: DialogHeaderKind
  /** Accessible name of the close buttons. */
  closeLabel?: string
  /**
   * Under 768px the panel is a bottom sheet (default `true`): full width, a grab handle, drag down to
   * close. `false` keeps the centred panel or the drawer at every width.
   */
  mobileSheet?: boolean
  /** Controls at the top-left of a `header="none"` panel, level with the corner close. */
  toolbar?: ReactNode
}

function useLayout(header: DialogHeaderKind, closeLabel: string, sheet: boolean): DialogLayout {
  const policy = use(DialogPolicyContext)
  return useMemo(
    () => ({ ...policy, header, closeLabel, sheet, showCloseButton: policy.dismiss === 'auto' }),
    [policy, header, closeLabel, sheet],
  )
}

function CornerControls({ toolbar }: { toolbar?: ReactNode }) {
  const layout = use(DialogLayoutContext)
  if (layout.header !== 'none') return null
  return (
    <>
      {toolbar ? (
        <div data-slot="dialog-toolbar" className="absolute top-3 left-3 z-1 flex items-center gap-1">
          {toolbar}
        </div>
      ) : null}
      {layout.showCloseButton ? (
        <div className={cn('absolute top-3 right-3 z-1', closeVisibility(layout.sheet))}>
          <DialogCloseButton size="icon-md" />
        </div>
      ) : null}
    </>
  )
}

/**
 * The × hides when the panel has a footer (audit: the footer is the way out) and, on a sheet,
 * under 768px (the grab handle takes its place).
 */
function closeVisibility(sheet: boolean) {
  return cn('group-has-data-[slot=dialog-footer]/dialog:hidden', sheet && 'max-md:hidden')
}

/** The sheet grab handle: a 36×5 pill with a 44px hit area. Only under 768px. A tap closes. */
function SheetHandle() {
  const { closeLabel, busy, close } = use(DialogLayoutContext)
  return (
    <button
      type="button"
      data-slot="dialog-sheet-handle"
      aria-label={closeLabel}
      disabled={busy}
      onClick={close}
      className={cn(
        'absolute top-2 left-1/2 z-2 hit-44 h-[5px] w-9 -translate-x-1/2 cursor-pointer rounded-pill bg-surface shadow-control',
        'outline-none focus-ring:outline-focus disabled:cursor-default md:hidden',
      )}
    />
  )
}

/* Panel motion. Transitions (not keyframes) so the exit runs and an interrupted open reverses. */
const CENTER_MOTION = [
  'transition-[opacity,translate,filter] duration-(--motion-dialog-open) ease-smooth-out',
  'data-ending-style:duration-(--motion-dialog-close)',
  'data-starting-style:translate-y-(--motion-dialog-rise) data-starting-style:opacity-0 data-starting-style:blur-(--motion-dialog-blur)',
  'data-ending-style:translate-y-(--motion-dialog-rise) data-ending-style:opacity-0 data-ending-style:blur-(--motion-dialog-blur)',
]
const DRAWER_MOTION = [
  'transition-[opacity,translate] duration-(--motion-dialog-open) ease-smooth-out',
  'data-ending-style:duration-(--motion-dialog-close)',
  'data-starting-style:translate-x-(--motion-drawer-x) data-ending-style:translate-x-(--motion-drawer-x)',
  // Reduced motion sets --motion-drawer-x to 0: keep the crossfade.
  'motion-reduce:data-starting-style:opacity-0 motion-reduce:data-ending-style:opacity-0',
]
/* The same motion from 768px up, when the panel is a sheet below it. */
const CENTER_MOTION_MD = [
  'ease-smooth-out md:transition-[opacity,translate,filter] md:duration-(--motion-dialog-open)',
  'md:data-ending-style:duration-(--motion-dialog-close)',
  'md:data-starting-style:translate-y-(--motion-dialog-rise) md:data-starting-style:opacity-0 md:data-starting-style:blur-(--motion-dialog-blur)',
  'md:data-ending-style:translate-y-(--motion-dialog-rise) md:data-ending-style:opacity-0 md:data-ending-style:blur-(--motion-dialog-blur)',
]
const DRAWER_MOTION_MD = [
  'ease-smooth-out md:transition-[opacity,translate] md:duration-(--motion-dialog-open)',
  'md:data-ending-style:duration-(--motion-dialog-close)',
  'md:data-starting-style:translate-x-(--motion-drawer-x) md:data-ending-style:translate-x-(--motion-drawer-x)',
  'md:motion-reduce:data-starting-style:opacity-0 md:motion-reduce:data-ending-style:opacity-0',
]
/* The sheet: slides up, solid the whole way. Reduced motion: a crossfade instead of the slide. */
const SHEET = [
  'max-md:w-full max-md:max-w-none! max-md:h-auto max-md:max-h-[calc(100dvh-24px)]',
  'max-md:rounded-t-[14px] max-md:rounded-b-none max-md:pt-3',
  'max-md:transition-[opacity,translate,transform] max-md:duration-(--motion-sheet-open)',
  'max-md:data-ending-style:duration-(--motion-sheet-close)',
  'max-md:motion-safe:data-starting-style:translate-y-full max-md:motion-safe:data-ending-style:translate-y-full',
  'max-md:motion-reduce:data-starting-style:opacity-0 max-md:motion-reduce:data-ending-style:opacity-0',
]

const BACKDROP = cn(
  'fixed inset-0 z-(--z-modal) bg-overlay backdrop-blur-[2px]',
  'transition-opacity duration-(--motion-dialog-open) ease-smooth-out data-ending-style:duration-(--motion-dialog-close)',
  'data-starting-style:opacity-0 data-ending-style:opacity-0',
)

const FIELD_SELECTOR =
  '[data-slot=dialog-body] :is(input:not([type=hidden]):not(:disabled), textarea:not(:disabled), select:not(:disabled), [contenteditable]:not([contenteditable=false]))'

type FocusTarget = DialogPrimitive.Popup.Props['initialFocus']
type OpenType = Parameters<Extract<NonNullable<FocusTarget>, (...args: never[]) => unknown>>[0]

/** Default initial focus: the first field in the body, else the panel (never the ×). */
function firstFieldTarget(panel: HTMLElement | null, openType: OpenType): HTMLElement | true {
  if (!panel) return true
  // Opened by touch: focus the panel, so the virtual keyboard does not cover the sheet.
  if (openType === 'touch') return panel
  return panel.querySelector<HTMLElement>(FIELD_SELECTOR) ?? panel
}

function mergeRefs<T>(...refs: (React.Ref<T> | undefined)[]) {
  return (node: T | null) => {
    for (const ref of refs) {
      if (typeof ref === 'function') ref(node)
      else if (ref) ref.current = node
    }
  }
}

const DRAG_START = 4
const DRAG_DISTANCE = 64
const DRAG_FRACTION = 0.15
const DRAG_VELOCITY = 0.11 // px per ms
const NO_DRAG = 'input, textarea, select, [contenteditable]:not([contenteditable=false])'

/**
 * Drag the sheet down to close it. Pointer events on the panel; under 768px only. A drag starts once the
 * pointer moves 4px down, not from a field and not inside a body that is scrolled. Release past
 * min(64px, 15% of the height) or faster than 0.11 px/ms closes; less springs back.
 */
function useSheetDrag(panel: HTMLElement | null, enabled: boolean, close: () => void) {
  const closeRef = useRef(close)
  useEffect(() => {
    closeRef.current = close
  })

  useEffect(() => {
    if (!enabled || !panel || typeof window === 'undefined' || !window.matchMedia) return
    const phone = window.matchMedia('(max-width: 767.98px)')
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)')

    let state: 'idle' | 'pending' | 'dragging' = 'idle'
    let pointerId = -1
    let startY = 0
    let offset = 0
    let lastY = 0
    let lastT = 0
    let velocity = 0

    function reset() {
      state = 'idle'
      pointerId = -1
    }

    function onDown(event: PointerEvent) {
      if (!phone.matches || event.button !== 0 || state !== 'idle') return
      const target = event.target as Element | null
      if (!target || target.closest(NO_DRAG)) return
      const body = target.closest<HTMLElement>('[data-slot=dialog-body]')
      if (body && body.scrollTop > 0) return
      state = 'pending'
      pointerId = event.pointerId
      startY = lastY = event.clientY
      lastT = event.timeStamp
      velocity = 0
      offset = 0
    }

    function onMove(event: PointerEvent) {
      if (state === 'idle' || event.pointerId !== pointerId || !panel) return
      const dy = event.clientY - startY
      if (state === 'pending') {
        if (dy < -DRAG_START) return reset()
        if (dy <= DRAG_START) return
        state = 'dragging'
        panel.setPointerCapture?.(pointerId)
        panel.style.transition = 'none'
      }
      const dt = event.timeStamp - lastT
      if (dt > 0) velocity = (event.clientY - lastY) / dt
      lastY = event.clientY
      lastT = event.timeStamp
      offset = Math.max(0, dy)
      if (!reduce.matches) panel.style.transform = `translateY(${offset}px)`
    }

    function onUp(event: PointerEvent) {
      if (event.pointerId !== pointerId || !panel) return
      const dragged = state === 'dragging'
      reset()
      if (!dragged) return
      // A drag is not a tap: swallow the click that follows on the element under the pointer.
      panel.addEventListener('click', swallow, { capture: true, once: true })
      window.setTimeout(() => panel.removeEventListener('click', swallow, { capture: true }), 0)
      const threshold = Math.min(DRAG_DISTANCE, panel.offsetHeight * DRAG_FRACTION)
      if (event.type !== 'pointercancel' && (offset > threshold || velocity > DRAG_VELOCITY)) {
        // Keep the dragged offset: the exit transition slides on from there.
        panel.style.transition = ''
        closeRef.current()
        return
      }
      panel.style.transition = 'transform var(--motion-sheet-close) var(--ease-smooth-out)'
      panel.style.transform = ''
      panel.addEventListener('transitionend', () => (panel.style.transition = ''), { once: true })
    }

    function swallow(event: MouseEvent) {
      event.stopPropagation()
      event.preventDefault()
    }

    // iOS scrolls the page under a touch drag unless touchmove is cancelled.
    function onTouchMove(event: TouchEvent) {
      if (state === 'dragging') event.preventDefault()
    }

    panel.addEventListener('pointerdown', onDown)
    panel.addEventListener('pointermove', onMove)
    panel.addEventListener('pointerup', onUp)
    panel.addEventListener('pointercancel', onUp)
    panel.addEventListener('touchmove', onTouchMove, { passive: false })
    return () => {
      panel.removeEventListener('pointerdown', onDown)
      panel.removeEventListener('pointermove', onMove)
      panel.removeEventListener('pointerup', onUp)
      panel.removeEventListener('pointercancel', onUp)
      panel.removeEventListener('touchmove', onTouchMove)
    }
  }, [panel, enabled])
}

type DialogContentProps = DialogPrimitive.Popup.Props &
  DialogLayoutProps & {
    /** Props for the portal (e.g. `container`). */
    portalProps?: DialogPrimitive.Portal.Props
  }

/** The modal panel with its overlay, in a portal. */
function DialogContent({
  className,
  size,
  placement = 'center',
  header = 'plain',
  closeLabel = 'Tutup',
  mobileSheet = true,
  toolbar,
  portalProps,
  initialFocus,
  ref,
  children,
  ...props
}: DialogContentProps) {
  const layout = useLayout(header, closeLabel, mobileSheet)
  const drawer = placement === 'drawer'
  const popupRef = useRef<HTMLDivElement | null>(null)
  const [panel, setPanel] = useState<HTMLDivElement | null>(null)
  const mergedRef = useMemo(() => mergeRefs<HTMLDivElement>(ref, popupRef, setPanel), [ref])
  const defaultFocus = useCallback((openType: OpenType) => firstFieldTarget(popupRef.current, openType), [])
  useSheetDrag(panel, mobileSheet && layout.dismiss !== 'none' && !layout.busy, layout.close)

  return (
    <DialogLayoutContext value={layout}>
      <DialogPrimitive.Portal data-slot="dialog-portal" {...portalProps}>
        <DialogPrimitive.Backdrop data-slot="dialog-backdrop" className={BACKDROP} />
        <DialogPrimitive.Viewport
          data-slot="dialog-viewport"
          className={cn(
            'fixed inset-0 z-(--z-modal) flex',
            drawer ? 'items-stretch justify-end p-2' : 'items-center justify-center p-4',
            mobileSheet && 'max-md:items-end max-md:justify-center max-md:p-0',
          )}
        >
          <DialogPrimitive.Popup
            ref={mergedRef}
            data-slot="dialog-content"
            data-size={size ?? 'md'}
            data-placement={placement}
            data-header={header}
            data-sheet={mobileSheet ? '' : undefined}
            aria-busy={layout.busy || undefined}
            initialFocus={initialFocus ?? defaultFocus}
            className={cn(
              dialogPanelVariants({ size, placement }),
              drawer ? 'h-full max-h-full' : 'max-h-[calc(100dvh-32px)]',
              mobileSheet
                ? [drawer ? DRAWER_MOTION_MD : CENTER_MOTION_MD, SHEET]
                : drawer
                  ? DRAWER_MOTION
                  : CENTER_MOTION,
              className,
            )}
            {...props}
          >
            {mobileSheet && layout.dismiss !== 'none' ? <SheetHandle /> : null}
            <CornerControls toolbar={toolbar} />
            {children}
          </DialogPrimitive.Popup>
        </DialogPrimitive.Viewport>
      </DialogPrimitive.Portal>
    </DialogLayoutContext>
  )
}

type DialogPanelProps = React.ComponentProps<'div'> & Omit<DialogLayoutProps, 'mobileSheet'>

/**
 * The dialog panel as a static surface: in the page flow, not portalled, not modal.
 * For specimens and docs that show a dialog next to other content. Put it inside `<Dialog>`.
 */
function DialogPanel({
  className,
  size,
  placement = 'center',
  header = 'plain',
  closeLabel = 'Tutup',
  toolbar,
  children,
  ...props
}: DialogPanelProps) {
  const layout = useLayout(header, closeLabel, false)
  return (
    <DialogLayoutContext value={layout}>
      <div
        data-slot="dialog-panel"
        data-size={size ?? 'md'}
        data-placement={placement}
        data-header={header}
        aria-busy={layout.busy || undefined}
        className={cn(dialogPanelVariants({ size, placement }), className)}
        {...props}
      >
        <CornerControls toolbar={toolbar} />
        {children}
      </div>
    </DialogLayoutContext>
  )
}

function DialogCloseButton({ size, className }: { size: 'icon-md' | 'icon-lg'; className?: string }) {
  const { closeLabel, busy } = use(DialogLayoutContext)
  return (
    <DialogPrimitive.Close
      data-slot="dialog-close-button"
      disabled={busy}
      aria-label={closeLabel}
      render={<Button variant="ghost" size={size} className={className} />}
    >
      <Icon icon={Cancel01Icon} />
    </DialogPrimitive.Close>
  )
}

interface DialogHeaderProps extends React.ComponentProps<'div'> {
  /** Above the title row, e.g. an `<IconDisc>` (Register v2). Switches to the stacked header. */
  media?: ReactNode
  /**
   * End of the title row, e.g. a status `<Badge>`. Switches to the stacked header. Do not repeat the
   * step count here when `below` holds a `<Steps>`: the steps already show it.
   */
  aside?: ReactNode
  /** Under the title row, inside the header, e.g. `<Steps>` (KYC v2). Switches to the stacked header. */
  below?: ReactNode
}

/**
 * The title row: put `<DialogTitle>` and an optional `<DialogDescription>` in `children`.
 * The close button is added at the end when the dialog `dismiss` is `auto` and the panel has no
 * footer (audit). On a sheet under 768px the grab handle takes its place.
 */
function DialogHeader({ className, media, aside, below, children, ...props }: DialogHeaderProps) {
  const { header, showCloseButton, sheet } = use(DialogLayoutContext)
  if (header === 'none') return null
  const stacked = Boolean(media || aside || below)
  const close = showCloseButton ? (
    <DialogCloseButton
      size={header === 'divided' || stacked ? 'icon-md' : 'icon-lg'}
      className={closeVisibility(sheet)}
    />
  ) : null

  if (stacked) {
    return (
      <div
        data-slot="dialog-header"
        data-stacked=""
        className={cn(
          'flex shrink-0 flex-col items-stretch gap-3 px-6 pt-5 pb-4',
          media && 'pt-6 pb-5',
          header === 'divided' && 'border-b-[0.5px] border-border-subtle',
          className,
        )}
        {...props}
      >
        {media ? <div className="self-start">{media}</div> : null}
        <div className="flex min-w-0 items-center justify-between gap-3">
          <div className="flex min-w-0 flex-1 flex-col gap-1 [&_[data-slot=dialog-description]]:text-ink-2">
            {children}
          </div>
          {aside ? <div className="flex shrink-0 items-center">{aside}</div> : null}
          {close}
        </div>
        {below}
      </div>
    )
  }

  return (
    <div
      data-slot="dialog-header"
      className={cn(
        'flex shrink-0 items-center justify-between gap-3 pl-6 has-data-[slot=dialog-description]:items-start',
        // The app keeps the divided padding (14 16 14 24) when a description is present.
        header === 'divided'
          ? 'border-b-[0.5px] border-border-subtle py-3.5 pr-4'
          : 'py-3 pr-3 has-data-[slot=dialog-description]:pt-4 has-data-[slot=dialog-description]:pb-1',
        className,
      )}
      {...props}
    >
      <div className="flex min-w-0 flex-col gap-1 has-data-[slot=dialog-description]:pt-1">{children}</div>
      {close}
    </div>
  )
}

/** The dialog name (title-sm). Base UI links it with `aria-labelledby`. */
function DialogTitle({ className, ...props }: DialogPrimitive.Title.Props) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn('m-0 min-w-0 text-title-sm text-ink', className)}
      {...props}
    />
  )
}

/** A muted body-sm line under the title. Base UI links it with `aria-describedby`. */
function DialogDescription({ className, ...props }: DialogPrimitive.Description.Props) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn('m-0 text-body-sm text-muted', className)}
      {...props}
    />
  )
}

interface DialogBodyProps extends React.ComponentProps<'div'> {
  /** No padding: the content lays out its own body (e.g. a `<form>` with a `<DialogFooter>`). */
  flush?: boolean
}

/** The scrolling content area. Its padding follows the header shape. */
function DialogBody({ className, flush = false, ...props }: DialogBodyProps) {
  const { header } = use(DialogLayoutContext)
  return (
    <div
      data-slot="dialog-body"
      className={cn(
        'min-h-0 flex-1 overflow-auto text-body-base',
        !flush && header === 'plain' && 'px-6 pb-6',
        !flush && header === 'divided' && 'p-6',
        !flush && header === 'none' && 'px-6 pt-8 pb-6',
        className,
      )}
      {...props}
    />
  )
}

/**
 * The action bar under the body: a top 0.5px hairline, actions on the right, 8px apart.
 * Order: secondary "Batal" first, then the primary or danger action. Buttons are LG.
 * For one control on the left, give it `className="mr-auto"`.
 * Under 768px (audit) the buttons stack full width, 8px apart, the last one (the confirm) on top.
 */
function DialogFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        'flex shrink-0 items-center justify-end gap-2 border-t-[0.5px] border-border-subtle px-6 py-4',
        'max-md:flex-col-reverse max-md:items-stretch max-md:[&>*]:w-full max-md:[&>*]:mr-0!',
        className,
      )}
      {...props}
    />
  )
}

/* ── Alert dialog ─────────────────────────────────────────────────────────── */

/**
 * A confirm dialog that needs an answer: no close button and no overlay dismiss.
 * Use the Dialog parts inside: `<AlertDialogContent><DialogHeader><DialogTitle>…` and
 * `<DialogFooter><DialogClose render={<Button variant="secondary" />}>Batal</DialogClose>…`.
 */
function AlertDialog(props: AlertDialogPrimitive.Root.Props) {
  return <AlertDialogPrimitive.Root {...props} />
}

/** The element that opens the alert dialog. */
function AlertDialogTrigger(props: AlertDialogPrimitive.Trigger.Props) {
  return <AlertDialogPrimitive.Trigger data-slot="alert-dialog-trigger" {...props} />
}

type AlertDialogContentProps = AlertDialogPrimitive.Popup.Props &
  Pick<DialogLayoutProps, 'size'> & { portalProps?: AlertDialogPrimitive.Portal.Props }

const ALERT_LAYOUT: DialogLayout = {
  header: 'plain',
  dismiss: 'no-close-button',
  busy: false,
  close: noop,
  closeLabel: 'Tutup',
  showCloseButton: false,
  sheet: false,
}

/** Default initial focus of an alert: the last footer button (the confirm), else Base UI's default. */
function confirmTarget(panel: HTMLElement | null): HTMLElement | true {
  const buttons = panel?.querySelectorAll<HTMLElement>('[data-slot=dialog-footer] button:not(:disabled)')
  return buttons?.length ? buttons[buttons.length - 1]! : true
}

/** The alert dialog panel (default SM 400) with its overlay, in a portal. Focus starts on the confirm. */
function AlertDialogContent({
  className,
  size = 'sm',
  portalProps,
  initialFocus,
  ref,
  ...props
}: AlertDialogContentProps) {
  const popupRef = useRef<HTMLDivElement | null>(null)
  const mergedRef = useMemo(() => mergeRefs<HTMLDivElement>(ref, popupRef), [ref])
  const defaultFocus = useCallback(() => confirmTarget(popupRef.current), [])
  return (
    <DialogLayoutContext value={ALERT_LAYOUT}>
      <AlertDialogPrimitive.Portal data-slot="alert-dialog-portal" {...portalProps}>
        <AlertDialogPrimitive.Backdrop data-slot="alert-dialog-backdrop" className={BACKDROP} />
        <AlertDialogPrimitive.Viewport className="fixed inset-0 z-(--z-modal) flex items-center justify-center p-4">
          <AlertDialogPrimitive.Popup
            ref={mergedRef}
            data-slot="alert-dialog-content"
            data-size={size}
            initialFocus={initialFocus ?? defaultFocus}
            className={cn(dialogPanelVariants({ size }), 'max-h-[calc(100dvh-32px)]', CENTER_MOTION, className)}
            {...props}
          />
        </AlertDialogPrimitive.Viewport>
      </AlertDialogPrimitive.Portal>
    </DialogLayoutContext>
  )
}

/** The alert dialog panel as a static surface, for specimens. Put it inside `<AlertDialog>`. */
function AlertDialogPanel({ className, size = 'sm', ...props }: React.ComponentProps<'div'> & Pick<DialogLayoutProps, 'size'>) {
  return (
    <DialogLayoutContext value={ALERT_LAYOUT}>
      <div
        data-slot="alert-dialog-panel"
        data-size={size}
        className={cn(dialogPanelVariants({ size }), className)}
        {...props}
      />
    </DialogLayoutContext>
  )
}

export {
  AlertDialog,
  AlertDialogContent,
  AlertDialogPanel,
  AlertDialogTrigger,
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPanel,
  DialogTitle,
  DialogTrigger,
  dialogPanelVariants,
  type DialogContentProps,
  type DialogDismiss,
  type DialogHeaderKind,
  type DialogHeaderProps,
  type DialogPanelProps,
  type DialogRootProps as DialogProps,
}
