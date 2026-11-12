import { Cancel01Icon } from '@hugeicons/core-free-icons'
import { useState } from 'react'

import { Icon } from '@/components/ui/icon'
import type { FoundationDoc } from '@/docs/types'
import { CodeBlock } from '@/gallery/code-block'
import { Section, SubHeading } from '@/gallery/page'
import { cn } from '@/lib/utils'

import { themeGroup, themeValue } from './_parts/theme'
import { CodeOnly, CopyChip, Mono, Note, Rules, TokenCopy, TokenTable } from './_parts/ui'

const Z_USE: Record<string, string> = {
  raised: 'In-flow lift: hovered tile, sticky review bar.',
  sticky: 'Sticky heads, row action menus, shell bars.',
  dropdown: 'Anchored menus (action menu), layout overlays.',
  popover: 'Filter and search panels.',
  overlay: 'Notification panel.',
  modal: 'Dialog, and the Select or Combobox menu inside it.',
  toast: 'Toasts. Always on top.',
}

/* Tailwind v4 default breakpoints. The theme keeps them. */
const BREAKPOINTS = [
  { name: 'sm', value: '40rem', px: 640 },
  { name: 'md', value: '48rem', px: 768 },
  { name: 'lg', value: '64rem', px: 1024 },
  { name: 'xl', value: '80rem', px: 1280 },
  { name: '2xl', value: '96rem', px: 1536 },
]

type Force = 'none' | 'hover' | 'pressed' | 'focus' | 'open'
const FORCES: Force[] = ['none', 'hover', 'pressed', 'focus', 'open']

const VARIANTS = [
  { name: 'hover-fine:', rule: 'Hover on a fine pointer only, and never on a disabled control. Replaces hover:.' },
  { name: 'pressed:', rule: 'While pressed, not when disabled. Replaces active:.' },
  { name: 'focus-ring:', rule: 'Keyboard focus. Pair with outline-focus. Replaces focus-visible:.' },
  { name: 'opened:', rule: 'A trigger whose popup is open (data-popup-open) or a toggle that is on (aria-pressed="true").' },
]

