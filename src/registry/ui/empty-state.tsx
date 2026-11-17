import { mergeProps } from '@base-ui/react/merge-props'
import { useRender } from '@base-ui/react/use-render'
import { cva, type VariantProps } from 'class-variance-authority'
import { createContext, use } from 'react'

import type { IconDiscShape, IconDiscSize, IconDiscTone } from '@/components/ui/icon-disc'
import { cn } from '@/lib/utils'

/*
 * Mayar v2 EmptyState. Code-only: no specimen on the Wonder Design System page.
 * Source: the shipped app (foundations/EmptyState.svelte).
 * md: 16px gap, 32×24 padding (page panels). sm: 12px gap, 24 padding (modules and console cards).
 * Icon (audit): a bare 18px glyph in the tone colour, no disc (the app: a 48 / 40px disc).
 * Title (audit): body-base regular ink (the app: semibold); description body-sm ink-2.
 */
const emptyStateVariants = cva('flex flex-col items-center justify-center text-center', {
  variants: {
    size: {
      sm: 'gap-3 p-6',
      md: 'gap-4 px-6 py-8',
    },
  },
  defaultVariants: { size: 'md' },
})

type EmptyStateSize = NonNullable<VariantProps<typeof emptyStateVariants>['size']>

const EmptyStateContext = createContext<EmptyStateSize>('md')

interface EmptyStateProps extends React.ComponentProps<'div'>, VariantProps<typeof emptyStateVariants> {}

/**
 * A centred empty, error or no-match state: an icon, a title, one line of text and actions.
 *
 * It has no card of its own: put it in the panel it replaces. Pass `role="alert"` for an error.
 */
function EmptyState({ className, size = 'md', ...props }: EmptyStateProps) {
  const resolved = size ?? 'md'
  return (
    <EmptyStateContext value={resolved}>
      <div
        data-slot="empty-state"
        data-size={resolved}
        {...props}
        className={cn(emptyStateVariants({ size: resolved }), className)}
      />
    </EmptyStateContext>
  )
}

const emptyStateIconVariants = cva('inline-flex shrink-0 [&_svg]:size-[18px]', {
  variants: {
    tone: {
      neutral: 'text-ink-2',
      well: 'text-ink-2',
      surface: 'text-ink-2',
      primary: 'text-primary',
      tint: 'text-primary',
      ring: 'text-primary',
      success: 'text-success-text',
      warning: 'text-warning-text',
      danger: 'text-danger-text',
    },
  },
  defaultVariants: { tone: 'neutral' },
})

interface EmptyStateIconProps extends React.ComponentProps<'span'> {
  /** Glyph colour, named as the IconDisc tones. */
  tone?: IconDiscTone
  /** Kept for IconDisc compatibility. Ignored: the icon has no disc (audit). */
  size?: IconDiscSize
  /** Kept for IconDisc compatibility. Ignored: the icon has no disc (audit). */
  shape?: IconDiscShape
}

/**
 * The icon: a bare 18px glyph in the tone colour (audit: no disc). The glyph is the child.
 * Decorative (`aria-hidden`): the title carries the meaning.
 */
function EmptyStateIcon({ className, tone = 'neutral', size: _size, shape: _shape, ...props }: EmptyStateIconProps) {
  const stateSize = use(EmptyStateContext)
  return (
    <span
      aria-hidden
      data-slot="empty-state-icon"
      data-tone={tone}
      data-size={stateSize}
      {...props}
      className={cn(emptyStateIconVariants({ tone }), className)}
    />
  )
}

/** Groups the title and the description (4px apart, at most 440px wide). */
function EmptyStateText({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="empty-state-text"
      {...props}
      className={cn('flex max-w-110 flex-col items-center gap-1', className)}
    />
  )
}

/** The title. A `<p>` by default; use `render={<h2 />}` when it heads the region. */
function EmptyStateTitle({ className, render, ...props }: useRender.ComponentProps<'p'>) {
  const defaultProps: useRender.ElementProps<'p'> = {
    'data-slot': 'empty-state-title',
    className: cn('m-0 text-body-base text-balance text-ink', className),
  } as useRender.ElementProps<'p'>
  return useRender({ defaultTagName: 'p', render, props: mergeProps<'p'>(defaultProps, props) })
}

/** One line that says why it is empty or what to do next. */
function EmptyStateDescription({ className, ...props }: React.ComponentProps<'p'>) {
  return (
    <p
      data-slot="empty-state-description"
      {...props}
      className={cn('m-0 text-body-sm text-pretty text-ink-2', className)}
    />
  )
}

/** The buttons or links under the text. */
function EmptyStateActions({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="empty-state-actions"
      {...props}
      className={cn('mt-1 flex flex-wrap items-center justify-center gap-2', className)}
    />
  )
}

export {
  EmptyState,
  EmptyStateActions,
  EmptyStateDescription,
  EmptyStateIcon,
  EmptyStateText,
  EmptyStateTitle,
  emptyStateVariants,
  type EmptyStateProps,
}
