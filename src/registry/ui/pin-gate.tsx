import { mergeProps } from '@base-ui/react/merge-props'
import { useRender } from '@base-ui/react/use-render'
import {
  AlertCircleIcon,
  CheckmarkCircle02Icon,
  SquareLock02Icon,
  Time04Icon,
} from '@hugeicons/core-free-icons'
import {
  createContext,
  use,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'

import { Dialog, DialogBody, DialogContent, type DialogProps } from '@/components/ui/dialog'
import { Icon } from '@/components/ui/icon'
import { IconDisc, type IconDiscProps } from '@/components/ui/icon-disc'
import { OtpInput } from '@/components/ui/otp-input'
import { Spinner } from '@/components/ui/spinner'
import { cn } from '@/lib/utils'

/*
 * Mayar v2 PIN Gate. The shipped app is the source of truth (components/PinGate.svelte,
 * PinDigits.svelte, SetPinModal.svelte); Wonder Dashboard › "Kartu Action PIN A … v2" (Verify,
 * Wrong PIN, Locked, Set Create, Set Confirm) is the visual reference.
 * Layout: centred column, 20px gap. Header: 44px primary disc (lock, 20px), 6px below it, title-sm,
 * body-sm ink-2 subtitle, 6px apart. Field: the LG OtpInput (44×52, radius xl, masked dots) and one
 * 16px line under it (caption-lg medium, 14px icon): danger for a wrong PIN, warning when locked,
 * ink-2 while it checks, success-text after a match. Links: 16px apart with a 1×14 hairline.
 * Dialog form: the app's Dialog surface (SM 400, header none, dialog elevation), padding 32 24 24
 * (DialogBody), corner close.
 * Copy (app): "PIN salah, coba lagi" · "PIN tidak sama, ulangi dari awal" · locked "PIN terkunci
 * sementara. Coba beberapa saat lagi." A server message replaces the first and the last.
 * States: empty, typing, checking, wrong PIN (danger + one shake + clear + refocus), locked
 * (unlocks by itself when the end time is known), success. `confirm` asks twice and checks that both match.
 */

type PinGateStatus = 'idle' | 'checking' | 'error' | 'locked' | 'success'
type PinGateStep = 'create' | 'confirm'

/** What `onSubmit` returns. `true`: the PIN is right. `false` or `{ error }`: it is wrong. */
type PinGateResult =
  | boolean
  | {
      /** The line under the boxes. Defaults to the `errorMessage` of the gate, or the lock notice with `locked`. */
      error?: string
      /** The PIN is locked. */
      locked?: boolean
      /** Seconds until the lock ends. The gate unlocks by itself then; `usePinGate().lockSeconds` counts down. */
      retryAfter?: number
    }

interface PinGateContextValue {
  length: 4 | 6
  value: string
  status: PinGateStatus
  step: PinGateStep | null
  message: string | null
  lockSeconds: number | null
  disabled: boolean
  inputId: string
  messageId: string
  fieldRef: React.RefObject<HTMLDivElement | null>
  setValue: (value: string) => void
  complete: (pin: string) => void
}

const PinGateContext = createContext<PinGateContextValue | null>(null)

/** Lets `PinGateDialog` block its close paths while a check runs. */
const PinGateBusyContext = createContext<((busy: boolean) => void) | null>(null)

function usePinGateContext(part: string) {
  const context = use(PinGateContext)
  if (!context) throw new Error(`<${part}> must be inside <PinGate>.`)
  return context
}

/** The gate state for custom parts: status, step (with `confirm`), the line text and the lock countdown. */
function usePinGate() {
  const { status, step, message, lockSeconds, value, length } = usePinGateContext('usePinGate')
  return { status, step, message, lockSeconds, value, length }
}

/** The app's lock notice. */
const LOCKED_NOTICE = 'PIN terkunci sementara. Coba beberapa saat lagi.'

interface PinGateProps extends Omit<React.ComponentProps<'div'>, 'onSubmit' | 'defaultValue'> {
  /** Checks the PIN. Return `true` for a match, `false` or `{ error, locked, retryAfter }` otherwise. A throw counts as wrong. */
  onSubmit: (pin: string) => Promise<PinGateResult> | PinGateResult
  /** Called after `onSubmit` returns `true`. Close the dialog or continue the action here. */
  onSuccess?: (pin: string) => void
  /** Called on every status change: idle, checking, error, locked, success. */
  onStatusChange?: (status: PinGateStatus) => void
  /** Number of digits. */
  length?: 4 | 6
  /** The typed digits (controlled). The gate clears them after a wrong PIN. */
  value?: string
  /** The typed digits at first render (uncontrolled). */
  defaultValue?: string
  /** Called with the digits on each edit and when the gate clears them. */
  onValueChange?: (value: string) => void
  /** Status at first render. For a gate that opens locked, or for docs and QA pages. */
  defaultStatus?: PinGateStatus
  /** The line under the boxes at first render (with `defaultStatus`). */
  defaultMessage?: string
  /** A lock end time from your server (ms since epoch or a Date). The gate stays locked until then. */
  lockedUntil?: number | Date
  /** Locks after this many wrong tries in a row (client side). Off when not set. */
  maxAttempts?: number
  /** Length of the client-side lock in seconds. */
  lockoutSeconds?: number
  /** Asks for the PIN twice (create, then confirm) and submits only when both match. */
  confirm?: boolean
  /** With `confirm`: the step at first render. For docs and QA pages. */
  defaultStep?: PinGateStep
  /** The line for a wrong PIN when `onSubmit` gives no `error`. */
  errorMessage?: string
  /** The line when the two entries of `confirm` differ. */
  mismatchMessage?: string
  /** The line after a match. */
  successMessage?: string
  /** The line while `onSubmit` runs. */
  checkingMessage?: string
  /** Disables the boxes. */
  disabled?: boolean
  /** Focuses the first box on mount. */
  autoFocus?: boolean
}

/**
 * A PIN prompt before a sensitive action: show card details, move balance, create or change a PIN.
 *
 * The gate owns the flow: it submits when every box is filled, shows "checking", clears the boxes,
 * shakes and refocuses after a wrong PIN, locks (and unlocks at the end time), and calls `onSuccess`
 * after a match. Your `onSubmit(pin)` does the check and returns `true`, `false` or
 * `{ error, locked, retryAfter }`. Compose the parts: `<PinGate onSubmit={check}><PinGateHeader><PinGateIcon />
 * <PinGateTitle>…</PinGateTitle></PinGateHeader><PinGateField /></PinGate>`. Put it in `PinGateDialog`
 * for the modal form.
 */
function PinGate({
  onSubmit,
  onSuccess,
  onStatusChange,
  length = 6,
  value: valueProp,
  defaultValue = '',
  onValueChange,
  defaultStatus = 'idle',
  defaultMessage,
  lockedUntil,
  maxAttempts,
  lockoutSeconds = 30,
  confirm = false,
  defaultStep = 'create',
  errorMessage = 'PIN salah, coba lagi',
  mismatchMessage = 'PIN tidak sama, ulangi dari awal',
  successMessage = 'PIN benar.',
  checkingMessage = 'Memeriksa PIN…',
  disabled = false,
  autoFocus = true,
  className,
  children,
  ...props
}: PinGateProps) {
  const [innerValue, setInnerValue] = useState(defaultValue)
  const value = valueProp ?? innerValue
  const [status, setStatusState] = useState<PinGateStatus>(defaultStatus)
  const [message, setMessage] = useState<string | null>(defaultMessage ?? null)
  const [step, setStep] = useState<PinGateStep>(defaultStep)
  const [lockEnd, setLockEnd] = useState<number | null>(null)
  const [now, setNow] = useState(() => Date.now())
  const [focusTick, setFocusTick] = useState(0)
  const firstPin = useRef('')
  const failures = useRef(0)
  const mounted = useRef(true)
  const fieldRef = useRef<HTMLDivElement | null>(null)
  const inputId = useId()
  const messageId = useId()
  const setBusy = use(PinGateBusyContext)

  const externalEnd = lockedUntil === undefined ? null : new Date(lockedUntil).getTime()
  const end = externalEnd !== null && externalEnd > now ? externalEnd : lockEnd
  const lockSeconds = end !== null ? Math.max(0, Math.ceil((end - now) / 1000)) : null
  const timedLock = end !== null && end > now
  const effectiveStatus: PinGateStatus = timedLock ? 'locked' : status

  const setStatus = useCallback(
    (next: PinGateStatus) => {
      setStatusState(next)
      onStatusChange?.(next)
    },
    [onStatusChange],
  )

  const setValue = useCallback(
    (next: string) => {
      if (valueProp === undefined) setInnerValue(next)
      onValueChange?.(next)
    },
    [valueProp, onValueChange],
  )

  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
    }
  }, [])

  useEffect(() => {
    setBusy?.(effectiveStatus === 'checking')
  }, [effectiveStatus, setBusy])

  useEffect(() => () => setBusy?.(false), [setBusy])

  // The countdown: tick each second while a timed lock runs, then unlock and refocus.
  useEffect(() => {
    if (end === null) return
    if (end <= Date.now()) return
    const timer = window.setInterval(() => {
      const t = Date.now()
      setNow(t)
      if (t >= end) {
        window.clearInterval(timer)
        setLockEnd(null)
        failures.current = 0
        setMessage(null)
        setStatus('idle')
        setFocusTick((n) => n + 1)
      }
    }, 1000)
    return () => window.clearInterval(timer)
  }, [end, setStatus])

  useEffect(() => {
    if (focusTick === 0 && !autoFocus) return
    // Runs after the commit, so boxes that were disabled during a check are enabled again here.
    const field = fieldRef.current
    if (!field) return
    // On mount, never pull focus back once the user is typing in the boxes.
    if (focusTick === 0 && field.contains(document.activeElement)) return
    field.querySelector<HTMLInputElement>('input:not(:disabled)')?.focus()
  }, [focusTick, autoFocus])

  const lock = useCallback(
    (seconds: number | undefined, line?: string) => {
      setValue('')
      const t = Date.now()
      setNow(t)
      setLockEnd(seconds && seconds > 0 ? t + seconds * 1000 : null)
      // A server message replaces the app's lock notice, as the app does.
      setMessage(line ?? null)
      setStatus('locked')
    },
    [setStatus, setValue],
  )

  const fail = useCallback(
    (line: string) => {
      setValue('')
      setStep('create')
      firstPin.current = ''
      setMessage(line)
      setStatus('error')
      setFocusTick((n) => n + 1)
    },
    [setStatus, setValue],
  )

  const complete = useCallback(
    (pin: string) => {
      if (disabled || pin.length !== length) return
      if (effectiveStatus === 'checking' || effectiveStatus === 'locked' || effectiveStatus === 'success') return

      if (confirm && step === 'create') {
        firstPin.current = pin
        setValue('')
        setMessage(null)
        setStatus('idle')
        setStep('confirm')
        setFocusTick((n) => n + 1)
        return
      }
      if (confirm && pin !== firstPin.current) {
        fail(mismatchMessage)
        return
      }

      setMessage(checkingMessage)
      setStatus('checking')
      void (async () => {
        let result: PinGateResult
        try {
          result = await onSubmit(pin)
        } catch (error) {
          result = { error: error instanceof Error && error.message ? error.message : undefined }
        }
        if (!mounted.current) return

        if (result === true) {
          failures.current = 0
          setMessage(successMessage)
          setStatus('success')
          onSuccess?.(pin)
          return
        }
        const detail = result === false ? {} : result
        if (detail.locked) {
          lock(detail.retryAfter, detail.error)
          return
        }
        failures.current += 1
        if (maxAttempts !== undefined && failures.current >= maxAttempts) {
          lock(lockoutSeconds)
          return
        }
        fail(detail.error ?? errorMessage)
      })()
    },
    [
      checkingMessage,
      confirm,
      disabled,
      effectiveStatus,
      errorMessage,
      fail,
      length,
      lock,
      lockoutSeconds,
      maxAttempts,
      mismatchMessage,
      onSubmit,
      onSuccess,
      setStatus,
      setValue,
      step,
      successMessage,
    ],
  )

  const setValueAndClear = useCallback(
    (next: string) => {
      setValue(next)
      // A new keystroke clears a stale error.
      if (effectiveStatus === 'error') {
        setMessage(null)
        setStatus('idle')
      }
    },
    [effectiveStatus, setStatus, setValue],
  )

  const line = effectiveStatus === 'locked' ? (message ?? LOCKED_NOTICE) : message

  const context = useMemo<PinGateContextValue>(
    () => ({
      length,
      value,
      status: effectiveStatus,
      step: confirm ? step : null,
      message: line,
      lockSeconds: timedLock ? lockSeconds : null,
      disabled,
      inputId,
      messageId,
      fieldRef,
      setValue: setValueAndClear,
      complete,
    }),
    [length, value, effectiveStatus, confirm, step, line, timedLock, lockSeconds, disabled, inputId, messageId, setValueAndClear, complete],
  )

  const shape = effectiveStatus === 'idle' ? (value.length === 0 ? 'empty' : 'typing') : effectiveStatus

  return (
    <PinGateContext value={context}>
      <div
        data-slot="pin-gate"
        data-state={shape}
        data-step={confirm ? step : undefined}
        aria-busy={effectiveStatus === 'checking' || undefined}
        className={cn('flex flex-col items-center gap-5 text-center', className)}
        {...props}
      >
        {children}
      </div>
    </PinGateContext>
  )
}

