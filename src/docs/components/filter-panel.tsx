import { Calendar03Icon } from '@hugeicons/core-free-icons'

import {
  FilterActiveBar,
  FilterChip,
  FilterChipClearAll,
  FilterChipList,
  FilterEmptyResult,
  FilterPanel,
  FilterPanelAmount,
  FilterPanelChecklist,
  FilterPanelChips,
  FilterPanelContent,
  FilterPanelDateRange,
  FilterPanelSection,
  FilterPanelSelect,
  FilterPanelTrigger,
  FilterResultCount,
  type FilterValues,
} from '@/components/ui/filter-panel'
import type { ComponentDoc, MatrixAxisItem, PropValue } from '@/docs/types'
import filterPanelSource from '@/registry/ui/filter-panel.tsx?raw'

const TODAY = '2026-11-12'

const STATUS = [
  { value: 'settled', label: 'Berhasil' },
  { value: 'pending', label: 'Menunggu' },
  { value: 'declined', label: 'Ditolak' },
  { value: 'reversed', label: 'Dibalik' },
]
const TYPES = [
  { value: 'purchase', label: 'Pembayaran' },
  { value: 'topup', label: 'Top-up Saldo' },
  { value: 'refund', label: 'Pengembalian Dana' },
  { value: 'reversal', label: 'Pembalikan' },
  { value: 'fee', label: 'Biaya Penolakan' },
  { value: 'adjustment', label: 'Penyesuaian' },
]
const CARDS = [
  { value: 'ops', label: 'Operasional Jakarta', description: '•••• 4821' },
  { value: 'ads', label: 'Iklan Meta', description: '•••• 1907' },
  { value: 'saas', label: 'Langganan SaaS', description: '•••• 7735' },
]
const SOURCES = [
  { value: 'account', label: 'Saldo Akun Perusahaan' },
  { value: 'qris-rina', label: 'QRIS — Rina Wulandari' },
]

type SectionKind = 'status' | 'type' | 'card' | 'amount' | 'source' | 'date'

const SECTION_CODE: Record<SectionKind, string> = {
  status: '<FilterPanelSection label="Status">\n  <FilterPanelChips name="status" options={statuses} />\n</FilterPanelSection>',
  type: '<FilterPanelSection label="Tipe">\n  <FilterPanelChips name="type" options={types} />\n</FilterPanelSection>',
  card: '<FilterPanelSection label="Kartu">\n  <FilterPanelChecklist name="card" options={cards} searchable />\n</FilterPanelSection>',
  amount: '<FilterPanelSection label="Jumlah">\n  <FilterPanelAmount name="amount" />\n</FilterPanelSection>',
  source: '<FilterPanelSection label="Sumber">\n  <FilterPanelSelect name="source" options={sources} allLabel="Semua sumber" />\n</FilterPanelSection>',
  date: '<FilterPanelSection label="Rentang">\n  <FilterPanelDateRange name="date" />\n</FilterPanelSection>',
}

function Section({ kind }: { kind: SectionKind }) {
  switch (kind) {
    case 'status':
      return (
        <FilterPanelSection label="Status">
          <FilterPanelChips name="status" options={STATUS} />
        </FilterPanelSection>
      )
    case 'type':
      return (
        <FilterPanelSection label="Tipe">
          <FilterPanelChips name="type" options={TYPES} />
        </FilterPanelSection>
      )
    case 'card':
      return (
        <FilterPanelSection label="Kartu">
          <FilterPanelChecklist name="card" options={CARDS} searchable />
        </FilterPanelSection>
      )
    case 'amount':
      return (
        <FilterPanelSection label="Jumlah">
          <FilterPanelAmount name="amount" />
        </FilterPanelSection>
      )
    case 'source':
      return (
        <FilterPanelSection label="Sumber">
          <FilterPanelSelect name="source" options={SOURCES} allLabel="Semua sumber" />
        </FilterPanelSection>
      )
    case 'date':
      return (
        <FilterPanelSection label="Rentang">
          <FilterPanelDateRange name="date" today={TODAY} />
        </FilterPanelSection>
      )
  }
}

const SPEC_VALUE: FilterValues = { status: 'pending', amount: { min: 100000, max: 500000 }, card: ['ads'] }

function panelCode(kinds: SectionKind[], title = 'Filter') {
  const body = kinds.map((k) => SECTION_CODE[k].split('\n').map((l) => '    ' + l).join('\n')).join('\n')
  return [
    '<FilterPanel value={filters} onValueChange={setFilters}>',
    '  <FilterPanelTrigger>Filter</FilterPanelTrigger>',
    title === 'Filter' ? '  <FilterPanelContent>' : `  <FilterPanelContent title="${title}">`,
    body,
    '  </FilterPanelContent>',
    '</FilterPanel>',
  ].join('\n')
}

