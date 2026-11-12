import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

/*
 * Mayar v2 Skeleton. Code-only: no specimen on the Wonder Design System page.
 * Source: the shipped app (foundations/Skeleton.svelte). The app bones are static; `shimmer` is an
 * opt-in addition of this port and stops under reduced motion.
 */
const skeletonVariants = cva('block max-w-full shrink-0', {
  variants: {
    radius: {
      sm: 'rounded-sm',
      md: 'rounded-md',
      lg: 'rounded-lg',
      xl: 'rounded-xl',
      '2xl': 'rounded-2xl',
      full: 'rounded-pill',
    },
    fill: {
      well: 'bg-well',
      component: 'bg-component',
    },
    shimmer: {
      true: 'bg-size-[200%_100%] motion-safe:animate-shimmer motion-reduce:bg-none',
      false: '',
    },
  },
  compoundVariants: [
    { shimmer: true, fill: 'well', className: 'bg-linear-to-r from-well via-surface to-well' },
    { shimmer: true, fill: 'component', className: 'bg-linear-to-r from-component via-component-hover to-component' },
  ],
  defaultVariants: { radius: 'sm', fill: 'well', shimmer: false },
})

type SkeletonLength = number | string

interface SkeletonProps
  extends Omit<React.ComponentProps<'span'>, 'children'>, VariantProps<typeof skeletonVariants> {
  /** A number is px; a string is any CSS length (`"60%"`). */
  width?: SkeletonLength
  /** A number is px: 10 / 12 / 14 for text lines, 20–24 for chips, 36 for fields. */
  height?: SkeletonLength
}

const length = (value: SkeletonLength) => (typeof value === 'number' ? `${value}px` : value)

/**
 * One placeholder bone for content that is still loading.
 *
 * It is always `aria-hidden`: put `role="status"`, `aria-busy` and a screen-reader label on the
 * loading container, not on each bone. For an avatar bone use
 * `<Skeleton width={36} height={36} radius="full" />`.
 */
function Skeleton({
  className,
  width = '100%',
  height = 12,
  radius,
  fill,
  shimmer,
  style,
  ...props
}: SkeletonProps) {
  return (
    <span
      data-slot="skeleton"
      data-radius={radius ?? 'sm'}
      data-fill={fill ?? 'well'}
      {...props}
      aria-hidden
      className={cn(skeletonVariants({ radius, fill, shimmer }), className)}
      style={{ width: length(width), height: length(height), ...style }}
    />
  )
}

export { Skeleton, skeletonVariants, type SkeletonProps }