/** The disc, title and subtitle, stacked and centred 6px apart. */
function PinGateHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="pin-gate-header" className={cn('flex flex-col items-center gap-1.5', className)} {...props} />
}

/** The 44px primary disc with a lock. Pass another `<Icon />` as `children` to change the glyph. */
function PinGateIcon({ className, children, ...props }: Omit<IconDiscProps, 'size' | 'tone'>) {
  return (
    <IconDisc data-slot="pin-gate-icon" size={44} tone="primary" aria-hidden className={cn('mb-1.5', className)} {...props}>
      {children ?? <Icon icon={SquareLock02Icon} size={20} />}
    </IconDisc>
  )
}

/** The prompt (title-sm, an `<h2>`). In a dialog, use `DialogTitle` so the dialog gets its name. */
function PinGateTitle({ className, render, ...props }: useRender.ComponentProps<'h2'>) {
  const defaultProps: useRender.ElementProps<'h2'> = {
    'data-slot': 'pin-gate-title',
    className: cn('m-0 text-title-sm text-ink', className),
  } as useRender.ElementProps<'h2'>
  return useRender({ defaultTagName: 'h2', render, props: mergeProps<'h2'>(defaultProps, props) })
}

/** One body-sm ink-2 line under the title. In a dialog, use `DialogDescription`. */
function PinGateDescription({ className, ...props }: React.ComponentProps<'p'>) {
  return <p data-slot="pin-gate-description" className={cn('m-0 text-body-sm text-ink-2', className)} {...props} />
}

