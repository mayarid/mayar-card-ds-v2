import {
  Toast as ToastPrimitive,
  type ToastManager,
  type ToastManagerAddOptions,
  type ToastObject,
} from '@base-ui/react/toast'
import { AlertCircleIcon, Cancel01Icon, CancelCircleIcon, CheckmarkCircle02Icon, HelpCircleIcon } from '@hugeicons/core-free-icons'
import { useMemo, type ComponentType, type ReactNode } from 'react'

import { Icon, type IconProps } from '@/components/ui/icon'
import { Spinner } from '@/components/ui/spinner'
import { cn } from '@/lib/utils'

/*
 * Mayar v2 Toast. Wonder "Mayar Toast Guide" (adopted from the ReUI Sonner examples) and the
 * shipped app (foundations/Toast.svelte, ToastViewport.svelte, toast.ts).
 * Card: 356px, radius 2xl, shadow-toast, 14px 16px padding, 12px gap. Tone lives only on the 18px
 * icon; card, title and description stay neutral. Default has no icon.
 * Content: title (body-sm medium), description (body-sm ink-2), one action (28px primary),
 * cancel (28px component, only with an action), close (24px, "Tutup notifikasi").
 * Placement: bottom centre, 28px + safe area. Max 3; older cards step back 12px and scale
 * 95% / 90%; hover or focus expands the stack.
 * Duration: 4s; 6s with an action or a description; loading never auto-dismisses.
 * Motion: open 350ms / close 250ms smooth-out, rise 16px, scale 0.97, blur 2px (--motion-toast-*).
 */

type ToastType = 'default' | 'success' | 'error' | 'warning' | 'info' | 'loading'

interface ToastButton {
  label: string
  onClick?: () => void
}

/** Custom data the Mayar toast keeps on each Base UI toast object. */
interface ToastData {
  cancel?: ToastButton
  closable?: boolean
}

interface ToastInput {
  /** Reuse an id to update a toast in place. */
  id?: string
  type?: ToastType
  title: ReactNode
  description?: ReactNode
  /** One action. Clicking it runs `onClick` and keeps the toast. */
  action?: ToastButton
  /** Shown only together with `action`. Clicking it runs `onClick` and closes the toast. */
  cancel?: ToastButton
  /** Adds a 24px close button. */
  closable?: boolean
  /** Milliseconds. `Infinity` never closes. Default: 4000, 6000 with an action or description, loading never. */
  duration?: number
}

interface ToastPromiseMessages<T> {
  loading: string | ToastInput
  success: string | ToastInput | ((value: T) => string | ToastInput)
  error: string | ToastInput | ((reason: unknown) => string | ToastInput)
}

type ToastInputArg = string | ToastInput

interface ToastApi {
  /** Shows a default toast and returns its id. */
  (input: ToastInputArg): string
  message: (input: ToastInputArg) => string
  success: (input: ToastInputArg) => string
  error: (input: ToastInputArg) => string
  warning: (input: ToastInputArg) => string
  info: (input: ToastInputArg) => string
  loading: (input: ToastInputArg) => string
  /** Changes a toast in place (type, text, action, duration). */
  update: (id: string, patch: Partial<ToastInput>) => void
  /** Closes one toast, or all of them without an id. */
  dismiss: (id?: string) => void
  /** One loading toast that turns into success or error. Returns the original promise. */
  promise: <T>(promise: Promise<T>, messages: ToastPromiseMessages<T>) => Promise<T>
}

interface ToasterInstance extends ToastApi {
  /** The Base UI manager. Pass it to `<ToastProvider toaster={…}>`. */
  manager: ToastManager<ToastData>
}

const TOAST_DURATION_MS = 4000
const TOAST_DURATION_LONG_MS = 6000
const TOAST_LIMIT = 3

type ManagerLike = Pick<ToastManager<ToastData>, 'add' | 'close' | 'update' | 'promise'>
type ToastOptions = ToastManagerAddOptions<ToastData>

function hasContent(node: ReactNode) {
  return typeof node === 'string' ? node.trim().length > 0 : Boolean(node)
}

