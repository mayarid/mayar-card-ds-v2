import { Textarea } from '@/components/ui/textarea'
import type { ComponentDoc, MatrixAxisItem, PropValue } from '@/docs/types'
import { toJsx } from '@/gallery/jsx'
import textareaSource from '@/registry/ui/textarea.tsx?raw'

type TextareaVariant = NonNullable<React.ComponentProps<typeof Textarea>['variant']>
type TextareaSize = NonNullable<React.ComponentProps<typeof Textarea>['size']>

const VARIANTS = ['default', 'ghost'] as const satisfies readonly TextareaVariant[]
const SIZES = ['md', 'lg', 'xl'] as const satisfies readonly TextareaSize[]

const STATES: MatrixAxisItem[] = [
  { label: 'Placeholder' },
  { label: 'Filled', props: { defaultValue: 'Untuk iklan bulan Mei.' } },
  { label: 'Focus', force: 'focus' },
  { label: 'Invalid', props: { defaultValue: 'Terlalu pendek', invalid: true } },
  { label: 'Disabled', props: { disabled: true } },
]

const DEFAULTS = { variant: 'default', size: 'lg', rows: 3 }

function render(props: Record<string, PropValue>, force?: string) {
  return (
    <Textarea
      key={String(props.defaultValue ?? '')}
      aria-label="Contoh textarea"
      variant={props.variant as TextareaVariant}
      size={props.size as TextareaSize}
      invalid={Boolean(props.invalid)}
      disabled={Boolean(props.disabled)}
      rows={typeof props.rows === 'number' ? props.rows : 2}
      placeholder={String(props.placeholder ?? 'Tulis catatan')}
      defaultValue={props.defaultValue === undefined ? undefined : String(props.defaultValue)}
      data-force-state={force}
    />
  )
}

function code(props: Record<string, PropValue>) {
  return toJsx('Textarea', { placeholder: 'Tulis catatan', ...props }, undefined, DEFAULTS)
}

export const doc: ComponentDoc = {
  slug: 'textarea',
  name: 'Textarea',
  group: 'Forms',
  description: 'A multi-line text field for notes and reasons. Same paints as Input; ⌘/Ctrl+Enter submits the form.',
  spec: 'wonder',
  wonderRef: 'Mayar Forms Inputs Guide › Textarea',
  registry: 'textarea',
  baseUi: { name: 'Field.Control', url: 'https://base-ui.com/react/components/field' },
  source: [{ path: 'components/ui/textarea.tsx', code: textareaSource }],
  playground: {
    controls: [
      { name: 'variant', type: 'select', options: VARIANTS, default: 'default' },
      { name: 'size', type: 'select', options: SIZES, default: 'lg' },
      { name: 'placeholder', type: 'text', default: 'Tulis catatan' },
      { name: 'invalid', type: 'boolean', default: false },
      { name: 'disabled', type: 'boolean', default: false },
    ],
    render: (values) => <div className="w-80">{render({ ...values, rows: 3 })}</div>,
    code,
  },
  matrices: [
    {
      title: 'Variants × states (LG)',
      description: 'Focus is forced.',
      rows: VARIANTS.map((v) => ({ label: v[0]!.toUpperCase() + v.slice(1), props: { variant: v } })),
      columns: STATES,
      render,
      code,
      cellWidth: 200,
    },
    {
      title: 'Sizes × states (Default)',
      description: 'MD 13px text, LG 14px, XL 16px.',
      rows: SIZES.map((s) => ({ label: s.toUpperCase(), props: { size: s }, codeOnly: s !== 'lg' })),
      columns: STATES,
      render,
      code,
      cellWidth: 200,
    },
  ],
  examples: [
    { id: 'textarea/with-field', title: 'In a Field', description: 'Label, optional marker and a description.' },
    { id: 'textarea/submit-shortcut', title: 'Submit shortcut', description: '⌘/Ctrl+Enter submits the form; Enter adds a line.' },
    { id: 'textarea/ghost', title: 'Ghost' },
  ],
  props: [
    { name: 'variant', type: '"default" | "ghost"', default: '"default"', description: 'Ghost is transparent until focus.' },
    { name: 'size', type: '"md" | "lg" | "xl"', default: '"lg"', description: 'Text 13 / 14 / 16 px.' },
    { name: 'invalid', type: 'boolean', default: 'false', description: 'Danger-subtle fill, danger ring, aria-invalid.' },
    { name: 'rows', type: 'number', default: '3', description: 'Visible lines. The user can resize it vertically.' },
    { name: 'value / defaultValue', type: 'string', description: 'Controlled or uncontrolled text.' },
    { name: 'onValueChange', type: '(value: string) => void', description: 'Called with the new text.' },
    { name: 'ref', type: 'Ref<HTMLTextAreaElement>', description: 'The native <textarea>.' },
  ],
  guidelines: {
    do: ['Show the character limit in the description when there is one.', 'Put it in a Field with a visible label.'],
    dont: ['Do not use a textarea for one line of text. Use Input.'],
  },
  notes: [
    'The shipped app code (Textarea.svelte) is the source of truth (decision, 12 Nov 2026). Wonder is the visual reference.',
    'The app has sizes MD / LG / XL and no ghost. Wonder shows a ghost Textarea; this port keeps it (transparent, border-focus ring on focus, as Input ghost). The app does not use it. MD and XL are not on the Wonder page.',
    'As in the app: no paint transition, no shake, and the disabled field keeps the control shadow.',
    'Built on Base UI Field.Control with render={<textarea />}, so it takes its label, description and invalid state from a Field.',
  ],
}
