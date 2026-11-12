import { AlertDialog as AlertDialogPrimitive } from '@base-ui/react/alert-dialog'
import { Dialog as DialogPrimitive } from '@base-ui/react/dialog'
import { Cancel01Icon } from '@hugeicons/core-free-icons'
import { cva, type VariantProps } from 'class-variance-authority'
import { createContext, use, useMemo, type ReactNode } from 'react'

import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { cn } from '@/lib/utils'

/*
 * Mayar v2 Dialog. Code-only: no specimen on the Wonder Design System page.
 * Source: the shipped app (foundations/Dialog.svelte + DialogFooter.svelte), built from the v2
 * frames (Create Card, Kartu Actions, KYC, PIN Gate, Transaksi detail drawer).
 * Sizes: SM 400 / MD 480 / LG 880. Radius media 20px. Overlay bg-overlay. z --z-modal.
 * Header: plain (36px ghost close, body 0 24 24) · divided (hairline, 32px close, body 24) ·
 * none (corner close, body 32 24 24). Placement: center or drawer (right edge, 8px inset, 430px).
 * Motion: entrance only. Panel opacity + scale 0.96 → 1, drawer translateX 24px → 0, overlay fade,
 * --motion-dialog-open 200ms smooth-out. Reduced motion zeroes the token.
 */

type DialogHeaderKind = 'plain' | 'divided' | 'none'
/** Close paths: `auto` all · `no-close-button` Esc + overlay · `none` a mandatory gate. */
type DialogDismiss = 'auto' | 'no-close-button' | 'none'

interface DialogPolicy {
  dismiss: DialogDismiss
  busy: boolean
}

interface DialogLayout extends DialogPolicy {
  header: DialogHeaderKind
  closeLabel: string
  showCloseButton: boolean
}

