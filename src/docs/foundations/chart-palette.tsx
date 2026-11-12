import type { FoundationDoc } from '@/docs/types'
import { CodeBlock } from '@/gallery/code-block'
import { Section, SubHeading } from '@/gallery/page'

import { contrastRatio } from './_parts/color'
import { themeValue } from './_parts/theme'
import { Mono, Note, Rules, Swatch, TokenCopy, TokenTable } from './_parts/ui'

const SERIES = [
  { n: 1, hue: 'Pink', category: 'Pemasaran', alias: 'Iklan & Marketing' },
  { n: 2, hue: 'Blue', category: 'Operasional' },
  { n: 3, hue: 'Violet', category: 'Software & Langganan', alias: 'also a fallback slot' },
  { n: 4, hue: 'Amber', category: 'Perjalanan Dinas', alias: 'Perjalanan, Transport & Logistik' },
  { n: 5, hue: 'Teal', category: 'Reserved', alias: 'second new category, fallback slot' },
  { n: 6, hue: 'Slate', category: 'Lainnya', alias: 'Uncategorized, and every series past six' },
]

/* Demo data: spend per category this month, in millions of rupiah. Static. */
const DEMO = [
  { n: 2, label: 'Operasional', value: 18.4 },
  { n: 1, label: 'Pemasaran', value: 12.1 },
  { n: 3, label: 'Software', value: 7.6 },
  { n: 4, label: 'Perjalanan', value: 5.2 },
  { n: 6, label: 'Lainnya', value: 2.3 },
]

function BarDemo() {
  const max = 20
  const width = 560
  const rowH = 36
  const labelW = 104
  const barMax = width - labelW - 64
  return (
    <figure className="flex flex-col gap-4 rounded-2xl bg-surface p-5 shadow-ring">
      <figcaption className="flex flex-col gap-0.5">
        <span className="text-title-sm text-ink">Pengeluaran per kategori</span>
        <span className="text-caption-lg text-muted">November 2026 · dalam juta rupiah</span>
      </figcaption>
      <svg viewBox={`0 0 ${width} ${DEMO.length * rowH}`} className="h-auto w-full max-w-[560px]" role="img" aria-label="Bar chart of spend per category">
        {DEMO.map((d, i) => {
          const y = i * rowH
          const w = (d.value / max) * barMax
          return (
            <g key={d.label}>
              <text x={0} y={y + rowH / 2} dominantBaseline="central" className="fill-ink-2 text-caption-lg">
                {d.label}
              </text>
              <rect x={labelW} y={y + 10} width={barMax} height={16} rx={4} fill="var(--color-component)" />
              <rect x={labelW} y={y + 10} width={w} height={16} rx={4} fill={`var(--color-chart-${d.n})`} />
              <text x={labelW + w + 8} y={y + rowH / 2} dominantBaseline="central" className="fill-ink text-caption-lg font-medium tabular-nums">
                {d.value.toLocaleString('id-ID')}
              </text>
            </g>
          )
        })}
      </svg>
      <ul className="flex flex-wrap gap-x-4 gap-y-1.5" aria-label="Legend">
        {DEMO.map((d) => (
          <li key={d.label} className="flex items-center gap-1.5 text-caption-lg text-ink-2">
            <span aria-hidden className="size-2 rounded-pill" style={{ background: `var(--color-chart-${d.n})` }} />
            {d.label}
          </li>
        ))}
      </ul>
    </figure>
  )
}

