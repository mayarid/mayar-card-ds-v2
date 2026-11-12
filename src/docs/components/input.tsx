import { Search01Icon } from '@hugeicons/core-free-icons'

import { Icon } from '@/components/ui/icon'
import { Input, InputPrefix } from '@/components/ui/input'
import { Kbd } from '@/components/ui/kbd'
import type { ComponentDoc, MatrixAxisItem, PropValue } from '@/docs/types'
import { indent, toJsx } from '@/gallery/jsx'
import inputSource from '@/registry/ui/input.tsx?raw'

type InputVariant = NonNullable<React.ComponentProps<typeof Input>['variant']>
type InputSize = NonNullable<React.ComponentProps<typeof Input>['size']>
type InputTone = NonNullable<React.ComponentProps<typeof Input>['tone']>

const VARIANTS = ['default', 'ghost', 'inline'] as const satisfies readonly InputVariant[]
const SIZES = ['sm', 'md', 'lg', 'xl'] as const satisfies readonly InputSize[]
const SLOTS = ['none', 'icon', 'kbd', 'icon-kbd', 'prefix'] as const

const STATES: MatrixAxisItem[] = [
  { label: 'Placeholder' },
  { label: 'Filled', props: { defaultValue: 'Iklan Meta' } },
  { label: 'Hover', force: 'hover' },
  { label: 'Focus', force: 'focus' },
  { label: 'Invalid', props: { defaultValue: 'budi@', invalid: true } },
  { label: 'Disabled', props: { disabled: true } },
]

const DEFAULTS = { variant: 'default', size: 'lg', tone: 'default', slot: 'none' }

function leadingFor(slot: PropValue) {
  if (slot === 'icon' || slot === 'icon-kbd') return <Icon icon={Search01Icon} />
  if (slot === 'prefix') return <InputPrefix>Rp</InputPrefix>
  return undefined
}

function render(props: Record<string, PropValue>, force?: string) {
  const slot = props.slot ?? 'none'
  return (
    <Input
      key={String(props.defaultValue ?? '')}
      aria-label="Contoh input"
      variant={props.variant as InputVariant}
      size={props.size as InputSize}
      tone={props.tone as InputTone}
      invalid={Boolean(props.invalid)}
      disabled={Boolean(props.disabled)}
      placeholder={String(props.placeholder ?? 'Placeholder')}
      defaultValue={props.defaultValue === undefined ? undefined : String(props.defaultValue)}
      leading={leadingFor(slot)}
      trailing={slot === 'kbd' || slot === 'icon-kbd' ? <Kbd aria-hidden>⌘K</Kbd> : undefined}
      onClear={props.clearable ? () => {} : undefined}
      data-force-state={force}
    />
  )
}

function code(props: Record<string, PropValue>) {
  const { slot = 'none', clearable, placeholder = 'Placeholder', ...rest } = props
  const attrs: Record<string, PropValue> = { placeholder, ...rest }
  let jsx = toJsx('Input', attrs, undefined, DEFAULTS)
  const extra: string[] = []
  if (slot === 'icon' || slot === 'icon-kbd') extra.push('leading={<Icon icon={Search01Icon} />}')
  if (slot === 'prefix') extra.push('leading={<InputPrefix>Rp</InputPrefix>}')
  if (slot === 'kbd' || slot === 'icon-kbd') extra.push('trailing={<Kbd aria-hidden>⌘K</Kbd>}')
  if (clearable) extra.push('onClear={() => setValue(\'\')}')
  if (extra.length) jsx = jsx.replace(/ \/>$/, `\n${indent(extra.join('\n'))}\n/>`)
  return jsx
}

