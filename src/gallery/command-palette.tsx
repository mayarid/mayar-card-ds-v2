import { Dialog } from '@base-ui/react/dialog'
import { Search01Icon } from '@hugeicons/core-free-icons'
import { useNavigate } from '@tanstack/react-router'
import { useEffect, useId, useMemo, useRef, useState } from 'react'

import { Icon } from '@/components/ui/icon'
import { Kbd } from '@/components/ui/kbd'
import { componentsByGroup, foundationList } from '@/docs'
import { cn } from '@/lib/utils'

type Target = { to: '/' } | { to: '/installation' } | { to: '/foundations/$slug'; slug: string } | { to: '/components/$slug'; slug: string }

interface PaletteItem {
  id: string
  label: string
  section: string
  target: Target
}

function allItems(): PaletteItem[] {
  return [
    { id: 'page-overview', label: 'Overview', section: 'Get started', target: { to: '/' } },
    { id: 'page-installation', label: 'Installation', section: 'Get started', target: { to: '/installation' } },
    ...foundationList.map((d) => ({
      id: `foundation-${d.slug}`,
      label: d.name,
      section: 'Foundations',
      target: { to: '/foundations/$slug' as const, slug: d.slug },
    })),
    ...componentsByGroup().flatMap((g) =>
      g.items.map((d) => ({
        id: `component-${d.slug}`,
        label: d.name,
        section: g.group,
        target: { to: '/components/$slug' as const, slug: d.slug },
      })),
    ),
  ]
}

/** Shows ⌘ on Apple devices and Ctrl everywhere else. */
export function useModKey() {
  const [mod] = useState(() => {
    if (typeof navigator === 'undefined') return 'Ctrl'
    const platform =
      (navigator as Navigator & { userAgentData?: { platform?: string } }).userAgentData?.platform ?? navigator.platform ?? ''
    return /mac|iphone|ipad/i.test(platform) ? '⌘' : 'Ctrl'
  })
  return mod
}

/** Opens the palette on Ctrl+K or ⌘K, from anywhere on the page. */
export function usePaletteShortcut(onOpen: () => void) {
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && !event.altKey && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        onOpen()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onOpen])
}