function AreaDemo() {
  const points = [30, 42, 38, 56, 50, 64, 58]
  const w = 280
  const h = 96
  const step = w / (points.length - 1)
  const line = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${i * step},${h - p}`).join(' ')
  return (
    <figure className="flex flex-col gap-3 rounded-2xl bg-surface p-5 shadow-ring">
      <figcaption className="text-caption-lg text-muted">Area: fill at 16% opacity, 1.5px line in the solid colour.</figcaption>
      <svg viewBox={`0 0 ${w} ${h}`} className="h-24 w-full" aria-hidden>
        <path d={`${line} L${w},${h} L0,${h} Z`} fill="var(--color-chart-2)" fillOpacity={0.16} />
        <path d={line} fill="none" stroke="var(--color-chart-2)" strokeWidth={1.5} strokeLinejoin="round" />
      </svg>
    </figure>
  )
}

function ChartPalettePage() {
  return (
    <>
      <Section
        id="palette"
        title="Palette"
        description="Six series colours. Contrast is computed on white: all clear 3:1 for graphics, none clears 4.5:1, so chart colours never carry text."
      >
        <TokenTable label="Chart palette" columns={['~Swatch', 'Token', 'Value', 'On white', 'Fixed category', 'Copy']}>
          {SERIES.map((s) => {
            const cssVar = `--color-chart-${s.n}`
            const value = themeValue(cssVar)
            const ratio = contrastRatio(value, '#ffffff')
            return (
              <tr key={s.n}>
                <td className="w-14">
                  <Swatch color={`var(${cssVar})`} />
                </td>
                <td>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-body-sm font-medium text-ink">chart-{s.n}</span>
                    <span className="text-caption-lg text-muted">{s.hue}</span>
                  </div>
                </td>
                <td>
                  <Mono>{value}</Mono>
                </td>
                <td>
                  <Mono>{ratio ? `${ratio.toFixed(2)}:1` : '—'}</Mono>
                </td>
                <td>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-body-sm text-ink">{s.category}</span>
                    {s.alias ? <span className="text-caption-lg text-muted">{s.alias}</span> : null}
                  </div>
                </td>
                <td>
                  <TokenCopy utility={`bg-chart-${s.n}`} cssVar={cssVar} />
                </td>
              </tr>
            )
          })}
        </TokenTable>
      </Section>

      <Section id="demo" title="In use" description="A static specimen. Labels and values stay ink and ink-2; only the marks take chart colours.">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <BarDemo />
          <AreaDemo />
        </div>
      </Section>

      <Section id="mapping" title="Mapping" description="A category keeps its colour on every chart and table. The order never follows size.">
        <SubHeading description="Names match without case or extra spaces.">Rules for names</SubHeading>
        <ul className="flex list-disc flex-col gap-1.5 pl-5 text-body-sm text-ink-2">
          <li>Perjalanan (the label in the Wonder frames) is the same slot as Perjalanan Dinas.</li>
          <li>Uncategorized (the API label for no category) uses the Lainnya slot, chart-6.</li>
          <li>A name that is not in the table goes to chart-3 or chart-5, chosen by a hash of the name.</li>
          <li>Six series maximum. Group the rest into Lainnya.</li>
          <li>One series uses primary, not chart-1. The palette starts at two series.</li>
        </ul>
        <CodeBlock
          code={`// Correct: a category dot\n<span className="size-2 rounded-pill bg-chart-4" /> Perjalanan Dinas\n\n// Incorrect: a chart colour as a status\n<Badge className="bg-chart-1">Gagal</Badge>`}
        />
      </Section>

      <Section id="rules" title="Rules" description="From the Wonder Chart Palette Guide and the shipped app.">
        <Rules
          items={{
            do: ['Use chart colours for series, legends, tooltip swatches and category dots.', 'Area fill: solid colour at 16% + a 1.5px line.', 'Axes, labels and values in ink, ink-2 or muted.'],
            dont: [
              'Buttons, links, focus, badges or status in chart colours.',
              'Success, warning or danger meaning. Use the feedback tokens.',
              'Text in a chart colour. None reaches 4.5:1.',
              'Usage bars in chart colours. They use the primary ramp and danger only at 100% or more.',
            ],
          }}
        />
        <Note>Usage bars are not categories. Their fill is a primary ramp (45%, 65%, 82%, solid) and danger at 100% or more, never warning, success or a chart colour.</Note>
      </Section>
    </>
  )
}

export const doc: FoundationDoc = {
  order: 7,
  slug: 'chart-palette',
  name: 'Chart palette',
  description: 'Six fixed series colours, the category each one belongs to, and the rules that keep charts readable.',
  Page: ChartPalettePage,
}