export const doc: ComponentDoc = {
  slug: 'input',
  name: 'Input',
  group: 'Forms',
  description:
    'A single-line text field. Default for forms, ghost for a field inside a toolbar, inline for text that is edited in place.',
  spec: 'wonder',
  wonderRef: 'Mayar Forms Inputs Guide › Input',
  registry: 'input',
  baseUi: { name: 'Input', url: 'https://base-ui.com/react/components/input' },
  source: [{ path: 'components/ui/input.tsx', code: inputSource }],
  playground: {
    controls: [
      { name: 'variant', type: 'select', options: VARIANTS, default: 'default' },
      { name: 'size', type: 'select', options: SIZES, default: 'lg' },
      { name: 'slot', label: 'content', type: 'select', options: SLOTS, default: 'none' },
      { name: 'placeholder', type: 'text', default: 'Cari transaksi' },
      { name: 'tone', type: 'select', options: ['default', 'danger'], default: 'default' },
      { name: 'clearable', label: 'clear button', type: 'boolean', default: false },
      { name: 'invalid', type: 'boolean', default: false },
      { name: 'disabled', type: 'boolean', default: false },
    ],
    render: (values) => <div className="w-80">{render(values)}</div>,
    code,
  },
  matrices: [
    {
      title: 'Variants × states (LG)',
      description: 'Hover and focus are forced. Invalid is the one error paint for every text control.',
      rows: VARIANTS.map((v) => ({ label: v[0]!.toUpperCase() + v.slice(1), props: { variant: v } })),
      columns: STATES,
      render,
      code,
      cellWidth: 200,
    },
    {
      title: 'Sizes × states (Default)',
      description: 'SM 28 / MD 32 / LG 36 / XL 40. Text 13 / 13 / 14 / 16.',
      rows: SIZES.map((s) => ({ label: s.toUpperCase(), props: { size: s } })),
      columns: STATES,
      render,
      code,
      cellWidth: 200,
    },
    {
      title: 'Content (LG)',
      description: 'Leading icon, end Kbd, the "Rp" prefix, and the clear button.',
      rows: [
        { label: 'Default' },
        { label: 'Disabled', props: { disabled: true } },
      ],
      columns: [
        { label: 'Icon', props: { slot: 'icon', placeholder: 'Cari' } },
        { label: 'Kbd', props: { slot: 'kbd', placeholder: 'Cari' } },
        { label: 'Icon + Kbd', props: { slot: 'icon-kbd', placeholder: 'Cari' } },
        { label: 'Prefix', props: { slot: 'prefix', defaultValue: '150.000' } },
        { label: 'Clear', props: { slot: 'icon', clearable: true, defaultValue: 'Budi' }, codeOnly: true },
      ],
      render,
      code,
      cellWidth: 200,
    },
    {
      title: 'Danger tone (code-only)',
      description: 'A danger focus ring for a type-to-confirm field. It is not an error: there is no fill and no aria-invalid.',
      rows: [{ label: 'Danger', props: { tone: 'danger' }, codeOnly: true }],
      columns: [
        { label: 'Default', props: { defaultValue: 'HAP' } },
        { label: 'Focus', props: { defaultValue: 'HAP' }, force: 'focus' },
      ],
      render,
      code,
      cellWidth: 200,
    },
  ],
  examples: [
    { id: 'input/search', title: 'Search with a shortcut', description: 'Leading icon and an end Kbd. A click on the Kbd focuses the field.' },
    { id: 'input/amount', title: 'Amount', description: 'InputPrefix "Rp" turns on tabular digits.' },
    { id: 'input/invalid', title: 'Invalid after submit', description: 'Set invalid on the Field after a submit. The field shakes once when it turns invalid.' },
    { id: 'input/clearable', title: 'Clear button', description: 'onClear shows a "×" while there is text.', codeOnly: true },
    { id: 'input/variants', title: 'Variants' },
    { id: 'input/confirm-delete', title: 'Type to confirm', description: 'tone="danger" paints only the focus ring.', codeOnly: true },
  ],
  props: [
    { name: 'variant', type: VARIANTS.map((v) => `"${v}"`).join(' | '), default: '"default"', description: 'Default has a surface and a ring; ghost and inline are transparent.' },
    { name: 'size', type: SIZES.map((s) => `"${s}"`).join(' | '), default: '"lg"', description: 'Height 28 / 32 / 36 / 40. Inline has no fixed height.' },
    { name: 'invalid', type: 'boolean', default: 'false', description: 'Danger-subtle fill, danger ring, aria-invalid. Inside a Field, set invalid on the Field.' },
    { name: 'leading', type: 'ReactNode', description: 'An <Icon> or <InputPrefix> before the text. Hidden from assistive tech.' },
    { name: 'trailing', type: 'ReactNode', description: 'Content after the text, e.g. <Kbd aria-hidden>⌘K</Kbd>.' },
    { name: 'onClear', type: '() => void', description: 'Shows a clear button while there is text; called after the value is emptied.' },
    { name: 'clearLabel', type: 'string', default: '"Hapus teks"', description: 'Accessible name of the clear button.' },
    { name: 'tone', type: '"default" | "danger"', default: '"default"', description: 'Danger focus ring for a type-to-confirm field. Not an error state.' },
    { name: 'value / defaultValue', type: 'string', description: 'Controlled or uncontrolled text.' },
    { name: 'onValueChange', type: '(value: string, details) => void', description: 'Called with the new text (Base UI).' },
    { name: 'className', type: 'string', description: 'Classes for the visible box. Every other prop goes on the native <input>.' },
    { name: 'ref', type: 'Ref<HTMLInputElement>', description: 'The native <input>.' },
  ],
  guidelines: {
    do: [
      'Put every field in a Field with a visible label.',
      'Show the error after a submit or a blur, not while the user types.',
      'Use inputMode="numeric" for amounts and codes, and type="email" for email.',
    ],
    dont: [
      'Do not use the placeholder as the label.',
      'Do not show a form error as a toast.',
      'Do not use tone="danger" for an error. Use invalid.',
    ],
  },
  notes: [
    'The Wonder canvas could not be read while this port was made (the Wonder tools did not answer). Values come from Input.svelte, which was built from the Wonder specimens. Check them again against the canvas.',
    'tone="danger" and the clear button come from the shipped app (Pengaturan v2 and Admin Pengguna v2) and are code-only.',
    'Under a coarse pointer the text is 16px for every size, so iOS does not zoom.',
    'The shake (theme animate-shake) plays once when the field turns invalid after the first render, and never on mount. Reduced motion turns it off. The Svelte Field shook on a "shakeSignal" bump; this port shakes the control itself when it turns invalid.',
    'The Svelte "prefix" prop is the InputPrefix part here, given to leading. "icon" and "kbd" are the leading and trailing slots.',
  ],
}
