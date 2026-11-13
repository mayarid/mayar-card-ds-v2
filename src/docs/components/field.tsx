import { Field, FieldDescription, FieldError, FieldHeader, FieldLabel, FieldPair, FieldPairLegend } from '@/components/ui/field'
import { Input, InputPrefix } from '@/components/ui/input'
import type { ComponentDoc, PropValue } from '@/docs/types'
import { indent } from '@/gallery/jsx'
import fieldSource from '@/registry/ui/field.tsx?raw'

type Kind = 'label' | 'required' | 'optional' | 'description' | 'error' | 'amount' | 'disabled' | 'counter' | 'pair'

const KINDS: { kind: Kind; label: string; codeOnly?: boolean }[] = [
  { kind: 'label', label: 'Label' },
  { kind: 'required', label: 'Required' },
  { kind: 'optional', label: 'Optional' },
  { kind: 'description', label: 'Description' },
  { kind: 'error', label: 'Error' },
  { kind: 'amount', label: 'Amount' },
  { kind: 'disabled', label: 'Disabled' },
  { kind: 'pair', label: 'Inline pair' },
  { kind: 'counter', label: 'Counter', codeOnly: true },
]

function render(props: Record<string, PropValue>) {
  const kind = (props.kind ?? 'label') as Kind
  const label = String(props.label ?? 'Nama kartu')
  const value = props.filled ? (kind === 'amount' ? '150.000' : 'Iklan Meta') : undefined
  const invalid = kind === 'error' || Boolean(props.invalid)
  const description = String(props.description ?? 'Tampil di daftar kartu.')

  if (kind === 'pair') {
    return (
      <FieldPair className="w-64">
        <FieldPairLegend className="sr-only">Masa berlaku</FieldPairLegend>
        <Field>
          <FieldLabel required>Bulan</FieldLabel>
          <Input placeholder="MM" defaultValue={props.filled ? '12' : undefined} />
        </Field>
        <Field>
          <FieldLabel required>Tahun</FieldLabel>
          <Input placeholder="YYYY" defaultValue={props.filled ? '2028' : undefined} />
        </Field>
      </FieldPair>
    )
  }

  return (
    <Field key={String(value)} className="w-64" invalid={invalid} disabled={kind === 'disabled' || Boolean(props.disabled)}>
      {kind === 'counter' ? (
        <FieldHeader>
          <FieldLabel required>NIK</FieldLabel>
          <span className="text-caption-lg text-muted">{props.filled ? '16' : '0'}/16</span>
        </FieldHeader>
      ) : (
        <FieldLabel required={kind === 'required'} optional={kind === 'optional'}>
          {kind === 'amount' ? 'Nominal' : label}
        </FieldLabel>
      )}
      <Input
        placeholder={kind === 'amount' ? '0' : 'Contoh: Iklan Meta'}
        defaultValue={value}
        leading={kind === 'amount' ? <InputPrefix>Rp</InputPrefix> : undefined}
      />
      {kind === 'description' || kind === 'amount' || props.withDescription ? (
        <FieldDescription>{kind === 'amount' ? 'Maksimal Rp10.000.000.' : description}</FieldDescription>
      ) : null}
      {invalid ? <FieldError>{String(props.error ?? 'Nama kartu wajib diisi.')}</FieldError> : null}
    </Field>
  )
}

function code(props: Record<string, PropValue>) {
  const kind = (props.kind ?? 'label') as Kind
  const value = props.filled ? (kind === 'amount' ? ' defaultValue="150.000"' : ' defaultValue="Iklan Meta"') : ''
  if (kind === 'pair') {
    return `<FieldPair>
  <FieldPairLegend className="sr-only">Masa berlaku</FieldPairLegend>
  <Field>
    <FieldLabel required>Bulan</FieldLabel>
    <Input placeholder="MM" />
  </Field>
  <Field>
    <FieldLabel required>Tahun</FieldLabel>
    <Input placeholder="YYYY" />
  </Field>
</FieldPair>`
  }
  const invalid = kind === 'error' || Boolean(props.invalid)
  const rootAttrs = [invalid ? ' invalid' : '', kind === 'disabled' || props.disabled ? ' disabled' : ''].join('')
  const lines: string[] = []
  if (kind === 'counter') {
    lines.push('<FieldHeader>', '  <FieldLabel required>NIK</FieldLabel>', '  <span>{nik.length}/16</span>', '</FieldHeader>')
  } else {
    const flag = kind === 'required' ? ' required' : kind === 'optional' ? ' optional' : ''
    lines.push(`<FieldLabel${flag}>${kind === 'amount' ? 'Nominal' : String(props.label ?? 'Nama kartu')}</FieldLabel>`)
  }
  lines.push(kind === 'amount' ? `<Input${value} leading={<InputPrefix>Rp</InputPrefix>} />` : `<Input${value} />`)
  if (kind === 'description' || kind === 'amount' || props.withDescription) {
    lines.push(`<FieldDescription>${kind === 'amount' ? 'Maksimal Rp10.000.000.' : String(props.description ?? 'Tampil di daftar kartu.')}</FieldDescription>`)
  }
  if (invalid) lines.push(`<FieldError>${String(props.error ?? 'Nama kartu wajib diisi.')}</FieldError>`)
  return `<Field${rootAttrs}>\n${indent(lines.join('\n'))}\n</Field>`
}

