import { CreditCardIcon, Notification01Icon, Settings01Icon, Wallet01Icon } from '@hugeicons/core-free-icons'
import type { ReactNode } from 'react'

import { Icon } from '@/components/ui/icon'

/* A small picture of each foundation for the overview tiles. Class names stay literal for Tailwind. */
const VISUALS: Record<string, ReactNode> = {
  colors: (
    <span className="flex -space-x-2">
      {['bg-primary', 'bg-ink', 'bg-well', 'bg-success', 'bg-warning', 'bg-danger'].map((c) => (
        <span key={c} className={`size-9 rounded-pill shadow-ring ring-2 ring-surface ${c}`} />
      ))}
    </span>
  ),
  typography: (
    <span className="flex items-baseline gap-4">
      <span className="text-[44px] leading-none font-semibold tracking-[-0.02em] text-ink">Aa</span>
      <span className="font-mono text-title-md text-ink-2 tabular-nums">4291 0042</span>
    </span>
  ),
  radius: (
    <span className="flex items-end gap-3">
      <span className="size-9 rounded-sm bg-primary-light shadow-ring" />
      <span className="size-11 rounded-xl bg-primary-light shadow-ring" />
      <span className="size-13 rounded-3xl bg-primary-light shadow-ring" />
      <span className="h-9 w-16 rounded-pill bg-primary-light shadow-ring" />
    </span>
  ),
  elevation: (
    <span className="flex items-center gap-4">
      <span className="h-10 w-14 rounded-lg bg-surface shadow-control" />
      <span className="h-12 w-16 rounded-xl bg-surface shadow-raised" />
      <span className="h-14 w-18 rounded-2xl bg-surface shadow-popover" />
    </span>
  ),
  motion: (
    <svg viewBox="0 0 120 64" className="h-16 w-30 text-primary" fill="none">
      <path d="M8 56H112M8 56V8" className="stroke-border" strokeWidth="1" />
      <path d="M8 56C34.4 56 51 8 112 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="112" cy="8" r="4" fill="currentColor" />
    </svg>
  ),
  icons: (
    <span className="flex items-center gap-5 text-ink-2">
      {[CreditCardIcon, Wallet01Icon, Notification01Icon, Settings01Icon].map((icon, i) => (
        <Icon key={i} icon={icon} size={24} />
      ))}
    </span>
  ),
  'chart-palette': (
    <span className="flex h-14 items-end gap-2">
      {['h-8 bg-chart-1', 'h-12 bg-chart-2', 'h-6 bg-chart-3', 'h-14 bg-chart-4', 'h-10 bg-chart-5', 'h-7 bg-chart-6'].map((c) => (
        <span key={c} className={`w-4 rounded-t-sm ${c}`} />
      ))}
    </span>
  ),
  layout: (
    <span className="grid h-14 w-28 grid-cols-[24px_1fr] gap-1.5 rounded-lg bg-surface p-1.5 shadow-ring">
      <span className="rounded-sm bg-component" />
      <span className="flex flex-col gap-1.5">
        <span className="h-3 rounded-sm bg-component" />
        <span className="flex-1 rounded-sm bg-primary-light" />
      </span>
    </span>
  ),
}

/** The picture area of a foundation tile. Decorative: the tile's name and line say what it is. */
export function FoundationVisual({ slug }: { slug: string }) {
  return (
    <span
      aria-hidden
      className="pointer-events-none flex h-36 items-center justify-center rounded-xl bg-surface shadow-ring transition-shadow duration-(--motion-quick) select-none group-hover:shadow-control"
    >
      {VISUALS[slug] ?? null}
    </span>
  )
}
