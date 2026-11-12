import { Children, createContext, isValidElement, use } from 'react'

import { cn } from '@/lib/utils'

/*
 * Mayar v2 Steps. Code-only: no specimen on the Wonder Design System page.
 * Source: the shipped app (foundations/Steps.svelte, the KYC header "Data diri · Dokumen · Paket").
 * One 4px bar per step, 6px apart, a 12/16 medium label 8px under it.
 * Bars: done and current primary, later component. Labels: current ink, done ink-2, later muted.
 */

type StepState = 'done' | 'current' | 'todo'

const StepContext = createContext<StepState>('todo')

interface StepsProps extends React.ComponentProps<'ol'> {
  /** The current step, 1-based. Steps before it are done. */
  current: number
}

/**
 * The bar progress of a multi-step flow.
 *
 * Put one `<Step>` per step in `children`: `<Steps current={2}><Step>Data diri</Step>…</Steps>`.
 * It is not interactive. The current step gets `aria-current="step"`.
 */
function Steps({ current, className, children, 'aria-label': ariaLabel = 'Langkah', ...props }: StepsProps) {
  const items = Children.toArray(children).filter(isValidElement)
  return (
    <ol
      data-slot="steps"
      aria-label={ariaLabel}
      {...props}
      className={cn('m-0 grid list-none auto-cols-fr grid-flow-col gap-x-1.5 p-0', className)}
    >
      {items.map((child, i) => {
        const step = i + 1
        const state: StepState = step < current ? 'done' : step === current ? 'current' : 'todo'
        return (
          <StepContext key={child.key ?? i} value={state}>
            {child}
          </StepContext>
        )
      })}
    </ol>
  )
}

/** One step: its bar and its label. Its state comes from the position in `<Steps>`. */
function Step({ className, children, ...props }: React.ComponentProps<'li'>) {
  const state = use(StepContext)
  return (
    <li
      data-slot="step"
      data-state={state}
      aria-current={state === 'current' ? 'step' : undefined}
      {...props}
      className={cn('group/step flex min-w-0 flex-col gap-2', className)}
    >
      <span
        aria-hidden
        className={cn(
          'block h-1 rounded-pill bg-component',
          'transition-colors duration-(--motion-quick) ease-smooth-out',
          'group-data-[state=current]/step:bg-primary group-data-[state=done]/step:bg-primary',
        )}
      />
      <span
        className={cn(
          'truncate text-caption-lg font-medium text-muted',
          'transition-colors duration-(--motion-quick) ease-smooth-out',
          'group-data-[state=current]/step:text-ink group-data-[state=done]/step:text-ink-2',
        )}
      >
        {children}
      </span>
    </li>
  )
}

export { Step, Steps, type StepsProps }