function asInput(value: ToastInputArg, type: ToastType): ToastInput {
  return typeof value === 'string' ? { title: value, type } : { ...value, type: value.type ?? type }
}

function toOptions(input: ToastInput): ToastOptions {
  const type = input.type ?? 'default'
  const duration =
    input.duration ??
    (type === 'loading'
      ? Infinity
      : input.action || hasContent(input.description)
        ? TOAST_DURATION_LONG_MS
        : TOAST_DURATION_MS)
  return {
    ...(input.id ? { id: input.id } : {}),
    type,
    title: input.title,
    description: input.description,
    timeout: Number.isFinite(duration) ? duration : 0,
    priority: type === 'error' ? 'high' : 'low',
    actionProps: input.action ? { children: input.action.label, onClick: input.action.onClick } : undefined,
    data: { cancel: input.cancel, closable: input.closable ?? false },
  }
}

function toInput(toast: ToastObject<ToastData>): ToastInput {
  const label = toast.actionProps?.children
  return {
    type: (toast.type as ToastType | undefined) ?? 'default',
    title: toast.title,
    description: toast.description,
    action: typeof label === 'string' ? { label, onClick: toast.actionProps?.onClick as (() => void) | undefined } : undefined,
    cancel: toast.data?.cancel,
    closable: toast.data?.closable,
  }
}

function toUpdate(input: ToastInput) {
  const { id: _id, ...options } = toOptions(input)
  return options
}

function buildToastApi(manager: ManagerLike): ToastApi {
  const typed = (type: ToastType) => (input: ToastInputArg) => manager.add(toOptions(asInput(input, type)))
  const api = typed('default') as ToastApi
  api.message = typed('default')
  api.success = typed('success')
  api.error = typed('error')
  api.warning = typed('warning')
  api.info = typed('info')
  api.loading = typed('loading')
  api.update = (id, patch) =>
    manager.update(id, (prev) => toUpdate({ ...toInput(prev), ...patch }))
  api.dismiss = (id) => manager.close(id)
  api.promise = <T,>(promise: Promise<T>, messages: ToastPromiseMessages<T>) =>
    manager.promise(promise, {
      loading: toUpdate(asInput(messages.loading, 'loading')),
      success: (value: T) =>
        toUpdate(asInput(typeof messages.success === 'function' ? messages.success(value) : messages.success, 'success')),
      error: (reason: unknown) =>
        toUpdate(asInput(typeof messages.error === 'function' ? messages.error(reason) : messages.error, 'error')),
    })
  return api
}

/** Creates a toast API with its own manager, for calls outside React (or an isolated provider). */
function createToaster(): ToasterInstance {
  const manager = ToastPrimitive.createToastManager<ToastData>()
  return Object.assign(buildToastApi(manager), { manager })
}

/** The app-wide toast API: `toast.success('Kartu dibuat')`. Mount `<ToastProvider>` + `<Toaster />` once. */
const toast = createToaster()

/** The toast API of the nearest `<ToastProvider>`, for use inside React components. */
function useToast(): ToastApi {
  const { add, close, update, promise } = ToastPrimitive.useToastManager<ToastData>()
  return useMemo(() => buildToastApi({ add, close, update, promise }), [add, close, update, promise])
}

/* ── Card parts ───────────────────────────────────────────────────────────── */

const ICONS: Record<Exclude<ToastType, 'default' | 'loading'>, { icon: IconProps['icon']; className: string }> = {
  success: { icon: CheckmarkCircle02Icon, className: 'text-success' },
  error: { icon: CancelCircleIcon, className: 'text-danger' },
  warning: { icon: AlertCircleIcon, className: 'text-warning' },
  info: { icon: HelpCircleIcon, className: 'text-primary' },
}

function ToastIcon({ type, multi }: { type: ToastType; multi: boolean }) {
  if (type === 'default') return null
  const className = cn('shrink-0', multi && 'mt-px')
  if (type === 'loading') return <Spinner size={18} data-slot="toast-icon" className={cn(className, 'text-muted')} />
  const { icon, className: tone } = ICONS[type]
  return <Icon icon={icon} size={18} data-slot="toast-icon" className={cn(className, tone)} />
}

