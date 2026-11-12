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
    'Shows how much of a limit, budget, quota or seat count is used. The fill gets darker blue as usage grows and turns red at 100%.',
  spec: 'code-only',
  registry: 'usage-bar',
  baseUi: { name: 'Meter', url: 'https://base-ui.com/react/components/meter' },
  source: [{ path: 'components/ui/usage-bar.tsx', code: source }],
  playground: {
    controls: [
      { name: 'value', type: 'select', options: ['0', '30', '60', '80', '95', '120'], default: '60' },
      { name: 'tone', type: 'select', options: ['auto', 'p1', 'p2', 'p3', 'p4', 'over'], default: 'auto' },
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
      title: 'Usage ramp × height',
      description: '<50% p1, 50% p2, 75% p3, 90% p4 (flat primary), 100%+ over (danger).',
      rows: [
        { label: '30% (p1)', props: { value: 30 }, codeOnly: true },
        { label: '60% (p2)', props: { value: 60 }, codeOnly: true },
        { label: '80% (p3)', props: { value: 80 }, codeOnly: true },
        { label: '95% (p4)', props: { value: 95 }, codeOnly: true },
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
      description: 'A share that is not a usage reading takes a chart colour. It wins over the ramp.',
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
      description: 'Numbers printed beside the bar, so the bar is decorative. --bar-delay staggers the fills.',
      codeOnly: true,
    },
    { id: 'usage-bar/share', title: 'Category share', description: 'color with a chart token, on a well panel.', codeOnly: true },
  ],
  props: [
    { name: 'value', type: 'number', description: 'Current value. Required. Clamped to min–max for the fill.' },
    { name: 'max', type: 'number', default: '100', description: 'Upper end. Use the limit, e.g. 10_000_000.' },
    { name: 'min', type: 'number', default: '0', description: 'Lower end.' },
    { name: 'tone', type: '"none" | "p1" | "p2" | "p3" | "p4" | "over"', description: 'Ramp bucket override. Default: from the percent.' },
    { name: 'color', type: 'string', description: 'Any CSS colour or token. Wins over tone.' },
    { name: 'height', type: '6 | 8', default: '6', description: 'Bar height in px.' },
    { name: 'track', type: '"component" | "well"', default: '"component"', description: 'Track fill.' },
    { name: 'format / locale / getAriaValueText', type: 'Meter.Root props', description: 'Formatting for UsageBarValue and aria-valuetext.' },
    { name: 'children', type: 'ReactNode', description: 'UsageBarLabel, UsageBarValue, UsageBarTrack. None = the track only, decorative.' },
  ],
  guidelines: {
    do: [
      'Print the numbers next to the bar ("Rp 7.200.000 dari Rp 10.000.000").',
      'Use the ramp for usage. Use color only for a share that is not usage.',
      'Give the bar a label (aria-label or UsageBarLabel) when no text next to it says what it measures.',
    ],
    dont: ['Do not use green or amber for usage. Red is only for 100% and over.', 'Do not animate the fill again on every update.'],
  },
  notes: [
    'Code-only: Usage Bar has no specimen on the Wonder Design System page. The Dashboard "Anggaran" panel uses it; values come from UsageBar.svelte and lib/usage-tone.ts.',
    'Built on Base UI Meter (role="meter"), the same role the app uses when the bar has a label. Without a label and without children it is aria-hidden, as in the app.',
    'The app takes value + max or percent. This port takes value, min and max (percent = value with max 100).',
    'The ramp colours p1–p3 are color-mix of primary and surface (45 / 65 / 82%), as in the app; there is no theme token for them.',
    'The fill uses animate-bar-fill once on mount; --motion-bar-fill is 0ms under reduced motion.',
  ],
}
