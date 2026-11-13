import { PlayIcon } from '@hugeicons/core-free-icons'
import { useState, type CSSProperties } from 'react'

import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import type { FoundationDoc } from '@/docs/types'
import { CodeBlock } from '@/gallery/code-block'
import { Section } from '@/gallery/page'

import { themeSource, themeValue } from './_parts/theme'
import { CopyChip, Mono, Note, Rules, TokenTable } from './_parts/ui'

const BASE_DURATIONS = [
  { name: 'micro', use: 'Tiny colour nudges.' },
  { name: 'quick', use: 'Hover and colour fades: Radio, choice card ring, OTP slot ring, Select chevron, Switch hover stretch.' },
  { name: 'fast', use: 'Short moves.' },
  { name: 'medium', use: 'Larger moves and settle-in.' },
]

const COMPONENT_DURATIONS = [
  { name: 'switch', use: 'Switch thumb travel, with a 1px overshoot. Uses ease-toggle.' },
  { name: 'check-box', use: 'Checkbox fill.' },
  { name: 'check-draw', use: 'Checkbox tick draw.' },
  { name: 'dropdown-open', use: 'Select, Combobox, Popover entry (scale from 0.97).' },
  { name: 'dropdown-close', use: 'Menu close: fade + 0.99.' },
  { name: 'tabs', use: 'Tabs pill or line indicator and label colour.' },
  { name: 'choice-pop', use: 'Choice card radio dot, scale 0 → 1.' },
  { name: 'toast-open', use: 'Toast entry: rise 16px, scale 0.97.' },
  { name: 'toast-close', use: 'Toast exit and stack restack.' },
  { name: 'dialog-open', use: 'Dialog entry: opacity + scale 0.96. No exit motion.' },
  { name: 'bar-fill', use: 'Usage bar fill, scaleX from the left. Never animate width.' },
  { name: 'state-swap', use: 'Combobox loading ↔ results body: 4px rise, 2px blur.' },
]

const EASINGS = [
  { name: 'smooth-out', className: 'ease-smooth-out', use: 'Everything that enters or moves, except Switch.' },
  { name: 'toggle', className: 'ease-toggle', use: 'Switch thumb only. A small overshoot.' },
  { name: 'standard', className: 'ease-standard', use: 'Symmetric transitions that are not entrances.' },
]

/* Class names stay literal so Tailwind generates them. */
const ANIMATIONS = [
  { name: 'menu-in', className: 'animate-menu-in', use: 'Menus and popovers. Scale 0.97 → 1 and fade.' },
  { name: 'dialog-in', className: 'animate-dialog-in', use: 'Dialog panel. Scale 0.96 → 1 and fade.' },
  { name: 'drawer-in', className: 'animate-drawer-in', use: 'Dialog as a drawer. Slides 24px from the right.' },
  { name: 'fade-in', className: 'animate-fade-in', use: 'Backdrops and plain reveals.' },
  { name: 'shake', className: 'animate-shake', use: 'Validation error on submit: Field, OTP, Select. Never on mount or typing.' },
  { name: 'bar-fill', className: 'animate-bar-fill origin-left', use: 'Usage bar first paint. Needs origin-left.' },
  { name: 'state-swap', className: 'animate-state-swap', use: 'Swap one body for another (loading → results).' },
  { name: 'shimmer', className: 'animate-shimmer', use: 'Skeleton shimmer. Infinite.' },
]

/* The tokens that the reduced-motion block sets to 0ms, read from theme.css. */
const REDUCED = (() => {
  const block = /@media \(prefers-reduced-motion: reduce\)\s*\{([\s\S]*?)\n\}/.exec(themeSource)?.[1] ?? ''
  return [...block.matchAll(/(--motion-[\w-]+)\s*:/g)].map((m) => m[1] as string)
})()

/** A dot that travels across a track with one duration and easing. */
function TravelDemo({ duration, easing, label }: { duration: string; easing: string; label: string }) {
  const [moved, setMoved] = useState(false)
  const dot: CSSProperties = {
    transitionDuration: duration,
    transitionTimingFunction: easing,
    transform: moved ? 'translateX(calc(var(--track) - 100% - 0.5rem))' : 'translateX(0)',
  }
  return (
    <div className="flex items-center gap-3">
      <Button variant="secondary" size="sm" onClick={() => setMoved((m) => !m)} aria-label={`Play ${label}`}>
        <Icon icon={PlayIcon} />
      </Button>
      <div className="relative h-6 w-40 rounded-pill bg-component [--track:10rem]" aria-hidden>
        <span className="absolute top-1 left-1 size-4 rounded-pill bg-primary transition-transform motion-reduce:transition-none" style={dot} />
      </div>
    </div>
  )
}

/** Replays a named animation by mounting a fresh element. */
function AnimationDemo({ className, name }: { className: string; name: string }) {
  const [run, setRun] = useState(0)
  const isBar = name === 'bar-fill'
  const isShimmer = name === 'shimmer'
  return (
    <div className="flex items-center gap-3">
      <Button variant="secondary" size="sm" onClick={() => setRun((n) => n + 1)} aria-label={`Replay ${name}`}>
        <Icon icon={PlayIcon} />
      </Button>
      <div className="flex h-12 w-40 items-center justify-center" aria-hidden>
        {isBar ? (
          <div className="h-1.5 w-full overflow-hidden rounded-pill bg-component">
            <div key={run} className={`h-full w-2/3 rounded-pill bg-primary ${className}`} />
          </div>
        ) : isShimmer ? (
          <div
            className={`h-4 w-full rounded-md ${className}`}
            style={{ backgroundImage: 'linear-gradient(90deg, var(--color-well) 25%, var(--color-sunken) 50%, var(--color-well) 75%)', backgroundSize: '200% 100%' }}
          />
        ) : (
          <div key={run} className={`flex h-10 w-28 items-center justify-center rounded-xl bg-surface text-caption-lg text-ink-2 shadow-popover ${className}`}>
            {name}
          </div>
        )}
      </div>
    </div>
  )
}

