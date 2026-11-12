import { Radio as RadioPrimitive } from '@base-ui/react/radio'
import { RadioGroup as RadioGroupPrimitive } from '@base-ui/react/radio-group'
import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

/*
 * Mayar v2 Radio. Wonder "Mayar Forms Inputs Guide" › Radio.
 * 16px round. Unchecked: surface + 1px ring. Checked: primary + inset highlight + a 6px white dot.
 * Motion: a quiet colour and opacity fade (--motion-quick). No stroke draw: a radio has a dot.
 * For an exclusive choice with a title and a description, use ChoiceCard instead.
 */
const radioClassName = cn(
  'relative inline-flex size-4 shrink-0 cursor-pointer items-center justify-center rounded-pill outline-none',
  'bg-surface shadow-[0_0_0_1px_var(--color-shadow-ring),0_1px_1px_-1px_var(--color-shadow-drop)]',
  'transition-[background-color,box-shadow] duration-(--motion-quick) ease-smooth-out',
  'focus-ring:outline-focus',
  'data-checked:bg-primary data-checked:shadow-none data-checked:inset-shadow-highlight',
  'hover-fine:data-checked:bg-primary-hover',
  'data-disabled:cursor-not-allowed data-disabled:bg-disabled data-disabled:shadow-ring data-disabled:inset-shadow-none',
)

type RadioGroupProps = Omit<RadioGroupPrimitive.Props, 'className'> & { className?: string }

/**
 * A group of radios for one choice in a form row. Arrow keys move the choice.
 *
 * `<RadioGroup defaultValue="bulanan" aria-label="Periode"><RadioGroupItem value="bulanan">Bulanan</RadioGroupItem>…</RadioGroup>`.
 * It supports `value`/`defaultValue`/`onValueChange`, `name`, `disabled` and `required`.
 */
function RadioGroup({ className, ...props }: RadioGroupProps) {
  return <RadioGroupPrimitive data-slot="radio-group" className={cn('flex flex-col', className)} {...props} />
}

interface RadioGroupItemProps extends Omit<RadioPrimitive.Root.Props, 'className' | 'children'> {
  className?: string
  /** The label. Without it, give the radio an `aria-label`. */
  children?: ReactNode
  /** A second line under the label. */
  description?: ReactNode
}

/**
 * One radio of a `RadioGroup`. Props (`value`, `disabled`, `aria-*`, `ref`) go to the Base UI
 * radio; `className` goes on the outer element (the label row when there is a label).
 */
function RadioGroupItem({ className, description, children, ...props }: RadioGroupItemProps) {
  const labelled = children !== undefined || description !== undefined

  const control = (
    <RadioPrimitive.Root
      data-slot="radio"
      className={cn(radioClassName, !labelled && 'hit-44', !labelled && className)}
      {...props}
    >
      <RadioPrimitive.Indicator
        keepMounted
        data-slot="radio-indicator"
        className="size-1.5 rounded-pill bg-on-primary transition-opacity duration-(--motion-quick) ease-smooth-out data-unchecked:opacity-0 data-disabled:bg-disabled-foreground"
      />
    </RadioPrimitive.Root>
  )

  if (!labelled) return control

  return (
    <label
      data-slot="radio-label"
      data-disabled={props.disabled ? '' : undefined}
      className={cn(
        'group/radio relative inline-flex min-h-11 cursor-pointer items-start gap-2 touch-manipulation select-none data-disabled:cursor-not-allowed',
        '[&_[data-slot=radio]]:mt-0.5',
        'hover-fine:[&_[data-slot=radio][data-checked]]:bg-primary-hover',
        className,
      )}
    >
      {control}
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        {children !== undefined ? (
          <span
            data-slot="radio-title"
            className="text-body-sm font-medium text-ink group-has-data-disabled/radio:text-disabled-foreground"
          >
            {children}
          </span>
        ) : null}
        {description !== undefined ? (
          <span
            data-slot="radio-description"
            className="text-caption-lg text-ink-2 group-has-data-disabled/radio:text-disabled-foreground"
          >
            {description}
          </span>
        ) : null}
      </span>
    </label>
  )
}

export { RadioGroup, RadioGroupItem, type RadioGroupItemProps, type RadioGroupProps }
