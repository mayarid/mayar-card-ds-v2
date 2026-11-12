import { Toggle } from '@base-ui/react/toggle'
import { ToggleGroup as BaseToggleGroup } from '@base-ui/react/toggle-group'
import {
  ArrowDown01Icon,
  Cancel01Icon,
  FilterHorizontalIcon,
  Search01Icon,
} from '@hugeicons/core-free-icons'
import {
  createContext,
  use,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  EmptyState,
  EmptyStateActions,
  EmptyStateDescription,
  EmptyStateIcon,
  EmptyStateText,
  EmptyStateTitle,
} from '@/components/ui/empty-state'
import { Icon } from '@/components/ui/icon'
import { Input, InputPrefix } from '@/components/ui/input'
import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverPanel,
  PopoverTitle,
  PopoverTrigger,
  type PopoverAlign,
} from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { cn } from '@/lib/utils'

/*
 * Mayar v2 Filter Panel. Wonder Dashboard › "Transaksi C Filter Panel v2", "Transaksi C Filter
 * Active v2", "Transaksi C Filter No Match v2". Source: the shipped app (components/FilterPopover.svelte,
 * TransactionFilters.svelte).
 * Trigger: 36px, radius xl, surface + control shadow, 16px icon, body-sm medium ink label, a 20px primary
 * count pill when filters are applied, an optional 14px chevron (the date button). Hover canvas, open
 * component (Wonder), focus outline.
 * Panel: 380 wide, radius 2xl, ring + 0 16px 32px shadow-modal. Header 12×16, hairline, body-base
 * semibold title and "Atur ulang". Body 16px padding, sections 16px apart, caption-lg semibold ink-2
 * labels 8px above the control. Footer 12×16, hairline, "Batal" + "Terapkan (N)", both MD.
 * Section controls: multi-select chips (28px, radius md, caption-lg; selected primary-light + primary
 * ring), checkbox list (with search), select, amount (mode track + Rp inputs), date range (presets + two
 * date inputs). Active chips: 28px primary-light, radius md, × to remove, "Hapus filter", result count.
 * Draft contract: the panel edits a draft; "Terapkan" commits it; "Batal", Esc and an outside press drop it.
 */

/* ── Values ───────────────────────────────────────────────────────────────── */

interface NumberRange {
  min?: number
  max?: number
}

interface DateRange {
  /** YYYY-MM-DD, inclusive. */
  from?: string
  /** YYYY-MM-DD, inclusive. */
  to?: string
}

/** One filter: a single value, a list, an amount range or a date range. Empty means "not set". */
type FilterValue = string | string[] | NumberRange | DateRange | undefined
type FilterValues = Record<string, FilterValue>

interface FilterOption {
  value: string
  label: string
  /** A second line (checkbox list), e.g. a masked card number. */
  description?: string
  /** Content at the end of a checkbox row, e.g. a count. */
  trailing?: ReactNode
  disabled?: boolean
}

function isNumberRange(value: FilterValue): value is NumberRange {
  return typeof value === 'object' && !Array.isArray(value) && !('from' in value) && !('to' in value)
}

function isDateRange(value: FilterValue): value is DateRange {
  return typeof value === 'object' && !Array.isArray(value) && !('min' in value) && !('max' in value)
}

/** True when a filter value is not set. */
function isFilterEmpty(value: FilterValue): boolean {
  if (value === undefined || value === '') return true
  if (Array.isArray(value)) return value.length === 0
  if (typeof value === 'object') return Object.values(value).every((v) => v === undefined || v === '')
  return false
}

const NO_EXCLUDE: readonly string[] = []

/** Number of set filters. Pass keys in `exclude` to leave some out (e.g. the date in its own button). */
function countFilters(values: FilterValues, exclude: readonly string[] = NO_EXCLUDE): number {
  const skip = new Set(exclude)
  return Object.entries(values).filter(([key, value]) => !skip.has(key) && !isFilterEmpty(value)).length
}

const RUPIAH = new Intl.NumberFormat('id-ID')

/** "Rp 2.500.000". */
function formatRupiah(amount: number) {
  return `Rp ${RUPIAH.format(amount)}`
}

/** "Rp 100.000–500.000", "≤ Rp 50.000", "≥ Rp 1.000.000", "Rp 75.000". */
function formatAmountRange({ min, max }: NumberRange): string {
  if (min !== undefined && max !== undefined) {
    return min === max ? formatRupiah(min) : `Rp ${RUPIAH.format(min)}–${RUPIAH.format(max)}`
  }
  if (max !== undefined) return `≤ ${formatRupiah(max)}`
  if (min !== undefined) return `≥ ${formatRupiah(min)}`
  return ''
}

