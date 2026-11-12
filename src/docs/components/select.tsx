import { Calendar03Icon, Tick02Icon } from '@hugeicons/core-free-icons'

import { Icon } from '@/components/ui/icon'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  selectGroupLabelClassName,
  selectItemVariants,
  selectPopupClassName,
  selectSeparatorClassName,
} from '@/components/ui/select'
import type { ComponentDoc, MatrixAxisItem, PropValue } from '@/docs/types'
import { indent, toJsx } from '@/gallery/jsx'
import { cn } from '@/lib/utils'
import selectSource from '@/registry/ui/select.tsx?raw'

type Size = 'sm' | 'md' | 'lg' | 'xl'
type Variant = 'default' | 'ghost'

const SIZES = ['sm', 'md', 'lg', 'xl'] as const
const PERIODS = [
  { value: 'harian', label: 'Harian' },
  { value: 'bulanan', label: 'Bulanan' },
  { value: 'tahunan', label: 'Tahunan' },
]

const STATES: MatrixAxisItem[] = [
  { label: 'Placeholder', props: { empty: true } },
  { label: 'Value' },
  { label: 'Hover', force: 'hover' },
  { label: 'Focus', force: 'focus' },
  { label: 'Open', force: 'open' },
  { label: 'Invalid', props: { invalid: true } },
  { label: 'Disabled', props: { disabled: true } },
]

const TRIGGER_DEFAULTS = { variant: 'default', size: 'lg', tone: 'default' }