const DialogPolicyContext = createContext<DialogPolicy>({ dismiss: 'auto', busy: false })
const DialogLayoutContext = createContext<DialogLayout>({
  header: 'plain',
  dismiss: 'auto',
  busy: false,
  closeLabel: 'Tutup',
  showCloseButton: true,
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
function Dialog({ dismiss = 'auto', busy = false, onOpenChange, disablePointerDismissal, ...props }: DialogRootProps) {
  const policy = useMemo(() => ({ dismiss, busy }), [dismiss, busy])
  return (
    <DialogPolicyContext value={policy}>
      <DialogPrimitive.Root
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
  /** Under 640px the centre panel fills the viewport (a full-height sheet). */
  mobileSheet?: boolean
  /** Controls at the top-left of a `header="none"` panel, level with the corner close. */
  toolbar?: ReactNode
}

function useLayout(header: DialogHeaderKind, closeLabel: string): DialogLayout {
  const policy = use(DialogPolicyContext)
  return useMemo(
    () => ({ ...policy, header, closeLabel, showCloseButton: policy.dismiss === 'auto' }),
    [policy, header, closeLabel],
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
        <div className="absolute top-3 right-3 z-1">
          <DialogCloseButton size="icon-md" />
        </div>
      ) : null}
    </>
  )
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
  mobileSheet = false,
  toolbar,
  portalProps,
  children,
  ...props
}: DialogContentProps) {
  const layout = useLayout(header, closeLabel)
  const drawer = placement === 'drawer'
  return (
    <DialogLayoutContext value={layout}>
      <DialogPrimitive.Portal data-slot="dialog-portal" {...portalProps}>
        <DialogPrimitive.Backdrop
          data-slot="dialog-backdrop"
          className="fixed inset-0 z-(--z-modal) bg-overlay animate-fade-in"
        />
        <DialogPrimitive.Viewport
          data-slot="dialog-viewport"
          className={cn(
            'fixed inset-0 z-(--z-modal) flex',
            drawer ? 'items-stretch justify-end p-2' : 'items-center justify-center p-4',
            mobileSheet && !drawer && 'max-sm:p-0',
          )}
        >
          <DialogPrimitive.Popup
            data-slot="dialog-content"
            data-size={size ?? 'md'}
            data-placement={placement}
            data-header={header}
            aria-busy={layout.busy || undefined}
            className={cn(
              dialogPanelVariants({ size, placement }),
              drawer ? 'h-full max-h-full animate-drawer-in' : 'max-h-[calc(100dvh-32px)] animate-dialog-in',
              mobileSheet &&
                !drawer &&
                'max-sm:h-dvh max-sm:max-h-dvh max-sm:max-w-none max-sm:rounded-none',
              className,
            )}
            {...props}
          >
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
  const layout = useLayout(header, closeLabel)
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

function DialogCloseButton({ size }: { size: 'icon-md' | 'icon-lg' }) {
  const { closeLabel, busy } = use(DialogLayoutContext)
  return (
    <DialogPrimitive.Close
      data-slot="dialog-close-button"
      disabled={busy}
      aria-label={closeLabel}
      render={<Button variant="ghost" size={size} />}
    >
      <Icon icon={Cancel01Icon} />
    </DialogPrimitive.Close>
  )
}

interface DialogHeaderProps extends React.ComponentProps<'div'> {
  /** Above the title row, e.g. an `<IconDisc>` (Register v2). Switches to the stacked header. */
  media?: ReactNode
  /** End of the title row, e.g. "Langkah 1 dari 3" (KYC v2). Switches to the stacked header. */
  aside?: ReactNode
  /** Under the title row, inside the header, e.g. `<Steps>` (KYC v2). Switches to the stacked header. */
  below?: ReactNode
}

/**
 * The title row: put `<DialogTitle>` and an optional `<DialogDescription>` in `children`.
 * The close button is added at the end when the dialog `dismiss` is `auto`.
 */
function DialogHeader({ className, media, aside, below, children, ...props }: DialogHeaderProps) {
  const { header, showCloseButton } = use(DialogLayoutContext)
  if (header === 'none') return null
  const stacked = Boolean(media || aside || below)
  const close = showCloseButton ? <DialogCloseButton size={header === 'divided' || stacked ? 'icon-md' : 'icon-lg'} /> : null

  if (stacked) {
    return (
      <div
        data-slot="dialog-header"
        data-stacked=""
        className={cn(
          'flex shrink-0 flex-col items-stretch gap-3 px-6 pt-5 pb-4',
          media && 'pt-6 pb-5',
          header === 'divided' && 'border-b border-border-subtle',
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
        'flex shrink-0 items-center justify-between gap-3 py-3 pr-3 pl-6',
        'has-data-[slot=dialog-description]:items-start has-data-[slot=dialog-description]:pt-4 has-data-[slot=dialog-description]:pb-1',
        header === 'divided' && 'border-b border-border-subtle py-3.5 pr-4',
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
 * The action bar under the body: a top hairline, actions on the right, 8px apart.
 * Order: secondary "Batal" first, then the primary or danger action. Buttons are LG.
 * For one control on the left, give it `className="mr-auto"`.
 */
function DialogFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        'flex shrink-0 items-center justify-end gap-2 border-t border-border-subtle px-6 py-4',
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
  closeLabel: 'Tutup',
  showCloseButton: false,
}

/** The alert dialog panel (default SM 400) with its overlay, in a portal. */
function AlertDialogContent({ className, size = 'sm', portalProps, ...props }: AlertDialogContentProps) {
  return (
    <DialogLayoutContext value={ALERT_LAYOUT}>
      <AlertDialogPrimitive.Portal data-slot="alert-dialog-portal" {...portalProps}>
        <AlertDialogPrimitive.Backdrop className="fixed inset-0 z-(--z-modal) bg-overlay animate-fade-in" />
        <AlertDialogPrimitive.Viewport className="fixed inset-0 z-(--z-modal) flex items-center justify-center p-4">
          <AlertDialogPrimitive.Popup
            data-slot="alert-dialog-content"
            data-size={size}
            className={cn(dialogPanelVariants({ size }), 'max-h-[calc(100dvh-32px)] animate-dialog-in', className)}
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