const DAY_SHORT = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short' })
const DAY_YEAR = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })

function parseDay(day: string | undefined) {
  if (!day) return undefined
  const [y, m, d] = day.split('-').map(Number)
  return y && m && d ? new Date(y, m - 1, d) : undefined
}

function toDay(date: Date) {
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${m}-${d}`
}

/** "5 Okt – 3 Nov 2026"; the year once when both ends share it. */
function formatDateRange({ from, to }: DateRange): string {
  const a = parseDay(from)
  const b = parseDay(to)
  if (a && b) {
    const left = a.getFullYear() === b.getFullYear() ? DAY_SHORT.format(a) : DAY_YEAR.format(a)
    return `${left} – ${DAY_YEAR.format(b)}`
  }
  if (a) return `≥ ${DAY_YEAR.format(a)}`
  if (b) return `≤ ${DAY_YEAR.format(b)}`
  return ''
}

type DatePreset = 'today' | '7d' | '30d' | 'month' | 'lastMonth'

const DATE_PRESETS: ReadonlyArray<{ value: DatePreset; label: string }> = [
  { value: 'today', label: 'Hari ini' },
  { value: '7d', label: '7 hari terakhir' },
  { value: '30d', label: '30 hari terakhir' },
  { value: 'month', label: 'Bulan ini' },
  { value: 'lastMonth', label: 'Bulan lalu' },
]

/** The inclusive range of a preset, relative to `today` (YYYY-MM-DD). */
function datePresetRange(preset: DatePreset, today: string): Required<DateRange> {
  const t = parseDay(today) ?? new Date(0)
  const shift = (days: number) => toDay(new Date(t.getFullYear(), t.getMonth(), t.getDate() + days))
  switch (preset) {
    case 'today':
      return { from: today, to: today }
    case '7d':
      return { from: shift(-6), to: today }
    case '30d':
      return { from: shift(-29), to: today }
    case 'month':
      return { from: toDay(new Date(t.getFullYear(), t.getMonth(), 1)), to: today }
    case 'lastMonth':
      return {
        from: toDay(new Date(t.getFullYear(), t.getMonth() - 1, 1)),
        to: toDay(new Date(t.getFullYear(), t.getMonth(), 0)),
      }
  }
}

/** The preset label for a range ("30 hari terakhir"), or the formatted range when no preset matches. */
function dateRangeLabel(range: DateRange, today: string): string {
  const preset = DATE_PRESETS.find(({ value }) => {
    const r = datePresetRange(value, today)
    return r.from === range.from && r.to === range.to
  })
  return preset?.label ?? formatDateRange(range)
}

/* ── Root ─────────────────────────────────────────────────────────────────── */

interface FilterPanelContextValue {
  applied: FilterValues
  draft: FilterValues
  /** Bumps on each seed and reset, so controls with local state start again. */
  version: number
  setField: (name: string, value: FilterValue) => void
  /** Controls register their key, so reset and the draft count touch only this panel's filters. */
  register: (name: string) => () => void
  reset: () => void
  apply: () => void
  draftCount: number
  appliedCount: number
}

const FilterPanelContext = createContext<FilterPanelContextValue | null>(null)

function useFilterPanelContext(part: string) {
  const context = use(FilterPanelContext)
  if (!context) throw new Error(`<${part}> must be inside <FilterPanel>.`)
  return context
}

/** The applied values, the draft and the counts, for custom triggers and sections. */
function useFilterPanel() {
  const { applied, draft, setField, reset, draftCount, appliedCount } = useFilterPanelContext('useFilterPanel')
  return { applied, draft, setField, reset, draftCount, appliedCount }
}

interface FilterPanelProps {
  /** The applied filters (controlled). */
  value?: FilterValues
  /** The applied filters at first render (uncontrolled). */
  defaultValue?: FilterValues
  /** Called with every filter when "Terapkan" commits the draft. */
  onValueChange?: (value: FilterValues) => void
  /** Open state (controlled). */
  open?: boolean
  /** Open state at first render. */
  defaultOpen?: boolean
  /** Called when the panel opens or closes. */
  onOpenChange?: (open: boolean) => void
  /** Keys the count leaves out, e.g. `["date"]` when the date has its own button. */
  countExclude?: readonly string[]
  children: ReactNode
}

/**
 * A filter button with a panel of filter sections, a reset, and "Batal" / "Terapkan".
 *
 * The panel edits a draft that starts from the applied value each time it opens. "Terapkan" commits
 * it through `onValueChange`; "Batal", Esc and an outside press drop it. Compose it:
 * `<FilterPanel value={filters} onValueChange={setFilters}><FilterPanelTrigger>Filter</FilterPanelTrigger>
 * <FilterPanelContent><FilterPanelSection label="Status"><FilterPanelChips name="status" options={…} />
 * </FilterPanelSection></FilterPanelContent></FilterPanel>`. Show what is applied with `FilterChip`s.
 */
function FilterPanel({
  value: valueProp,
  defaultValue = {},
  onValueChange,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  countExclude = NO_EXCLUDE,
  children,
}: FilterPanelProps) {
  const [innerValue, setInnerValue] = useState<FilterValues>(defaultValue)
  const applied = valueProp ?? innerValue
  const [innerOpen, setInnerOpen] = useState(defaultOpen)
  const open = openProp ?? innerOpen
  const [draft, setDraft] = useState<FilterValues>(applied)
  const [version, setVersion] = useState(0)
  const [fields, setFields] = useState<readonly string[]>([])

  const register = useCallback((name: string) => {
    setFields((f) => (f.includes(name) ? f : [...f, name]))
    return () => setFields((f) => f.filter((n) => n !== name))
  }, [])

  const setOpen = useCallback(
    (next: boolean) => {
      if (next) {
        // Seed the draft from what is applied.
        setDraft(applied)
        setVersion((v) => v + 1)
      }
      if (openProp === undefined) setInnerOpen(next)
      onOpenChange?.(next)
    },
    [applied, openProp, onOpenChange],
  )

  const setField = useCallback((name: string, next: FilterValue) => {
    setDraft((d) => ({ ...d, [name]: next }))
  }, [])

  const reset = useCallback(() => {
    setDraft((d) => ({ ...d, ...Object.fromEntries(fields.map((k) => [k, undefined])) }))
    setVersion((v) => v + 1)
  }, [fields])

  const apply = useCallback(() => {
    const next = Object.fromEntries(Object.entries(draft).filter(([, v]) => !isFilterEmpty(v)))
    if (valueProp === undefined) setInnerValue(next)
    onValueChange?.(next)
    setOpen(false)
  }, [draft, valueProp, onValueChange, setOpen])

  // Before the first open the draft mirrors the applied value, so a static panel shows it.
  const shownDraft = open || version > 0 ? draft : applied

  const context = useMemo<FilterPanelContextValue>(
    () => ({
      applied,
      draft: shownDraft,
      version,
      setField,
      register,
      reset,
      apply,
      draftCount:
        fields.length > 0
          ? fields.filter((k) => !isFilterEmpty(shownDraft[k])).length
          : countFilters(shownDraft, countExclude),
      appliedCount: countFilters(applied, countExclude),
    }),
    [applied, shownDraft, version, fields, setField, register, reset, apply, countExclude],
  )

  return (
    <FilterPanelContext value={context}>
      <Popover open={open} onOpenChange={(next) => setOpen(next)}>
        {children}
      </Popover>
    </FilterPanelContext>
  )
}

/* ── Trigger ──────────────────────────────────────────────────────────────── */

const triggerClassName = cn(
  'group/filter-trigger relative hit-44 inline-flex h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-xl border-0 px-3 whitespace-nowrap',
  'bg-surface font-sans text-body-sm font-medium text-ink-2 shadow-control outline-none select-none touch-manipulation',
  'transition-[background-color,box-shadow] duration-(--motion-quick) ease-smooth-out',
  'hover-fine:bg-canvas opened:bg-component focus-ring:outline-focus',
  'data-[count]:pr-2',
  'disabled:cursor-not-allowed disabled:bg-disabled disabled:text-disabled-foreground disabled:shadow-none',
  '[&_svg]:pointer-events-none [&_svg]:shrink-0',
)

interface FilterPanelTriggerProps extends Omit<React.ComponentProps<typeof PopoverTrigger>, 'children'> {
  /** The label, e.g. "Filter" or the applied date range. */
  children: ReactNode
  /** The leading glyph. Defaults to the filter icon; `null` hides it. */
  icon?: React.ComponentProps<typeof Icon>['icon'] | null
  /** A trailing chevron (the date button). */
  chevron?: boolean
  /** The count pill. Defaults to the number of applied filters; 0 hides it. */
  count?: number
}

/** The 36px toolbar button. It shows how many filters are applied and gets the open look while open. */
function FilterPanelTrigger({ className, children, icon = FilterHorizontalIcon, chevron = false, count, ...props }: FilterPanelTriggerProps) {
  const { appliedCount } = useFilterPanelContext('FilterPanelTrigger')
  const shown = count ?? appliedCount
  return (
    <PopoverTrigger
      data-slot="filter-panel-trigger"
      data-count={shown > 0 ? shown : undefined}
      className={cn(triggerClassName, chevron && 'pr-2.5', className)}
      {...props}
    >
      {icon ? <Icon icon={icon} /> : null}
      <span className="text-ink group-disabled/filter-trigger:text-disabled-foreground">{children}</span>
      {shown > 0 ? (
        <span
          data-slot="filter-panel-count"
          className="inline-flex h-5 min-w-5 items-center justify-center rounded-pill bg-primary px-1.5 text-caption-lg font-semibold text-on-primary tabular-nums group-disabled/filter-trigger:bg-disabled-foreground"
        >
          <span className="sr-only">, aktif: </span>
          {shown}
        </span>
      ) : null}
      {chevron ? <Icon icon={ArrowDown01Icon} size={14} /> : null}
    </PopoverTrigger>
  )
}

/* ── Panel ────────────────────────────────────────────────────────────────── */

const panelShadow = 'shadow-[0_0_0_1px_var(--color-shadow-ring),0_16px_32px_var(--color-shadow-modal)]'

interface FilterPanelContentProps extends Omit<React.ComponentProps<'div'>, 'title'> {
  /** The header title. `null` drops the header (and the reset link). */
  title?: ReactNode
  /** Panel width in px. */
  width?: number
  /** Edge of the trigger the panel lines up with. */
  align?: PopoverAlign
  resetLabel?: string
  cancelLabel?: string
  /** The apply text. " (N)" with the draft count is added. */
  applyLabel?: string
  /** Content at the start of the footer, e.g. the picked date range. */
  footerStart?: ReactNode
  /** Renders the panel in the page flow, not anchored. For docs and specimens. */
  inline?: boolean
}

/** The panel: header with the title and "Atur ulang", a scrolling body for the sections, and the footer. */
function FilterPanelContent({
  className,
  title = 'Filter',
  width = 380,
  align = 'end',
  resetLabel = 'Atur ulang',
  cancelLabel = 'Batal',
  applyLabel = 'Terapkan',
  footerStart,
  inline = false,
  children,
  style,
  ...props
}: FilterPanelContentProps) {
  const { reset, apply, draftCount } = useFilterPanelContext('FilterPanelContent')
  const titleId = useId()
  const inner = (
    <>
      {title !== null ? (
        <div data-slot="filter-panel-header" className="flex items-center justify-between gap-3 border-b border-border-subtle px-4 py-3">
          {inline ? (
            <h2 id={titleId} className="m-0 text-body-base font-semibold text-ink">
              {title}
            </h2>
          ) : (
            <PopoverTitle className="text-body-base">{title}</PopoverTitle>
          )}
          <Button variant="link-muted" size="sm" onClick={reset}>
            {resetLabel}
          </Button>
        </div>
      ) : null}
      <div
        data-slot="filter-panel-body"
        className="flex max-h-[min(560px,calc(100dvh-240px))] flex-col gap-4 overflow-auto p-4"
      >
        {children}
      </div>
      <div
        data-slot="filter-panel-footer"
        className={cn(
          'flex items-center gap-2 border-t border-border-subtle px-4 py-3',
          footerStart ? 'justify-between' : 'justify-end',
        )}
      >
        {footerStart ? <div className="min-w-0 text-body-sm text-ink-2 tabular-nums">{footerStart}</div> : null}
        <div className="flex items-center gap-2">
          <PopoverClose render={<Button variant="secondary" />}>{cancelLabel}</PopoverClose>
          <Button onClick={apply}>{draftCount > 0 ? `${applyLabel} (${draftCount})` : applyLabel}</Button>
        </div>
      </div>
    </>
  )

  const shared = {
    'data-slot': 'filter-panel-content',
    style: { width, ...style },
    className: cn(panelShadow, className),
  }

  if (inline) {
    return (
      <PopoverPanel
        role="dialog"
        aria-labelledby={title !== null ? titleId : undefined}
        aria-label={title === null ? 'Filter' : undefined}
        {...shared}
        {...props}
      >
        {inner}
      </PopoverPanel>
    )
  }
  return (
    <PopoverContent align={align} aria-label={title === null ? 'Filter' : undefined} {...shared} {...props}>
      {inner}
    </PopoverContent>
  )
}

/** Registers a control's key with the panel while it is mounted. */
function useFilterField(name: string, part: string) {
  const context = useFilterPanelContext(part)
  const { register } = context
  useEffect(() => register(name), [register, name])
  return context
}

/* ── Sections ─────────────────────────────────────────────────────────────── */

const SectionContext = createContext<{ labelId: string; label: string }>({ labelId: '', label: '' })

interface FilterPanelSectionProps extends React.ComponentProps<'div'> {
  /** The section label (caption-lg semibold ink-2). It names the control inside. */
  label: string
}

/** One filter: a label and its control, 8px apart. */
function FilterPanelSection({ className, label, children, ...props }: FilterPanelSectionProps) {
  const labelId = useId()
  const context = useMemo(() => ({ labelId, label }), [labelId, label])
  return (
    <SectionContext value={context}>
      <div data-slot="filter-panel-section" className={cn('flex min-w-0 flex-col gap-2', className)} {...props}>
        <span id={labelId} className="text-caption-lg font-semibold text-ink-2">
          {label}
        </span>
        {children}
      </div>
    </SectionContext>
  )
}

const chipClassName = cn(
  'relative hit-44 inline-flex h-7 cursor-pointer items-center rounded-md border-0 bg-transparent px-2.5 whitespace-nowrap',
  'font-sans text-caption-lg font-medium text-ink-2 shadow-ring outline-none select-none touch-manipulation',
  'before:h-[max(100%,40px)]!',
  'transition-[background-color,box-shadow,color] duration-(--motion-quick) ease-smooth-out',
  'hover-fine:not-data-pressed:bg-canvas hover-fine:not-data-pressed:text-ink focus-ring:outline-focus',
  'data-pressed:bg-primary-light data-pressed:text-primary data-pressed:shadow-[0_0_0_1px_var(--color-primary)]',
  'data-disabled:cursor-not-allowed data-disabled:bg-disabled data-disabled:text-disabled-foreground data-disabled:shadow-none',
)

interface FilterPanelChipsProps {
  className?: string
  /** The filter key in the value. */
  name: string
  options: readonly FilterOption[]
  /** Several chips can be on (a list). `false`: one chip, pressed again to clear (a string). */
  multiple?: boolean
}

/** Toggle chips (28px). Multi-select by default; the value is a list of option values. */
function FilterPanelChips({ name, options, multiple = true, className }: FilterPanelChipsProps) {
  const { draft, setField } = useFilterField(name, 'FilterPanelChips')
  const { labelId } = use(SectionContext)
  const raw = draft[name]
  const value = Array.isArray(raw) ? raw : typeof raw === 'string' && raw ? [raw] : []
  return (
    <BaseToggleGroup
      data-slot="filter-panel-chips"
      multiple={multiple}
      value={value}
      onValueChange={(next) => setField(name, multiple ? next : next[0])}
      aria-labelledby={labelId || undefined}
      className={cn('flex flex-wrap gap-1.5', className)}
    >
      {options.map((option) => (
        <Toggle key={option.value} value={option.value} disabled={option.disabled} className={chipClassName}>
          {option.label}
        </Toggle>
      ))}
    </BaseToggleGroup>
  )
}

interface FilterPanelChecklistProps extends React.ComponentProps<'div'> {
  name: string
  options: readonly FilterOption[]
  /** Adds a search field over the list (label and description). */
  searchable?: boolean
  searchPlaceholder?: string
  /** The hint when the search matches nothing. */
  emptyLabel?: string
}

/** A checkbox list (multi-select), e.g. cards with their masked numbers. Optional search. */
function FilterPanelChecklist({
  name,
  options,
  searchable = false,
  searchPlaceholder = 'Cari kartu…',
  emptyLabel = 'Tidak ada kartu',
  className,
  ...props
}: FilterPanelChecklistProps) {
  const { draft, setField } = useFilterField(name, 'FilterPanelChecklist')
  const { labelId, label } = use(SectionContext)
  const [query, setQuery] = useState('')
  const raw = draft[name]
  const value = Array.isArray(raw) ? raw : []
  const q = query.trim().toLowerCase()
  const shown = q
    ? options.filter((o) => o.label.toLowerCase().includes(q) || o.description?.toLowerCase().includes(q))
    : options

  return (
    <div data-slot="filter-panel-checklist" className={cn('flex flex-col gap-2', className)} {...props}>
      {searchable ? (
        <Input
          type="search"
          size="md"
          value={query}
          onValueChange={(next) => setQuery(next)}
          placeholder={searchPlaceholder}
          aria-label={label ? `Cari ${label.toLowerCase()}` : searchPlaceholder}
          leading={<Icon icon={Search01Icon} />}
        />
      ) : null}
      <div role="group" aria-labelledby={labelId || undefined} className="flex max-h-52 flex-col overflow-auto">
        {shown.length === 0 ? (
          <p data-slot="filter-panel-empty" className="m-0 px-2.5 py-2 text-body-sm text-muted">
            {emptyLabel}
          </p>
        ) : (
          shown.map((option) => (
            <Checkbox
              key={option.value}
              className="w-full items-center rounded-lg px-2.5 hover-fine:bg-state-hover [&_[data-slot=checkbox]]:mt-0"
              checked={value.includes(option.value)}
              disabled={option.disabled}
              description={option.description}
              trailing={option.trailing}
              onCheckedChange={(checked) =>
                setField(name, checked ? [...value, option.value] : value.filter((v) => v !== option.value))
              }
            >
              {option.label}
            </Checkbox>
          ))
        )}
      </div>
    </div>
  )
}

interface FilterPanelSelectProps {
  name: string
  options: readonly FilterOption[]
  /** The "no filter" row and placeholder. */
  allLabel?: string
  className?: string
}

/** A single choice from a short list (Select, 36px), with an "all" row that clears it. */
function FilterPanelSelect({ name, options, allLabel = 'Semua', className }: FilterPanelSelectProps) {
  const { draft, setField } = useFilterField(name, 'FilterPanelSelect')
  const { labelId } = use(SectionContext)
  const raw = draft[name]
  const value = typeof raw === 'string' ? raw : ''
  const items = useMemo(() => [{ value: '', label: allLabel }, ...options.map(({ value: v, label }) => ({ value: v, label }))], [options, allLabel])
  return (
    <Select<string> items={items} value={value} onValueChange={(next) => setField(name, next || undefined)}>
      <SelectTrigger size="lg" aria-labelledby={labelId || undefined} className={cn('rounded-lg', className)}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {items.map((item) => (
          <SelectItem key={item.value} value={item.value}>
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

type AmountMode = 'range' | 'specific' | 'lt' | 'gt'

const AMOUNT_MODES: ReadonlyArray<{ value: AmountMode; label: string }> = [
  { value: 'range', label: 'Rentang' },
  { value: 'specific', label: 'Spesifik' },
  { value: 'lt', label: 'Kurang dari' },
  { value: 'gt', label: 'Lebih dari' },
]

function modeOf({ min, max }: NumberRange): AmountMode {
  if (min !== undefined && max !== undefined) return min === max ? 'specific' : 'range'
  if (max !== undefined) return 'lt'
  if (min !== undefined) return 'gt'
  return 'range'
}

function parseAmount(text: string) {
  const digits = text.replace(/\D/g, '')
  return digits ? Number.parseInt(digits, 10) : undefined
}

const formatTyped = (n: number | undefined) => (n === undefined ? '' : RUPIAH.format(n))

function rangeFor(mode: AmountMode, a: number | undefined, b: number | undefined): NumberRange | undefined {
  const r: NumberRange =
    mode === 'range' ? { min: a, max: b } : mode === 'specific' ? { min: a, max: a } : mode === 'lt' ? { max: a } : { min: a }
  return r.min === undefined && r.max === undefined ? undefined : r
}

interface FilterPanelAmountProps {
  name: string
  className?: string
}

function AmountControl({ name, className }: FilterPanelAmountProps) {
  const { draft, setField } = useFilterField(name, 'FilterPanelAmount')
  const { label } = use(SectionContext)
  const raw = draft[name]
  const initial: NumberRange = isNumberRange(raw) ? raw : {}
  const [mode, setMode] = useState<AmountMode>(() => modeOf(initial))
  const [first, setFirst] = useState<number | undefined>(() => (modeOf(initial) === 'lt' ? initial.max : initial.min))
  const [second, setSecond] = useState<number | undefined>(() => (modeOf(initial) === 'range' ? initial.max : undefined))

  function update(nextMode: AmountMode, a: number | undefined, b: number | undefined) {
    setMode(nextMode)
    setFirst(a)
    setSecond(b)
    setField(name, rangeFor(nextMode, a, b))
  }

  const prefix = <InputPrefix className="font-normal text-muted">Rp</InputPrefix>
  const group = label || 'Jumlah'
  return (
    <div data-slot="filter-panel-amount" className={cn('flex flex-col gap-2', className)}>
      <ToggleGroup
        variant="track"
        size="sm"
        fill
        aria-label={`Mode ${group.toLowerCase()}`}
        value={mode}
        onValueChange={(next) => update(next as AmountMode, first, second)}
      >
        {AMOUNT_MODES.map((m) => (
          <ToggleGroupItem key={m.value} value={m.value} className="flex-1 px-1.5 text-caption-lg">
            {m.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      <div className={cn('grid gap-2', mode === 'range' ? 'grid-cols-2' : 'grid-cols-1')}>
        <Input
          size="lg"
          inputMode="numeric"
          className="rounded-lg"
          leading={prefix}
          placeholder={mode === 'range' ? 'Min' : 'Jumlah'}
          aria-label={mode === 'range' ? `${group} minimum` : group}
          value={formatTyped(first)}
          onValueChange={(text) => update(mode, parseAmount(text), second)}
        />
        {mode === 'range' ? (
          <Input
            size="lg"
            inputMode="numeric"
            className="rounded-lg"
            leading={prefix}
            placeholder="Maks"
            aria-label={`${group} maksimum`}
            value={formatTyped(second)}
            onValueChange={(text) => update(mode, first, parseAmount(text))}
          />
        ) : null}
      </div>
    </div>
  )
}

/** An amount filter: a mode track (Rentang, Spesifik, Kurang dari, Lebih dari) and Rp inputs. Value `{ min, max }`. */
function FilterPanelAmount(props: FilterPanelAmountProps) {
  const { version } = useFilterPanelContext('FilterPanelAmount')
  return <AmountControl key={version} {...props} />
}

interface FilterPanelDateRangeProps {
  name: string
  /** Today as YYYY-MM-DD. Defaults to the device date. Pass it for stable demos and tests. */
  today?: string
  className?: string
}

/** A date filter: preset chips and two date inputs ("Dari", "Sampai"). Value `{ from, to }` (YYYY-MM-DD, inclusive). */
function FilterPanelDateRange({ name, today: todayProp, className }: FilterPanelDateRangeProps) {
  const { draft, setField } = useFilterField(name, 'FilterPanelDateRange')
  const { labelId } = use(SectionContext)
  const [deviceToday] = useState(() => toDay(new Date()))
  const today = todayProp ?? deviceToday
  const raw = draft[name]
  const range: DateRange = isDateRange(raw) ? raw : {}
  const active = DATE_PRESETS.find(({ value }) => {
    const r = datePresetRange(value, today)
    return r.from === range.from && r.to === range.to
  })?.value

  const set = (next: DateRange) => setField(name, next.from || next.to ? next : undefined)

  return (
    <div data-slot="filter-panel-date-range" className={cn('flex flex-col gap-3', className)}>
      <BaseToggleGroup
        aria-labelledby={labelId || undefined}
        value={active ? [active] : []}
        onValueChange={(next) => {
          const preset = next[0] as DatePreset | undefined
          set(preset ? datePresetRange(preset, today) : {})
        }}
        className="flex flex-wrap gap-1.5"
      >
        {DATE_PRESETS.map((p) => (
          <Toggle key={p.value} value={p.value} className={chipClassName}>
            {p.label}
          </Toggle>
        ))}
      </BaseToggleGroup>
      <div className="grid grid-cols-2 gap-2">
        <label className="flex min-w-0 flex-col gap-1 text-caption-lg text-ink-2">
          Dari
          <Input
            type="date"
            size="lg"
            className="rounded-lg"
            max={range.to ?? today}
            value={range.from ?? ''}
            onValueChange={(from) => set({ ...range, from: from || undefined })}
          />
        </label>
        <label className="flex min-w-0 flex-col gap-1 text-caption-lg text-ink-2">
          Sampai
          <Input
            type="date"
            size="lg"
            className="rounded-lg"
            min={range.from}
            max={today}
            value={range.to ?? ''}
            onValueChange={(to) => set({ ...range, to: to || undefined })}
          />
        </label>
      </div>
    </div>
  )
}

/* ── Applied filters ──────────────────────────────────────────────────────── */

/** The row under the toolbar: the chips on the left, the result count on the right. */
function FilterActiveBar({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div data-slot="filter-active-bar" className={cn('flex items-center justify-between gap-2', className)} {...props} />
  )
}

/** The chips and the "Hapus filter" link, 8px apart, wrapping. */
function FilterChipList({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="filter-chip-list"
      role="list"
      aria-label="Filter aktif"
      className={cn('flex min-w-0 flex-wrap items-center gap-2', className)}
      {...props}
    />
  )
}

interface FilterChipProps extends React.ComponentProps<'span'> {
  /** Removes this filter. The × button is named "Hapus filter {label}". */
  onRemove?: () => void
  /** The text for the × button name. Defaults to the chip text when it is a string. */
  label?: string
}

/** One applied filter ("Status: Pending, Gagal") with a × that removes it. */
function FilterChip({ className, children, onRemove, label, ...props }: FilterChipProps) {
  const name = label ?? (typeof children === 'string' ? children : 'ini')
  return (
    <span
      data-slot="filter-chip"
      role="listitem"
      className={cn(
        'inline-flex h-7 max-w-full items-center gap-1 rounded-md bg-primary-light pl-2.5 text-caption-lg font-medium text-primary',
        onRemove ? 'pr-0.5' : 'pr-2.5',
        className,
      )}
      {...props}
    >
      <span className="min-w-0 truncate">{children}</span>
      {onRemove ? (
        <button
          type="button"
          data-slot="filter-chip-remove"
          aria-label={`Hapus filter ${name}`}
          onClick={onRemove}
          className={cn(
            'relative hit-44 inline-flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-sm border-0 bg-transparent p-0 text-current outline-none',
            'before:size-10!',
            'transition-colors duration-(--motion-quick) ease-smooth-out hover-fine:bg-primary-light-hover focus-ring:outline-focus',
          )}
        >
          <Icon icon={Cancel01Icon} size={14} />
        </button>
      ) : null}
    </span>
  )
}

/** "Hapus filter": clears every applied filter. 4px further from the last chip. */
function FilterChipClearAll({ className, children = 'Hapus filter', ...props }: React.ComponentProps<typeof Button>) {
  return (
    <span role="listitem" className="ml-1 inline-flex">
      <Button variant="link-muted" size="sm" className={cn('text-caption-lg', className)} {...props}>
        {children}
      </Button>
    </span>
  )
}

/** "12 transaksi" (caption-lg muted). Pass the count; `noun` defaults to "transaksi". */
function FilterResultCount({ className, count, noun = 'transaksi', ...props }: React.ComponentProps<'span'> & { count: number; noun?: string }) {
  return (
    <span
      data-slot="filter-result-count"
      role="status"
      className={cn('shrink-0 text-caption-lg text-muted tabular-nums', className)}
      {...props}
    >
      {RUPIAH.format(count)} {noun}
    </span>
  )
}

interface FilterEmptyResultProps extends Omit<React.ComponentProps<'div'>, 'title'> {
  title?: ReactNode
  description?: ReactNode
  clearLabel?: string
  /** Clears every filter. Without it there is no button. */
  onClear?: () => void
}

/** The no-match state for a filtered list: a search disc, a title, one line and "Hapus filter". */
function FilterEmptyResult({
  title = 'Tidak ada transaksi yang cocok',
  description = 'Ubah atau hapus filter untuk melihat transaksi lain.',
  clearLabel = 'Hapus filter',
  onClear,
  ...props
}: FilterEmptyResultProps) {
  return (
    <EmptyState data-slot="filter-empty-result" {...props}>
      <EmptyStateIcon tone="neutral">
        <Icon icon={Search01Icon} size={20} />
      </EmptyStateIcon>
      <EmptyStateText>
        <EmptyStateTitle>{title}</EmptyStateTitle>
        <EmptyStateDescription className="text-muted">{description}</EmptyStateDescription>
      </EmptyStateText>
      {onClear ? (
        <EmptyStateActions>
          <Button variant="secondary" onClick={onClear}>
            {clearLabel}
          </Button>
        </EmptyStateActions>
      ) : null}
    </EmptyState>
  )
}

export {
  DATE_PRESETS,
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
  countFilters,
  datePresetRange,
  dateRangeLabel,
  formatAmountRange,
  formatDateRange,
  formatRupiah,
  isFilterEmpty,
  useFilterPanel,
  type DatePreset,
  type DateRange,
  type FilterOption,
  type FilterPanelContentProps,
  type FilterPanelProps,
  type FilterPanelTriggerProps,
  type FilterValue,
  type FilterValues,
  type NumberRange,
}