function StateDemo() {
  const [force, setForce] = useState<Force>('none')
  return (
    <div className="flex flex-col gap-4 rounded-2xl bg-surface p-5 shadow-ring">
      <div role="radiogroup" aria-label="Force a state" className="flex flex-wrap gap-1 self-start rounded-xl bg-component p-1">
        {FORCES.map((f) => (
          <button
            key={f}
            type="button"
            role="radio"
            aria-checked={force === f}
            onClick={() => setForce(f)}
            className={cn(
              'h-7 rounded-lg px-2.5 text-body-sm font-medium text-ink-2 outline-none transition-colors duration-(--motion-quick) hover-fine:text-ink focus-ring:outline-focus',
              force === f && 'bg-surface text-ink shadow-control',
            )}
          >
            {f === 'none' ? 'Live' : f}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-6 rounded-xl bg-canvas p-6">
        <button
          type="button"
          data-force-state={force === 'none' ? undefined : force}
          className="h-8 rounded-lg bg-surface px-3 text-body-sm font-medium text-ink shadow-control outline-none transition-colors duration-(--motion-quick) hover-fine:bg-ghost-hover-bg pressed:bg-sunken focus-ring:outline-focus opened:bg-primary-tint opened:text-primary-deep"
        >
          Lihat kartu
        </button>
        <span className="text-caption-lg text-muted">
          {force === 'none' ? 'Hover, press or tab to the button.' : `Forced with data-force-state="${force}".`}
        </span>
      </div>
      <CodeBlock title="states.tsx" code={`<button className="hover-fine:bg-ghost-hover-bg pressed:bg-sunken focus-ring:outline-focus opened:bg-primary-tint">\n  Lihat kartu\n</button>\n\n// Docs and QA only: show a state without a pointer.\n<button data-force-state="hover" />`} />
    </div>
  )
}

function HitAreaDemo() {
  const [show, setShow] = useState(true)
  return (
    <div className="flex flex-col gap-4 rounded-2xl bg-surface p-5 shadow-ring">
      <div className="flex items-center gap-10 rounded-xl bg-canvas p-8">
        <div className="relative">
          <button
            type="button"
            aria-label="Tutup"
            className="relative hit-44 flex size-6 items-center justify-center rounded-md text-ink-2 outline-none hover-fine:bg-state-hover pressed:bg-state-pressed focus-ring:outline-focus"
          >
            <Icon icon={Cancel01Icon} size={14} />
          </button>
          {show ? (
            <span aria-hidden className="pointer-events-none absolute top-1/2 left-1/2 size-11 -translate-1/2 rounded-md border border-dashed border-primary-400 bg-primary/10" />
          ) : null}
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-body-sm text-ink">24px visible, 44px to tap.</span>
          <label className="flex items-center gap-2 text-caption-lg text-ink-2">
            <input type="checkbox" checked={show} onChange={(e) => setShow(e.target.checked)} className="accent-primary" />
            Show the hit area
          </label>
        </div>
      </div>
      <CodeBlock title="hit-area.tsx" code={`<button className="relative hit-44 size-6">…</button>`} />
    </div>
  )
}

function LayoutPage() {
  const zTokens = themeGroup('--z-')
  return (
    <>
      <Section id="container" title="Container and gutter" description="From Wonder. The container caps page content; the gutter is the page side padding on wide screens.">
        <TokenTable label="Layout tokens" columns={['Token', 'Value', 'Copy', 'Wonder']}>
          <tr>
            <td>
              <div className="flex flex-col gap-0.5">
                <span className="text-body-sm font-medium text-ink">layout</span>
                <span className="text-caption-lg text-muted">Max content width. Named layout so it does not clash with the container colour.</span>
              </div>
            </td>
            <td>
              <Mono>{themeValue('--container-layout')}</Mono>
            </td>
            <td>
              <TokenCopy utility="max-w-layout" cssVar="--container-layout" />
            </td>
            <td>
              <Mono>container</Mono>
            </td>
          </tr>
          <tr>
            <td>
              <div className="flex flex-col gap-0.5">
                <span className="text-body-sm font-medium text-ink">gutter</span>
                <span className="text-caption-lg text-muted">Page side padding. A spacing key, so px-gutter, gap-gutter and so on work.</span>
              </div>
            </td>
            <td>
              <Mono>{themeValue('--spacing-gutter')}</Mono>
            </td>
            <td>
              <TokenCopy utility="px-gutter" cssVar="--spacing-gutter" />
            </td>
            <td>
              <Mono>gutter</Mono>
            </td>
          </tr>
        </TokenTable>
        <div aria-hidden className="rounded-2xl bg-well p-3">
          <div className="mx-auto flex h-24 max-w-layout items-stretch rounded-xl bg-primary-tint">
            <div className="w-6 shrink-0 rounded-l-xl bg-primary-light sm:w-10" />
            <div className="flex flex-1 items-center justify-center font-mono text-caption-lg text-primary-deep">max-w-layout · px-gutter</div>
            <div className="w-6 shrink-0 rounded-r-xl bg-primary-light sm:w-10" />
          </div>
        </div>
        <CodeBlock title="container.tsx" code={`<main className="mx-auto w-full max-w-layout px-5 md:px-gutter">…</main>`} />
      </Section>

      <Section id="z-index" title="Z-index" description="Low to high. Use the variables, not raw numbers: z-(--z-modal).">
        <TokenTable label="Z-index scale" columns={['Token', 'Value', 'Copy']}>
          {zTokens.map(([cssVar, value]) => {
            const name = cssVar.replace('--z-', '')
            return (
              <tr key={cssVar}>
                <td>
                  <div className="flex flex-col gap-0.5">
                    <span className="flex items-center gap-2 text-body-sm font-medium text-ink">
                      {name}
                      <CodeOnly />
                    </span>
                    <span className="text-caption-lg text-muted">{Z_USE[name] ?? ''}</span>
                  </div>
                </td>
                <td>
                  <Mono>{value}</Mono>
                </td>
                <td>
                  <TokenCopy utility={`z-(${cssVar})`} cssVar={cssVar} />
                </td>
              </tr>
            )
          })}
        </TokenTable>
        <Note>A local stack inside one component (1, 2 in a card face) can stay a raw number when the component sets isolation: isolate.</Note>
      </Section>

      <Section id="breakpoints" title="Breakpoints" description="Tailwind defaults, mobile first. Set breakpoints where the content breaks; pointer checks belong to hover-fine:, not to a width.">
        <TokenTable label="Breakpoints" columns={['Prefix', 'Min width', 'px']}>
          {BREAKPOINTS.map((b) => (
            <tr key={b.name}>
              <td>
                <CopyChip value={`${b.name}:`} className="text-ink" />
              </td>
              <td>
                <Mono>{b.value}</Mono>
              </td>
              <td>
                <Mono>{b.px}</Mono>
              </td>
            </tr>
          ))}
        </TokenTable>
      </Section>

      <Section id="states" title="State variants" description="Custom variants in theme.css. Each one also matches data-force-state, so the docs can show a state without a pointer.">
        <TokenTable label="State variants" columns={['Variant', 'Rule']}>
          {VARIANTS.map((v) => (
            <tr key={v.name}>
              <td className="w-40">
                <CopyChip value={v.name} className="text-ink" />
              </td>
              <td className="text-body-sm text-ink-2">{v.rule}</td>
            </tr>
          ))}
        </TokenTable>
        <SubHeading description="Pick a state to force it, or choose Live and use the pointer and keyboard.">Live demo</SubHeading>
        <StateDemo />
      </Section>

      <Section id="utilities" title="Utilities" description="Two theme utilities for focus and touch.">
        <SubHeading description="1px solid border-focus, 1px offset. Put it behind focus-ring:.">outline-focus</SubHeading>
        <div className="flex flex-wrap items-center gap-4 rounded-2xl bg-surface p-5 shadow-ring">
          <span className="flex h-8 items-center rounded-lg bg-surface px-3 text-body-sm text-ink shadow-control outline-focus">Fokus</span>
          <CopyChip value="focus-ring:outline-focus" className="text-ink" />
        </div>
        <SubHeading description="A hit area of at least 44×44 without a change to the visible box. Needs relative.">hit-44</SubHeading>
        <HitAreaDemo />
        <Rules
          items={{
            do: ['hit-44 on every control smaller than 44px.', 'focus-ring:outline-focus on every interactive element.'],
            dont: ['outline-none without a replacement.', 'hit-44 on controls that sit closer than 44px apart; the hit areas overlap.'],
          }}
        />
      </Section>
    </>
  )
}

export const doc: FoundationDoc = {
  order: 8,
  slug: 'layout',
  name: 'Layout',
  description: 'Container, gutter, z-index and breakpoints, plus the state variants and the focus and hit-area utilities.',
  Page: LayoutPage,
}
