import { Field } from '@base-ui/react/field'
import { cva, type VariantProps } from 'class-variance-authority'
import { useRef } from 'react'

import { useInvalidShake } from '@/components/ui/input'
import { cn } from '@/lib/utils'

/*
 * Mayar v2 Textarea. Wonder "Mayar Forms Inputs Guide" › Textarea (default and ghost).
 * Same paints as Input: surface + control shadow, border-focus ring on focus, danger-subtle + danger ring
 * when invalid (one shake when it turns invalid), disabled fill. Radius xl 10px, 10/12 padding, 14/20 text.
 * Code-only sizes from the shipped app: MD (13px text, 8/12 padding, radius lg) and XL (16/24 text, 12/14 padding).
 * Text is 16px under a coarse pointer. ⌘/Ctrl+Enter submits the form; Enter adds a line.
 */

const textareaVariants = cva(
  [
    'block w-full min-w-0 resize-y border-0 font-sans font-normal text-ink outline-none touch-manipulation',
    'placeholder:text-placeholder',
    'transition-[background-color,box-shadow] duration-(--motion-quick) ease-smooth-out',
    'pointer-coarse:text-body-lg',
    'aria-invalid:bg-danger-subtle aria-invalid:shadow-[0_0_0_1px_var(--color-danger)]',
    'disabled:cursor-not-allowed disabled:bg-disabled disabled:text-disabled-foreground',
    'data-shaking:motion-safe:animate-shake',
  ],
  {
    variants: {
      variant: {
        default: [
          'bg-surface shadow-control',
          'not-aria-invalid:focus-ring:shadow-[0_0_0_1px_var(--color-border-focus),0_1px_1px_-1px_var(--color-shadow-drop),0_1px_2px_var(--color-shadow-ambient)]',
          'disabled:shadow-ring',
        ],
        ghost: [
          'bg-transparent shadow-none',
          'not-aria-invalid:focus-ring:bg-transparent not-aria-invalid:focus-ring:shadow-[0_0_0_1px_var(--color-border-focus)]',
          'disabled:bg-transparent',
        ],
      },
      size: {
        md: 'rounded-lg px-3 py-2 text-body-sm',
        lg: 'rounded-xl px-3 py-2.5 text-body-base',
        xl: 'rounded-xl px-3.5 py-3 text-body-lg',
      },
    },
    defaultVariants: { variant: 'default', size: 'lg' },
  },
)

interface TextareaProps
  extends Omit<React.ComponentProps<'textarea'>, 'value' | 'defaultValue'>,
    VariantProps<typeof textareaVariants> {
  value?: string
  defaultValue?: string
  /** Called with the new text. Use when controlled. */
  onValueChange?: (value: string) => void
  /** Invalid paint and `aria-invalid`. Inside a `Field`, set `invalid` on the Field. */
  invalid?: boolean
}

/**
 * A multi-line text field.
 *
 * It works inside a Base UI `Field`, which wires the label, description and error.
 * ⌘/Ctrl+Enter submits the nearest form.
 */
function Textarea({
  className,
  variant,
  size,
  invalid = false,
  rows = 3,
  autoComplete = 'off',
  spellCheck = false,
  id,
  name,
  disabled,
  value,
  defaultValue,
  onValueChange,
  onKeyDown,
  ref,
  ...props
}: TextareaProps) {
  const innerRef = useRef<HTMLTextAreaElement | null>(null)
  useInvalidShake(innerRef, () => innerRef.current?.getAttribute('aria-invalid') === 'true')

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    onKeyDown?.(event)
    if (event.defaultPrevented) return
    if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
      event.preventDefault()
      event.currentTarget.form?.requestSubmit()
    }
  }

  return (
    <Field.Control
      id={id}
      name={name}
      disabled={disabled}
      value={value}
      defaultValue={defaultValue}
      onValueChange={onValueChange ? (next) => onValueChange(next) : undefined}
      render={
        <textarea
          ref={(node) => {
            innerRef.current = node
            if (typeof ref === 'function') ref(node)
            else if (ref) ref.current = node
          }}
          data-slot="textarea"
          data-variant={variant ?? 'default'}
          data-size={size ?? 'lg'}
          rows={rows}
          autoComplete={autoComplete}
          spellCheck={spellCheck}
          {...(invalid ? { 'aria-invalid': true } : {})}
          className={cn(textareaVariants({ variant, size }), className)}
          onKeyDown={handleKeyDown}
          {...props}
        />
      }
    />
  )
}

export { Textarea, textareaVariants, type TextareaProps }
