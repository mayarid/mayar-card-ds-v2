import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

import { Toc, type TocItem } from './toc'

/** Page frame: content column plus an "On this page" rail on wide screens. */
export function DocPage({ children, toc = [] }: { children: ReactNode; toc?: TocItem[] }) {
  return (
    <div className="mx-auto flex w-full max-w-[1200px] gap-12 px-5 pt-8 pb-24 md:px-10 md:pt-12">
      <article className="flex min-w-0 flex-1 flex-col gap-14">{children}</article>
      {toc.length > 0 ? (
        <aside className="sticky top-12 hidden h-fit w-48 shrink-0 xl:block">
          <Toc items={toc} />
        </aside>
      ) : null}
    </div>
  )
}

export function PageHeader({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow?: ReactNode
  title: string
  description: ReactNode
  children?: ReactNode
}) {
  return (
    <header className="flex flex-col gap-3">
      {eyebrow ? <div className="flex flex-wrap items-center gap-2">{eyebrow}</div> : null}
      <h1 className="text-display text-ink">{title}</h1>
      <p className="max-w-[64ch] text-body-lg text-ink-2">{description}</p>
      {children}
    </header>
  )
}

export function Section({
  id,
  title,
  description,
  children,
  className,
}: {
  id: string
  title: string
  description?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className={cn('flex scroll-mt-20 flex-col gap-4', className)}>
      <div className="flex flex-col gap-1">
        <h2 id={`${id}-title`} className="text-title-md text-ink">
          <a href={`#${id}`} className="outline-none hover-fine:underline focus-visible:outline-focus">
            {title}
          </a>
        </h2>
        {description ? <p className="max-w-[70ch] text-body-base text-ink-2">{description}</p> : null}
      </div>
      {children}
    </section>
  )
}

export function SubHeading({ children, description }: { children: ReactNode; description?: ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <h3 className="text-title-sm text-ink">{children}</h3>
      {description ? <p className="text-body-sm text-ink-2">{description}</p> : null}
    </div>
  )
}

export function Pill({ tone = 'neutral', children }: { tone?: 'neutral' | 'brand' | 'warning'; children: ReactNode }) {
  return (
    <span
      className={cn(
        'inline-flex h-6 items-center gap-1 rounded-pill px-2.5 text-caption-lg font-medium',
        tone === 'neutral' && 'bg-component text-ink-2',
        tone === 'brand' && 'bg-primary-light text-primary-deep',
        tone === 'warning' && 'bg-warning-light text-warning-text',
      )}
    >
      {children}
    </span>
  )
}
