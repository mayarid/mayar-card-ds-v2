import { Input as BaseInput } from '@base-ui/react/input'
import { CancelCircleIcon } from '@hugeicons/core-free-icons'
import { cva, type VariantProps } from 'class-variance-authority'
import { useLayoutEffect, useRef, useState } from 'react'

import { Icon } from '@/components/ui/icon'
import { cn } from '@/lib/utils'

/*
 * Mayar v2 Input. Wonder "Mayar Forms Inputs Guide" › Input.
 * Variants: default, ghost, inline. Sizes: SM 28 / MD 32 / LG 36 (default) / XL 40.
 * Radius lg 8px (SM, MD) and xl 10px (LG, XL). Text 13 (SM, MD), 14 (LG), 16 (XL); 16 under a coarse pointer.
 * States: placeholder, filled, hover (canvas), focus (border-focus ring), invalid (danger-subtle + danger ring,
 * one shake when it turns invalid), disabled.
 * Code-only: tone "danger" (danger focus ring for a type-to-confirm field) and the clear button.
 */

const inputVariants = cva(
  [
    'group/input relative flex w-full min-w-0 items-center text-ink touch-manipulation',
    'font-sans font-normal',
    'pointer-coarse:text-body-lg',
    '[&_svg]:shrink-0',
    // Invalid: the one error story for every text control.
    'has-[[aria-invalid=true]]:bg-danger-subtle has-[[aria-invalid=true]]:shadow-[0_0_0_1px_var(--color-danger)]',
    // Disabled.
    'has-disabled:cursor-not-allowed has-disabled:bg-disabled has-disabled:text-disabled-foreground has-disabled:shadow-ring',
    // A text prefix ("Rp") turns on tabular digits.
    '[&:has([data-slot=input-prefix])_input]:tabular-nums',
    'data-shaking:motion-safe:animate-shake',
  ],
  {
    variants: {
      variant: {
        default: [
          'bg-surface shadow-control',
          'transition-[background-color,box-shadow] duration-(--motion-quick) ease-smooth-out',
          'hover-fine:not-has-disabled:not-focus-within:not-has-[[aria-invalid=true]]:bg-canvas',
          // Focus: real focus inside the box, or a forced focus state.
          'not-has-[[aria-invalid=true]]:focus-within:shadow-[0_0_0_1px_var(--color-border-focus),0_1px_1px_-1px_var(--color-shadow-drop),0_1px_2px_var(--color-shadow-ambient)]',
          'not-has-[[aria-invalid=true]]:[&[data-force-state~=focus]]:shadow-[0_0_0_1px_var(--color-border-focus),0_1px_1px_-1px_var(--color-shadow-drop),0_1px_2px_var(--color-shadow-ambient)]',
        ],
        ghost: [
          'bg-transparent shadow-none',
          'has-disabled:bg-transparent has-disabled:shadow-none',
          'not-has-[[aria-invalid=true]]:focus-within:shadow-[0_0_0_1px_var(--color-border-focus)]',
          'not-has-[[aria-invalid=true]]:[&[data-force-state~=focus]]:shadow-[0_0_0_1px_var(--color-border-focus)]',
        ],
        inline: [
          'h-auto! rounded-none! p-0! bg-transparent shadow-none',
          'has-disabled:bg-transparent has-disabled:shadow-none',
          'not-has-[[aria-invalid=true]]:focus-within:shadow-[0_0_0_1px_var(--color-border-focus)]',
          'not-has-[[aria-invalid=true]]:[&[data-force-state~=focus]]:shadow-[0_0_0_1px_var(--color-border-focus)]',
        ],
      },
      size: {
        sm: 'h-7 gap-1.5 rounded-lg pr-2 pl-2.5 text-body-sm [&_svg]:size-3.5',
        md: 'h-8 gap-2 rounded-lg pr-2.5 pl-3 text-body-sm [&_svg]:size-4',
        lg: 'h-9 gap-2 rounded-xl pr-2.5 pl-3 text-body-base [&_svg]:size-4',
        xl: 'h-10 gap-2 rounded-xl pr-3 pl-3.5 text-body-lg [&_svg]:size-4',
      },
      tone: {
        default: '',
        danger: [
          'not-has-[[aria-invalid=true]]:focus-within:shadow-[0_0_0_1px_var(--color-danger),0_1px_1px_-1px_var(--color-shadow-drop),0_1px_2px_var(--color-shadow-ambient)]',
          'not-has-[[aria-invalid=true]]:[&[data-force-state~=focus]]:shadow-[0_0_0_1px_var(--color-danger),0_1px_1px_-1px_var(--color-shadow-drop),0_1px_2px_var(--color-shadow-ambient)]',
        ],
      },
    },
    defaultVariants: { variant: 'default', size: 'lg', tone: 'default' },
  },
)