export function CommandPalette({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  // The palette has no trigger element (a shortcut can open it), so remember what had focus and return there on close.
  const returnFocus = useRef<HTMLElement | null>(null)
  useEffect(() => {
    if (open) return
    const remember = (event: FocusEvent) => {
      if (event.target instanceof HTMLElement) returnFocus.current = event.target
    }
    if (document.activeElement instanceof HTMLElement) returnFocus.current = document.activeElement
    document.addEventListener('focusin', remember)
    return () => document.removeEventListener('focusin', remember)
  }, [open])

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-(--z-modal) bg-overlay" />
        <Dialog.Popup
          finalFocus={returnFocus}
          className={cn(
            // No open or close animation: people open a palette many times a day, from the keyboard.
            'fixed top-[12dvh] left-1/2 z-(--z-modal) flex max-h-[min(560px,76dvh)] w-[min(600px,calc(100vw-24px))] -translate-x-1/2 flex-col overflow-hidden rounded-2xl bg-surface shadow-dialog outline-none',
          )}
        >
          <Dialog.Title className="sr-only">Search the design system</Dialog.Title>
          {open ? <PaletteBody onClose={() => onOpenChange(false)} /> : null}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

function PaletteBody({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate()
  const listId = useId()
  const items = useMemo(() => allItems(), [])
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const listRef = useRef<HTMLDivElement>(null)

  const q = query.trim().toLowerCase()
  // Ranked matches, then grouped by section in the order each section first appears.
  const sections = useMemo(() => {
    const starts = q ? items.filter((i) => i.label.toLowerCase().startsWith(q)) : items
    const contains = q
      ? items.filter((i) => !starts.includes(i) && (i.label.toLowerCase().includes(q) || i.section.toLowerCase().includes(q)))
      : []
    const grouped: { name: string; items: PaletteItem[] }[] = []
    for (const item of [...starts, ...contains]) {
      const section = grouped.find((g) => g.name === item.section)
      if (section) section.items.push(item)
      else grouped.push({ name: item.section, items: [item] })
    }
    return grouped
  }, [items, q])
  // The visual order is the keyboard order.
  const results = useMemo(() => sections.flatMap((g) => g.items), [sections])

  const active = results[Math.min(activeIndex, results.length - 1)]

  useEffect(() => {
    if (!active) return
    listRef.current?.querySelector(`[data-id="${active.id}"]`)?.scrollIntoView?.({ block: 'nearest' })
  }, [active])

  function go(item: PaletteItem) {
    onClose()
    const t = item.target
    if (t.to === '/foundations/$slug') void navigate({ to: t.to, params: { slug: t.slug } })
    else if (t.to === '/components/$slug') void navigate({ to: t.to, params: { slug: t.slug } })
    else void navigate({ to: t.to })
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    const last = results.length - 1
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActiveIndex((i) => (i >= last ? 0 : i + 1))
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIndex((i) => (i <= 0 ? last : i - 1))
    } else if (event.key === 'Home' && event.ctrlKey) {
      event.preventDefault()
      setActiveIndex(0)
    } else if (event.key === 'End' && event.ctrlKey) {
      event.preventDefault()
      setActiveIndex(last)
    } else if (event.key === 'Enter' && active) {
      event.preventDefault()
      go(active)
    }
  }

  const optionId = (item: PaletteItem) => `${listId}-${item.id}`
  const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-')

  return (
    <>
      <div className="flex h-14 shrink-0 items-center gap-3 border-b border-border-subtle px-4">
        <Icon icon={Search01Icon} className="text-muted" />
        <input
          autoFocus
          role="combobox"
          aria-expanded="true"
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={active ? optionId(active) : undefined}
          aria-label="Search components and foundations"
          placeholder="Search components and foundations"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setActiveIndex(0)
          }}
          onKeyDown={onKeyDown}
          className="h-full min-w-0 flex-1 bg-transparent text-[16px] leading-6 text-ink outline-none placeholder:text-placeholder pointer-fine:text-body-base"
        />
        <Kbd className="hidden sm:inline-flex">Esc</Kbd>
        <Dialog.Close className="-mr-2 h-11 rounded-lg px-2 text-body-sm font-medium text-ink-2 outline-none focus-visible:outline-focus sm:hidden">
          Cancel
        </Dialog.Close>
      </div>

      <div ref={listRef} id={listId} role="listbox" aria-label="Results" className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-2">
        {sections.map((section) => (
          <div key={section.name} role="group" aria-labelledby={`${listId}-${slug(section.name)}`} className="flex flex-col pb-2">
            <p id={`${listId}-${slug(section.name)}`} role="presentation" className="px-3 pt-2 pb-1 text-caption-lg font-medium text-muted">
              {section.name}
            </p>
            {section.items.map((item) => {
              const selected = item === active
              return (
                <div
                  key={item.id}
                  id={optionId(item)}
                  data-id={item.id}
                  role="option"
                  aria-selected={selected}
                  onPointerMove={() => setActiveIndex(results.indexOf(item))}
                  onClick={() => go(item)}
                  className={cn(
                    'flex h-10 cursor-pointer items-center rounded-lg px-3 text-body-base text-ink-2 select-none pointer-coarse:h-11',
                    selected && 'bg-state-hover text-ink',
                  )}
                >
                  {item.label}
                </div>
              )
            })}
          </div>
        ))}
        {results.length === 0 ? (
          <p className="px-3 py-8 text-center text-body-sm text-ink-2" role="status">
            No match for “{query}”. Try a component name, such as Button.
          </p>
        ) : null}
      </div>

      <div className="hidden h-10 shrink-0 items-center gap-4 border-t border-border-subtle px-4 text-caption-lg text-muted sm:flex">
        <span className="flex items-center gap-1.5">
          <Kbd>↑</Kbd>
          <Kbd>↓</Kbd> Move
        </span>
        <span className="flex items-center gap-1.5">
          <Kbd>Enter</Kbd> Open
        </span>
        <span className="flex items-center gap-1.5">
          <Kbd>Esc</Kbd> Close
        </span>
      </div>
    </>
  )
}
