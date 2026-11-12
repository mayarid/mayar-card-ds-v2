import { Search01Icon } from '@hugeicons/core-free-icons'
import { Link } from '@tanstack/react-router'
import { useMemo, useState } from 'react'

import { Icon } from '@/components/ui/icon'
import { componentsByGroup, foundationDocs } from '@/docs'
import { cn } from '@/lib/utils'

const linkClass = cn(
  'flex h-8 items-center justify-between gap-2 rounded-lg px-2.5 text-body-sm text-ink-2 outline-none',
  'transition-colors duration-(--motion-quick) hover-fine:bg-state-hover hover-fine:text-ink focus-visible:outline-focus',
  'data-[status=active]:bg-surface data-[status=active]:font-medium data-[status=active]:text-ink data-[status=active]:shadow-control',
)

function NavHeading({ children }: { children: React.ReactNode }) {
  return <p className="px-2.5 pt-5 pb-1.5 text-overline text-muted uppercase">{children}</p>
}

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const [query, setQuery] = useState('')
  const q = query.trim().toLowerCase()

  const groups = useMemo(
    () =>
      componentsByGroup()
        .map((g) => ({ ...g, items: g.items.filter((d) => !q || d.name.toLowerCase().includes(q)) }))
        .filter((g) => g.items.length > 0),
    [q],
  )
  const foundations = foundationDocs.filter((d) => !q || d.name.toLowerCase().includes(q))

  return (
    <nav aria-label="Design system" className="flex flex-col pb-10">
      <div className="relative px-0.5 pt-1">
        <Icon icon={Search01Icon} className="pointer-events-none absolute top-1/2 left-3 mt-0.5 -translate-y-1/2 text-placeholder" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search"
          aria-label="Search components and foundations"
          className="h-8 w-full rounded-lg bg-surface pr-2.5 pl-8 text-body-sm text-ink shadow-control outline-none placeholder:text-placeholder focus-visible:outline-focus"
        />
      </div>

      {!q ? (
        <>
          <NavHeading>Start</NavHeading>
          <Link to="/" className={linkClass} activeOptions={{ exact: true }} onClick={onNavigate}>
            Overview
          </Link>
          <Link to="/installation" className={linkClass} onClick={onNavigate}>
            Installation
          </Link>
        </>
      ) : null}

      {foundations.length > 0 ? <NavHeading>Foundations</NavHeading> : null}
      {foundations.map((doc) => (
        <Link key={doc.slug} to="/foundations/$slug" params={{ slug: doc.slug }} className={linkClass} onClick={onNavigate}>
          {doc.name}
        </Link>
      ))}

      {groups.map((g) => (
        <div key={g.group} className="flex flex-col">
          <NavHeading>{g.group}</NavHeading>
          {g.items.map((doc) => (
            <Link key={doc.slug} to="/components/$slug" params={{ slug: doc.slug }} className={linkClass} onClick={onNavigate}>
              {doc.name}
              {doc.spec === 'code-only' ? (
                <span className="rounded-sm bg-component px-1 text-[10px] leading-4 font-medium text-ink-2">code</span>
              ) : null}
            </Link>
          ))}
        </div>
      ))}

      {q && foundations.length === 0 && groups.length === 0 ? (
        <p className="px-2.5 pt-6 text-body-sm text-muted">No match for “{query}”.</p>
      ) : null}
    </nav>
  )
}
