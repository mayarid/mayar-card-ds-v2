import { cn } from '@/lib/utils'

/*
 * Mayar v2 Kbd. Wonder "Mayar Forms Inputs Guide" › Kbd row (⌘K, Esc, Enter, /) and the in-input Kbd
 * (default and disabled). 20px tall, min-width 20px, 6px side padding, radius sm, component fill,
 * ink-2, caption-sm (11/16 medium). Disabled uses disabled-foreground.
 */

interface KbdProps extends React.ComponentProps<'kbd'> {
  /** Dims the key, for a hint inside a disabled control. */
  disabled?: boolean
}

/**
 * A keyboard key hint, such as ⌘K or Esc.
 *
 * Put the key text in `children`. Put one `<Kbd>` for each key of a chord: `<Kbd>⌘</Kbd><Kbd>K</Kbd>`,
 * or one `<Kbd>⌘K</Kbd>` for the short form that the Mayar specimens use.
 */
function Kbd({ className, disabled = false, ...props }: KbdProps) {
  return (
    <kbd
      data-slot="kbd"
      data-disabled={disabled ? '' : undefined}
      className={cn(
        'inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-sm bg-component px-1.5',
        'font-sans text-caption-sm font-medium whitespace-nowrap text-ink-2 select-none',
        'data-disabled:text-disabled-foreground',
        className,
      )}
      {...props}
    />
  )
}

export { Kbd, type KbdProps }
