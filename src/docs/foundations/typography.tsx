import type { FoundationDoc } from '@/docs/types'
import { CodeBlock } from '@/gallery/code-block'
import { Section, SubHeading } from '@/gallery/page'

import { themeValue } from './_parts/theme'
import { CopyChip, Mono, Note, Rules, Tag, TokenTable } from './_parts/ui'

/* Class names stay literal so Tailwind generates them. */
const SCALE = [
  { step: 'display', className: 'text-display', sample: 'Rp 12.450.000', use: 'Guide titles, large balance amounts.' },
  { step: 'title-lg', className: 'text-title-lg', sample: 'Kartu Tim', use: 'Page titles.' },
  { step: 'title-md', className: 'text-title-md', sample: 'Bekukan kartu?', use: 'Modal titles, OTP digits.' },
  { step: 'title-sm', className: 'text-title-sm', sample: 'Pengeluaran bulan ini', use: 'Card and panel titles.' },
  { step: 'body-lg', className: 'text-body-lg', sample: 'Masukkan nominal top up', use: 'XL inputs, amount fields.' },
  { step: 'body-base', className: 'text-body-base', sample: 'Saldo tersedia untuk semua kartu', use: 'Default UI: nav, LG controls, table cells.' },
  { step: 'body-sm', className: 'text-body-sm', sample: 'Kartu akan aktif setelah verifikasi', use: 'SM and MD controls, descriptions.' },
  { step: 'caption-lg', className: 'text-caption-lg', sample: 'Diperbarui 2 menit lalu', use: 'Helper text, meta, column heads.' },
  { step: 'caption-sm', className: 'text-caption-sm', sample: 'Aktif', use: 'SM badges, Kbd, counts. The floor: nothing is smaller than 11px.' },
  { step: 'overline', className: 'text-overline uppercase', sample: 'Ringkasan', use: 'Section labels. Always uppercase, pair with text-muted.' },
] as const

const WEIGHTS = [
  { name: 'normal', className: 'font-normal', use: 'Body, descriptions, input values, helper text.' },
  { name: 'medium', className: 'font-medium', use: 'Labels, buttons, nav, badges, column heads.' },
  { name: 'semibold', className: 'font-semibold', use: 'Titles, amounts, overlines.' },
] as const

function stepValues(step: string) {
  const base = `--text-${step}`
  return {
    size: themeValue(base),
    leading: themeValue(`${base}--line-height`),
    tracking: themeValue(`${base}--letter-spacing`) || '0',
    weight: themeValue(`${base}--font-weight`) || '400',
  }
}

function FontCard({ name, family, role, sample, className, tag }: { name: string; family: string; role: string; sample: string; className: string; tag?: string }) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-surface p-5 shadow-ring">
      <div className="flex items-center justify-between gap-2">
        <span className="text-title-sm text-ink">{name}</span>
        {tag ? <Tag tone="warning">{tag}</Tag> : null}
      </div>
      <p className={`text-title-lg text-ink ${className}`}>{sample}</p>
      <p className="text-body-sm text-ink-2">{role}</p>
      <CopyChip value={family} />
    </div>
  )
}

