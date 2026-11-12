import type { FoundationDoc } from '@/docs/types'
import { Section, SubHeading } from '@/gallery/page'

import { themeValue } from './_parts/theme'
import { CodeOnly, Mono, Note, Rules, Swatch, TokenCopy, TokenTable } from './_parts/ui'

/* Class names stay literal so Tailwind generates them. */
const SHADOWS = [
  {
    name: 'ring',
    className: 'shadow-ring',
    cssVar: '--shadow-ring',
    use: 'Hairline edge only. Code blocks, tables, flat panels on surface.',
  },
  {
    name: 'control',
    className: 'shadow-control',
    cssVar: '--shadow-control',
    use: 'Controls and elevated surfaces: secondary button, input, Surface elevated. Ring + 1px drop + ambient.',
  },
  {
    name: 'raised',
    className: 'shadow-raised',
    cssVar: '--shadow-raised',
    use: 'A tile that lifts on hover, a sticky review bar.',
  },
  {
    name: 'popover',
    className: 'shadow-popover',
    cssVar: '--shadow-popover',
    use: 'Every dropdown surface: Select and Combobox menus, action menu, filter and search panels, date picker.',
  },
  {
    name: 'toast',
    className: 'shadow-toast',
    cssVar: '--shadow-toast',
    use: 'Toasts.',
  },
  {
    name: 'card',
    className: 'shadow-card',
    cssVar: '--shadow-card',
    use: 'A page-level card that floats on a tinted page, such as the auth card. Four layers.',
  },
  {
    name: 'highlight',
    className: 'inset-shadow-highlight',
    cssVar: '--inset-shadow-highlight',
    use: 'A 1px top highlight inside filled buttons (primary, inverted, danger).',
  },
] as const

const COLORS = ['shadow-ring', 'shadow-drop', 'shadow-ambient', 'shadow-modal', 'highlight-inset']

function ElevationPage() {
  return (
    <>
      <Section
        id="shadows"
        title="Shadows"
        description="Every composite is code-only: Wonder has the shadow colours, and the shipped app combines them. Each one starts with the 1px hairline ring, so elevated surfaces need no border."
      >
        <div className="grid gap-4 rounded-2xl bg-canvas p-6 shadow-ring sm:grid-cols-2 lg:grid-cols-4">
          {SHADOWS.map((s) => (
            <div key={s.name} className="flex flex-col items-center gap-3">
              <div className={`flex h-20 w-full items-center justify-center rounded-2xl ${s.name === 'highlight' ? 'bg-primary' : 'bg-surface'} ${s.className}`}>
                <span className={`font-mono text-caption-lg ${s.name === 'highlight' ? 'text-on-primary' : 'text-ink-2'}`}>{s.className}</span>
              </div>
            </div>
          ))}
        </div>
        <TokenTable label="Shadow tokens" columns={['Token', 'Value', 'Copy']}>
          {SHADOWS.map((s) => (
            <tr key={s.name}>
              <td className="w-[40%]">
                <div className="flex flex-col gap-0.5">
                  <span className="flex items-center gap-2 text-body-sm font-medium text-ink">
                    {s.name}
                    <CodeOnly />
                  </span>
                  <span className="text-caption-lg text-muted">{s.use}</span>
                </div>
              </td>
              <td>
                <Mono className="block max-w-[44ch] text-caption-sm leading-4 whitespace-normal">{themeValue(s.cssVar)}</Mono>
              </td>
              <td>
                <TokenCopy utility={s.className} cssVar={s.cssVar} />
              </td>
            </tr>
          ))}
        </TokenTable>
      </Section>

      <Section id="shadow-colors" title="Shadow colours" description="From Wonder. Colours only: never use one alone as a box-shadow value.">
        <TokenTable label="Shadow colours" columns={['~Swatch', 'Token', 'Value', 'Copy']}>
          {COLORS.map((name) => (
            <tr key={name}>
              <td className="w-14">
                <Swatch color={`var(--color-${name})`} />
              </td>
              <td>
                <Mono className="text-ink">{name}</Mono>
              </td>
              <td>
                <Mono>{themeValue(`--color-${name}`)}</Mono>
              </td>
              <td>
                <TokenCopy cssVar={`--color-${name}`} />
              </td>
            </tr>
          ))}
        </TokenTable>
      </Section>

      <Section id="when" title="Which shadow" description="Pick by what the surface does, not by how much depth looks nice.">
        <SubHeading>Decision</SubHeading>
        <ul className="flex flex-col gap-1.5 text-body-sm text-ink-2">
          <li>A flat panel or code block on surface → shadow-ring.</li>
          <li>A control or an elevated card in a page → shadow-control.</li>
          <li>Something that lifts in reply to hover → shadow-raised.</li>
          <li>A popup anchored to a trigger → shadow-popover.</li>
          <li>A toast → shadow-toast.</li>
          <li>One hero card on a tinted page → shadow-card.</li>
        </ul>
        <Rules
          items={{
            do: ['Use the ring for edges; controls use rings, not border.', 'Keep one elevation step per layer.'],
            dont: ['box-shadow: var(--color-shadow-modal). The colour alone is not a valid shadow, and the menu loses its edge.', 'Stack a border and shadow-ring on one element.'],
          }}
        />
        <Note>The z-index scale that goes with elevation is on the Layout page.</Note>
      </Section>
    </>
  )
}

export const doc: FoundationDoc = {
  order: 4,
  slug: 'elevation',
  name: 'Elevation',
  description: 'Layered shadows built from the Wonder shadow colours: ring, control, raised, popover, toast and card.',
  Page: ElevationPage,
}
