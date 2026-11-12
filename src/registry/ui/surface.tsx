import { mergeProps } from '@base-ui/react/merge-props'
import { useRender } from '@base-ui/react/use-render'
import { cva, type VariantProps } from 'class-variance-authority'
import type { CSSProperties } from 'react'

import { cn } from '@/lib/utils'

/*
 * Mayar v2 Surface. Wonder "Mayar Card Design System" › Card (Surface) section.
 * Kinds: container = white surface (not the `container` colour token), subtle = component,
 * strong = component-hover, card = card, transparent = none.
 * Radius lg 8 / xl 10 / 2xl 12 (default) / 3xl 16. Elevated = control shadow.
 * Divided: a 1px border-subtle line between direct children, 16px in from the start edge.
 * Nested: inner radius = outer radius − outer padding (16 − 4 = 12).
 */
const surfaceVariants = cva(
  'flex min-w-0 flex-col gap-1 border-0 p-(--surface-padding) font-sans text-ink',
  {
    variants: {
      variant: {
        container: 'bg-surface',
        subtle: 'bg-component',
        strong: 'bg-component-hover',
        card: 'bg-card',
        transparent: 'bg-transparent',
      },
      radius: {
        lg: 'rounded-lg',
        xl: 'rounded-xl',
        '2xl': 'rounded-2xl',
        '3xl': 'rounded-3xl',
      },
      elevated: {
        true: 'shadow-control has-[>[data-related-ring=subtle]]:shadow-[0_0_0_1px_var(--color-border-subtle),var(--shadow-control)]',
        false: 'has-[>[data-related-ring=subtle]]:shadow-[0_0_0_1px_var(--color-border-subtle)]',
      },
      divided: {
        true: [
          'gap-0 overflow-clip *:relative',
          "[&>*+*]:before:pointer-events-none [&>*+*]:before:absolute [&>*+*]:before:top-0 [&>*+*]:before:right-0 [&>*+*]:before:left-4 [&>*+*]:before:h-px [&>*+*]:before:bg-border-subtle [&>*+*]:before:content-['']",
        ],
        false: '',
      },
    },
    defaultVariants: { variant: 'container', radius: '2xl', elevated: false, divided: false },
  },
)

type SurfaceRadius = 'lg' | 'xl' | '2xl' | '3xl'

const SURFACE_RADII: Record<SurfaceRadius, number> = { lg: 8, xl: 10, '2xl': 12, '3xl': 16 }

/** A surface that sits inside a related parent surface. */
interface RelatedSurface {
  /** The parent's radius. */
  outerRadius: SurfaceRadius
  /** The parent's padding in px. Above 24 the child keeps its own radius. */
  padding: number
  /** The parent draws a 1px border-subtle ring around the pair. */
  ring?: 'subtle'
}

/** The child radius in px for a related pair: outer radius − padding. */
function resolveSurfaceRadius(radius: SurfaceRadius, nested?: RelatedSurface): number {
  if (!nested || nested.padding > 24) return SURFACE_RADII[radius]
  return Math.max(0, SURFACE_RADII[nested.outerRadius] - Math.max(0, nested.padding))
}

type SurfaceVariantProps = VariantProps<typeof surfaceVariants>

interface SurfaceProps extends useRender.ComponentProps<'div'>, Omit<SurfaceVariantProps, 'radius'> {
  radius?: SurfaceRadius
  /** Padding in px. 16 by default, 0 when `divided` (the rows own their padding). */
  padding?: number
  /** Only for a surface that is visibly related to its parent surface. */
  nested?: RelatedSurface
}

/**
 * A generic layout surface for panels, grouped rows and nested related cards.
 *
 * `variant` sets the fill, `radius` the corner, `elevated` the control shadow, `divided` a hairline
 * between direct children. Not the bank card face.
 */
function Surface({
  className,
  variant,
  radius = '2xl',
  elevated,
  divided,
  padding,
  nested,
  style,
  render,
  ...props
}: SurfaceProps) {
  const resolvedPadding = Math.max(0, padding ?? (divided ? 0 : 16))
  const vars = {
    '--surface-padding': `${resolvedPadding}px`,
    ...(nested ? { borderRadius: `${resolveSurfaceRadius(radius, nested)}px` } : {}),
  } as CSSProperties

  const defaultProps: useRender.ElementProps<'div'> = {
    'data-slot': 'surface',
    'data-variant': variant ?? 'container',
    'data-radius': radius,
    'data-elevated': elevated ? '' : undefined,
    'data-divided': divided ? '' : undefined,
    'data-related-ring': nested?.ring === 'subtle' ? 'subtle' : undefined,
    className: cn(surfaceVariants({ variant, radius, elevated: Boolean(elevated), divided: Boolean(divided) }), className),
    style: typeof style === 'function' ? vars : { ...vars, ...style },
  } as useRender.ElementProps<'div'>

  return useRender({
    defaultTagName: 'div',
    render,
    props: mergeProps<'div'>(defaultProps, props),
  })
}

export { Surface, surfaceVariants, resolveSurfaceRadius, type SurfaceProps, type SurfaceRadius, type RelatedSurface }
