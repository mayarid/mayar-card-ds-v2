import type { FoundationDoc } from '@/docs/types'
import { Section, SubHeading } from '@/gallery/page'

import { contrastRatio, wcagLevel } from './_parts/color'
import { themeValue } from './_parts/theme'
import { Mono, Rules, Swatch, Tag, TokenCopy, TokenTable } from './_parts/ui'

interface ColorToken {
  /** Theme name without the `--color-` prefix. */
  name: string
  /** The utility people reach for first. Defaults to `bg-<name>`. */
  utility?: string
  use: string
  codeOnly?: boolean
}

interface ColorGroup {
  id: string
  title: string
  description: string
  tokens: ColorToken[]
}

const GROUPS: ColorGroup[] = [
  {
    id: 'brand',
    title: 'Brand and primary',
    description: 'The one action colour. Hover and active are fixed steps, not opacity.',
    tokens: [
      { name: 'primary', use: 'Primary button, selected ring, links, info.' },
      { name: 'primary-hover', use: 'Primary button hover.' },
      { name: 'primary-active', use: 'Primary button pressed.' },
      { name: 'primary-deep', utility: 'text-primary-deep', use: 'Text on primary-light. Same value as primary-active.' },
      { name: 'primary-light', use: 'Soft primary fill: secondary brand button, brand badge.' },
      { name: 'primary-light-hover', use: 'Hover of primary-light.' },
      { name: 'primary-tint', use: 'Selected chip or choice card, new-row highlight.' },
      { name: 'primary-300', use: 'Ramp step for charts and the usage ramp.' },
      { name: 'primary-400', use: 'Ramp step for charts and the usage ramp.' },
      { name: 'primary-500', use: 'Ramp step for charts and the usage ramp.' },
      { name: 'on-primary', utility: 'text-on-primary', use: 'Text and icons on primary.' },
      { name: 'on-brand', utility: 'text-on-brand', use: 'Text and icons on brand fills.' },
      { name: 'brand-blue', use: 'Logo reference only.' },
      { name: 'brand-pink', use: 'Logo reference only.' },
    ],
  },
  {
    id: 'text',
    title: 'Text',
    description: 'Four text steps. Body copy is ink or ink-2; muted is for meta; placeholder is for inputs only.',
    tokens: [
      { name: 'ink', utility: 'text-ink', use: 'Main reading text and titles.' },
      { name: 'ink-2', utility: 'text-ink-2', use: 'Secondary copy, descriptions, inactive tabs.' },
      { name: 'muted', utility: 'text-muted', use: 'Meta, helper text, timestamps.' },
      { name: 'placeholder', utility: 'placeholder:text-placeholder', use: 'Input placeholder only. Fails 4.5:1.' },
    ],
  },
  {
    id: 'inverted',
    title: 'Inverted',
    description: 'The dark action fill and the text on it.',
    tokens: [
      { name: 'inverted', use: 'Inverted button, dark chips.' },
      { name: 'inverted-hover', use: 'Inverted button hover.' },
      { name: 'inverted-active', use: 'Inverted button pressed.' },
      { name: 'on-inverted', utility: 'text-on-inverted', use: 'Text and icons on inverted.' },
    ],
  },
  {
    id: 'surfaces',
    title: 'Surfaces',
    description: 'Page, panels and quiet fills. The alpha fills tint whatever sits under them.',
    tokens: [
      { name: 'canvas', use: 'Page and app background.' },
      { name: 'surface', use: 'Default panel and card body.' },
      { name: 'sunken', use: 'Inset or sunken area.' },
      { name: 'well', use: 'Placeholder and skeleton well, todo dot.' },
      { name: 'card', use: 'Subtle card wash.' },
      { name: 'component', use: 'Quiet grouped area, neutral badge, secondary fill.' },
      { name: 'component-hover', use: 'Hover of component.' },
      { name: 'component-active', use: 'Pressed component.' },
      { name: 'container', use: 'Token name only. Surface "container" paints surface.', codeOnly: true },
      { name: 'surface-strong', use: 'Dark surface in light mode (card face).', codeOnly: true },
      { name: 'overlay', use: 'Modal backdrop.' },
    ],
  },
  {
    id: 'borders',
    title: 'Borders and focus',
    description: 'Controls use a hairline ring (shadow-ring), not a border. Focus is a 1px outline with 1px offset.',
    tokens: [
      { name: 'border', utility: 'border-border', use: 'Dividers on surface.' },
      { name: 'border-subtle', utility: 'border-border-subtle', use: 'Alpha divider, nested-pair ring.' },
      { name: 'border-focus', utility: 'outline-border-focus', use: 'Focus outline. Use the outline-focus utility.' },
      { name: 'focus-ring', utility: 'ring-focus-ring', use: 'Same value as border-focus.' },
    ],
  },
  {
    id: 'washes',
    title: 'Interaction washes',
    description: 'Hover and pressed fills for rows, nav and menu items, and the ghost button.',
    tokens: [
      { name: 'state-hover', use: 'Nav and menu item hover.' },
      { name: 'state-pressed', use: 'Nav and menu item pressed.' },
      { name: 'ghost-hover-bg', use: 'Ghost button hover fill.' },
      { name: 'ghost-hover-border', utility: 'border-ghost-hover-border', use: 'Ghost button hover ring.' },
    ],
  },
  {
    id: 'disabled',
    title: 'Disabled',
    description: 'A dedicated pair. Never use opacity to disable a control.',
    tokens: [
      { name: 'disabled', use: 'Disabled control fill.' },
      { name: 'disabled-foreground', utility: 'text-disabled-foreground', use: 'Disabled text and icons.' },
    ],
  },
  {
    id: 'feedback',
    title: 'Feedback',
    description: 'Status colours. Fill, text-on-light and light fill. Text on white uses the -text step.',
    tokens: [
      { name: 'danger', use: 'Danger button, error icon.' },
      { name: 'danger-hover', use: 'Danger button hover.' },
      { name: 'danger-active', use: 'Danger button pressed.' },
      { name: 'danger-text', utility: 'text-danger-text', use: 'Error text.' },
      { name: 'danger-subtle', use: 'Error input fill.' },
      { name: 'danger-light', use: 'Danger badge and soft danger button.' },
      { name: 'danger-light-hover', use: 'Hover of danger-light.' },
      { name: 'danger-light-active', use: 'Pressed danger-light.' },
      { name: 'on-danger', utility: 'text-on-danger', use: 'Text on danger.' },
      { name: 'success', use: 'Success icon and dot.' },
      { name: 'success-text', utility: 'text-success-text', use: 'Success text.' },
      { name: 'success-light', use: 'Success badge fill.' },
      { name: 'warning', use: 'Warning icon and fill. Never text.' },
      { name: 'warning-text', utility: 'text-warning-text', use: 'Warning text.' },
      { name: 'warning-light', use: 'Warning badge fill.' },
      { name: 'info', use: 'Info. Same value as primary.' },
      { name: 'pink-light', use: 'Pink badge fill.' },
      { name: 'pink-text', utility: 'text-pink-text', use: 'Pink badge text.' },
    ],
  },
  {
    id: 'controls',
    title: 'Controls',
    description: 'Colours that belong to one control.',
    tokens: [
      { name: 'switch-off', use: 'Switch track when off.' },
      { name: 'highlight-inset', utility: 'inset-shadow-highlight', use: 'Top highlight on filled buttons (inside inset-shadow-highlight).' },
    ],
  },
  {
    id: 'shadow-colors',
    title: 'Shadow colours',
    description: 'Colours only. They build the elevation composites; never use one alone as a box-shadow.',
    tokens: [
      { name: 'shadow-ring', utility: 'shadow-ring', use: 'Hairline ring in every composite.' },
      { name: 'shadow-drop', use: 'Close drop.' },
      { name: 'shadow-ambient', use: 'Soft ambient shadow.' },
      { name: 'shadow-modal', use: 'Wide drop for popovers, toasts and cards.' },
    ],
  },
]