type InputVariantProps = VariantProps<typeof inputVariants>

/**
 * Replays the theme shake on an element. It is feedback on top of the invalid paint, so call it only
 * after a user action (a submit, a wrong code). Reduced motion turns it off.
 */
function replayShake(element: HTMLElement | null) {
  if (!element) return
  element.removeAttribute('data-shaking')
  void element.offsetWidth
  element.setAttribute('data-shaking', '')
  element.addEventListener('animationend', () => element.removeAttribute('data-shaking'), { once: true })
}

/**
 * Shakes `targetRef` once each time `isInvalid()` turns from false to true after the first render.
 * A control that mounts invalid does not shake.
 */
function useInvalidShake(targetRef: React.RefObject<HTMLElement | null>, isInvalid: () => boolean) {
  const previous = useRef<boolean | null>(null)
  useLayoutEffect(() => {
    const now = isInvalid()
    if (previous.current === false && now) replayShake(targetRef.current)
    previous.current = now
  })
}

/** Assigns one node to several refs. */
function assignRefs<T>(node: T, ...refs: Array<React.Ref<T> | undefined>) {
  for (const ref of refs) {
    if (typeof ref === 'function') ref(node)
    else if (ref) ref.current = node
  }
}

/** Sets the value of a native input the way typing does, so React and Base UI see the change. */
function setNativeValue(input: HTMLInputElement, value: string) {
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set
  setter?.call(input, value)
  input.dispatchEvent(new Event('input', { bubbles: true }))
}

interface InputProps
  extends Omit<BaseInput.Props, 'size' | 'prefix' | 'className' | 'ref'>,
    InputVariantProps {
  /** Classes for the outer box (the visible field). */
  className?: string
  /** The native `<input>`. */
  ref?: React.Ref<HTMLInputElement>
  /** Invalid paint (danger-subtle fill and danger ring) and `aria-invalid`. Inside a `Field`, set `invalid` on the Field. */
  invalid?: boolean
  /** Content before the text: an `<Icon>` or an `<InputPrefix>`. Hidden from assistive tech. */
  leading?: React.ReactNode
  /** Content after the text, e.g. `<Kbd>⌘K</Kbd>`. */
  trailing?: React.ReactNode
  /** Shows a clear button while there is text. Called after the value is emptied. */
  onClear?: () => void
  /** Accessible name of the clear button. */
  clearLabel?: string
  /** Forces an interaction state in docs and QA pages. */
  'data-force-state'?: string
}

/**
 * A single-line text field.
 *
 * Put an icon or a text prefix in `leading` and a key hint in `trailing`:
 * `<Input leading={<Icon icon={Search01Icon} />} trailing={<Kbd aria-hidden>⌘K</Kbd>} />`.
 * Every native input attribute goes on the `<input>`; `className` goes on the visible box.
 * It works inside a Base UI `Field`, which wires the label, description and error.
 */