const LINE_TONE: Record<PinGateStatus, string> = {
  idle: 'text-danger-text',
  error: 'text-danger-text',
  locked: 'text-warning-text',
  checking: 'text-ink-2',
  success: 'text-success-text',
}

interface PinGateFieldProps extends Omit<React.ComponentProps<'div'>, 'children'> {
  /** Accessible name of the first box. The other boxes are "Digit PIN ke-N". */
  label?: string
}

/**
 * The masked boxes and the status line under them. The line keeps its 16px height when it is empty,
 * so the layout does not jump. With `confirm`, two step dots follow the line.
 */
function PinGateField({ className, label = 'PIN', ...props }: PinGateFieldProps) {
  const { length, value, status, step, message, disabled, inputId, messageId, fieldRef, setValue, complete } =
    usePinGateContext('PinGateField')
  const blocked = disabled || status === 'checking' || status === 'locked' || status === 'success'

  return (
    <div
      ref={fieldRef}
      data-slot="pin-gate-field"
      className={cn('flex flex-col items-center gap-2', className)}
      {...props}
    >
      <label htmlFor={inputId} className="sr-only">
        {label}
      </label>
      <OtpInput
        id={inputId}
        size="lg"
        length={length}
        mask
        autoComplete="off"
        value={value}
        onValueChange={(next) => setValue(next)}
        onValueComplete={(next) => complete(next)}
        invalid={status === 'error'}
        disabled={blocked}
        aria-describedby={messageId}
        slotLabel={(index) => `Digit PIN ke-${index + 1}`}
      />
      <p
        id={messageId}
        data-slot="pin-gate-message"
        data-tone={status}
        aria-live="assertive"
        aria-atomic
        className={cn(
          'm-0 flex min-h-4 items-center justify-center gap-1.5 text-caption-lg font-medium tabular-nums',
          LINE_TONE[status],
        )}
      >
        {message ? (
          <>
            {status === 'checking' ? (
              <Spinner size={14} />
            ) : (
              <Icon
                icon={
                  status === 'locked' ? Time04Icon : status === 'success' ? CheckmarkCircle02Icon : AlertCircleIcon
                }
                size={14}
              />
            )}
            <span>{message}</span>
          </>
        ) : null}
      </p>
      {step ? (
        <div data-slot="pin-gate-steps" aria-hidden className="flex items-center gap-1.5 pt-1">
          <span className={cn('h-1.5 rounded-pill bg-primary', step === 'create' ? 'w-4' : 'w-1.5')} />
          <span className={cn('h-1.5 rounded-pill', step === 'confirm' ? 'w-4 bg-primary' : 'w-1.5 bg-switch-off')} />
        </div>
      ) : null}
    </div>
  )
}