function ColorCard({ token }: { token: ColorToken }) {
  const cssVar = `--color-${token.name}`
  const value = themeValue(cssVar)
  return (
    <li className="flex min-w-0 flex-col gap-2">
      <Swatch color={`var(${cssVar})`} size="lg" className="h-20" />
      <div className="flex items-baseline justify-between gap-2 px-0.5">
        <span className="truncate text-body-sm font-medium text-ink">{token.name}</span>
        <Mono className="shrink-0 text-muted">{value}</Mono>
      </div>
      <p className="px-0.5 text-caption-lg text-ink-2">{token.use}</p>
      <div className="-ml-1">
        <TokenCopy utility={token.utility ?? `bg-${token.name}`} cssVar={cssVar} />
      </div>
    </li>
  )
}

const v = (name: string) => themeValue(`--color-${name}`)

/* Text tokens on the two page backgrounds. */
const TEXT_ON_BG = ['ink', 'ink-2', 'muted', 'placeholder', 'disabled-foreground', 'primary', 'danger-text', 'success-text', 'warning-text', 'pink-text']

/* Foreground on fill pairs that the components use. */
const PAIRS: [fg: string, bg: string][] = [
  ['on-primary', 'primary'],
  ['on-primary', 'primary-hover'],
  ['on-danger', 'danger'],
  ['on-inverted', 'inverted'],
  ['primary-deep', 'primary-light'],
  ['primary', 'primary-tint'],
  ['danger-text', 'danger-light'],
  ['danger-text', 'danger-subtle'],
  ['success-text', 'success-light'],
  ['warning-text', 'warning-light'],
  ['pink-text', 'pink-light'],
  ['ink-2', 'component'],
  ['ink', 'well'],
]

