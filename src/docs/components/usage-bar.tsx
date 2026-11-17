import { UsageBar, UsageBarLabel, UsageBarTrack, UsageBarValue, type UsageTone } from '@/components/ui/usage-bar'
import type { ComponentDoc, PropValue } from '@/docs/types'
import { toJsx } from '@/gallery/jsx'
import source from '@/registry/ui/usage-bar.tsx?raw'

const DEFAULTS = { height: 6, track: 'component', max: 100 }

function render(props: Record<string, PropValue>) {
  const common = {
    value: Number(props.value ?? 60),
    height: Number(props.height ?? 6) as 6 | 8,
    track: (props.track ?? 'component') as 'component' | 'well',
    tone: props.tone && props.tone !== 'auto' ? (props.tone as UsageTone) : undefined,
    color: props.color ? String(props.color) : undefined,
  }
  return (
    <div className={props.track === 'well' ? 'w-56 rounded-xl bg-surface p-3' : 'w-56'}>
      {props.labelled ? (
        <UsageBar {...common}>
          <UsageBarLabel>Limit bulanan</UsageBarLabel>
          <UsageBarValue />
          <UsageBarTrack />
        </UsageBar>
      ) : (
        <UsageBar {...common} aria-label="Limit bulanan" />
      )}
    </div>
  )
}

function code(props: Record<string, PropValue>) {
  const attrs = {
    value: Number(props.value ?? 60),
    height: props.height === undefined ? undefined : Number(props.height),
    track: props.track,
    tone: props.tone === 'auto' ? undefined : props.tone,
    color: props.color || undefined,
  }
  if (props.labelled) {
    return toJsx(
      'UsageBar',
      attrs,
      ['<UsageBarLabel>Limit bulanan</UsageBarLabel>', '<UsageBarValue />', '<UsageBarTrack />'].join('\n'),
      DEFAULTS,
    )
  }
  return toJsx('UsageBar', { ...attrs, 'aria-label': 'Limit bulanan' }, undefined, DEFAULTS)
}

