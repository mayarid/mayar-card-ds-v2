import { useState, type MouseEvent } from 'react'

import { TabsCount, TabsLink, TabsNav } from '@/components/ui/tabs'

const NAV = [
  { href: '#pengguna', label: 'Pengguna' },
  { href: '#kyc', label: 'KYC', count: 4 },
  { href: '#audit', label: 'Audit' },
]

/* The admin console bar: the bar draws the hairline; the tabs fill its 56px height. */
export default function TabsFullHeight() {
  const [current, setCurrent] = useState('#pengguna')

  function go(event: MouseEvent<HTMLAnchorElement>, href: string) {
    event.preventDefault()
    setCurrent(href)
  }

  return (
    <div className="flex h-14 w-full items-center gap-6 border-b border-border bg-surface px-4 [--tabs-gap:24px]">
      <span className="text-body-sm font-semibold text-ink">Konsol</span>
      <TabsNav variant="line" tone="primary" countTone="tint" fullHeight aria-label="Konsol admin" value={current}>
        {NAV.map((item) => (
          <TabsLink key={item.href} value={item.href} href={item.href} onClick={(event) => go(event, item.href)}>
            {item.label}
            {item.count ? <TabsCount label="menunggu">{item.count}</TabsCount> : null}
          </TabsLink>
        ))}
      </TabsNav>
    </div>
  )
}