function Ratio({ fg, bg }: { fg: string; bg: string }) {
  const ratio = contrastRatio(v(fg), v(bg))
  if (ratio === null) return <Mono>—</Mono>
  const level = wcagLevel(ratio)
  return (
    <span className="inline-flex items-center gap-2">
      <Mono className="text-ink">{ratio.toFixed(2)}:1</Mono>
      <Tag tone={level === 'Fail' ? 'danger' : level === 'AA large' ? 'warning' : 'success'}>{level}</Tag>
    </span>
  )
}

function Specimen({ fg, bg }: { fg: string; bg: string }) {
  return (
    <span
      aria-hidden
      className="inline-flex h-8 w-12 items-center justify-center rounded-lg text-body-base font-semibold shadow-ring"
      style={{ color: `var(--color-${fg})`, background: `var(--color-${bg})` }}
    >
      Aa
    </span>
  )
}

function ColorsPage() {
  return (
    <>

      {GROUPS.map((group) => (
        <Section key={group.id} id={group.id} title={group.title} description={group.description}>
          <ul aria-label={`${group.title} colour tokens`} className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 md:gap-x-5">
            {group.tokens.map((token) => (
              <ColorCard key={token.name} token={token} />
            ))}
          </ul>
        </Section>
      ))}

      <Section id="chart" title="Chart colours" description="Six series colours for charts only. Mapping and rules are on their own page.">
        <div className="flex flex-wrap items-center gap-3">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <Swatch key={n} color={`var(--color-chart-${n})`} size="sm" />
          ))}
          <a
            href={`${import.meta.env.BASE_URL}foundations/chart-palette`}
            className="rounded-sm text-body-sm text-primary underline-offset-2 outline-none hover-fine:underline focus-ring:outline-focus"
          >
            Chart palette
          </a>
        </div>
      </Section>

      <Section
        id="contrast"
        title="Contrast"
        description="WCAG 2.2 ratios computed from the token values. Translucent colours are painted on white first. AA needs 4.5:1 for body text and 3:1 for large text and icons."
      >
        <SubHeading description="Each text token on surface (white) and canvas.">Text on page backgrounds</SubHeading>
        <TokenTable label="Text tokens on surface and canvas" columns={['Token', 'On surface', 'On canvas']}>
          {TEXT_ON_BG.map((fg) => (
            <tr key={fg}>
              <td>
                <span className="flex items-center gap-3">
                  <Specimen fg={fg} bg="surface" />
                  <Mono className="text-ink">{fg}</Mono>
                </span>
              </td>
              <td>
                <Ratio fg={fg} bg="surface" />
              </td>
              <td>
                <Ratio fg={fg} bg="canvas" />
              </td>
            </tr>
          ))}
        </TokenTable>
        <SubHeading description="The foreground and fill pairs that components use.">Pairs</SubHeading>
        <TokenTable label="Foreground on fill pairs" columns={['Pair', 'Foreground', 'Fill', 'Ratio']}>
          {PAIRS.map(([fg, bg]) => (
            <tr key={`${fg}-${bg}`}>
              <td className="w-20">
                <Specimen fg={fg} bg={bg} />
              </td>
              <td>
                <Mono className="text-ink">{fg}</Mono>
              </td>
              <td>
                <Mono className="text-ink">{bg}</Mono>
              </td>
              <td>
                <Ratio fg={fg} bg={bg} />
              </td>
            </tr>
          ))}
        </TokenTable>
        <Rules
          items={{
            do: ['Body copy in ink or ink-2.', 'Status text on white in the -text step (danger-text, warning-text, success-text).', 'Pair every fill with its on-* token.'],
            dont: ['Body copy in placeholder or muted at small sizes on canvas.', 'Text in warning (#faac1b); it fails on white.', 'Disable with opacity; use disabled and disabled-foreground.'],
          }}
        />
      </Section>
    </>
  )
}

export const doc: FoundationDoc = {
  order: 1,
  slug: 'colors',
  name: 'Colors',
  description: 'The colour tokens for brand, text, surfaces, borders and feedback. Each one shows its value and its contrast.',
  Page: ColorsPage,
}