const toastSurfaceClass = 'w-[356px] max-w-full rounded-2xl bg-surface font-sans text-ink shadow-toast'
const toastLayoutClass = 'relative flex items-center gap-3 px-4 py-3.5 data-multi:items-start'
const toastTitleClass = 'm-0 text-body-sm font-medium text-ink'
const toastDescriptionClass = 'm-0 text-body-sm text-ink-2'
const toastButtonClass =
  'relative hit-44 inline-flex h-7 shrink-0 cursor-pointer items-center rounded-md px-2.5 text-caption-lg font-medium outline-none select-none'
const toastActionClass = cn(
  toastButtonClass,
  'bg-primary text-on-brand shadow-[0_0_0_1px_var(--color-primary-deep),inset_0_1px_0_var(--color-highlight-inset)]',
  'focus-ring:shadow-[0_0_0_2px_var(--color-primary-deep),inset_0_0_0_2px_var(--color-on-brand),inset_0_1px_0_var(--color-highlight-inset)]',
)
const toastOutlineRing = 'focus-ring:outline-2 focus-ring:outline-offset-2 focus-ring:outline-border-focus'
const toastCancelClass = cn(toastButtonClass, 'bg-component text-ink', toastOutlineRing)
const toastCloseClass = cn(
  'absolute top-2.5 right-2.5 hit-44 inline-flex size-6 cursor-pointer items-center justify-center rounded-md text-muted outline-none',
  toastOutlineRing,
)

interface ToastSlots {
  Title: ComponentType<{ className: string; children?: ReactNode }>
  Description: ComponentType<{ className: string; children?: ReactNode }>
  Action: ComponentType<{ className: string; children?: ReactNode }>
  Cancel: ComponentType<{ className: string; children?: ReactNode }>
  Close: ComponentType<{ className: string; children?: ReactNode }>
}

interface ToastBodyProps {
  type: ToastType
  title: ReactNode
  description?: ReactNode
  actionLabel?: ReactNode
  cancelLabel?: ReactNode
  closable?: boolean
  slots: ToastSlots
}

function ToastBody({ type, title, description, actionLabel, cancelLabel, closable, slots }: ToastBodyProps) {
  const { Title, Description, Action, Cancel, Close } = slots
  const hasDescription = hasContent(description)
  const actionRow = Boolean(actionLabel && cancelLabel)
  const multi = hasDescription || actionRow || Boolean(closable)
  const text = (
    <div data-slot="toast-text" className={cn('flex min-w-0 flex-1 flex-col gap-0.5', closable && 'pr-5')}>
      <Title className={toastTitleClass}>{title}</Title>
      {hasDescription ? <Description className={toastDescriptionClass}>{description}</Description> : null}
    </div>
  )
  return (
    <>
      <ToastIcon type={type} multi={multi} />
      {actionRow ? (
        <div className="flex min-w-0 flex-1 flex-col gap-3">
          {text}
          <div data-slot="toast-actions" className="flex flex-wrap items-center gap-2">
            <Action className={toastActionClass}>{actionLabel}</Action>
            <Cancel className={toastCancelClass}>{cancelLabel}</Cancel>
          </div>
        </div>
      ) : (
        <>
          {text}
          {actionLabel ? <Action className={toastActionClass}>{actionLabel}</Action> : null}
        </>
      )}
      {closable ? (
        <Close className={toastCloseClass}>
          <Icon icon={Cancel01Icon} size={14} />
        </Close>
      ) : null}
    </>
  )
}

function isMulti(description: ReactNode, actionRow: boolean, closable?: boolean) {
  return hasContent(description) || actionRow || Boolean(closable)
}

/* ── Live toast ───────────────────────────────────────────────────────────── */