function MotionPage() {
  return (
    <>
      <Note>Press a play button to see each token. With reduced motion on, the demos do not move.</Note>

      <Section
        id="durations"
        title="Durations"
        description="Plain CSS variables, not theme keys. Use them as duration-(--motion-quick). Most are 0ms under reduced motion."
      >
        <TokenTable label="Base durations" columns={['Token', 'Value', 'Demo', 'Copy']}>
          {[...BASE_DURATIONS, ...COMPONENT_DURATIONS].map((d) => {
            const cssVar = `--motion-${d.name}`
            return (
              <tr key={d.name}>
                <td className="w-[38%]">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-body-sm font-medium text-ink">{d.name}</span>
                    <span className="text-caption-lg text-muted">{d.use}</span>
                  </div>
                </td>
                <td>
                  <Mono>{themeValue(cssVar)}</Mono>
                </td>
                <td>
                  <TravelDemo duration={`var(${cssVar})`} easing={d.name === 'switch' ? 'var(--ease-toggle)' : 'var(--ease-smooth-out)'} label={d.name} />
                </td>
                <td>
                  <div className="flex flex-col items-start gap-0.5">
                    <CopyChip value={`duration-(${cssVar})`} className="text-ink" />
                    <CopyChip value={`var(${cssVar})`} />
                  </div>
                </td>
              </tr>
            )
          })}
        </TokenTable>
      </Section>

      <Section id="easings" title="Easings" description="Theme keys, so ease-smooth-out is a class. The demo runs each curve over 600ms so the shape shows.">
        <TokenTable label="Easings" columns={['Token', 'Value', 'Demo', 'Copy']}>
          {EASINGS.map((e) => {
            const cssVar = `--ease-${e.name}`
            return (
              <tr key={e.name}>
                <td className="w-[38%]">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-body-sm font-medium text-ink">{e.name}</span>
                    <span className="text-caption-lg text-muted">{e.use}</span>
                  </div>
                </td>
                <td>
                  <Mono>{themeValue(cssVar)}</Mono>
                </td>
                <td>
                  <TravelDemo duration="600ms" easing={`var(${cssVar})`} label={e.name} />
                </td>
                <td>
                  <div className="flex flex-col items-start gap-0.5">
                    <CopyChip value={e.className} className="text-ink" />
                    <CopyChip value={`var(${cssVar})`} />
                  </div>
                </td>
              </tr>
            )
          })}
        </TokenTable>
      </Section>

      <Section id="animations" title="Named animations" description="Keyframes in the theme. Each animate-* class reads its duration from a motion token.">
        <TokenTable label="Named animations" columns={['Animation', 'Demo', 'Copy']}>
          {ANIMATIONS.map((a) => (
            <tr key={a.name}>
              <td className="w-[45%]">
                <div className="flex flex-col gap-0.5">
                  <span className="text-body-sm font-medium text-ink">{a.name}</span>
                  <span className="text-caption-lg text-muted">{a.use}</span>
                </div>
              </td>
              <td>
                <AnimationDemo className={a.className} name={a.name} />
              </td>
              <td>
                <CopyChip value={a.className} className="text-ink" />
              </td>
            </tr>
          ))}
        </TokenTable>
        <CodeBlock
          code={`<div className="rounded-xl bg-surface shadow-popover animate-menu-in">…</div>\n<div className="transition-colors duration-(--motion-quick) ease-smooth-out hover-fine:bg-state-hover">…</div>`}
        />
      </Section>

      <Section
        id="reduced-motion"
        title="Reduced motion"
        description="Under prefers-reduced-motion: reduce, the theme sets these tokens to 0ms. State still changes at once: colour, opacity and the tick appear with no fade."
      >
        <div className="flex flex-wrap gap-1.5">
          {REDUCED.map((name) => (
            <code key={name} className="rounded-md bg-component px-1.5 py-0.5 font-mono text-caption-lg text-ink-2">
              {name}
            </code>
          ))}
        </div>
        <Note>
          --motion-micro, --motion-medium and the toast tokens keep their values. A component that uses them adds
          motion-reduce:animate-none or motion-reduce:transition-none on the moving element.
        </Note>
        <Rules
          items={{
            do: [
              'Read durations from --motion-* so reduced motion turns them off.',
              'Animate transform and opacity only. Use scaleX for bars.',
              'Enter with ease-smooth-out.',
              'Skip motion on first paint: tabs snap, checkboxes and switches wait for the first change.',
            ],
            dont: [
              'Raw ms values in components.',
              'transition: all, or animating width and height.',
              'Bounce, tilt, glare or stagger on cards, badges or buttons.',
              'Animate tab panels. Only the indicator moves.',
            ],
          }}
        />
      </Section>
    </>
  )
}

export const doc: FoundationDoc = {
  order: 5,
  slug: 'motion',
  name: 'Motion',
  description: 'Durations and easings, with live demos. Under reduced motion, nothing moves, but the state still changes.',
  Page: MotionPage,
}
