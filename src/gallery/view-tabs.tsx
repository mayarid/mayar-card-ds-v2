import { Tabs } from '@base-ui/react/tabs'
import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

interface ViewTabsProps {
  items: { value: string; label: string; content: ReactNode }[]
  defaultValue?: string
  className?: string
  /** Extra controls at the end of the tab bar. */
  actions?: ReactNode
}

/** Preview / Code switch used by the gallery (not part of the design system). */
export function ViewTabs({ items, defaultValue, className, actions }: ViewTabsProps) {
  return (
    <Tabs.Root defaultValue={defaultValue ?? items[0]?.value} className={cn('flex flex-col gap-3', className)}>
      <div className="flex items-center justify-between gap-2">
        <Tabs.List className="relative inline-flex rounded-lg bg-component p-0.5">
          {items.map((item) => (
            <Tabs.Tab
              key={item.value}
              value={item.value}
              className="relative z-1 h-7 rounded-md px-3 text-body-sm font-medium text-ink-2 outline-none transition-colors duration-(--motion-quick) hover-fine:text-ink focus-visible:outline-focus data-active:text-ink"
            >
              {item.label}
            </Tabs.Tab>
          ))}
          <Tabs.Indicator className="absolute top-(--active-tab-top) left-(--active-tab-left) h-(--active-tab-height) w-(--active-tab-width) rounded-md bg-surface shadow-control transition-[left,width] duration-(--motion-tabs) ease-smooth-out" />
        </Tabs.List>
        {actions}
      </div>
      {items.map((item) => (
        <Tabs.Panel key={item.value} value={item.value} className="outline-none">
          {item.content}
        </Tabs.Panel>
      ))}
    </Tabs.Root>
  )
}