const toastStackClass = [
  'absolute inset-x-0 bottom-0 mx-auto origin-bottom outline-none select-none focus-ring:outline-focus',
  'z-[calc(1000-var(--toast-index))]',
  '[--toast-scale:calc(1-var(--toast-index)*0.05)] [--toast-lift:calc(var(--toast-index)*-12px)]',
  'h-[var(--toast-frontmost-height,var(--toast-height))] data-expanded:h-(--toast-height)',
  '[transform:translateX(var(--toast-swipe-movement-x))_translateY(calc(var(--toast-swipe-movement-y)+var(--toast-lift)))_scale(var(--toast-scale))]',
  'data-expanded:[transform:translateX(var(--toast-swipe-movement-x))_translateY(calc(var(--toast-swipe-movement-y)-var(--toast-offset-y)+var(--toast-lift)))]',
  'data-limited:pointer-events-none data-limited:opacity-0',
  'transition-[transform,opacity,filter,height] duration-(--motion-toast-open) ease-smooth-out',
  'data-ending-style:duration-(--motion-toast-close) motion-reduce:transition-none',
  'data-starting-style:opacity-0 data-starting-style:blur-[2px]',
  'data-starting-style:[transform:translateY(var(--motion-toast-distance))_scale(var(--motion-toast-scale))]',
  'data-ending-style:opacity-0 data-ending-style:blur-[2px]',
  'data-ending-style:not-data-swipe-direction:[transform:translateY(calc(var(--toast-lift)+var(--motion-toast-distance)))_scale(calc(var(--toast-scale)*var(--motion-toast-scale)))]',
  'data-ending-style:data-[swipe-direction=down]:[transform:translateY(calc(var(--toast-swipe-movement-y)+150%))]',
  'data-ending-style:data-[swipe-direction=right]:[transform:translateX(calc(var(--toast-swipe-movement-x)+150%))]',
  'motion-reduce:data-starting-style:transform-none motion-reduce:data-starting-style:blur-none',
  "after:absolute after:inset-x-0 after:top-full after:h-[13px] after:content-['']",
].join(' ')

const LIVE_SLOTS: ToastSlots = {
  Title: (props) => <ToastPrimitive.Title data-slot="toast-title" {...props} />,
  Description: (props) => <ToastPrimitive.Description data-slot="toast-description" {...props} />,
  Action: (props) => <ToastPrimitive.Action data-slot="toast-action" {...props} />,
  Cancel: (props) => <ToastPrimitive.Close data-slot="toast-cancel" {...props} />,
  Close: (props) => <ToastPrimitive.Close data-slot="toast-close" aria-label="Tutup notifikasi" {...props} />,
}

interface ToastProps extends Omit<ToastPrimitive.Root.Props, 'toast'> {
  /** The toast object from `useToastManager().toasts`. */
  toast: ToastObject<ToastData>
}

/**
 * A short, non-blocking message about the result of an action.
 *
 * Call `toast.success('Kartu dibuat')` (or `useToast()` inside a component) and mount
 * `<ToastProvider><App /><Toaster /></ToastProvider>` once. `<Toaster>` renders one `<Toast>` per
 * toast; render `<Toast>` yourself only for a custom viewport.
 */
function Toast({ toast: item, className, ...props }: ToastProps) {
  const type = (item.type as ToastType | undefined) ?? 'default'
  const cancel = item.data?.cancel
  const actionLabel = item.actionProps?.children
  const slots = useMemo<ToastSlots>(
    () => ({
      ...LIVE_SLOTS,
      Cancel: (p) => <ToastPrimitive.Close data-slot="toast-cancel" onClick={cancel?.onClick} {...p} />,
    }),
    [cancel],
  )
  return (
    <ToastPrimitive.Root
      toast={item}
      data-slot="toast"
      className={cn(toastSurfaceClass, toastStackClass, className)}
      {...props}
    >
      <ToastPrimitive.Content
        data-slot="toast-content"
        data-multi={isMulti(item.description, Boolean(actionLabel && cancel), item.data?.closable) || undefined}
        className={cn(
          toastLayoutClass,
          'transition-opacity duration-(--motion-toast-close) data-behind:opacity-0 data-expanded:opacity-100',
        )}
      >
        <ToastBody
          type={type}
          title={item.title}
          description={item.description}
          actionLabel={actionLabel}
          cancelLabel={actionLabel ? cancel?.label : undefined}
          closable={item.data?.closable}
          slots={slots}
        />
      </ToastPrimitive.Content>
    </ToastPrimitive.Root>
  )
}

