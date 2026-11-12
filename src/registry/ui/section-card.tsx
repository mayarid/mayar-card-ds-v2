import { mergeProps } from '@base-ui/react/merge-props'
import { useRender } from '@base-ui/react/use-render'
import { createContext, useContext, useId, useMemo, type ComponentProps } from 'react'

import { Surface } from '@/components/ui/surface'
import { cn } from '@/lib/utils'

/*
 * Mayar v2 SectionCard (code-only, from the admin user detail cards).
 * A default Surface (white, radius 2xl, control shadow) with a 56px head (20px side padding,
 * border-subtle line), a body (20px padding, 12px gap; `flush` removes both) and a 48px foot.
 */
const SectionCardContext = createContext<{ titleId: string } | null>(null)

function useSectionCard() {
  const context = useContext(SectionCardContext)
  if (!context) throw new Error('SectionCard parts must be inside <SectionCard>.')
  return context
}

type SectionCardProps = Omit<ComponentProps<typeof Surface>, 'variant' | 'padding' | 'divided' | 'nested'>

/**
 * A titled card: a head with a title and an optional aside, a body and an optional foot.
 *
 * It is a named region (`role="region"`, labelled by `SectionCardTitle`).
 */
function SectionCard({ className, elevated = true, children, ...props }: SectionCardProps) {
  const titleId = useId()
  const context = useMemo(() => ({ titleId }), [titleId])
  return (
    <SectionCardContext.Provider value={context}>
      <Surface
        role="region"
        aria-labelledby={titleId}
        data-slot="section-card"
        padding={0}
        elevated={elevated}
        className={cn('gap-0 overflow-clip', className)}
        {...props}
      >
        {children}
      </Surface>
    </SectionCardContext.Provider>
  )
}

function SectionCardHeader({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="section-card-header"
      className={cn(
        'flex h-14 shrink-0 items-center justify-between gap-4 border-b border-border-subtle px-5',
        className,
      )}
      {...props}
    />
  )
}

/** The card title. An `<h2>` by default; use `render={<h3 />}` for another level. */
function SectionCardTitle({ className, render, ...props }: useRender.ComponentProps<'h2'>) {
  const { titleId } = useSectionCard()
  const defaultProps: useRender.ElementProps<'h2'> = {
    id: titleId,
    'data-slot': 'section-card-title',
    className: cn('m-0 min-w-0 text-body-base font-semibold text-ink', className),
  } as useRender.ElementProps<'h2'>
  return useRender({ defaultTagName: 'h2', render, props: mergeProps<'h2'>(defaultProps, props) })
}

function SectionCardAside({ className, ...props }: ComponentProps<'div'>) {
  return <div data-slot="section-card-aside" className={cn('flex shrink-0 items-center gap-2', className)} {...props} />
}

interface SectionCardBodyProps extends ComponentProps<'div'> {
  /** No padding and no gap, for a table or list that owns its rows. */
  flush?: boolean
}

function SectionCardBody({ className, flush = false, ...props }: SectionCardBodyProps) {
  return (
    <div
      data-slot="section-card-body"
      data-flush={flush ? '' : undefined}
      className={cn('flex flex-1 flex-col', flush ? 'gap-0 p-0' : 'gap-3 p-5', className)}
      {...props}
    />
  )
}

function SectionCardFooter({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="section-card-footer"
      className={cn('flex min-h-12 items-center px-5', className)}
      {...props}
    />
  )
}

export {
  SectionCard,
  SectionCardHeader,
  SectionCardTitle,
  SectionCardAside,
  SectionCardBody,
  SectionCardFooter,
  type SectionCardProps,
  type SectionCardBodyProps,
}
