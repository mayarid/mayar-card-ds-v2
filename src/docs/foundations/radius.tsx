import type { FoundationDoc } from '@/docs/types'
import { Section } from '@/gallery/page'

import { themeValue } from './_parts/theme'
import { Mono, Note, Rules, Tag, TokenCopy, TokenTable } from './_parts/ui'

/* Class names stay literal so Tailwind generates them. */
const RADII = [
  { name: 'sm', className: 'rounded-sm', use: 'Checkbox box, tab counts, small tags.' },
  { name: 'md', className: 'rounded-md', use: 'SM tabs pill and trigger.' },
  { name: 'lg', className: 'rounded-lg', use: 'Input and Select SM/MD, Button SM/MD, MD tabs pill.' },
  { name: 'xl', className: 'rounded-xl', use: 'Input and Select LG/XL, Button LG, choice card, segmented list.' },
  { name: '2xl', className: 'rounded-2xl', use: 'Surface default, toast.' },
  { name: '3xl', className: 'rounded-3xl', use: 'Outer card of a nested pair.' },
  { name: 'card', className: 'rounded-card', use: 'Page-level cards. Same value as 3xl.' },
  { name: 'media', className: 'rounded-media', use: 'Payment card face, media dialog.' },
  { name: 'panel', className: 'rounded-panel', use: 'Auth brand panel.' },
  { name: 'pill', className: 'rounded-pill', use: 'Every pill and circle: badges, chips, discs, avatars, bar tracks.' },
  { name: 'btn', className: 'rounded-btn', use: 'Not used by components. See the note below.', unused: true },
] as const

function RadiusPage() {
  return (
    <>
      <Section id="scale" title="Radius scale" description="Small controls take small radii. Surfaces take larger ones.">
        <TokenTable label="Radius tokens" columns={['~Specimen', 'Token', 'Value', 'Copy']}>
          {RADII.map((r) => (
            <tr key={r.name}>
              <td className="w-20">
                <span aria-hidden className={`block size-12 border border-primary-300 bg-primary-tint ${r.className}`} />
              </td>
              <td>
                <div className="flex flex-col gap-0.5">
                  <span className="flex items-center gap-2 text-body-sm font-medium text-ink">
                    {r.name}
                    {'unused' in r ? <Tag tone="warning">not used</Tag> : null}
                  </span>
                  <span className="text-caption-lg text-muted">{r.use}</span>
                </div>
              </td>
              <td>
                <Mono>{themeValue(`--radius-${r.name}`)}</Mono>
              </td>
              <td>
                <TokenCopy utility={r.className} cssVar={`--radius-${r.name}`} />
              </td>
            </tr>
          ))}
        </TokenTable>
        <Note>
          rounded-btn (12px) is in the theme, but no component uses it. Button uses rounded-lg for SM and MD, and rounded-xl
          for LG.
        </Note>
      </Section>

      <Section id="nesting" title="Nested radii" description="Inner radius = outer radius − padding. The same radius inside and out leaves a thick corner.">
        <div className="grid gap-3 sm:grid-cols-2">
          <figure className="flex flex-col gap-2">
            <div className="rounded-3xl bg-surface p-2 shadow-ring">
              <div className="h-20 rounded-lg bg-well" />
            </div>
            <figcaption className="text-caption-lg text-muted">Correct: 16px outer, 8px padding, 8px inner.</figcaption>
          </figure>
          <figure className="flex flex-col gap-2">
            <div className="rounded-3xl bg-surface p-2 shadow-ring">
              <div className="h-20 rounded-3xl bg-well" />
            </div>
            <figcaption className="text-caption-lg text-muted">Incorrect: 16px outer and inner.</figcaption>
          </figure>
        </div>
        <Rules
          items={{
            do: ['rounded-pill for every pill and circle.', 'Match the control size: lg for SM/MD controls, xl for LG/XL.'],
            dont: ['rounded-full, rounded-[999px] or raw px radii.', 'rounded-btn on buttons.'],
          }}
        />
      </Section>
    </>
  )
}

export const doc: FoundationDoc = {
  order: 3,
  slug: 'radius',
  name: 'Radius',
  description: 'Corner radii from small controls to page cards, and the pill for every round shape.',
  Page: RadiusPage,
}
