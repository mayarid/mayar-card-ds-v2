import { Copy01Icon, Tick02Icon } from '@hugeicons/core-free-icons'
import type { CSSProperties, ReactNode } from 'react'

import { Icon } from '@/components/ui/icon'
import { useCopy } from '@/gallery/use-copy'
import { cn } from '@/lib/utils'

/*
 * Shared building blocks for the foundation pages. This folder is not matched by the
 * `./foundations/*.tsx` glob, so nothing here is read as a page.
 */

/** A mono chip that shows a value and copies it on click. */
export function CopyChip({ value, className }: { value: string; className?: string }) {
  const { copied, copy } = useCopy()
  return (
    <button
      type="button"
      onClick={() => void copy(value)}
      className={cn(
        'group/chip inline-flex h-6 max-w-full items-center gap-1 rounded-md px-1.5 text-left font-mono text-caption-lg text-ink-2 outline-none',
        'transition-colors duration-(--motion-quick) hover-fine:bg-state-hover hover-fine:text-ink pressed:bg-state-pressed focus-ring:outline-focus',
        copied && 'text-success-text',
        className,
      )}
    >
      <span className="sr-only">Copy </span>
      <span className="truncate">{value}</span>
      <Icon
        icon={copied ? Tick02Icon : Copy01Icon}
        size={12}
        className={cn('opacity-0 transition-opacity duration-(--motion-quick) group-hover/chip:opacity-100 group-focus-visible/chip:opacity-100', copied && 'opacity-100')}
      />
      <span className="sr-only" aria-live="polite">
        {copied ? ', copied' : ''}
      </span>
    </button>
  )
}

/** Two copy actions for one token: the Tailwind class and the CSS variable. */
export function TokenCopy({ utility, cssVar }: { utility?: string; cssVar: string }) {
  return (
    <div className="flex flex-col items-start gap-0.5">
      {utility ? <CopyChip value={utility} className="text-ink" /> : null}
      <CopyChip value={`var(${cssVar})`} />
    </div>
  )
}

/** A colour chip. Translucent colours sit on a checkerboard so their alpha shows. */
export function Swatch({ color, size = 'md', className }: { color: string; size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const checker: CSSProperties = {
    backgroundImage:
      'linear-gradient(45deg, var(--color-sunken) 25%, transparent 25%), linear-gradient(-45deg, var(--color-sunken) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, var(--color-sunken) 75%), linear-gradient(-45deg, transparent 75%, var(--color-sunken) 75%)',
    backgroundSize: '8px 8px',
    backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0',
  }
  return (
    <span
      aria-hidden
      className={cn(
        'relative inline-block shrink-0 overflow-hidden bg-surface shadow-ring',
        size === 'sm' && 'size-6 rounded-md',
        size === 'md' && 'size-10 rounded-lg',
        size === 'lg' && 'h-16 w-full rounded-xl',
        className,
      )}
      style={checker}
    >
      <span className="absolute inset-0" style={{ background: color }} />
    </span>
  )
}

/** A small label next to a token name. */
export function Tag({ tone = 'neutral', children }: { tone?: 'neutral' | 'warning' | 'brand' | 'success' | 'danger'; children: ReactNode }) {
  return (
    <span
      className={cn(
        'inline-flex h-5 shrink-0 items-center rounded-sm px-1.5 text-caption-sm whitespace-nowrap',
        tone === 'neutral' && 'bg-component text-ink-2',
        tone === 'warning' && 'bg-warning-light text-warning-text',
        tone === 'brand' && 'bg-primary-light text-primary-deep',
        tone === 'success' && 'bg-success-light text-success-text',
        tone === 'danger' && 'bg-danger-light text-danger-text',
      )}
    >
      {children}
    </span>
  )
}

/** The "code-only" tag for tokens that are not in Wonder. */
export function CodeOnly() {
  return <Tag tone="warning">code-only</Tag>
}

/**
 * A table on a surface card. Pass the column labels; rows go in `children`.
 * A label that starts with `~` is read by screen readers but not shown (e.g. `~Swatch`).
 */
export function TokenTable({ label, columns, children, className }: { label: string; columns: string[]; children: ReactNode; className?: string }) {
  return (
    <div className={cn('overflow-x-auto rounded-2xl bg-surface shadow-ring', className)}>
      <table className="w-full min-w-[640px] border-collapse text-left">
        <caption className="sr-only">{label}</caption>
        <thead>
          <tr className="border-b border-border-subtle">
            {columns.map((col) => (
              <th key={col} scope="col" className="h-9 px-4 text-caption-lg font-medium whitespace-nowrap text-muted">
                {col.startsWith('~') ? <span className="sr-only">{col.slice(1)}</span> : col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="[&>tr]:border-b [&>tr]:border-border-subtle [&>tr:last-child]:border-0 [&_td]:px-4 [&_td]:py-3 [&_td]:align-middle">
          {children}
        </tbody>
      </table>
    </div>
  )
}

/** A mono value cell: hex, px, ms. */
export function Mono({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cn('font-mono text-caption-lg text-ink-2 tabular-nums', className)}>{children}</span>
}

/** "Do" and "Don't" rules side by side. */
export function Rules({ items }: { items: { do: string[]; dont?: string[] } }) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      <div className="flex flex-col gap-2 rounded-2xl bg-surface p-4 shadow-ring">
        <p className="text-overline text-success-text uppercase">Do</p>
        <ul className="flex list-disc flex-col gap-1.5 pl-4 text-body-sm text-ink-2 marker:text-success">
          {items.do.map((rule) => (
            <li key={rule}>{rule}</li>
          ))}
        </ul>
      </div>
      {items.dont?.length ? (
        <div className="flex flex-col gap-2 rounded-2xl bg-surface p-4 shadow-ring">
          <p className="text-overline text-danger-text uppercase">Don't</p>
          <ul className="flex list-disc flex-col gap-1.5 pl-4 text-body-sm text-ink-2 marker:text-danger">
            {items.dont.map((rule) => (
              <li key={rule}>{rule}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  )
}

/** A quiet bordered note under a section. */
export function Note({ children }: { children: ReactNode }) {
  return <p className="max-w-[70ch] rounded-xl bg-well px-4 py-3 text-body-sm text-ink-2">{children}</p>
}
