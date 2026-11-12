import { Field as BaseField } from '@base-ui/react/field'
import { Fieldset } from '@base-ui/react/fieldset'
import { AlertCircleIcon } from '@hugeicons/core-free-icons'

import { Icon } from '@/components/ui/icon'
import { cn } from '@/lib/utils'

/*
 * Mayar v2 Field. Wonder "Mayar Forms Inputs Guide" › Field (label, optional, description, error, amount,
 * disabled) and the inline pair.
 * Column with 6px gaps. Label 13/20 medium ink; required "*" danger-text; "(opsional)" 12/16 muted.
 * Description 12/16 ink-2. Error 12/16 danger-text with a 14px alert icon; it replaces the description.
 * Pair: two fields in a two-column grid with a 12px gap, each with its own label.
 */

type FieldProps = BaseField.Root.Props

/**
 * Wraps one form control with its label, description and error.
 *
 * Compose it: `<Field><FieldLabel>Nama</FieldLabel><Input /><FieldError>…</FieldError></Field>`.
 * Built on Base UI `Field`, so the label, `aria-describedby`, `invalid` and `disabled` reach the control
 * (Input, Textarea, OtpInput, Select, Checkbox) without ids.
 */
function Field({ className, ...props }: FieldProps) {
  return (
    <BaseField.Root
      data-slot="field"
      className={cn(
        'flex w-full min-w-0 flex-col gap-1.5',
        // The error replaces the description.
        'has-[[data-slot=field-error]]:[&_[data-slot=field-description]]:hidden',
        className,
      )}
      {...props}
    />
  )
}

/** A row for the label and content at its end, such as a counter ("16/16") or a badge. */
function FieldHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="field-header"
      className={cn('flex items-center gap-1 [&>:not([data-slot=field-label])]:ms-auto', className)}
      {...props}
    />
  )
}

interface FieldLabelProps extends BaseField.Label.Props {
  /** Adds a red "*" after the text. Also set `required` on the control. */
  required?: boolean
  /** Adds a muted "(opsional)" after the text. Ignored when `required`. */
  optional?: boolean
  /** Text of the optional marker. */
  optionalLabel?: string
}

/** The label of a `Field`. Clicking it focuses the control. */
function FieldLabel({
  className,
  required = false,
  optional = false,
  optionalLabel = '(opsional)',
  children,
  ...props
}: FieldLabelProps) {
  return (
    <BaseField.Label
      data-slot="field-label"
      className={cn(
        'inline-flex w-fit items-baseline gap-1 font-sans text-body-sm font-medium text-ink',
        'cursor-pointer data-disabled:cursor-not-allowed',
        className,
      )}
      {...props}
    >
      {children}
      {required ? (
        <span data-slot="field-required" aria-hidden className="text-danger-text">
          *
        </span>
      ) : null}
      {optional && !required ? (
        <span data-slot="field-optional" className="text-caption-lg font-normal text-muted">
          {optionalLabel}
        </span>
      ) : null}
    </BaseField.Label>
  )
}

/** Help text under the control. Hidden while a `FieldError` shows. */
function FieldDescription({ className, ...props }: BaseField.Description.Props) {
  return (
    <BaseField.Description
      data-slot="field-description"
      className={cn('m-0 font-sans text-caption-lg text-ink-2', className)}
      {...props}
    />
  )
}

/**
 * The error line of a `Field`, with an alert icon. Announced with `role="alert"`.
 *
 * With children and no `match`, it always shows: render it only when there is an error
 * (`{error && <FieldError>{error}</FieldError>}`). Pass `match="valueMissing"` (or another validity key)
 * to show it from native validation, or no children to show the browser message.
 */
function FieldError({ className, children, match, ...props }: BaseField.Error.Props) {
  return (
    <BaseField.Error
      data-slot="field-error"
      role="alert"
      match={match ?? (children !== undefined ? true : undefined)}
      className={cn('m-0 flex items-start gap-1.5 font-sans text-caption-lg text-danger-text', className)}
      {...props}
    >
      <Icon icon={AlertCircleIcon} size={14} className="mt-px" />
      <span>{children}</span>
    </BaseField.Error>
  )
}

/**
 * Two fields side by side that answer one question, such as "Masa berlaku" (month and year).
 *
 * Put a `FieldPairLegend` first (add `className="sr-only"` to hide it), then two `Field`s.
 * Anything else (a shared description) spans both columns.
 */
function FieldPair({ className, ...props }: Fieldset.Root.Props) {
  return (
    <Fieldset.Root
      data-slot="field-pair"
      className={cn(
        'm-0 grid w-full min-w-0 grid-cols-2 gap-x-3 gap-y-1.5 border-0 p-0',
        '[&>:not([data-slot=field])]:col-span-2',
        className,
      )}
      {...props}
    />
  )
}

/** The name of a `FieldPair`, read when focus enters the group. */
function FieldPairLegend({ className, ...props }: Fieldset.Legend.Props) {
  return (
    <Fieldset.Legend
      data-slot="field-pair-legend"
      className={cn('font-sans text-body-sm font-medium text-ink', className)}
      {...props}
    />
  )
}

export { Field, FieldDescription, FieldError, FieldHeader, FieldLabel, FieldPair, FieldPairLegend, type FieldProps }
