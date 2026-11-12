import { Tabs, TabsCount, TabsList, TabsTab } from '@/components/ui/tabs'
import type { ComponentDoc, MatrixAxisItem, PropValue } from '@/docs/types'
import { indent, toJsx } from '@/gallery/jsx'
import tabsSource from '@/registry/ui/tabs.tsx?raw'

type Variant = 'segmented' | 'line'
type Size = 'sm' | 'md'
type Tone = 'neutral' | 'primary'
type CountTone = 'neutral' | 'primary' | 'tint'
type Force = MatrixAxisItem['force']

const DEFAULTS = { variant: 'segmented', size: 'md', tone: 'neutral', countTone: 'neutral' }

const ITEMS = [
  { value: 'all', label: 'Semua', count: 12 },
  { value: 'mine', label: 'Kartu saya', count: 3 },
  { value: 'frozen', label: 'Dibekukan', count: 0 },
]

/*
 * One tab bar. `target` is the tab that gets the forced state or `disabled`;
 * the first tab is active.
 */
function render(props: Record<string, PropValue>, force?: Force) {
  const count = Number(props.items ?? 3)
  const items = ITEMS.slice(0, Math.max(2, Math.min(3, count)))
  const target = props.target === undefined ? 1 : Number(props.target)
  return (
    <Tabs
      variant={props.variant as Variant}
      size={props.size as Size}
      tone={props.tone as Tone}
      countTone={props.countTone as CountTone}
      fill={Boolean(props.fill)}
      defaultValue="all"
    >
      <TabsList aria-label="Kartu">
        {items.map((item, index) => (
          <TabsTab
            key={item.value}
            value={item.value}
            disabled={Boolean(props.disabled) && index === target}
            data-force-state={index === target ? force : undefined}
          >
            {item.label}
            {props.withCount ? <TabsCount loading={Boolean(props.loading)}>{item.count}</TabsCount> : null}
          </TabsTab>
        ))}
      </TabsList>
    </Tabs>
  )
}

function code(props: Record<string, PropValue>) {
  const { withCount, disabled, loading, items = 3, target = 1, ...rest } = props
  const list = ITEMS.slice(0, Math.max(2, Math.min(3, Number(items))))
    .map((item, index) => {
      const count = withCount ? (loading ? '\n  <TabsCount loading />' : `\n  <TabsCount>${item.count}</TabsCount>`) : ''
      const attrs: Record<string, PropValue> = { value: item.value, disabled: Boolean(disabled) && index === Number(target) }
      return toJsx('TabsTab', attrs, `${item.label}${count}`)
    })
    .join('\n')
  return toJsx(
    'Tabs',
    { ...rest, defaultValue: 'all' },
    `<TabsList aria-label="Kartu">\n${indent(list)}\n</TabsList>`,
    DEFAULTS,
  )
}

const STATES: MatrixAxisItem[] = [
  { label: 'Default' },
  { label: 'Hover (2nd tab)', force: 'hover' },
  { label: 'Focus (2nd tab)', force: 'focus' },
  { label: 'Disabled item', props: { disabled: true } },
]

