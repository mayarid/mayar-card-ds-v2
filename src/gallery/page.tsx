import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

import { Toc, type TocItem } from './toc'

/**
 * Page frame: one column plus an "On this page" rail on wide screens. The column is 800px for reading;
 * `wide` lets component pages take up to 880px, so state matrices scroll less.
 */
const NO_TOC: TocItem[] = []

export function DocPage({ children, toc = NO_TOC, wide = false }: { children: ReactNode; toc?: TocItem[]; wide?: boolean }) {
  return (
    <div className="mx-auto flex w-full max-w-[1184px] justify-center gap-14 px-5 pt-10 pb-24 md:px-10 md:pt-14">
      <article className={cn('flex w-full min-w-0 flex-col gap-12 md:gap-16', wide ? 'max-w-[880px]' : 'max-w-[800px]')}>{children}</article>
      {toc.length > 0 ? (
        <aside className="sticky top-28 hidden h-fit w-44 shrink-0 xl:block">
          <Toc items={toc} />
        </aside>
      ) : null}
    </div>
  )
}

/** The page title and one short lead. Quiet on purpose: the specimen below is the content. */
export function PageHeader({ title, description, children }: { title: string; description: ReactNode; children?: ReactNode }) {
  return (
    <header className="flex flex-col gap-2">
      <h1 className="text-title-lg text-balance text-ink">{title}</h1>
      <p className="max-w-[62ch] text-body-lg text-pretty text-ink-2">{description}</p>
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
      <div className="flex flex-col gap-1.5">
        <h2 id={`${id}-title`} className="text-title-md text-balance text-ink">
          <a href={`#${id}`} className="outline-none hover-fine:underline focus-visible:outline-focus">
            {title}
          </a>
        </h2>
        {description ? <p className="max-w-[65ch] text-body-base text-pretty text-ink-2">{description}</p> : null}
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
