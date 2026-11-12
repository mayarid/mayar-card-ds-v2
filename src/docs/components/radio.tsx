import { RadioGroup, RadioGroupItem } from '@/components/ui/radio'
import type { ComponentDoc, MatrixAxisItem, PropValue } from '@/docs/types'
import { toJsx } from '@/gallery/jsx'
import radioSource from '@/registry/ui/radio.tsx?raw'

const STATES: MatrixAxisItem[] = [
  { label: 'Default' },
  { label: 'Hover', force: 'hover' },
  { label: 'Focus', force: 'focus' },
  { label: 'Disabled', props: { disabled: true } },
]

const VALUES: MatrixAxisItem[] = [
  { label: 'Unchecked', props: { checked: false } },
  { label: 'Checked', props: { checked: true } },
]

/** One radio in its own group, so a matrix cell can show a single state. */
function render(props: Record<string, PropValue>, force?: string) {
  const label = props.label ? String(props.label) : undefined
  return (
    <RadioGroup key={String(props.checked)} aria-label="Periode" defaultValue={props.checked ? 'bulanan' : undefined}>
      <RadioGroupItem
        value="bulanan"
        disabled={Boolean(props.disabled)}
        description={props.description ? String(props.description) : undefined}
        aria-label={label ? undefined : 'Bulanan'}
        data-force-state={force}
      >
        {label}
      </RadioGroupItem>
    </RadioGroup>
  )
}

function code(props: Record<string, PropValue>) {
  const { label, checked, disabled, description } = props
  const item = toJsx(
    'RadioGroupItem',
    { value: 'bulanan', disabled, description: description || undefined, ...(label ? {} : { 'aria-label': 'Bulanan' }) },
    label ? String(label) : undefined,
  )
  return toJsx('RadioGroup', { 'aria-label': 'Periode', defaultValue: checked ? 'bulanan' : undefined }, item)
}

function playgroundRender(values: Record<string, PropValue>) {
  return (
    <RadioGroup key={String(values.disabled)} aria-label="Periode" defaultValue="bulanan" disabled={Boolean(values.disabled)}>
      <RadioGroupItem value="harian">Harian</RadioGroupItem>
      <RadioGroupItem value="bulanan" description={values.description ? String(values.description) : undefined}>
        Bulanan
      </RadioGroupItem>
      <RadioGroupItem value="tahunan">Tahunan</RadioGroupItem>
    </RadioGroup>
  )
}

function playgroundCode(values: Record<string, PropValue>) {
  const items = [
    '<RadioGroupItem value="harian">Harian</RadioGroupItem>',
    toJsx('RadioGroupItem', { value: 'bulanan', description: values.description || undefined }, 'Bulanan'),
    '<RadioGroupItem value="tahunan">Tahunan</RadioGroupItem>',
  ].join('\n')
  return toJsx('RadioGroup', { 'aria-label': 'Periode', defaultValue: 'bulanan', disabled: values.disabled }, items)
}

export const doc: ComponentDoc = {
  slug: 'radio',
  name: 'Radio',
  group: 'Forms',
  description: 'One choice out of a few, in a plain form row. Arrow keys move the choice inside the group.',
  spec: 'wonder',
  wonderRef: 'Mayar Forms Inputs Guide › Radio',
  registry: 'radio',
  baseUi: { name: 'Radio Group', url: 'https://base-ui.com/react/components/radio' },
  source: [{ path: 'components/ui/radio.tsx', code: radioSource }],
  playground: {
    controls: [
      { name: 'description', type: 'text', default: 'Limit direset setiap tanggal 1' },
      { name: 'disabled', type: 'boolean', default: false },
    ],
    render: playgroundRender,
    code: playgroundCode,
  },
  matrices: [
    {
      title: 'Values × states',
      description: 'The 16px radio alone. Hover and focus are forced.',
      rows: VALUES,
      columns: STATES,
      render,
      code,
      cellWidth: 96,
    },
    {
      title: 'Label row',
      description: 'Label and description beside the radio; the row is at least 44px tall.',
      rows: [
        { label: 'Label', props: { label: 'Bulanan' } },
        { label: 'Label + description', props: { label: 'Bulanan', description: 'Direset tanggal 1' } },
      ],
      columns: [...VALUES, { label: 'Disabled', props: { checked: true, disabled: true } }],
      render,
      code,
      cellWidth: 200,
    },
  ],
  examples: [
    { id: 'radio/basic', title: 'Basic' },
    { id: 'radio/with-description', title: 'With descriptions' },
    { id: 'radio/controlled-inline', title: 'Controlled, in a row', description: 'The value lives in state; the group lays out in a row.' },
  ],
  props: [
    { name: 'RadioGroup value / defaultValue', type: 'unknown', description: 'Controlled / uncontrolled selected value.' },
    { name: 'RadioGroup onValueChange', type: '(value, details) => void', description: 'Called when the user picks a radio.' },
    { name: 'RadioGroup name / disabled / required', type: 'string / boolean', description: 'Form props for the whole group.' },
    { name: 'RadioGroupItem value', type: 'unknown', description: 'Required. The value this radio selects.' },
    { name: 'RadioGroupItem children', type: 'ReactNode', description: 'The label. Without it, set aria-label.' },
    { name: 'RadioGroupItem description', type: 'ReactNode', description: 'A second line under the label.' },
    { name: 'RadioGroupItem disabled', type: 'boolean', default: 'false', description: 'Skipped by the arrow keys.' },
    { name: 'className', type: 'string', description: 'RadioGroupItem: on the label row (or on the radio when there is no label).' },
  ],
  guidelines: {
    do: [
      'Give every group a name: a visible legend, aria-label or aria-labelledby.',
      'Select a sensible default when there is one.',
    ],
    dont: [
      'Do not use Radio for an exclusive choice with a title and a description card. Use ChoiceCard.',
      'Do not use Radio for more than about 6 choices. Use Select.',
    ],
  },
  notes: [
    'The shipped app (Radio.svelte) is the source of truth; Wonder is the visual reference. Where they differ, the app wins.',
    'The app groups radios by a shared name and syncs peers with a document listener. Here Base UI RadioGroup owns the value, roving focus and arrow keys.',
    'A disabled checked radio keeps a white dot on the grey disabled fill, as in the app.',
  ],
}
