import { useEffect, useState } from 'react'

import { cn } from '@/lib/utils'

export interface TocItem {
  id: string
  label: string
}

/** "On this page" list. Marks the section nearest the top of the viewport. */
export function Toc({ items }: { items: TocItem[] }) {
  const [active, setActive] = useState(items[0]?.id)

  useEffect(() => {
    const els = items.map((i) => document.getElementById(i.id)).filter((el): el is HTMLElement => el !== null)
    if (els.length === 0) return
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]) setActive(visible[0].target.id)
      },
      { rootMargin: '-80px 0px -60% 0px' },
    )
    els.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [items])

  if (items.length === 0) return null
  return (
    <nav aria-label="On this page" className="flex flex-col gap-1">
      <p className="pb-1 text-overline text-muted uppercase">On this page</p>
      {items.map((item) => (
        <a
          key={item.id}
          href={`#${item.id}`}
          aria-current={active === item.id ? 'location' : undefined}
          className={cn(
            'rounded-sm py-1 text-body-sm text-muted outline-none transition-colors duration-(--motion-quick) hover-fine:text-ink focus-visible:outline-focus',
            active === item.id && 'font-medium text-ink',
          )}
        >
          {item.label}
        </a>
      ))}
    </nav>
  )
}
