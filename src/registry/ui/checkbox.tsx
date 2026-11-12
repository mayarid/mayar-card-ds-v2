import { Checkbox as CheckboxPrimitive } from '@base-ui/react/checkbox'
import { cva, type VariantProps } from 'class-variance-authority'
import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

/*
 * Mayar v2 Checkbox. Wonder "Mayar Forms Inputs Guide" › Checkbox.
 * 16px box, radius sm (4px). Unchecked: surface + 1px ring. Checked / indeterminate: primary +
 * inset highlight. The tick draws with stroke-dashoffset (--motion-check-draw) and erases with
 * --motion-check-box. A CSS transition never runs on first paint, so a checked box mounts drawn.
 * Variant "tile" (code-only, KYC document grid): box + label in a 36px bordered tile.
 */
const checkboxVariants = cva(
  [
    'inline-flex size-4 shrink-0 cursor-pointer items-center justify-center rounded-sm outline-none',
    'bg-surface text-on-primary shadow-[0_0_0_1px_var(--color-shadow-ring),0_1px_1px_-1px_var(--color-shadow-drop)]',
    'transition-[background-color,box-shadow] duration-(--motion-check-box) ease-smooth-out',
    'focus-ring:outline-focus',
    'data-checked:bg-primary data-checked:shadow-none data-checked:inset-shadow-highlight',
    'data-indeterminate:bg-primary data-indeterminate:shadow-none data-indeterminate:inset-shadow-highlight',
    'hover-fine:data-checked:bg-primary-hover hover-fine:data-indeterminate:bg-primary-hover',
    'data-disabled:cursor-not-allowed data-disabled:bg-disabled data-disabled:text-disabled-foreground data-disabled:shadow-ring data-disabled:inset-shadow-none',
  ],
)

const checkboxRowVariants = cva(
  [
    'group/checkbox relative cursor-pointer touch-manipulation select-none',
    'data-disabled:cursor-not-allowed',
    // A hover on the row paints the box as if the pointer were on it.
    'hover-fine:[&_[data-slot=checkbox][data-checked]]:bg-primary-hover hover-fine:[&_[data-slot=checkbox][data-indeterminate]]:bg-primary-hover',
  ],
  {
    variants: {
      variant: {
        default: 'inline-flex min-h-11 items-start gap-2 [&_[data-slot=checkbox]]:mt-0.5',
        tile: [
          'flex min-h-9 min-w-0 items-center gap-2 rounded-lg bg-surface px-3 py-2',
          'inset-ring inset-ring-border-subtle',
          'transition-[background-color,box-shadow] duration-(--motion-quick) ease-smooth-out',
          // 44px hit area around the 36px tile.
          'before:absolute before:inset-x-0 before:-inset-y-1',
          'has-data-checked:bg-primary-tint has-data-checked:inset-ring-[1.5px] has-data-checked:inset-ring-primary',
          'hover-fine:not-has-data-checked:inset-ring-border has-[[data-slot=checkbox][data-force-state~=hover]]:not-has-data-checked:inset-ring-border',
          // The unchecked box stands out from the tile at 3:1: a muted ring.
          '[&_[data-slot=checkbox]:not([data-checked],[data-indeterminate],[data-disabled])]:shadow-[inset_0_0_0_1.5px_var(--color-muted)]',
          // The focus outline goes round the tile (2px offset, as in the app), not the box.
          '[&_[data-slot=checkbox]]:outline-none!',
          'has-[[data-slot=checkbox]:focus-visible]:outline-focus has-[[data-slot=checkbox][data-force-state~=focus]]:outline-focus',
          'has-[[data-slot=checkbox]:focus-visible]:outline-offset-2! has-[[data-slot=checkbox][data-force-state~=focus]]:outline-offset-2!',
        ],
      },
    },
    defaultVariants: { variant: 'default' },
  },
)

interface CheckboxProps
  extends Omit<CheckboxPrimitive.Root.Props, 'className' | 'children'>,
    VariantProps<typeof checkboxRowVariants> {
  className?: string
  /** The label. Without it, give the checkbox an `aria-label` (or wrap it in a `Field.Label`). */
  children?: ReactNode
  /** A second line under the label. */
  description?: ReactNode
  /** Content at the end of the row, e.g. a count in a filter list. Part of the label. */
  trailing?: ReactNode
}

/**
 * A checkbox for an on/off choice in a form or a list, with an optional label and description.
 *
 * Put the label in `children`: `<Checkbox defaultChecked>Kirim struk</Checkbox>`.
 * Props (`checked`, `onCheckedChange`, `indeterminate`, `name`, `aria-*`, `ref`) go to the
 * Base UI checkbox; `className` goes on the outer element (the label row when there is a label).
 */
function Checkbox({ className, variant, description, trailing, children, ...props }: CheckboxProps) {
  const labelled = children !== undefined || description !== undefined || trailing !== undefined
  const tile = variant === 'tile'

  const box = (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(checkboxVariants(), !labelled && 'relative hit-44', !labelled && className)}
      {...props}
    >
      <CheckboxPrimitive.Indicator keepMounted data-slot="checkbox-indicator" className="flex items-center justify-center">
        <svg
          aria-hidden
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-3 in-data-indeterminate:hidden"
        >
          <path
            d="M20 6 9 17l-5-5"
            pathLength={1}
            className="[stroke-dasharray:1] [stroke-dashoffset:1] transition-[stroke-dashoffset] duration-(--motion-check-box) ease-smooth-out in-data-checked:[stroke-dashoffset:0] in-data-checked:duration-(--motion-check-draw)"
          />
        </svg>
        <span className="hidden h-0.5 w-2 rounded-[1px] bg-current in-data-indeterminate:block" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )

  if (!labelled) return box

  return (
    <label
      data-slot="checkbox-label"
      data-variant={variant ?? 'default'}
      data-disabled={props.disabled ? '' : undefined}
      className={cn(checkboxRowVariants({ variant }), className)}
    >
      {box}
      {children !== undefined || description !== undefined ? (
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          {children !== undefined ? (
            <span
              data-slot="checkbox-title"
              className={cn(
                'text-body-sm font-medium text-ink group-has-data-disabled/checkbox:text-disabled-foreground',
                tile && 'line-clamp-2 text-ink-2 group-has-data-checked/checkbox:text-ink',
              )}
            >
              {children}
            </span>
          ) : null}
          {description !== undefined ? (
            <span
              data-slot="checkbox-description"
              className="text-caption-lg text-ink-2 group-has-data-disabled/checkbox:text-disabled-foreground"
            >
              {description}
            </span>
          ) : null}
        </span>
      ) : null}
      {trailing !== undefined ? (
        <span data-slot="checkbox-trailing" className="ml-auto shrink-0 pl-3">
          {trailing}
        </span>
      ) : null}
    </label>
  )
}

export { Checkbox, checkboxVariants, type CheckboxProps }
