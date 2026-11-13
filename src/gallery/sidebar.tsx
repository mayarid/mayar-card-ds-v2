import { Search01Icon } from '@hugeicons/core-free-icons'
import { Link } from '@tanstack/react-router'
import { useId, useMemo, useState, type ReactNode } from 'react'

import { Icon } from '@/components/ui/icon'
import { componentsByGroup, foundationList } from '@/docs'
import { cn } from '@/lib/utils'

const linkClass = cn(
  '-ml-px flex h-8 items-center border-l border-transparent pr-2 pl-3.5 text-body-sm text-ink-2 outline-none pointer-coarse:h-11',
  'transition-colors duration-(--motion-quick) hover-fine:border-border hover-fine:text-ink focus-visible:outline-focus',
  'data-[status=active]:border-primary data-[status=active]:text-ink',
)

function NavGroup({ title, children }: { title: string; children: ReactNode }) {
  const id = useId()
  return (
    <div role="group" aria-labelledby={id} className="flex flex-col">
      <p id={id} className="px-2.5 pt-6 pb-2 text-caption-lg font-medium text-muted">
        {title}
      </p>
      <ul className="ml-2.5 flex flex-col border-l border-border-subtle">{children}</ul>
    </div>
  )
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
  const foundations = foundationList.filter((d) => !q || d.name.toLowerCase().includes(q))

  return (
    <nav aria-label="Design system" className="flex flex-col pt-4 pb-10">
      <div className="relative px-0.5">
        <Icon icon={Search01Icon} size={14} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-placeholder" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filter"
          aria-label="Filter the navigation"
          className="h-8 w-full rounded-lg bg-surface pr-2.5 pl-8 text-body-sm text-ink shadow-control outline-none placeholder:text-placeholder focus-visible:outline-focus pointer-coarse:h-11 pointer-coarse:text-[16px]"
        />
      </div>

      {!q ? (
        <NavGroup title="Get started">
          <li>
            <Link to="/" className={linkClass} activeOptions={{ exact: true }} onClick={onNavigate}>
              Overview
            </Link>
          </li>
          <li>
            <Link to="/installation" className={linkClass} onClick={onNavigate}>
              Installation
            </Link>
          </li>
        </NavGroup>
      ) : null}

      {foundations.length > 0 ? (
        <NavGroup title="Foundations">
          {foundations.map((doc) => (
            <li key={doc.slug}>
              <Link to="/foundations/$slug" params={{ slug: doc.slug }} className={linkClass} onClick={onNavigate}>
                {doc.name}
              </Link>
            </li>
          ))}
        </NavGroup>
      ) : null}

      {groups.map((g) => (
        <NavGroup key={g.group} title={g.group}>
          {g.items.map((doc) => (
            <li key={doc.slug}>
              <Link to="/components/$slug" params={{ slug: doc.slug }} className={linkClass} onClick={onNavigate}>
                {doc.name}
              </Link>
            </li>
          ))}
        </NavGroup>
      ))}

      {q && foundations.length === 0 && groups.length === 0 ? (
        <p className="px-2.5 pt-6 text-body-sm text-ink-2" role="status">
          No match for “{query}”.
        </p>
      ) : null}
    </nav>
  )
}