interface ToasterProps extends ToastPrimitive.Viewport.Props {
  /** Position against the nearest positioned parent instead of the window (mocks, docs). No portal. */
  contained?: boolean
}

/**
 * The toast viewport: bottom centre, 28px above the safe area, newest on top, max 3.
 * Mount it once inside `<ToastProvider>`. Hover or focus expands the stack and pauses the timers.
 */
function Toaster({ className, contained = false, ...props }: ToasterProps) {
  const { toasts } = ToastPrimitive.useToastManager<ToastData>()
  const viewport = (
    <ToastPrimitive.Viewport
      data-slot="toaster"
      aria-label="Notifikasi"
      className={cn(
        contained ? 'absolute' : 'fixed',
        'bottom-[calc(env(safe-area-inset-bottom,0px)+28px)] left-1/2 z-(--z-toast) w-[356px] max-w-[calc(100%-32px)] -translate-x-1/2 outline-none',
        className,
      )}
      {...props}
    >
      {toasts.map((item) => (
        <Toast key={item.id} toast={item} />
      ))}
    </ToastPrimitive.Viewport>
  )
  return contained ? viewport : <ToastPrimitive.Portal>{viewport}</ToastPrimitive.Portal>
}

interface ToastProviderProps extends Omit<ToastPrimitive.Provider.Props, 'toastManager'> {
  /** The toaster whose calls this provider shows. Default: the app-wide `toast`. */
  toaster?: ToasterInstance
}

/** Holds the toasts. Wrap the app once; `useToast()` and the `toast` API need it. */
function ToastProvider({ toaster = toast, limit = TOAST_LIMIT, ...props }: ToastProviderProps) {
  return <ToastPrimitive.Provider toastManager={toaster.manager} limit={limit} {...props} />
}

/* ── Static card ──────────────────────────────────────────────────────────── */

const STATIC_SLOTS: ToastSlots = {
  Title: (props) => <p data-slot="toast-title" {...props} />,
  Description: (props) => <p data-slot="toast-description" {...props} />,
  Action: (props) => <button type="button" data-slot="toast-action" {...props} />,
  Cancel: (props) => <button type="button" data-slot="toast-cancel" {...props} />,
  Close: (props) => <button type="button" data-slot="toast-close" aria-label="Tutup notifikasi" {...props} />,
}

interface ToastCardProps extends Omit<React.ComponentProps<'div'>, 'title'> {
  type?: ToastType
  title: ReactNode
  description?: ReactNode
  /** Label of the action button. */
  action?: ReactNode
  /** Label of the cancel button (shown only with `action`). */
  cancel?: ReactNode
  closable?: boolean
}

/**
 * The toast card as a static surface: in the page flow, no timer, no live region.
 * For specimens and docs that show several toasts side by side.
 */
function ToastCard({ type = 'default', title, description, action, cancel, closable, className, ...props }: ToastCardProps) {
  return (
    <div data-slot="toast-card" data-type={type} className={cn(toastSurfaceClass, className)} {...props}>
      <div
        data-multi={isMulti(description, Boolean(action && cancel), closable) || undefined}
        className={toastLayoutClass}
      >
        <ToastBody
          type={type}
          title={title}
          description={description}
          actionLabel={action}
          cancelLabel={action ? cancel : undefined}
          closable={closable}
          slots={STATIC_SLOTS}
        />
      </div>
    </div>
  )
}

export {
  Toast,
  ToastCard,
  ToastProvider,
  Toaster,
  createToaster,
  toast,
  useToast,
  TOAST_DURATION_LONG_MS,
  TOAST_DURATION_MS,
  TOAST_LIMIT,
  type ToastApi,
  type ToastButton,
  type ToastCardProps,
  type ToastData,
  type ToastInput,
  type ToastPromiseMessages,
  type ToastProps,
  type ToastType,
  type ToasterInstance,
  type ToasterProps,
}
