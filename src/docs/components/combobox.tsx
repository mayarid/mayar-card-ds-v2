import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxEmptyDescription,
  ComboboxEmptyTitle,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxStatus,
  ComboboxTrigger,
  ComboboxValue,
  comboboxPopupClassName,
} from '@/components/ui/combobox'
import { selectPopupClassName } from '@/components/ui/select'
import type { ComponentDoc, MatrixAxisItem, PropValue } from '@/docs/types'
import { indent, toJsx } from '@/gallery/jsx'
import { cn } from '@/lib/utils'
import comboboxSource from '@/registry/ui/combobox.tsx?raw'

type Size = 'sm' | 'md' | 'lg' | 'xl'
type Variant = 'default' | 'ghost'
interface Team {
  value: string
  label: string
}

const SIZES = ['sm', 'md', 'lg', 'xl'] as const
const TEAMS: Team[] = [
  { value: 'marketing', label: 'Marketing' },
  { value: 'marketplace', label: 'Marketplace' },
  { value: 'merchandising', label: 'Merchandising' },
  { value: 'finance', label: 'Finance' },
  { value: 'operasional', label: 'Operasional' },
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

const TRIGGER_DEFAULTS = { variant: 'default', size: 'lg' }

function Popup({ loading }: { loading?: boolean }) {
  return (
    <>
      <ComboboxInput aria-label="Cari tim" />
      {loading ? (
        <ComboboxStatus>Memuat hasil…</ComboboxStatus>
      ) : (
        <ComboboxEmpty>
          <ComboboxEmptyTitle>Tim tidak ditemukan</ComboboxEmptyTitle>
          <ComboboxEmptyDescription>Periksa ejaan atau buat tim baru.</ComboboxEmptyDescription>
        </ComboboxEmpty>
      )}
      <ComboboxList>
        {(team: Team) => (
          <ComboboxItem key={team.value} value={team}>
            {team.label}
          </ComboboxItem>
        )}
      </ComboboxList>
    </>
  )
}

function render(props: Record<string, PropValue>, force?: string) {
  return (
    <Combobox
      key={String(props.empty)}
      items={props.loading ? [] : TEAMS}
      defaultValue={props.empty ? null : TEAMS[0]}
      disabled={Boolean(props.disabled)}
    >
      <ComboboxTrigger
        aria-label="Tim"
        variant={props.variant as Variant}
        size={props.size as Size}
        aria-invalid={props.invalid ? true : undefined}
        data-force-state={force}
      >
        <ComboboxValue placeholder={String(props.placeholder ?? 'Pilih tim')} />
      </ComboboxTrigger>
      <ComboboxContent>
        <Popup loading={Boolean(props.loading)} />
      </ComboboxContent>
    </Combobox>
  )
}

function code(props: Record<string, PropValue>) {
  const { variant, size, invalid, disabled, empty, loading, placeholder = 'Pilih tim' } = props
  const trigger = toJsx(
    'ComboboxTrigger',
    { 'aria-label': 'Tim', variant, size, 'aria-invalid': invalid },
    toJsx('ComboboxValue', { placeholder }),
    TRIGGER_DEFAULTS,
  )
  const state = loading
    ? '<ComboboxStatus>Memuat hasil…</ComboboxStatus>'
    : '<ComboboxEmpty>\n  <ComboboxEmptyTitle>Tim tidak ditemukan</ComboboxEmptyTitle>\n  <ComboboxEmptyDescription>Periksa ejaan atau buat tim baru.</ComboboxEmptyDescription>\n</ComboboxEmpty>'
  const list =
    '<ComboboxList>\n  {(team) => (\n    <ComboboxItem key={team.value} value={team}>\n      {team.label}\n    </ComboboxItem>\n  )}\n</ComboboxList>'
  const content = `<ComboboxContent>\n${indent(`<ComboboxInput aria-label="Cari tim" />\n${state}\n${list}`)}\n</ComboboxContent>`
  const root = `<Combobox items={teams}${empty ? '' : ' defaultValue={teams[0]}'}${disabled ? ' disabled' : ''}>`
  return `${root}\n${indent(`${trigger}\n${content}`)}\n</Combobox>`
}

/* The open popup, drawn in place with Base UI `inline` mode (no portal, no focus move). */
function PopupSpecimen({ query, loading }: { query: string; loading?: boolean }) {
  return (
    <Combobox items={loading ? [] : TEAMS} inline open defaultInputValue={query} defaultValue={TEAMS[0]}>
      <div className={cn(selectPopupClassName, comboboxPopupClassName, 'w-60 animate-none')}>
        <Popup loading={loading} />
      </div>
    </Combobox>
  )
}

export const doc: ComponentDoc = {
  slug: 'combobox',
  name: 'Combobox',
  group: 'Forms',
  description:
    'Picks one value from a long list, with a search row inside the popup. Empty and loading are separate states.',
  spec: 'wonder',
  wonderRef: 'Mayar Forms Inputs Guide › Select / Combobox (open, combobox, empty)',
  registry: 'combobox',
  baseUi: { name: 'Combobox', url: 'https://base-ui.com/react/components/combobox' },
  source: [{ path: 'components/ui/combobox.tsx', code: comboboxSource }],
  playground: {
    controls: [
      { name: 'variant', type: 'select', options: ['default', 'ghost'], default: 'default' },
      { name: 'size', type: 'select', options: SIZES, default: 'lg' },
      { name: 'placeholder', type: 'text', default: 'Pilih tim' },
      { name: 'empty', label: 'no value', type: 'boolean', default: true },
      { name: 'loading', type: 'boolean', default: false },
      { name: 'invalid', type: 'boolean', default: false },
      { name: 'disabled', type: 'boolean', default: false },
    ],
    render: (values) => <div className="w-64">{render(values)}</div>,
    code,
  },
  matrices: [
    {
      title: 'Sizes × states (default)',
      description: 'The trigger has the Select chrome and keeps the focus ring while open. Hover, focus and open are forced.',
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
      ],
      columns: STATES,
      render,
      code,
      cellWidth: 168,
    },
    {
      title: 'Popup states',
      description:
        'Open: every team. Combobox: "Mar" filters to Marketing and Marketplace. Empty: no match. Loading: an async search. Empty and loading fade in (opacity only).',
      rows: [{ label: 'Popup' }],
      columns: [
        { label: 'Open', props: { query: '' } },
        { label: 'Filtered', props: { query: 'Mar' } },
        { label: 'Empty', props: { query: 'Xyz' } },
        { label: 'Loading', props: { query: 'Mar', loading: true }, codeOnly: true },
      ],
      render: (props) => <PopupSpecimen query={String(props.query)} loading={Boolean(props.loading)} />,
      code: (props) => code({ loading: props.loading }),
      cellWidth: 256,
    },
  ],
  examples: [
    { id: 'combobox/basic', title: 'Basic', description: 'Pass items; the Combobox filters them by label.' },
    { id: 'combobox/groups', title: 'Groups' },
    { id: 'combobox/async', title: 'Async search', description: 'Loading shows a status line, not the empty state.' },
    { id: 'combobox/in-field', title: 'In a Field', description: 'Field.Label names the trigger.' },
  ],
  props: [
    { name: 'Combobox items', type: 'Item[] | Group[]', description: 'The list. With { value, label } objects, the label is shown and filtered.' },
    { name: 'Combobox value / defaultValue', type: 'Item | null', description: 'Controlled / uncontrolled value.' },
    { name: 'Combobox onValueChange', type: '(value, details) => void', description: 'Called with the picked item.' },
    { name: 'Combobox inputValue / onInputValueChange', type: 'string', description: 'The search text, for an async search.' },
    { name: 'Combobox loopFocus / autoHighlight', type: 'boolean', default: 'false / true', description: 'Like the app: arrow keys stop at the ends, and the first match is highlighted while typing.' },
    { name: 'Combobox filter', type: '(item, query) => boolean | null', description: 'Custom match; null turns filtering off (server results).' },
    { name: 'Combobox name / disabled / required', type: 'string / boolean', description: 'Form props.' },
    { name: 'ComboboxTrigger variant / size', type: '"default" | "ghost" / "sm" … "xl"', default: '"default" / "lg"', description: 'Same as SelectTrigger.' },
    { name: 'ComboboxTrigger aria-invalid', type: 'boolean', description: 'Error state. Field.Root invalid does the same.' },
    { name: 'ComboboxValue placeholder', type: 'ReactNode', description: 'Text when there is no value.' },
    { name: 'ComboboxInput trailing', type: 'ReactNode', description: 'End of the search row, e.g. <ComboboxClear />.' },
    { name: 'ComboboxEmpty', type: 'children', description: 'ComboboxEmptyTitle + ComboboxEmptyDescription. Shown only when no item matches.' },
    { name: 'ComboboxStatus', type: 'children', description: 'A polite status line, e.g. "Memuat hasil…".' },
  ],
  guidelines: {
    do: [
      'Use Combobox when the list is long enough that the user types to find the option.',
      'Write an empty state that says what to do next: "Periksa ejaan atau buat tim baru."',
      'Show ComboboxStatus while results load; show ComboboxEmpty only when the search is done.',
    ],
    dont: ['Do not put a Create button in the popup.', 'Do not use Combobox for free text. Use Input.'],
  },
  notes: [
    'The shipped app is the source of truth (decision, 12 Nov 2026). Every value here comes from Combobox.svelte; Wonder is the visual reference.',
    'The app hand-rolled the listbox (filtering, highlight, flip, close timers, empty debounce). This port uses Base UI Combobox with the input inside the popup, so combobox-logic.ts is not ported: Base UI filters by label (case-insensitive), skips disabled items, positions and flips the popup. loopFocus={false} and autoHighlight match the app\'s moveEnabledIndex (stop at the ends) and its first-match highlight while typing.',
    'The popup is exactly as wide as the trigger. Its shadow is the app\'s own (ring, 0 12px 32px -8px drop colour, 0 4px 8px -2px ambient): softer than shadow-popover, which uses the modal colour.',
    'The search row has no placeholder in the app, only the search icon. Its name is "Cari" by default; the app uses "Cari " + the trigger name, so pass that as aria-label.',
    'The app\'s default empty copy is "Tim tidak ditemukan" / "Periksa ejaan atau buat tim baru." and its loading copy "Memuat hasil…". Here the copy is the children of ComboboxEmpty and ComboboxStatus.',
    'The menu uses z-(--z-modal) like the app, so it paints over a Dialog or Popover.',
    'The trigger keeps the focus ring and drops the hover wash while the popup is open, like the app.',
    'ComboboxClear is code-only: neither the app nor Wonder has a clear button in the search row.',
  ],
}
