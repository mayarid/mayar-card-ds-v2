import { Switch as SwitchPrimitive } from '@base-ui/react/switch'
import { cva, type VariantProps } from 'class-variance-authority'
import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

/*
 * Mayar v2 Switch. Wonder "Mayar Forms Inputs Guide" › Switch Block.
 * SM 28×16 (12px thumb, 12px travel) / MD 36×20 (16px thumb, 16px travel). Off: switch-off; on: primary.
 * The thumb travels with --motion-switch on ease-toggle (a bounded overshoot). On hover the thumb
 * stretches away from its pinned edge (SM 12→14, MD 16→18) with scaleX, so the box never resizes.
 * A CSS transition never runs on first paint, so an "on" switch mounts in place.
 */
const switchVariants = cva(
  [
    'relative inline-flex shrink-0 cursor-pointer items-center rounded-pill bg-switch-off outline-none touch-manipulation',
    'focus-ring:outline-focus',
    'data-checked:bg-primary',
    'data-disabled:cursor-not-allowed data-disabled:bg-disabled',
  ],
  {
    variants: {
      size: {
        sm: 'h-4 w-7 hover-fine:*:data-[slot=switch-thumb]:scale-x-[calc(14/12)]',
        md: 'h-5 w-9 hover-fine:*:data-[slot=switch-thumb]:scale-x-[calc(18/16)]',
      },
    },
    defaultVariants: { size: 'md' },
  },
)

const thumbVariants = cva(
  [
    'pointer-events-none absolute top-0.5 left-0.5 rounded-pill bg-surface shadow-[0_1px_2px_var(--color-shadow-drop)]',
    'origin-left data-checked:origin-right',
    '[transition:translate_var(--motion-switch)_var(--ease-toggle),scale_var(--motion-quick)_var(--ease-smooth-out)]',
  ],
  {
    variants: {
      size: {
        sm: 'size-3 data-checked:translate-x-3',
        md: 'size-4 data-checked:translate-x-4',
      },
    },
    defaultVariants: { size: 'md' },
  },
)

/** A hover on the label row stretches the thumb too. */
const rowHover = {
  sm: 'hover-fine:[&_[data-slot=switch-thumb]]:scale-x-[calc(14/12)]',
  md: 'hover-fine:[&_[data-slot=switch-thumb]]:scale-x-[calc(18/16)]',
} as const

interface SwitchProps
  extends Omit<SwitchPrimitive.Root.Props, 'className' | 'children'>,
    VariantProps<typeof switchVariants> {
  className?: string
  /** The label. Without it, give the switch an `aria-label` (or wrap it in a `Field.Label`). */
  children?: ReactNode
  /** A second line under the label. */
  description?: ReactNode
}

/**
 * An on/off switch for a setting that applies at once.
 *
 * Put the label in `children`: `<Switch defaultChecked>Notifikasi transaksi</Switch>`.
 * Props (`checked`, `onCheckedChange`, `name`, `aria-*`, `ref`) go to the Base UI switch;
 * `className` goes on the outer element (the label row when there is a label).
 */
function Switch({ className, size, description, children, ...props }: SwitchProps) {
  const labelled = children !== undefined || description !== undefined
  const resolvedSize = size ?? 'md'

  const control = (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size={resolvedSize}
      className={cn(switchVariants({ size }), !labelled && 'hit-44', !labelled && className)}
      {...props}
    >
      <SwitchPrimitive.Thumb data-slot="switch-thumb" className={thumbVariants({ size })} />
    </SwitchPrimitive.Root>
  )

  if (!labelled) return control

  return (
    <label
      data-slot="switch-label"
      data-disabled={props.disabled ? '' : undefined}
      className={cn(
        'group/switch relative inline-flex min-h-11 cursor-pointer items-start gap-2 touch-manipulation select-none data-disabled:cursor-not-allowed',
        '[&_[data-slot=switch]]:mt-0.5',
        rowHover[resolvedSize],
        className,
      )}
    >
      {control}
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        {children !== undefined ? (
          <span
            data-slot="switch-title"
            className="text-body-sm font-medium text-ink group-has-data-disabled/switch:text-disabled-foreground"
          >
            {children}
          </span>
        ) : null}
        {description !== undefined ? (
          <span
            data-slot="switch-description"
            className="text-caption-lg text-ink-2 group-has-data-disabled/switch:text-disabled-foreground"
          >
            {description}
          </span>
        ) : null}
      </span>
    </label>
  )
}

export { Switch, switchVariants, type SwitchProps }