export const doc: ComponentDoc = {
  slug: 'tabs',
  name: 'Tabs',
  group: 'Selection',
  description:
    'Switches between related panels on the same page. Segmented for peer views of the same data, line for sections of one page.',
  spec: 'wonder',
  wonderRef: 'Mayar Card Design System › Selection › Tabs Segmented, Tabs Line',
  registry: 'tabs',
  baseUi: { name: 'Tabs', url: 'https://base-ui.com/react/components/tabs' },
  source: [{ path: 'components/ui/tabs.tsx', code: tabsSource }],
  playground: {
    controls: [
      { name: 'variant', type: 'select', options: ['segmented', 'line'], default: 'segmented' },
      { name: 'size', type: 'select', options: ['md', 'sm'], default: 'md' },
      { name: 'tone', type: 'select', options: ['neutral', 'primary'], default: 'neutral' },
      { name: 'countTone', label: 'count tone', type: 'select', options: ['neutral', 'primary', 'tint'], default: 'neutral' },
      { name: 'withCount', label: 'counts', type: 'boolean', default: false },
      { name: 'fill', type: 'boolean', default: false },
      { name: 'disabled', label: 'disable 2nd tab', type: 'boolean', default: false },
    ],
    render: (values) => render(values),
    code,
  },
  matrices: [
    {
      title: 'Segmented × states',
      description: 'MD and SM, with and without counts. The first tab is active; the state is on the second tab.',
      rows: [
        { label: 'MD', props: { variant: 'segmented', size: 'md' } },
        { label: 'MD · count', props: { variant: 'segmented', size: 'md', withCount: true } },
        { label: 'MD · 2 items', props: { variant: 'segmented', size: 'md', items: 2 } },
        { label: 'SM', props: { variant: 'segmented', size: 'sm' } },
        { label: 'SM · count', props: { variant: 'segmented', size: 'sm', withCount: true }, codeOnly: true },
        { label: 'MD · fill', props: { variant: 'segmented', size: 'md', fill: true }, codeOnly: true },
        { label: 'MD · loading count', props: { variant: 'segmented', size: 'md', withCount: true, loading: true }, codeOnly: true },
      ],
      columns: STATES,
      render,
      code,
      cellWidth: 300,
    },
    {
      title: 'Line × states',
      description: 'Neutral and primary tone, and the count tones. The state is on the second tab.',
      rows: [
        { label: 'Neutral', props: { variant: 'line' } },
        { label: 'Neutral · count', props: { variant: 'line', withCount: true } },
        { label: 'Primary tone · count', props: { variant: 'line', tone: 'primary', withCount: true }, codeOnly: true },
        { label: 'Count tone primary', props: { variant: 'line', countTone: 'primary', withCount: true }, codeOnly: true },
        { label: 'Count tone tint', props: { variant: 'line', countTone: 'tint', withCount: true }, codeOnly: true },
        { label: 'Loading count', props: { variant: 'line', withCount: true, loading: true }, codeOnly: true },
      ],
      columns: STATES,
      render,
      code,
      cellWidth: 320,
    },
  ],
  examples: [
    { id: 'tabs/segmented', title: 'Segmented with panels', description: 'One panel for each tab. Arrow keys move and activate.' },
    { id: 'tabs/line-with-counts', title: 'Line with counts', description: 'tone="primary" gives the admin look. label is read after the number.', codeOnly: true },
    { id: 'tabs/fill', title: 'Fill (controlled)', description: 'The track spans its container; the tabs share it equally.', codeOnly: true },
    { id: 'tabs/unread-count', title: 'Unread count', description: 'countTone="primary" keeps the pill in both states.', codeOnly: true },
    { id: 'tabs/loading-counts', title: 'Loading counts', description: 'A static bone in place of each count. The region owns aria-busy.', codeOnly: true },
  ],
  props: [
    { name: 'variant', type: '"segmented" | "line"', default: '"segmented"', description: 'Tabs: segmented track or underlined row.' },
    { name: 'size', type: '"sm" | "md"', default: '"md"', description: 'Segmented only: 28 / 32px tabs.' },
    { name: 'tone', type: '"neutral" | "primary"', default: '"neutral"', description: 'Line only: primary underline and round count pills.' },
    { name: 'countTone', type: '"neutral" | "primary" | "tint"', default: '"neutral"', description: 'Paints every count as a primary-light or primary-tint pill.' },
    { name: 'fill', type: 'boolean', default: 'false', description: 'Segmented only: the track spans its container.' },
    { name: 'value / defaultValue', type: 'string | number', description: 'Active tab, controlled or uncontrolled (Base UI).' },
    { name: 'onValueChange', type: '(value, details) => void', description: 'Called when the active tab changes.' },
    { name: 'orientation', type: '"horizontal" | "vertical"', default: '"horizontal"', description: 'Vertical line tabs use a rail on the end edge.' },
    { name: 'TabsList scrollable', type: 'boolean', default: 'false', description: 'Line: the row scrolls sideways on a narrow screen.' },
    { name: 'TabsList activateOnFocus', type: 'boolean', default: 'true', description: 'Arrow keys activate the tab they move to.' },
    { name: 'TabsCount label', type: 'string', description: 'Screen-reader suffix after the number ("pengajuan").' },
    { name: 'TabsCount loading', type: 'boolean', default: 'false', description: 'A static bone in place of the number.' },
  ],
  guidelines: {
    do: [
      'Use segmented for peer views of the same data, line for sections of one page.',
      'Keep labels short. The selection changes colour, never weight.',
      'Name the list with aria-label.',
    ],
    dont: [
      'Do not use Tabs for a filter that does not switch panels. Use ToggleGroup.',
      'Do not put Tabs in a local scroll box. Use scrollable on the list.',
    ],
  },
  notes: [
    'Wonder could not be read during this port (the Wonder endpoint did not answer). The values come from the shipped Svelte component, which was built from the Wonder specimens. Check them against Wonder again.',
    'The sliding pill and underline use Base UI Tabs.Indicator (--active-tab-* variables) with --motion-tabs and ease-smooth-out, not the JS measurer of the app.',
    'Base UI keeps a disabled tab focusable (aria-disabled), so arrow keys stop on it but do not activate it. The app skipped disabled tabs.',
    'Code-only: tone, countTone, fill, loading counts, scrollable and vertical orientation. The app link mode (nav tabs with href), header slot and fullHeight are not ported: compose a <nav> with links for URL tabs.',
    'countTone="tint" on segmented tabs uses the same round pill as countTone="primary" (the app only changed the colours there).',
  ],
}
