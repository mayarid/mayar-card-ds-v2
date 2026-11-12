import { useState, type MouseEvent } from 'react'

import { TabsCount, TabsLink, TabsNav } from '@/components/ui/tabs'

const STATUSES = [
  { href: '#menunggu', label: 'Menunggu', count: 12 },
  { href: '#disetujui', label: 'Disetujui', count: 48 },
  { href: '#ditolak', label: 'Ditolak', count: 3 },
]

/* In an app, derive `value` from the current URL and pass a router link through `render`. */
export default function TabsNavLinks() {
  const [current, setCurrent] = useState('#menunggu')

  function go(event: MouseEvent<HTMLAnchorElement>, href: string) {
    event.preventDefault()
    setCurrent(href)
  }

  return (
    <TabsNav variant="line" tone="primary" scrollable aria-label="Status KYC" value={current} className="w-full">
      {STATUSES.map((status) => (
        <TabsLink key={status.href} value={status.href} href={status.href} onClick={(event) => go(event, status.href)}>
          {status.label}
          <TabsCount label="pengajuan">{status.count}</TabsCount>
        </TabsLink>
      ))}
    </TabsNav>
  )
}