/* Trigger matrix */

const TRIGGER_STATES: MatrixAxisItem[] = [
  { label: 'Default' },
  { label: 'Hover', force: 'hover' },
  { label: 'Focus', force: 'focus' },
  { label: 'Open', force: 'open' },
  { label: 'Disabled', props: { disabled: true }, codeOnly: true },
]

function triggerRender(props: Record<string, PropValue>, force?: string) {
  const value: FilterValues = props.active ? { status: 'pending', type: 'purchase' } : {}
  return (
    <FilterPanel defaultValue={value}>
      <FilterPanelTrigger
        icon={props.date ? Calendar03Icon : undefined}
        chevron={Boolean(props.date)}
        count={props.date ? 0 : undefined}
        disabled={Boolean(props.disabled)}
        data-force-state={force}
      >
        {props.date ? '30 hari terakhir' : 'Filter'}
      </FilterPanelTrigger>
    </FilterPanel>
  )
}

function triggerCode(props: Record<string, PropValue>) {
  const dis = props.disabled ? ' disabled' : ''
  if (props.date) return `<FilterPanelTrigger icon={Calendar03Icon} chevron count={0}${dis}>\n  30 hari terakhir\n</FilterPanelTrigger>`
  return `<FilterPanelTrigger${dis}>Filter</FilterPanelTrigger>${props.active ? '\n// 2 filters applied → the count pill shows 2' : ''}`
}

/* Panel matrix */

const PANELS: Array<{ label: string; kinds: SectionKind[]; value?: FilterValues; title?: string; codeOnly?: boolean }> = [
  { label: 'Transaksi (Wonder)', kinds: ['status', 'type', 'amount', 'source'], value: SPEC_VALUE },
  { label: 'Nothing selected', kinds: ['status', 'type', 'amount'] },
  { label: 'Kartu checklist', kinds: ['card'], value: SPEC_VALUE, codeOnly: true },
  { label: 'Tanggal', kinds: ['date'], value: { date: { from: '2026-10-14', to: TODAY } }, title: 'Tanggal' },
]

function panelRender(props: Record<string, PropValue>) {
  const spec = PANELS[Number(props.panel)] ?? PANELS[0]!
  return (
    <FilterPanel defaultValue={spec.value}>
      <FilterPanelContent inline title={spec.title} width={spec.title === 'Tanggal' ? 340 : 380}>
        {spec.kinds.map((k) => (
          <Section key={k} kind={k} />
        ))}
      </FilterPanelContent>
    </FilterPanel>
  )
}

/* Active bar matrix */

const ACTIVE: Array<{ label: string; chips: string[]; count: number }> = [
  { label: 'One filter', chips: ['Status: Menunggu'], count: 2 },
  { label: 'Several filters', chips: ['Tanggal: 30 hari terakhir', 'Status: Menunggu', 'Jumlah: Rp 100.000–500.000'], count: 12 },
  { label: 'No match', chips: ['Status: Ditolak', 'Jumlah: ≥ Rp 10.000.000'], count: 0 },
]

function activeRender(props: Record<string, PropValue>) {
  const spec = ACTIVE[Number(props.active)] ?? ACTIVE[0]!
  return (
    <div className="flex w-[560px] flex-col gap-3">
      <FilterActiveBar>
        <FilterChipList>
          {spec.chips.map((c) => (
            <FilterChip key={c} onRemove={() => {}}>
              {c}
            </FilterChip>
          ))}
          <FilterChipClearAll />
        </FilterChipList>
        <FilterResultCount count={spec.count} />
      </FilterActiveBar>
      {spec.count === 0 ? (
        <div className="rounded-2xl bg-surface shadow-control">
          <FilterEmptyResult onClear={() => {}} />
        </div>
      ) : null}
    </div>
  )
}

function activeCode(props: Record<string, PropValue>) {
  const spec = ACTIVE[Number(props.active)] ?? ACTIVE[0]!
  const lines = [
    '<FilterActiveBar>',
    '  <FilterChipList>',
    ...spec.chips.map((c) => `    <FilterChip onRemove={() => drop('…')}>${c}</FilterChip>`),
    '    <FilterChipClearAll onClick={() => setFilters({})} />',
    '  </FilterChipList>',
    `  <FilterResultCount count={${spec.count}} />`,
    '</FilterActiveBar>',
  ]
  if (spec.count === 0) lines.push('<FilterEmptyResult onClear={() => setFilters({})} />')
  return lines.join('\n')
}