export const doc: ComponentDoc = {
  slug: 'usage-bar',
  name: 'Usage Bar',
  group: 'Display',
  description:
    'Shows how much of a limit, budget, quota or seat count is used. The fill is primary, turns to warning from 85% and red at 100%.',
  spec: 'code-only',
  registry: 'usage-bar',
  baseUi: { name: 'Meter', url: 'https://base-ui.com/react/components/meter' },
  source: [{ path: 'components/ui/usage-bar.tsx', code: source }],
  playground: {
    controls: [
      { name: 'value', type: 'select', options: ['0', '30', '60', '80', '95', '120'], default: '60' },
      { name: 'tone', type: 'select', options: ['auto', 'fill', 'warning', 'over'], default: 'auto' },
      { name: 'height', type: 'select', options: ['6', '8'], default: '6' },
      { name: 'track', type: 'select', options: ['component', 'well'], default: 'component' },
      { name: 'labelled', label: 'label + value', type: 'boolean', default: true },
      { name: 'color', type: 'text', default: '' },
    ],
    render,
    code,
  },
  matrices: [
    {
      title: 'Usage tones × height',
      description: 'Below 85% fill (primary), 85% and up warning, 100%+ over (danger).',
      rows: [
        { label: '30% (fill)', props: { value: 30 }, codeOnly: true },
        { label: '80% (fill)', props: { value: 80 }, codeOnly: true },
        { label: '90% (warning)', props: { value: 90 }, codeOnly: true },
        { label: '120% (over)', props: { value: 120 }, codeOnly: true },
        { label: '0%', props: { value: 0 }, codeOnly: true },
      ],
      columns: [
        { label: 'Height 6', props: { height: 6 } },
        { label: 'Height 8', props: { height: 8 } },
        { label: 'Well track', props: { track: 'well' } },
        { label: 'Label + value', props: { labelled: true } },
      ],
      render,
      code,
      cellWidth: 260,
    },
    {
      title: 'Colour override (share bars)',
      description: 'A share that is not a usage reading takes a chart colour. It wins over the tone.',
      rows: [1, 2, 3, 4, 5, 6].map((n) => ({
        label: `chart-${n}`,
        props: { color: `var(--color-chart-${n})`, value: 20 + n * 10 },
        codeOnly: true,
      })),
      columns: [{ label: 'Height 8', props: { height: 8 } }],
      render,
      code,
      cellWidth: 260,
    },
  ],
  examples: [
    { id: 'usage-bar/with-label', title: 'Label and value', description: 'UsageBarLabel names the meter.', codeOnly: true },
    {
      id: 'usage-bar/ramp',
      title: 'Budget list',
      description: 'Numbers printed beside the bar, so the bar is decorative. The fills fade in together.',
      codeOnly: true,
    },
    { id: 'usage-bar/share', title: 'Category share', description: 'color with a chart token, on a well panel.', codeOnly: true },
  ],
  props: [
    { name: 'value', type: 'number', description: 'Current value. Required. Clamped to min–max for the fill.' },
    { name: 'max', type: 'number', default: '100', description: 'Upper end. Use the limit, e.g. 10_000_000.' },
    { name: 'min', type: 'number', default: '0', description: 'Lower end.' },
    {
      name: 'tone',
      type: '"none" | "fill" | "warning" | "over"',
      description:
        'Tone override. Default: from the percent with getUsageTone(percent, near = 85): fill (bg-primary) below near, warning (bg-warning) from near, over (bg-danger) from 100%.',
    },
    { name: 'color', type: 'string', description: 'Any CSS colour or token. Wins over tone.' },
    { name: 'height', type: '6 | 8', default: '6', description: 'Bar height in px.' },
    { name: 'track', type: '"component" | "well"', default: '"component"', description: 'Track fill.' },
    { name: 'format / locale / getAriaValueText', type: 'Meter.Root props', description: 'Formatting for UsageBarValue and aria-valuetext.' },
    { name: 'children', type: 'ReactNode', description: 'UsageBarLabel, UsageBarValue, UsageBarTrack. None = the track only, decorative.' },
  ],
  guidelines: {
    do: [
      'Print the numbers next to the bar ("Rp 7.200.000 dari Rp 10.000.000").',
      'Use the default tones for usage. Use color only for a share that is not usage.',
      'Give the bar a label (aria-label or UsageBarLabel) when no text next to it says what it measures.',
    ],
    dont: [
      'Do not use green for usage. Red is only for 100% and over; warning is only for near the limit.',
      'Do not animate the fill again on every update, and do not stagger the fills.',
    ],
  },
  notes: [
    'Code-only: Usage Bar has no specimen on the Wonder Design System page. The Dashboard "Anggaran" panel uses it; values come from UsageBar.svelte and lib/usage-tone.ts.',
    'Built on Base UI Meter (role="meter"), the same role the app uses when the bar has a label. Without a label and without children it is aria-hidden, as in the app.',
    'The app takes value + max or percent. This port takes value, min and max (percent = value with max 100).',
    'The fill uses animate-bar-fill once on mount: an opacity fade of --motion-bar-fill (150ms; 0ms under reduced motion). It does not grow with scaleX.',
    'Audit (17 Nov 2026): no blue intensity ramp. One flat fill (bg-primary) below 85%, the warning tone (bg-warning) from 85% (the near state), danger from 100%. The shipped app (lib/usage-tone.ts) uses a blue ramp of primary mixed into surface (45 / 65 / 82 / 100%) and is "never amber".',
    'Audit (17 Nov 2026): the 40ms per-row stagger (--bar-delay) is removed; every fill fades in at once. The shipped app staggers the rows.',
    'Audit (17 Nov 2026): a plain-text UsageBarLabel gets the same text as its title, so a truncated label can still be read in full. The shipped app has no title.',
  ],
}
