import { Tabs } from '@base-ui/react/tabs'
import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

import { frameClass } from './preview-frame'

interface ViewTabsProps {
  items: { value: string; label: string; content: ReactNode }[]
  defaultValue?: string
  className?: string
  /** Extra controls at the end of the tab bar. */
  actions?: ReactNode
}

/** Preview / Code switch used by the gallery (not part of the design system). Text tabs on the frame's top edge. */
export function ViewTabs({ items, defaultValue, className, actions }: ViewTabsProps) {
  return (
    <Tabs.Root defaultValue={defaultValue ?? items[0]?.value} className={cn(frameClass, className)}>
      <div className="flex h-11 items-center justify-between gap-2 border-b border-border-subtle pr-1.5 pl-2">
        <Tabs.List className="relative flex h-full items-stretch">
          {items.map((item) => (
            <Tabs.Tab
              key={item.value}
              value={item.value}
              className="relative px-2.5 text-body-sm font-medium text-muted outline-none transition-colors duration-(--motion-quick) hover-fine:text-ink focus-visible:outline-focus focus-visible:-outline-offset-4 data-active:text-ink"
            >
              {item.label}
            </Tabs.Tab>
          ))}
          <Tabs.Indicator className="absolute -bottom-px left-(--active-tab-left) h-0.5 w-(--active-tab-width) bg-ink transition-[left,width] duration-(--motion-tabs) ease-smooth-out motion-reduce:transition-none" />
        </Tabs.List>
        {actions ? <div className="flex items-center gap-1">{actions}</div> : null}
      </div>
      {items.map((item) => (
        <Tabs.Panel key={item.value} value={item.value} className="outline-none">
          {item.content}
        </Tabs.Panel>
      ))}
    </Tabs.Root>
  )
}