const ALL_KINDS: SectionKind[] = ['status', 'type', 'card', 'amount', 'source', 'date']

export const doc: ComponentDoc = {
  slug: 'filter-panel',
  name: 'Filter Panel',
  group: 'Patterns',
  description: 'A filter button with a count, a panel of filter sections with reset and apply, active filter chips and a no-match state.',
  spec: 'wonder',
  wonderRef: 'Dashboard › Transaksi C Filter Panel / Filter Active / Filter No Match v2',
  registry: 'filter-panel',
  baseUi: { name: 'Popover + ToggleGroup', url: 'https://base-ui.com/react/components/popover' },
  source: [{ path: 'components/ui/filter-panel.tsx', code: filterPanelSource }],
  playground: {
    controls: [
      { name: 'status', label: 'Status chips', type: 'boolean', default: true },
      { name: 'type', label: 'Tipe chips', type: 'boolean', default: true },
      { name: 'card', label: 'Kartu checklist', type: 'boolean', default: true },
      { name: 'amount', label: 'Jumlah', type: 'boolean', default: true },
      { name: 'source', label: 'Sumber select', type: 'boolean', default: false },
      { name: 'date', label: 'Tanggal', type: 'boolean', default: false },
      { name: 'title', type: 'text', default: 'Filter' },
    ],
    render: (values) => {
      const kinds = ALL_KINDS.filter((k) => values[k])
      return (
        <FilterPanel defaultValue={{ status: 'pending' }}>
          <FilterPanelTrigger>Filter</FilterPanelTrigger>
          <FilterPanelContent title={String(values.title || 'Filter')} align="start">
            {kinds.map((k) => (
              <Section key={k} kind={k} />
            ))}
          </FilterPanelContent>
        </FilterPanel>
      )
    },
    code: (values) => panelCode(ALL_KINDS.filter((k) => values[k]), String(values.title || 'Filter')),
  },
  matrices: [
    {
      title: 'Trigger × states',
      description: 'Hover and open are canvas (as the app), focus is the outline. The count pill shows the applied filters.',
      rows: [
        { label: 'No filters', props: {} },
        { label: 'Active (count)', props: { active: true } },
        { label: 'Date (chevron)', props: { date: true } },
      ],
      columns: TRIGGER_STATES,
      render: triggerRender,
      code: triggerCode,
    },
    {
      title: 'Open panel (static)',
      description: 'The panel as a static surface. Status and Tipe chips take one choice (as the app); "Terapkan (N)" counts the draft filters of this panel.',
      rows: PANELS.map((p, i) => ({ label: p.label, props: { panel: i }, codeOnly: p.codeOnly })),
      columns: [{ label: 'Open' }],
      render: panelRender,
      code: (props) => {
        const spec = PANELS[Number(props.panel)] ?? PANELS[0]!
        return panelCode(spec.kinds, spec.title)
      },
      cellWidth: 400,
    },
    {
      title: 'Active filters and no match',
      description: 'Chips with ×, "Hapus filter" and the result count. With 0 results the list shows the no-match state.',
      rows: ACTIVE.map((a, i) => ({ label: a.label, props: { active: i } })),
      columns: [{ label: 'Applied' }],
      render: activeRender,
      code: activeCode,
      cellWidth: 580,
    },
  ],
  examples: [
    {
      id: 'filter-panel/transactions',
      title: 'Transaksi toolbar',
      description: 'Search, a date button and the Filter panel share one value. Chips show what is applied; 0 rows show the no-match state.',
    },
    {
      id: 'filter-panel/card-status',
      title: 'Card status checklist',
      description: 'One checkbox section with counts, aligned to the start of the trigger.',
      codeOnly: true,
    },
    { id: 'filter-panel/no-match', title: 'No match', description: 'Remove a chip or clear all to leave the no-match state.' },
  ],
  props: [
    { name: 'value / defaultValue / onValueChange', type: 'FilterValues', description: 'The applied filters: { [name]: string | string[] | { min, max } | { from, to } }. onValueChange fires on "Terapkan" with empty filters dropped.' },
    { name: 'open / defaultOpen / onOpenChange', type: 'boolean', description: 'The panel open state. Each open seeds the draft from the applied value.' },
    { name: 'countExclude', type: 'string[]', description: 'Keys the trigger count leaves out (e.g. "date" with its own button).' },
    { name: 'FilterPanelTrigger icon / chevron / count', type: 'IconSvgElement | null / boolean / number', default: 'filter icon / false / applied count', description: 'Leading glyph, trailing chevron (date button), count pill override.' },
    { name: 'FilterPanelContent title / width / align', type: 'ReactNode | null / number / "start" | "end"', default: '"Filter" / 380 / "end"', description: 'Header title (null drops the header), panel width, edge of the trigger.' },
    { name: 'FilterPanelContent resetLabel / cancelLabel / applyLabel / footerStart', type: 'string / ReactNode', description: '"Atur ulang", "Batal", "Terapkan" (+ " (N)"), content at the footer start.' },
    { name: 'FilterPanelContent inline', type: 'boolean', default: 'false', description: 'In the page flow, not anchored. For docs and specimens.' },
    { name: 'FilterPanelSection label', type: 'string', description: 'The section label. It names the control inside.' },
    { name: 'FilterPanelChips name / options / multiple', type: 'string / FilterOption[] / boolean', default: 'multiple: false', description: 'The Toggle Group SM chips. One value (a string) by default, as the app; multiple for a list.' },
    { name: 'FilterPanelChecklist name / options / searchable / emptyLabel', type: 'string / FilterOption[] / boolean / string', description: 'Checkbox list with optional search and the "Tidak ada kartu" hint.' },
    { name: 'FilterPanelSelect name / options / allLabel', type: 'string / FilterOption[] / string', description: 'One value from a short list; the "all" row clears it.' },
    { name: 'FilterPanelAmount name', type: 'string', description: 'Mode track + Rp inputs. Value { min, max }.' },
    { name: 'FilterPanelDateRange name / today', type: 'string / "YYYY-MM-DD"', description: 'Preset chips + "Dari" / "Sampai". Value { from, to }, inclusive.' },
    { name: 'FilterChip onRemove / label', type: '() => void / string', description: 'One applied filter. The × is named "Hapus filter {label}".' },
    { name: 'FilterResultCount count / noun', type: 'number / string', default: 'noun: "transaksi"', description: '"12 transaksi", a polite status.' },
    { name: 'FilterEmptyResult title / description / onClear', type: 'ReactNode / () => void', description: 'The no-match state with "Hapus filter".' },
    { name: 'countFilters, formatAmountRange, formatDateRange, dateRangeLabel, datePresetRange, formatRupiah', type: 'helpers', description: 'Counting and id-ID formatting for chips and labels.' },
  ],
  guidelines: {
    do: [
      'Show every applied filter as a chip, with the section name first ("Status: Menunggu").',
      'Put the date range in its own button with a chevron, and leave it out of the Filter count (countExclude).',
      'Show the result count next to the chips, and the no-match state with "Hapus filter" when it is 0.',
    ],
    dont: [
      'Do not apply a filter on each click inside the panel: "Terapkan" commits, "Batal" discards.',
      'Do not use the panel for one simple choice that applies at once: use a Select or a Toggle Group.',
    ],
  },
  notes: [
    'The shipped app code is the source of truth (decision 2026-11-12). Wonder is the visual reference only.',
    'Open trigger: the app fills it with canvas (the hover colour) and eases only background-color; the trigger has a pointer cursor. Wonder fills the open trigger with component.',
    'Panel shadow: the app uses the Popover elevation (shadow-popover). Wonder shows ring + 0 16px 32px shadow-modal.',
    'Status, Tipe and Struk chips: the app allows one choice each (its Toggle Group SM, a press on the pressed chip keeps it on). FilterPanelChips does the same by default; pass multiple for a list. Wonder shows multi-select chips (Pending and Gagal both on) with a transparent fill.',
    'Status labels follow the app: Berhasil, Menunggu, Ditolak, Dibalik. Wonder writes "Pending" and "Gagal".',
    'Amount and ID inputs: the app uses Input LG (radius xl) with the default "Rp" prefix (ink-2 medium). Wonder shows radius lg at 36px and a muted prefix.',
    'Sumber: the app trigger is 36px, radius lg, with a pointer cursor; FilterPanelSelect uses the Select LG trigger with rounded-lg, cursor-pointer and an eased hover fill.',
    'Date: the app pairs presets with a range calendar (DateRangeCalendar). This port skips the calendar: preset chips (one choice) and two native date inputs.',
    'The ID Transaksi text field is not a part: put an Input in a FilterPanelSection and set the draft through useFilterPanel().setField.',
    'The Wonder Kartu checklist board ("Card Filter Status Checklist") is a non-v2 hex specimen; the checklist uses the v2 Checkbox and is marked code-only.',
  ],
}
