import { mergeProps } from '@base-ui/react/merge-props'
import { useRender } from '@base-ui/react/use-render'
import { cva } from 'class-variance-authority'

import { cn } from '@/lib/utils'

/*
 * Mayar v2 IconDisc. Code-only: no specimen on the Wonder Design System page.
 * Source: the shipped app (foundations/IconDisc.svelte).
 * Sizes 24 / 28 / 32 / 36 / 40 / 44 / 48 / 56. The glyph inside gets 14 / 16 / 16 / 18 / 20 / 20 / 20 / 24.
 * The square shape uses radius md / md / lg / xl / xl / xl / 2xl / 3xl.
 * 28 is the app's step dot (request-access tracker, KYC track: 16px glyph) and the budget category
 * chip (radius md); the Plan Badge row disc uses it too.
 */
const iconDiscVariants = cva(
  [
    'inline-flex shrink-0 items-center justify-center rounded-pill',
    '[&_svg]:pointer-events-none [&_svg]:shrink-0',
  ],
  {
    variants: {
      size: {
        '24': 'size-6 data-[shape=square]:rounded-md [&_svg]:size-3.5',
        '28': 'size-7 data-[shape=square]:rounded-md [&_svg]:size-4',
        '32': 'size-8 data-[shape=square]:rounded-lg [&_svg]:size-4',
        '36': 'size-9 data-[shape=square]:rounded-xl [&_svg]:size-4.5',
        '40': 'size-10 data-[shape=square]:rounded-xl [&_svg]:size-5',
        '44': 'size-11 data-[shape=square]:rounded-xl [&_svg]:size-5',
        '48': 'size-12 data-[shape=square]:rounded-2xl [&_svg]:size-5',
        '56': 'size-14 data-[shape=square]:rounded-3xl [&_svg]:size-6',
      },
      tone: {
        neutral: 'bg-component text-ink-2',
        well: 'bg-well text-ink-2',
        primary: 'bg-primary-light text-primary',
        tint: 'bg-primary-tint text-primary',
        success: 'bg-success-light text-success-text',
        warning: 'bg-warning-light text-warning-text',
        danger: 'bg-danger-light text-danger-text',
        ring: 'bg-surface text-primary ring-1 ring-primary-light',
        surface: 'bg-surface text-ink-2 shadow-ring',
      },
    },
    defaultVariants: { size: '40', tone: 'neutral' },
  },
)

type IconDiscSize = 24 | 28 | 32 | 36 | 40 | 44 | 48 | 56
type IconDiscTone = 'neutral' | 'well' | 'primary' | 'tint' | 'success' | 'warning' | 'danger' | 'ring' | 'surface'
type IconDiscShape = 'circle' | 'square'

/** The glyph size (px) that fits each disc size. The disc also sizes a child `<svg>` for you. */
const iconDiscIconSize: Record<IconDiscSize, number> = { 24: 14, 28: 16, 32: 16, 36: 18, 40: 20, 44: 20, 48: 20, 56: 24 }

interface IconDiscProps extends useRender.ComponentProps<'span'> {
  /** Diameter in px. */
  size?: IconDiscSize
  /** Fill and glyph colour. */
  tone?: IconDiscTone
  /** A circle, or a rounded square for a module header. */
  shape?: IconDiscShape
}

/**
 * A tinted circle or rounded square that holds one icon.
 *
 * Put the glyph in `children`: `<IconDisc tone="danger"><Icon icon={Alert02Icon} /></IconDisc>`.
 * It is decorative (`aria-hidden`) by default, because the title next to it carries the meaning.
 */
function IconDisc({ className, size = 40, tone = 'neutral', shape = 'circle', render, ...props }: IconDiscProps) {
  const defaultProps: useRender.ElementProps<'span'> = {
    'aria-hidden': true,
    'data-slot': 'icon-disc',
    'data-size': size,
    'data-tone': tone,
    'data-shape': shape,
    className: cn(iconDiscVariants({ size: String(size) as `${IconDiscSize}`, tone }), className),
  } as useRender.ElementProps<'span'>

  return useRender({
    defaultTagName: 'span',
    render,
    props: mergeProps<'span'>(defaultProps, props),
  })
}

export {
  IconDisc,
  iconDiscIconSize,
  iconDiscVariants,
  type IconDiscProps,
  type IconDiscShape,
  type IconDiscSize,
  type IconDiscTone,
}
