import { Switch } from '@/components/ui/switch'
import type { ComponentDoc, MatrixAxisItem, PropValue } from '@/docs/types'
import { toJsx } from '@/gallery/jsx'
import switchSource from '@/registry/ui/switch.tsx?raw'

const SIZES = ['sm', 'md'] as const

const STATES: MatrixAxisItem[] = [
  { label: 'Off' },
  { label: 'On', props: { checked: true } },
  { label: 'Off hover', force: 'hover' },
  { label: 'On hover', props: { checked: true }, force: 'hover' },
  { label: 'Focus', props: { checked: true }, force: 'focus' },
  { label: 'Disabled off', props: { disabled: true } },
  { label: 'Disabled on', props: { checked: true, disabled: true } },
]

const DEFAULTS = { size: 'md', checked: false, disabled: false }

function render(props: Record<string, PropValue>, force?: string) {
  const label = props.label ? String(props.label) : undefined
  return (
    <Switch
      key={String(props.checked)}
      size={props.size as 'sm' | 'md'}
      defaultChecked={Boolean(props.checked)}
      disabled={Boolean(props.disabled)}
      description={props.description ? String(props.description) : undefined}
      aria-label={label ? undefined : 'Notifikasi'}
      data-force-state={force}
    >
      {label}
    </Switch>
  )
}

function code(props: Record<string, PropValue>) {
  const { label, checked, ...rest } = props
  const attrs = { ...rest, defaultChecked: checked, ...(label ? {} : { 'aria-label': 'Notifikasi' }) }
  return toJsx('Switch', attrs, label ? String(label) : undefined, DEFAULTS)
}

export const doc: ComponentDoc = {
  slug: 'switch',
  name: 'Switch',
  group: 'Forms',
  description: 'Turns a setting on or off at once, with no Save step. The thumb slides with a small overshoot.',
  spec: 'wonder',
  wonderRef: 'Mayar Forms Inputs Guide › Switch Block',
  registry: 'switch',
  baseUi: { name: 'Switch', url: 'https://base-ui.com/react/components/switch' },
  source: [{ path: 'components/ui/switch.tsx', code: switchSource }],
  playground: {
    controls: [
      { name: 'size', type: 'select', options: SIZES, default: 'md' },
      { name: 'label', type: 'text', default: 'Notifikasi transaksi' },
      { name: 'description', type: 'text', default: '' },
      { name: 'checked', label: 'defaultChecked', type: 'boolean', default: true },
      { name: 'disabled', type: 'boolean', default: false },
    ],
    render: (values) => render(values),
    code,
  },
  matrices: [
    {
      title: 'Sizes × states',
      description: 'SM 28×16 and MD 36×20. Hover stretches the thumb away from its pinned edge. Hover and focus are forced.',
      rows: SIZES.map((s) => ({ label: s.toUpperCase(), props: { size: s } })),
      columns: STATES,
      render,
      code,
      cellWidth: 96,
    },
    {
      title: 'Label row',
      rows: SIZES.map((s) => ({ label: s.toUpperCase(), props: { size: s, label: 'Notifikasi', description: 'Email setiap transaksi' } })),
      columns: [STATES[0]!, STATES[1]!, STATES[6]!],
      render,
      code,
      cellWidth: 220,
    },
  ],
  examples: [
    { id: 'switch/settings-list', title: 'Settings list', description: 'Label on the left, switch on the right.' },
    { id: 'switch/controlled', title: 'Controlled', description: 'The value lives in state and drives other UI.' },
    { id: 'switch/small', title: 'Small', description: 'SM in a dense table row. An aria-label names it.' },
  ],
  props: [
    { name: 'children', type: 'ReactNode', description: 'The label. Without it, set aria-label.' },
    { name: 'description', type: 'ReactNode', description: 'A second line under the label.' },
    { name: 'size', type: '"sm" | "md"', default: '"md"', description: 'Track 28×16 or 36×20.' },
    { name: 'checked / defaultChecked', type: 'boolean', description: 'Controlled / uncontrolled value.' },
    { name: 'onCheckedChange', type: '(checked: boolean, details) => void', description: 'Called when the user toggles it.' },
    { name: 'disabled / required / readOnly', type: 'boolean', default: 'false', description: 'Form states.' },
    { name: 'name / value / uncheckedValue', type: 'string', description: 'Form submission.' },
    { name: 'className', type: 'string', description: 'On the label row (or on the switch when there is no label).' },
    { name: 'ref', type: 'Ref<HTMLElement>', description: 'The Base UI switch element (role="switch").' },
  ],
  guidelines: {
    do: ['Use a switch for a setting that applies at once.', 'Name the setting, not the action: "Notifikasi transaksi".'],
    dont: [
      'Do not use a switch in a form that has a Save button. Use Checkbox.',
      'Do not change the label text when the switch changes.',
    ],
  },
  notes: [
    'Wonder was not reachable while this port was made. Values come from Switch.svelte, which was built from the Wonder Switch Block; check them against Wonder.',
    'The app animates the thumb with keyframes (1px overshoot at 55%). This port uses one translate transition on ease-toggle (cubic-bezier(0.34, 1.35, 0.64, 1)), which overshoots by itself, so no new keyframes are needed in theme.css.',
    'The track colour changes at once (the app sets its transition to 0ms).',
    'The app requires a label. Here the label is optional, but a switch without one must have an aria-label.',
  ],
}