function TypographyPage() {
  return (
    <>
      <Section
        id="scale"
        title="Type scale"
        description="Ten steps. Each text-* class sets size, line height, tracking and, for titles and captions, weight. Values come from theme.css."
      >
        <TokenTable label="Type scale" columns={['Specimen', 'Size / line', 'Tracking', 'Weight', 'Class']}>
          {SCALE.map((item) => {
            const s = stepValues(item.step)
            return (
              <tr key={item.step}>
                <td>
                  <div className="flex flex-col gap-1">
                    <span className={`${item.className} text-ink`}>{item.sample}</span>
                    <span className="text-caption-lg text-muted">
                      {item.step} · {item.use}
                    </span>
                  </div>
                </td>
                <td>
                  <Mono>
                    {s.size} / {s.leading}
                  </Mono>
                </td>
                <td>
                  <Mono>{s.tracking}</Mono>
                </td>
                <td>
                  <Mono>{s.weight}</Mono>
                </td>
                <td>
                  <CopyChip value={item.className} className="text-ink" />
                </td>
              </tr>
            )
          })}
        </TokenTable>
        <Note>
          Negative tracking starts at title-md. Body steps are 400 by default; add font-medium for labels. The overline step does
          not set uppercase, so add the uppercase class with it.
        </Note>
      </Section>

      <Section id="weights" title="Weights" description="Only three weights exist. There is no 700 or 800.">
        <div className="grid gap-3 sm:grid-cols-3">
          {WEIGHTS.map((w) => (
            <div key={w.name} className="flex flex-col gap-2 rounded-2xl bg-surface p-5 shadow-ring">
              <span className={`text-title-lg text-ink ${w.className}`}>Aa</span>
              <span className="flex items-center gap-2 text-body-sm text-ink">
                {w.name} <Mono>{themeValue(`--font-weight-${w.name}`)}</Mono>
              </span>
              <span className="text-caption-lg text-muted">{w.use}</span>
              <CopyChip value={w.className} />
            </div>
          ))}
        </div>
        <Rules
          items={{
            do: ['Change state with colour, never weight. A weight change shifts width and moves neighbours.'],
            dont: ['font-bold or font-extrabold. The theme does not define them.'],
          }}
        />
      </Section>

      <Section id="fonts" title="Fonts" description="Plus Jakarta Sans for all UI text. Paper Mono for card numbers and codes.">
        <div className="grid gap-3 md:grid-cols-3">
          <FontCard name="Plus Jakarta Sans" family="font-sans" className="font-sans" sample="Kartu Tim" role="All UI text. Variable font, 400 / 500 / 600." />
          <FontCard
            name="Paper Mono"
            family="font-mono"
            className="font-mono tabular-nums"
            sample="4291 0820 1337"
            role="Card numbers and codes. Ligatures, calt, ss01 and ss02 are off. A metric-matched fallback avoids layout shift."
          />
          <FontCard
            name="JetBrains Mono"
            family="font-card"
            className="font-card"
            sample="4291 0820"
            role="Wonder card/mono, for the payment card face (phase 2 pattern). Not loaded by the gallery."
            tag="reference"
          />
        </div>
        <SubHeading description="Amounts, counts, tables, OTP and timers. Digits keep one width, so values do not jitter.">Tabular numbers</SubHeading>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            { label: 'Proportional', className: '' },
            { label: 'tabular-nums', className: 'tabular-nums' },
          ].map((row) => (
            <div key={row.label} className="flex flex-col gap-2 rounded-2xl bg-surface p-5 shadow-ring">
              <span className="text-caption-lg text-muted">{row.label}</span>
              <div className={`flex flex-col items-end text-body-base text-ink ${row.className}`}>
                <span>Rp 1.111.111</span>
                <span>Rp 9.080.500</span>
                <span>Rp 40.000</span>
              </div>
            </div>
          ))}
        </div>
        <CodeBlock code={`<span className="text-title-md text-ink tabular-nums">Rp 12.450.000</span>\n<span className="font-mono text-body-base">4291 0820 1337 0042</span>`} />
      </Section>

      <Section id="usage" title="Usage rules" description="From the Wonder Typography Guide and the shipped app.">
        <Rules
          items={{
            do: [
              'Use the text-* steps. They set size and line height together.',
              'Titles in ink at 600; descriptions in ink-2 at 400; meta in muted.',
              'Overline: text-overline + uppercase + text-muted.',
              'tabular-nums on every amount, count, table number, OTP and timer.',
              'Mono only for card numbers and codes.',
              'One line + ellipsis for truncation, with a path to the full text.',
            ],
            dont: [
              'Raw sizes such as text-[15px], or anything under 11px.',
              'Mono for amounts or body copy.',
              'Italic or underline for emphasis. Underline is for links.',
              'Placeholder colour for body copy.',
            ],
          }}
        />
        <Note>
          Touch inputs (Input, Textarea, Select, Combobox) switch to 16/24 text under a coarse pointer, so iOS does not zoom the
          page. This is pointer based, not a screen-width breakpoint.
        </Note>
      </Section>
    </>
  )
}

export const doc: FoundationDoc = {
  order: 2,
  slug: 'typography',
  name: 'Typography',
  description: 'The ten-step type scale, the three weights and the fonts: Plus Jakarta Sans for UI, Paper Mono for card numbers.',
  Page: TypographyPage,
}
