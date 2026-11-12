import { OTPField } from '@base-ui/react/otp-field'
import { cva } from 'class-variance-authority'
import { Fragment, useEffect, useRef } from 'react'

import { useInvalidShake } from '@/components/ui/input'
import { cn } from '@/lib/utils'

/*
 * Mayar v2 OTP / PIN input. Wonder "Mayar Forms Inputs Guide" › OTP.
 * MD (default): 40×40 slots, radius xl, title-md 20/28 semibold digits, 8px gap; 6 slots show as two
 * groups of 3 with a 12×2 separator. States: empty, active (border-focus ring), filled, masked, invalid
 * (danger-subtle + danger ring, one shake when it turns invalid), disabled.
 * LG (code-only, the PIN gate in the shipped app): 44×52 slots in one row, a 10px ink dot when masked,
 * focus ring + 3px primary-light halo (danger + danger-light when invalid), flat when disabled.
 */

const slotVariants = cva(
  [
    'm-0 border-0 p-0 text-center font-sans text-title-md font-semibold text-ink tabular-nums outline-none',
    'rounded-xl bg-surface shadow-control touch-manipulation',
    'transition-[background-color,box-shadow] duration-(--motion-quick) ease-smooth-out',
    'aria-invalid:bg-danger-subtle aria-invalid:shadow-[0_0_0_1px_var(--color-danger)]',
    'disabled:cursor-not-allowed disabled:bg-disabled disabled:text-disabled-foreground',
  ],
  {
    variants: {
      size: {
        md: [
          'size-10',
          'not-aria-invalid:focus-ring:shadow-[0_0_0_1px_var(--color-border-focus),0_1px_1px_-1px_var(--color-shadow-drop),0_1px_2px_var(--color-shadow-ambient)]',
        ],
        lg: [
          'peer h-13 w-11 caret-primary aria-invalid:caret-danger',
          '[&[type=password]]:text-transparent',
          'focus:shadow-[0_0_0_1px_var(--color-border-focus),0_0_0_3px_var(--color-primary-light)]',
          '[&[data-force-state~=focus]]:shadow-[0_0_0_1px_var(--color-border-focus),0_0_0_3px_var(--color-primary-light)]',
          'aria-invalid:focus:shadow-[0_0_0_1px_var(--color-danger),0_0_0_3px_var(--color-danger-light)]',
          'aria-invalid:[&[data-force-state~=focus]]:shadow-[0_0_0_1px_var(--color-danger),0_0_0_3px_var(--color-danger-light)]',
          'disabled:shadow-none',
        ],
      },
    },
    defaultVariants: { size: 'md' },
  },
)

type OtpInputSize = 'md' | 'lg'

interface OtpInputProps extends Omit<OTPField.Root.Props, 'length' | 'mask'> {
  /** Number of slots. */
  length?: 4 | 6
  /** Slot size. LG is the PIN gate box. */
  size?: OtpInputSize
  /** Hides the digits (a PIN). LG shows a dot in each filled slot. */
  mask?: boolean
  /** Invalid paint and `aria-invalid` on every slot; shakes once when it turns true. */
  invalid?: boolean
  /** Accessible name of slots 2…n. The first slot takes the field label. */
  slotLabel?: (index: number, length: number) => string
  /** Focuses the first slot on mount, and again when a controlled `value` clears (a PIN retry). */
  autoFocus?: boolean
  /** Forces an interaction state on the active slot in docs and QA pages. */
  'data-force-state'?: string
}

/**
 * A code or PIN input with one slot for each digit.
 *
 * Built on Base UI `OTPField`: digits only, paste fills every slot, arrows and Backspace move between
 * slots, and the first slot has `autocomplete="one-time-code"`. Label it with a `Field` + `FieldLabel`, or a
 * `<label htmlFor={id}>`. Set `autoComplete="off"` for a PIN.
 */
function OtpInput({
  className,
  length = 6,
  size = 'md',
  mask = false,
  invalid = false,
  inputMode = 'numeric',
  slotLabel = (index, total) => `Digit ${index + 1} of ${total}`,
  autoFocus = false,
  'data-force-state': forceState,
  ref,
  ...props
}: OtpInputProps) {
  const rootRef = useRef<HTMLDivElement | null>(null)
  useInvalidShake(rootRef, () => rootRef.current?.querySelector('[aria-invalid=true]') != null)

  const cleared = (props.value ?? '') === ''
  useEffect(() => {
    if (!autoFocus || !cleared) return
    rootRef.current?.querySelector<HTMLInputElement>('[data-slot=otp-input-slot]')?.focus()
  }, [autoFocus, cleared])

  const forcedIndex = Math.min(String(props.value ?? props.defaultValue ?? '').length, length - 1)
  const grouped = size === 'md' && length === 6

  return (
    <OTPField.Root
      ref={(node: HTMLDivElement | null) => {
        rootRef.current = node
        if (typeof ref === 'function') ref(node)
        else if (ref) ref.current = node
      }}
      data-slot="otp-input"
      data-size={size}
      data-invalid={invalid ? '' : undefined}
      length={length}
      mask={mask}
      inputMode={inputMode}
      className={cn('inline-flex items-center gap-2 data-shaking:motion-safe:animate-shake', className)}
      {...props}
    >
      {Array.from({ length }, (_, index) => (
        <Fragment key={index}>
          {grouped && index === 3 ? (
            <span data-slot="otp-input-separator" aria-hidden className="h-0.5 w-3 rounded-[1px] bg-border-subtle" />
          ) : null}
          <span data-slot="otp-input-cell" className="relative inline-flex">
            <OTPField.Input
              data-slot="otp-input-slot"
              aria-label={index === 0 ? undefined : slotLabel(index, length)}
              data-force-state={forceState && index === forcedIndex ? forceState : undefined}
              {...(invalid ? { 'aria-invalid': true } : {})}
              className={slotVariants({ size })}
            />
            {mask && size === 'lg' ? (
              <span
                data-slot="otp-input-dot"
                aria-hidden
                className={cn(
                  'pointer-events-none absolute top-1/2 left-1/2 size-2.5 -translate-1/2 rounded-pill bg-ink opacity-0',
                  'peer-data-filled:opacity-100 peer-disabled:bg-disabled-foreground',
                )}
              />
            ) : null}
          </span>
        </Fragment>
      ))}
    </OTPField.Root>
  )
}

export { OtpInput, type OtpInputProps }
