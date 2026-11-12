import { Checkbox } from '@/components/ui/checkbox'
import type { ComponentDoc, MatrixAxisItem, PropValue } from '@/docs/types'
import { toJsx } from '@/gallery/jsx'
import checkboxSource from '@/registry/ui/checkbox.tsx?raw'

const STATES: MatrixAxisItem[] = [
  { label: 'Default' },
  { label: 'Hover', force: 'hover' },
  { label: 'Focus', force: 'focus' },
  { label: 'Disabled', props: { disabled: true } },
]

const VALUES: MatrixAxisItem[] = [
  { label: 'Unchecked', props: { checked: false } },
  { label: 'Checked', props: { checked: true } },
  { label: 'Indeterminate', props: { indeterminate: true } },
]

const DEFAULTS = { variant: 'default', checked: false, indeterminate: false, disabled: false }

function render(props: Record<string, PropValue>, force?: string) {
  const label = props.label === undefined ? undefined : String(props.label)
  const description = props.description ? String(props.description) : undefined
  return (
    <Checkbox
      // Remount when the playground value changes, so the uncontrolled default applies.
      key={`${String(props.checked)}-${String(props.indeterminate)}`}
      variant={props.variant as 'default' | 'tile'}
      defaultChecked={Boolean(props.checked)}
      indeterminate={Boolean(props.indeterminate)}
      disabled={Boolean(props.disabled)}
      description={description}
      aria-label={label ? undefined : 'Pilih'}
      data-force-state={force}
      className={props.variant === 'tile' ? 'w-48' : undefined}
    >
      {label}
    </Checkbox>
  )
}

function code(props: Record<string, PropValue>) {
  const { label, checked, ...rest } = props
  const attrs = { ...rest, defaultChecked: checked, ...(label ? {} : { 'aria-label': 'Pilih' }) }
  return toJsx('Checkbox', attrs, label ? String(label) : undefined, DEFAULTS)
}

export const doc: ComponentDoc = {
  slug: 'checkbox',
  name: 'Checkbox',
  group: 'Forms',
  description:
    'An on/off choice in a form or a list. The whole label row toggles it; the tick draws in when the user checks it.',
  spec: 'wonder',
  wonderRef: 'Mayar Forms Inputs Guide › Checkbox',
  registry: 'checkbox',
  baseUi: { name: 'Checkbox', url: 'https://base-ui.com/react/components/checkbox' },
  source: [{ path: 'components/ui/checkbox.tsx', code: checkboxSource }],
  playground: {
    controls: [
      { name: 'variant', type: 'select', options: ['default', 'tile'], default: 'default' },
      { name: 'label', type: 'text', default: 'Kirim struk ke email' },
      { name: 'description', type: 'text', default: '' },
      { name: 'checked', label: 'defaultChecked', type: 'boolean', default: true },
      { name: 'indeterminate', type: 'boolean', default: false },
      { name: 'disabled', type: 'boolean', default: false },
    ],
    render: (values) => render(values),
    code,
  },
  matrices: [
    {
      title: 'Values × states',
      description: 'The 16px box alone. Hover and focus are forced.',
      rows: VALUES,
      columns: STATES,
      render,
      code,
      cellWidth: 96,
    },
    {
      title: 'Label row',
      description: 'Label and description sit beside the box; the row is at least 44px tall.',
      rows: [
        { label: 'Label', props: { label: 'Kirim struk' } },
        { label: 'Label + description', props: { label: 'Kirim struk', description: 'Ke email pemilik kartu' } },
      ],
      columns: [...VALUES, { label: 'Disabled', props: { checked: true, disabled: true } }],
      render,
      code,
      cellWidth: 200,
    },
    {
      title: 'Tile',
      description: 'A 36px bordered tile for a pick grid (KYC revision documents).',
      rows: VALUES.map((v) => ({ ...v, codeOnly: true, props: { ...v.props, variant: 'tile', label: 'Selfie dengan KTP' } })),
      columns: STATES,
      render,
      code,
      cellWidth: 208,
    },
  ],
  examples: [
    { id: 'checkbox/with-description', title: 'With a description' },
    {
      id: 'checkbox/select-all',
      title: 'Select all',
      description: 'The parent box is indeterminate while only some children are checked.',
    },
    { id: 'checkbox/tile-grid', title: 'Tile grid', description: 'KYC documents to upload again.', codeOnly: true },
    {
      id: 'checkbox/in-field',
      title: 'In a Field',
      description: 'Inside Base UI Field.Root, Field.Label names the box and Field.Error is announced.',
    },
  ],
  props: [
    { name: 'children', type: 'ReactNode', description: 'The label. Without it, set aria-label.' },
    { name: 'description', type: 'ReactNode', description: 'A second line under the label.' },
    { name: 'trailing', type: 'ReactNode', description: 'Content at the end of the row, e.g. a count.' },
    { name: 'variant', type: '"default" | "tile"', default: '"default"', description: 'Tile puts box and label in a 36px bordered tile.' },
    { name: 'checked / defaultChecked', type: 'boolean', description: 'Controlled / uncontrolled value.' },
    { name: 'onCheckedChange', type: '(checked: boolean, details) => void', description: 'Called when the user toggles it.' },
    { name: 'indeterminate', type: 'boolean', default: 'false', description: 'Mixed state: shows a dash, aria-checked="mixed".' },
    { name: 'disabled / required / readOnly', type: 'boolean', default: 'false', description: 'Form states.' },
    { name: 'name / value', type: 'string', description: 'Form submission.' },
    { name: 'className', type: 'string', description: 'On the label row (or on the box when there is no label).' },
    { name: 'ref', type: 'Ref<HTMLElement>', description: 'The Base UI checkbox element (role="checkbox").' },
  ],
  guidelines: {
    do: [
      'Use a checkbox for a choice the user confirms with a separate action (Simpan).',
      'Write the label as a statement that is true when checked: "Kirim struk ke email".',
      'Use indeterminate only on a parent box whose children are partly checked.',
    ],
    dont: [
      'Do not use a checkbox for a setting that applies at once. Use Switch.',
      'Do not use a checkbox for one choice out of many. Use Radio or ChoiceCard.',
    ],
  },
  notes: [
    'The shipped app (Checkbox.svelte) is the source of truth; Wonder is the visual reference. Where they differ, the app wins.',
    'The box shadow is a 1px ring plus a 1px drop (no ambient layer), as in the app, so it is not shadow-control.',
    'The tick uses pathLength="1" for the stroke-dashoffset draw, so the app\'s getTotalLength() measure is not necessary.',
    'The app gates the draw behind an "is-init" class. Here a CSS transition does not run on first paint, so a checked box mounts drawn without a gate.',
    'The tile variant comes from the app (KYC revision grid) and is not on the Wonder page. Its focus outline sits 2px outside the tile, as in the app.',
    'Props and ref go to the Base UI checkbox (the app put rest props on the label and ref on the native input).',
  ],
}
