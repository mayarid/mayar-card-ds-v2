import { mergeProps } from '@base-ui/react/merge-props'
import { useRender } from '@base-ui/react/use-render'
import { cva, type VariantProps } from 'class-variance-authority'
import { createContext, use } from 'react'

import { IconDisc, type IconDiscProps } from '@/components/ui/icon-disc'
import { cn } from '@/lib/utils'

/*
 * Mayar v2 EmptyState. Code-only: no specimen on the Wonder Design System page.
 * Source: the shipped app (foundations/EmptyState.svelte).
 * md: 48px disc, 16px gap, 32×24 padding (page panels). sm: 40px disc, 12px gap, 24 padding
 * (modules and console cards). Title body-base semibold ink; description body-sm ink-2.
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
 * A centred empty, error or no-match state: an icon disc, a title, one line of text and actions.
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

/** The icon disc. Its size follows the empty state (sm 40px, md 48px); the glyph is the child. */
function EmptyStateIcon({ size, ...props }: IconDiscProps) {
  const stateSize = use(EmptyStateContext)
  return <IconDisc data-slot="empty-state-icon" size={size ?? (stateSize === 'sm' ? 40 : 48)} {...props} />
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
    className: cn('m-0 text-body-base font-semibold text-balance text-ink', className),
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