export const doc: ComponentDoc = {
  slug: 'field',
  name: 'Field',
  group: 'Forms',
  description: 'Wraps a form control with its label, description and error, and wires them for assistive tech.',
  spec: 'wonder',
  wonderRef: 'Mayar Forms Inputs Guide › Field',
  registry: 'field',
  baseUi: { name: 'Field', url: 'https://base-ui.com/react/components/field' },
  source: [{ path: 'components/ui/field.tsx', code: fieldSource }],
  playground: {
    controls: [
      { name: 'label', type: 'text', default: 'Nama kartu' },
      { name: 'kind', label: 'marker', type: 'select', options: ['label', 'required', 'optional'], default: 'required' },
      { name: 'withDescription', label: 'description', type: 'boolean', default: true },
      { name: 'description', label: 'description text', type: 'text', default: 'Tampil di daftar kartu.' },
      { name: 'invalid', type: 'boolean', default: false },
      { name: 'error', label: 'error text', type: 'text', default: 'Nama kartu wajib diisi.' },
      { name: 'disabled', type: 'boolean', default: false },
    ],
    render: (values) => render(values),
    code,
  },
  matrices: [
    {
      title: 'Parts × value',
      description: 'Each field part, empty and filled. The error replaces the description.',
      rows: KINDS.map(({ kind, label, codeOnly }) => ({ label, props: { kind }, codeOnly })),
      columns: [{ label: 'Empty' }, { label: 'Filled', props: { filled: true } }],
      render,
      code,
      cellWidth: 280,
    },
  ],
  examples: [
    { id: 'field/basic', title: 'Label, marker and description', description: 'Required, optional and disabled.' },
    { id: 'field/validation', title: 'Validation on submit', description: 'Set invalid, render FieldError and change shakeSignal after a submit. The field shakes once.' },
    { id: 'field/pair', title: 'Inline pair', description: 'Two fields that answer one question, with a shared description.' },
    { id: 'field/with-counter', title: 'Counter in the label row', description: 'FieldHeader puts content at the end of the label row.', codeOnly: true },
    { id: 'input/amount', title: 'Amount', description: 'Input with the "Rp" prefix.' },
  ],
  props: [
    { name: 'Field · invalid', type: 'boolean', description: 'Marks the control invalid (aria-invalid and the invalid paint).' },
    { name: 'Field · shakeSignal', type: 'number | string', description: 'Opt-in error shake. Change it after a failed submit or blur: the control and error shake once if the field is invalid. The label stays still. Never on mount or typing.' },
    { name: 'Field · disabled', type: 'boolean', default: 'false', description: 'Disables the control.' },
    { name: 'Field · name / validate / validationMode', type: 'Base UI Field.Root', description: 'Base UI validation. See the Base UI Field docs.' },
    { name: 'FieldLabel · required', type: 'boolean', default: 'false', description: 'A red "*" (hidden from assistive tech). Also set required on the control.' },
    { name: 'FieldLabel · optional', type: 'boolean', default: 'false', description: 'A muted "(opsional)" after the text.' },
    { name: 'FieldLabel · optionalLabel', type: 'string', default: '"(opsional)"', description: 'Text of the optional marker.' },
    { name: 'FieldError · match', type: 'boolean | keyof ValidityState', default: 'true with children', description: 'When it shows. With children and no match it always shows.' },
    { name: 'FieldHeader', type: 'div', description: 'Label row with content at its end (a counter, a badge).' },
    { name: 'FieldPair / FieldPairLegend', type: 'Base UI Fieldset', description: 'Two fields in a two-column grid, named by the legend. FieldPair also takes shakeSignal.' },
  ],
  guidelines: {
    do: [
      'Give every control a visible label.',
      'Write the error as what to do next: "Masukkan email yang valid".',
      'Use FieldPair only for two values of one thing (month and year).',
    ],
    dont: ['Do not show a form error as a toast.', 'Do not put a description and an error at the same time; the error replaces it.'],
  },
  notes: [
    'The shipped app code (Field.svelte) is the source of truth (decision, 12 Nov 2026). Wonder is the visual reference.',
    'Field.svelte took label, helper and error as props and gave the child snippet { id, describedBy, invalid }. This port uses compound parts on Base UI Field, so ids and aria-describedby are automatic.',
    'The Svelte "aside" snippet is FieldHeader here and is code-only (KYC / Register v2).',
    'The Svelte pair put one helper or error under the grid for both controls. Here a FieldPair takes any element after the two fields across both columns; link it with aria-describedby on the FieldPair.',
    'As in the app, the shake is opt-in: change shakeSignal after a failed submit. The control and message rows shake (280ms: 2 × shake-a + 2 × shake-b, smooth-out); the label does not. A change of invalid alone does not shake.',
    'In the app, "(opsional)" sits outside the <label>. Here it is inside FieldLabel, so it is part of the accessible name.',
  ],
}