/** The link row under the field ("Lupa PIN?", "Atur PIN baru"), 16px apart. Put `Button variant="link"`s in it. */
function PinGateActions({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="pin-gate-actions" className={cn('flex items-center gap-4', className)} {...props} />
}

/** The 1×14 hairline between two links. */
function PinGateActionSeparator({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      data-slot="pin-gate-action-separator"
      aria-hidden
      className={cn('h-3.5 w-px bg-border-subtle', className)}
      {...props}
    />
  )
}

interface PinGateDialogProps extends Omit<DialogProps, 'busy' | 'children'> {
  children: ReactNode
  /** Classes for the dialog panel. */
  className?: string
  /** Accessible name of the corner close button. */
  closeLabel?: string
}

/**
 * The PIN Gate in a modal: Dialog SM (400px), no header row, a corner close, padding 32 24 24.
 * Put a `<PinGate>` inside; use `DialogTitle` and `DialogDescription` in its header. Nothing closes the
 * dialog while the PIN is checked. The gate mounts fresh each time the dialog opens.
 */
function PinGateDialog({ children, className, closeLabel, ...props }: PinGateDialogProps) {
  const [busy, setBusy] = useState(false)
  return (
    <PinGateBusyContext value={setBusy}>
      <Dialog busy={busy} {...props}>
        <DialogContent
          size="sm"
          header="none"
          closeLabel={closeLabel}
          initialFocus={() => document.querySelector<HTMLElement>('[data-slot=pin-gate-field] input:not(:disabled)')}
          className={className}
        >
          <DialogBody className="overflow-visible">{children}</DialogBody>
        </DialogContent>
      </Dialog>
    </PinGateBusyContext>
  )
}

export {
  PinGate,
  PinGateActionSeparator,
  PinGateActions,
  PinGateDescription,
  PinGateDialog,
  PinGateField,
  PinGateHeader,
  PinGateIcon,
  PinGateTitle,
  usePinGate,
  type PinGateDialogProps,
  type PinGateFieldProps,
  type PinGateProps,
  type PinGateResult,
  type PinGateStatus,
  type PinGateStep,
}