function render(props: Record<string, PropValue>, force?: string) {
  return (
    <Select
      key={String(props.empty)}
      items={PERIODS}
      defaultValue={props.empty ? null : 'bulanan'}
      disabled={Boolean(props.disabled)}
    >
      <SelectTrigger
        aria-label="Periode"
        variant={props.variant as Variant}
        size={props.size as Size}
        tone={props.tone as 'default' | 'active'}
        aria-invalid={props.invalid ? true : undefined}
        data-force-state={force}
      >
        {props.leading ? <Icon icon={Calendar03Icon} className="text-ink-2" /> : null}
        <SelectValue placeholder={String(props.placeholder ?? 'Pilih periode')} />
      </SelectTrigger>
      <SelectContent>
        {PERIODS.map((p) => (
          <SelectItem key={p.value} value={p.value}>
            {p.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

function code(props: Record<string, PropValue>) {
  const { variant, size, tone, invalid, disabled, empty, placeholder = 'Pilih periode', leading } = props
  const trigger = toJsx(
    'SelectTrigger',
    { 'aria-label': 'Periode', variant, size, tone, 'aria-invalid': invalid },
    [leading ? '<Icon icon={Calendar03Icon} />' : '', toJsx('SelectValue', { placeholder })].filter(Boolean).join('\n'),
    TRIGGER_DEFAULTS,
  )
  const content = toJsx(
    'SelectContent',
    {},
    PERIODS.map((p) => `<SelectItem value="${p.value}">${p.label}</SelectItem>`).join('\n'),
  )
  const root = `<Select items={periods}${empty ? '' : ' defaultValue="bulanan"'}${disabled ? ' disabled' : ''}>`
  return `${root}\n${indent(`${trigger}\n${content}`)}\n</Select>`
}

/* A static drawing of the open popup, built from the exported classes. The real popup is portalled. */
function StaticItem({
  children,
  selected,
  highlighted,
  disabled,
  tone,
}: {
  children: string
  selected?: boolean
  highlighted?: boolean
  disabled?: boolean
  tone?: 'action'
}) {
  return (
    <div
      className={selectItemVariants({ tone })}
      data-highlighted={highlighted ? '' : undefined}
      data-disabled={disabled ? '' : undefined}
    >
      <span className="min-w-0 flex-1 truncate">{children}</span>
      {selected ? <Icon icon={Tick02Icon} className="text-ink" /> : null}
    </div>
  )
}

function PopupSpecimen({ kind }: { kind: string }) {
  return (
    <div className={cn(selectPopupClassName, 'w-56 animate-none')}>
      {kind === 'grouped' ? (
        <>
          <div className={selectGroupLabelClassName}>Operasional</div>
          <StaticItem selected>Transportasi</StaticItem>
          <StaticItem highlighted>Makan</StaticItem>
          <div className={selectSeparatorClassName} />
          <div className={selectGroupLabelClassName}>Pemasaran</div>
          <StaticItem>Iklan</StaticItem>
          <StaticItem disabled>Event</StaticItem>
        </>
      ) : kind === 'action' ? (
        <>
          <StaticItem selected>Andi Pratama</StaticItem>
          <StaticItem>Sari Wulandari</StaticItem>
          <div className={selectSeparatorClassName} />
          <StaticItem tone="action">+ Tambah pemegang kartu</StaticItem>
        </>
      ) : (
        <>
          <StaticItem>Harian</StaticItem>
          <StaticItem selected highlighted>
            Bulanan
          </StaticItem>
          <StaticItem>Tahunan</StaticItem>
          <StaticItem disabled>Kustom</StaticItem>
        </>
      )}
    </div>
  )
}

export const doc: ComponentDoc = {
  slug: 'select',
  name: 'Select',
  group: 'Forms',
  description:
    'Picks one value from a short list. The trigger has the Input chrome; the menu is a listbox. Never a native <select>.',
  spec: 'wonder',
  wonderRef: 'Mayar Forms Inputs Guide › Select / Combobox',
  registry: 'select',
  baseUi: { name: 'Select', url: 'https://base-ui.com/react/components/select' },
  source: [{ path: 'components/ui/select.tsx', code: selectSource }],
  playground: {
    controls: [
      { name: 'variant', type: 'select', options: ['default', 'ghost'], default: 'default' },
      { name: 'size', type: 'select', options: SIZES, default: 'lg' },
      { name: 'tone', type: 'select', options: ['default', 'active'], default: 'default' },
      { name: 'placeholder', type: 'text', default: 'Pilih periode' },
      { name: 'empty', label: 'no value', type: 'boolean', default: false },
      { name: 'leading', label: 'leading icon', type: 'boolean', default: false },
      { name: 'invalid', type: 'boolean', default: false },
      { name: 'disabled', type: 'boolean', default: false },
    ],
    render: (values) => <div className="w-64">{render(values)}</div>,
    code,
  },
  matrices: [
    {
      title: 'Sizes × states (default)',
      description: 'SM 28 / MD 32 / LG 36 / XL 40. Hover, focus and open are forced.',
      rows: SIZES.map((s) => ({ label: s.toUpperCase(), props: { size: s } })),
      columns: STATES,
      render,
      code,
      cellWidth: 168,
    },
    {
      title: 'Variants × states (LG)',
      rows: [
        { label: 'Default', props: { variant: 'default' } },
        { label: 'Ghost', props: { variant: 'ghost' } },
        { label: 'Active filter', props: { tone: 'active' }, codeOnly: true },
        { label: 'Leading icon', props: { leading: true }, codeOnly: true },
      ],
      columns: STATES,
      render,
      code,
      cellWidth: 168,
    },
    {
      title: 'Open menu',
      description:
        'A static drawing of the popup: radius xl, 4px padding, popover shadow, 32px rows, a tick on the selected row, a wash on the highlighted row.',
      rows: [
        { label: 'List', props: { kind: 'list' } },
        { label: 'Groups + separator', props: { kind: 'grouped' } },
        { label: 'Action row', props: { kind: 'action' }, codeOnly: true },
      ],
      columns: [{ label: 'Open' }],
      render: (props) => <PopupSpecimen kind={String(props.kind)} />,
      code: (props) =>
        props.kind === 'grouped'
          ? `<SelectContent>\n  <SelectGroup>\n    <SelectGroupLabel>Operasional</SelectGroupLabel>\n    <SelectItem value="transportasi">Transportasi</SelectItem>\n  </SelectGroup>\n  <SelectSeparator />\n  …\n</SelectContent>`
          : props.kind === 'action'
            ? `<SelectSeparator />\n<SelectItem value="__new" tone="action">+ Tambah pemegang kartu</SelectItem>`
            : `<SelectContent>\n  <SelectItem value="harian">Harian</SelectItem>\n  <SelectItem value="kustom" disabled>Kustom</SelectItem>\n</SelectContent>`,
      cellWidth: 240,
    },
  ],
  examples: [
    { id: 'select/basic', title: 'Basic', description: 'Pass items so SelectValue shows the label of the value.' },
    { id: 'select/groups', title: 'Groups', description: 'A separator goes only between groups.' },
    { id: 'select/in-field', title: 'In a Field', description: 'Field.Label names the trigger; Field.Root invalid paints it.' },
    { id: 'select/in-dialog', title: 'In a dialog', description: 'The menu opens over the dialog; Esc closes only the menu.' },
    { id: 'select/filter', title: 'Filter (active tone)', description: 'A set toolbar filter with custom closed text.', codeOnly: true },
  ],
  props: [
    { name: 'Select value / defaultValue', type: 'Value | null', description: 'Controlled / uncontrolled value.' },
    { name: 'Select onValueChange', type: '(value, details) => void', description: 'Called with the new value.' },
    { name: 'Select items', type: '{ value, label }[] | Record<string, ReactNode>', description: 'Labels, so SelectValue can show the label before the popup mounts.' },
    { name: 'Select name / disabled / required', type: 'string / boolean', description: 'Form props.' },
    { name: 'SelectTrigger variant', type: '"default" | "ghost"', default: '"default"', description: 'Ghost has no fill and no ring until focus.' },
    { name: 'SelectTrigger size', type: '"sm" | "md" | "lg" | "xl"', default: '"lg"', description: 'Height 28 / 32 / 36 / 40.' },
    { name: 'SelectTrigger tone', type: '"default" | "active"', default: '"default"', description: 'Active paints a filter that is set (code-only).' },
    { name: 'SelectTrigger aria-invalid', type: 'boolean', description: 'Error: danger-subtle fill and danger ring. Field.Root invalid does the same.' },
    { name: 'SelectValue placeholder', type: 'ReactNode', description: 'Text when there is no value.' },
    { name: 'SelectValue children', type: 'ReactNode | (value) => ReactNode', description: 'Other closed text, e.g. "Paket: Business".' },
    { name: 'SelectContent side / align / sideOffset', type: 'Base UI Positioner', default: '"bottom" / "start" / 4', description: 'Placement.' },
    { name: 'SelectContent alignItemWithTrigger', type: 'boolean', default: 'false', description: 'Overlap the trigger like a native select.' },
    { name: 'SelectItem tone', type: '"default" | "action"', default: '"default"', description: 'Action paints a shortcut row in primary (code-only).' },
  ],
  guidelines: {
    do: [
      'Use Select for a short list (up to about 10 options) with no typing.',
      'Give every Select a label: a Field.Label, or aria-label on the trigger.',
      'Use Combobox when the user must type to find the option.',
    ],
    dont: ['Do not use a native <select> or <datalist>.', 'Do not show a form error as a toast. Use the invalid state and the Field error.'],
  },
  notes: [
    'Wonder was not reachable while this port was made. Values come from Select.svelte, which was built from the Wonder specimen; check them against Wonder.',
    'The menu uses z-(--z-modal) like the app (design/forms.md: "Select / Combobox menus --v2-z-modal"), not --z-dropdown: a menu in a Dialog (z-modal) or Popover (z-popover) must paint over it.',
    'The app portals the menu into an open <dialog>. With Base UI the menu portals to <body> and Base UI nests it in the Dialog\'s floating tree, so outside click and Esc close only the menu.',
    'invalid is aria-invalid on the trigger (or Field.Root invalid), not a separate prop.',
    'The app shakes the Select on an invalid submit (is-shaking). This port leaves that to the Field; use animate-shake on the trigger if you need it.',
    'The active tone, the action row and the leading icon come from the app and are not on the Wonder page.',
    'The app test helpers (pickSelectOption, readSelectOptions) are ported into select.test.tsx.',
  ],
}
