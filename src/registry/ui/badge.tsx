import { mergeProps } from '@base-ui/react/merge-props'
import { useRender } from '@base-ui/react/use-render'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

/*
 * Mayar v2 Badge. Wonder "Mayar Card Design System" › Badge section.
 * Sizes: SM 16 / MD 20 / LG 24. Shapes: rounded (radius sm, LG radius md) and pill.
 * An icon in children (12px) takes 2px off the start padding of a rounded badge.
 * `well` is code-only (the console "Belum" chip).
 */
const badgeVariants = cva(
  [
    'inline-flex shrink-0 items-center justify-self-start gap-1 border-0 font-sans font-medium whitespace-nowrap tabular-nums',
    '[&_svg]:pointer-events-none [&_svg]:size-3 [&_svg]:shrink-0',
  ],
  {
    variants: {
      variant: {
        default: 'bg-component text-ink-2',
        brand: 'bg-primary-light text-primary',
        danger: 'bg-danger-light text-danger-text',
        success: 'bg-success-light text-success-text',
        warning: 'bg-warning-light text-warning-text',
        inverted: 'bg-inverted text-on-brand',
        outline: 'bg-transparent text-ink-2 shadow-[inset_0_0_0_1px_var(--color-border-subtle)]',
        transparent: 'bg-transparent text-ink-2',
        well: 'bg-well text-ink-2',
      },
      size: {
        sm: 'h-4 rounded-sm text-caption-sm',
        md: 'h-5 rounded-sm text-caption-lg',
        lg: 'h-6 rounded-md text-body-sm',
      },
      shape: {
        rounded: '',
        pill: 'rounded-pill',
      },
    },
    compoundVariants: [
      { shape: 'rounded', size: 'sm', className: 'px-1.5 has-[>svg]:ps-1' },
      { shape: 'rounded', size: 'md', className: 'px-1.5 has-[>svg]:ps-1' },
      { shape: 'rounded', size: 'lg', className: 'px-2 has-[>svg]:ps-1.5' },
      { shape: 'pill', size: 'sm', className: 'px-2 has-[>svg]:ps-1.5' },
      { shape: 'pill', size: 'md', className: 'px-2 has-[>svg]:ps-1.5' },
      { shape: 'pill', size: 'lg', className: 'px-2.5 has-[>svg]:ps-2' },
    ],
    defaultVariants: { variant: 'default', size: 'md', shape: 'rounded' },
  },
)

type BadgeVariantProps = VariantProps<typeof badgeVariants>

interface BadgeProps extends useRender.ComponentProps<'span'>, BadgeVariantProps {}

/**
 * A static status or category label.
 *
 * Not a button, link or nav count. Put an icon first in `children`:
 * `<Badge variant="success"><Icon icon={Tick02Icon} size={12} />Aktif</Badge>`.
 */
function Badge({ className, variant, size, shape, render, ...props }: BadgeProps) {
  const defaultProps: useRender.ElementProps<'span'> = {
    'data-slot': 'badge',
    'data-variant': variant ?? 'default',
    'data-size': size ?? 'md',
    className: cn(badgeVariants({ variant, size, shape }), className),
  } as useRender.ElementProps<'span'>

  return useRender({
    defaultTagName: 'span',
    render,
    props: mergeProps<'span'>(defaultProps, props),
  })
}

export { Badge, badgeVariants, type BadgeProps }
