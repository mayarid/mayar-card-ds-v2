import { Search01Icon } from '@hugeicons/core-free-icons'
import { useDeferredValue, useId, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import type { FoundationDoc } from '@/docs/types'
import { CodeBlock } from '@/gallery/code-block'
import { Section } from '@/gallery/page'
import { useCopy } from '@/gallery/use-copy'
import { cn } from '@/lib/utils'

import { APP_ICONS } from './_parts/app-icons'
import { Note, Rules } from './_parts/ui'

const SIZES = [14, 16, 20, 24] as const
type Size = (typeof SIZES)[number]

const usage = (component: string, size: Size) => (size === 16 ? `<Icon icon={${component}} />` : `<Icon icon={${component}} size={${size}} />`)
const importLine = (component: string) => `import { ${component} } from '@hugeicons/core-free-icons'`

function IconGallery() {
  const [query, setQuery] = useState('')
  const [size, setSize] = useState<Size>(16)
  const [selectedName, setSelectedName] = useState('plus')
  const selected = APP_ICONS.find((i) => i.name === selectedName)?.component ?? 'Add01Icon'
  const { copied, copy } = useCopy()
  const searchId = useId()
  const deferred = useDeferredValue(query)
  const q = deferred.trim().toLowerCase()
  const items = q ? APP_ICONS.filter((i) => i.name.includes(q) || i.component.toLowerCase().includes(q)) : APP_ICONS

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <label htmlFor={searchId} className="sr-only">
          Search icons
        </label>
        <div className="relative min-w-60 flex-1">
          <Icon icon={Search01Icon} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted" />
          <input
            id={searchId}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, e.g. wallet or Arrow"
            className="h-9 w-full rounded-lg bg-surface pr-3 pl-9 text-body-sm text-ink shadow-control outline-none placeholder:text-placeholder focus-ring:outline-focus"
          />
        </div>
        <div role="group" aria-label="Icon size" className="flex gap-1 rounded-xl bg-component p-1">
          {SIZES.map((s) => (
            <Button
              key={s}
              size="sm"
              variant="ghost"
              aria-pressed={size === s}
              onClick={() => setSize(s)}
              className="tabular-nums opened:bg-surface opened:text-ink opened:shadow-control"
            >
              {s}
            </Button>
          ))}
        </div>
      </div>

      <p className="text-caption-lg text-muted" aria-live="polite">
        {items.length} of {APP_ICONS.length} icons · click one to copy its usage
      </p>

      {items.length ? (
        <ul className="grid grid-cols-[repeat(auto-fill,minmax(7.5rem,1fr))] gap-2">
          {items.map((item) => {
            const isSelected = item.name === selectedName
            return (
              <li key={item.name}>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedName(item.name)
                    void copy(usage(item.component, size))
                  }}
                  className={cn(
                    'flex h-24 w-full flex-col items-center justify-center gap-2 rounded-xl bg-surface px-2 text-ink shadow-ring outline-none',
                    'transition-shadow duration-(--motion-quick) hover-fine:shadow-control pressed:bg-sunken focus-ring:outline-focus',
                    isSelected && 'shadow-[0_0_0_1px_var(--color-primary)]',
                  )}
                >
                  <Icon icon={item.icon} size={size} />
                  <span className="w-full truncate text-center text-caption-lg text-ink-2">{item.name}</span>
                  <span className="sr-only">, copy {item.component}</span>
                </button>
              </li>
            )
          })}
        </ul>
      ) : (
        <Note>No icon matches “{deferred}”. Try a shorter word, or search the Hugeicons name (for example Arrow).</Note>
      )}

      <div className="flex flex-col gap-2">
        <p className="text-body-sm text-ink-2" aria-live="polite">
          {copied ? 'Copied the usage for ' : 'Usage for '}
          <code className="font-mono text-caption-lg text-ink">{selected}</code>
        </p>
        <CodeBlock code={`${importLine(selected)}\n\nimport { Icon } from '@/components/ui/icon'\n\n${usage(selected, size)}`} />
      </div>
    </div>
  )
}

function IconsPage() {
  return (
    <>
      <Section
        id="app-icons"
        title="Icons in the app"
        description="The glyphs the shipped app uses, from the free Hugeicons Stroke Rounded set. The label is the app's glyph name; the copied code uses the Hugeicons name."
      >
        <IconGallery />
      </Section>

      <Section id="usage" title="Usage" description="Icons go in children through the Icon wrapper. It sets 16px, stroke 1.5, currentColor and aria-hidden.">
        <Rules
          items={{
            do: [
              '16px in MD and LG controls, 14px in SM controls (the Button sets this for you).',
              'Inherit colour: the icon takes the text colour of its parent.',
              'Give a lone icon button an aria-label that names the action.',
              'Pair an error icon with text. Colour and icon alone are not enough.',
            ],
            dont: [
              'Mix icon libraries or stroke weights on one surface.',
              'aria-label="icon". Describe the action instead.',
              'Import the whole package. Import each icon by name so the bundle stays small.',
            ],
          }}
        />
        <Note>
          The Wonder icon library (Design System, Hugeicons) could not be listed for this page. The set above is the full app set; add
          any Wonder-only icons to <code className="font-mono">_parts/app-icons.ts</code>.
        </Note>
      </Section>
    </>
  )
}

export const doc: FoundationDoc = {
  order: 6,
  slug: 'icons',
  name: 'Icons',
  description: 'Hugeicons Stroke Rounded at stroke 1.5. Search the app set, pick a size and copy the usage.',
  Page: IconsPage,
}