function Input({
  className,
  variant,
  size,
  tone,
  invalid = false,
  leading,
  trailing,
  onClear,
  clearLabel = 'Hapus teks',
  disabled,
  readOnly,
  autoComplete = 'off',
  spellCheck = false,
  value,
  defaultValue,
  onValueChange,
  ref,
  'data-force-state': forceState,
  ...props
}: InputProps) {
  const boxRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [uncontrolledFilled, setUncontrolledFilled] = useState(
    defaultValue !== undefined && String(defaultValue) !== '',
  )
  const filled = value !== undefined ? String(value) !== '' : uncontrolledFilled

  useInvalidShake(boxRef, () => inputRef.current?.getAttribute('aria-invalid') === 'true')

  function clear() {
    const input = inputRef.current
    if (!input) return
    setNativeValue(input, '')
    onClear?.()
    input.focus()
  }

  function focusFromBox(event: React.MouseEvent<HTMLDivElement>) {
    const target = event.target as HTMLElement
    if (target.closest('input, button, a')) return
    event.preventDefault()
    inputRef.current?.focus()
  }

  return (
    <div
      ref={boxRef}
      data-slot="input-box"
      data-variant={variant ?? 'default'}
      data-size={size ?? 'lg'}
      data-tone={tone === 'danger' ? 'danger' : undefined}
      data-force-state={forceState}
      className={cn(inputVariants({ variant, size, tone }), className)}
      onMouseDown={focusFromBox}
    >
      {leading ? (
        <span
          data-slot="input-leading"
          aria-hidden
          className="pointer-events-none inline-flex shrink-0 items-center text-ink-2 group-has-disabled/input:text-disabled-foreground"
        >
          {leading}
        </span>
      ) : null}
      <BaseInput
        ref={(node: HTMLElement | null) => {
          inputRef.current = node as HTMLInputElement | null
          assignRefs(node as HTMLInputElement | null, ref)
        }}
        data-slot="input"
        disabled={disabled}
        readOnly={readOnly}
        autoComplete={autoComplete}
        spellCheck={spellCheck}
        value={value}
        defaultValue={defaultValue}
        onValueChange={(next, details) => {
          onValueChange?.(next, details)
          setUncontrolledFilled(next !== '')
        }}
        {...(invalid ? { 'aria-invalid': true } : {})}
        {...(autoComplete === 'off' ? { 'data-1p-ignore': 'true', 'data-lpignore': 'true' } : {})}
        className={cn(
          'h-full w-full min-w-0 flex-1 appearance-none border-0 bg-transparent p-0 text-inherit outline-none',
          'placeholder:text-placeholder disabled:cursor-not-allowed disabled:text-disabled-foreground',
          onClear && '[&::-webkit-search-cancel-button]:appearance-none',
        )}
        {...props}
      />
      {onClear && filled && !disabled && !readOnly ? (
        <button
          type="button"
          data-slot="input-clear"
          aria-label={clearLabel}
          onClick={clear}
          className={cn(
            'relative hit-44 inline-flex shrink-0 items-center justify-center rounded-pill text-ink-2 outline-none',
            'transition-colors duration-(--motion-quick) ease-smooth-out hover-fine:text-ink focus-ring:outline-focus',
          )}
        >
          <Icon icon={CancelCircleIcon} />
        </button>
      ) : null}
      {trailing ? (
        <span
          data-slot="input-trailing"
          className="inline-flex shrink-0 items-center gap-1 text-ink-2 group-has-disabled/input:text-disabled-foreground group-has-disabled/input:[&_[data-slot=kbd]]:text-disabled-foreground"
        >
          {trailing}
        </span>
      ) : null}
    </div>
  )
}

/** A text prefix inside `Input`, such as "Rp". Medium weight, ink-2. Turns on tabular digits in the field. */
function InputPrefix({ className, ...props }: React.ComponentProps<'span'>) {
  return <span data-slot="input-prefix" className={cn('font-medium text-ink-2', className)} {...props} />
}

export { Input, InputPrefix, inputVariants, replayShake, useInvalidShake, type InputProps }
