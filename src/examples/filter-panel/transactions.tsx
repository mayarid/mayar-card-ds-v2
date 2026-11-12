import { Calendar03Icon, Search01Icon } from '@hugeicons/core-free-icons'
import { useState } from 'react'

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
  dateRangeLabel,
  formatAmountRange,
  formatRupiah,
  type DateRange,
  type FilterValues,
  type NumberRange,
} from '@/components/ui/filter-panel'
import { Icon } from '@/components/ui/icon'
import { Input } from '@/components/ui/input'

const TODAY = '2026-11-12'

const STATUS = [
  { value: 'settled', label: 'Berhasil' },
  { value: 'pending', label: 'Pending' },
  { value: 'declined', label: 'Gagal' },
  { value: 'reversed', label: 'Dibalik' },
]
const TYPES = [
  { value: 'purchase', label: 'Pembayaran' },
  { value: 'topup', label: 'Top-up Saldo' },
  { value: 'refund', label: 'Pengembalian Dana' },
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

const ROWS = [
  { id: 't1', merchant: 'Meta Ads', amount: 1_250_000, status: 'settled', type: 'purchase', card: 'ads', day: '2026-11-11' },
  { id: 't2', merchant: 'Notion Labs', amount: 160_000, status: 'pending', type: 'purchase', card: 'saas', day: '2026-11-11' },
  { id: 't3', merchant: 'Tokopedia', amount: 487_500, status: 'declined', type: 'purchase', card: 'ops', day: '2026-11-08' },
  { id: 't4', merchant: 'Top-up Saldo', amount: 5_000_000, status: 'settled', type: 'topup', card: 'ops', day: '2026-10-30' },
]

const labelOf = (options: { value: string; label: string }[], values: string[]) =>
  values.map((v) => options.find((o) => o.value === v)?.label ?? v).join(', ')

export default function FilterPanelTransactions() {
  const [filters, setFilters] = useState<FilterValues>({ date: { from: '2026-10-14', to: TODAY } })

  const status = (filters.status as string[] | undefined) ?? []
  const types = (filters.type as string[] | undefined) ?? []
  const cards = (filters.card as string[] | undefined) ?? []
  const amount = filters.amount as NumberRange | undefined
  const date = filters.date as DateRange | undefined

  const rows = ROWS.filter(
    (r) =>
      (status.length === 0 || status.includes(r.status)) &&
      (types.length === 0 || types.includes(r.type)) &&
      (cards.length === 0 || cards.includes(r.card)) &&
      (amount?.min === undefined || r.amount >= amount.min) &&
      (amount?.max === undefined || r.amount <= amount.max) &&
      (!date?.from || r.day >= date.from) &&
      (!date?.to || r.day <= date.to),
  )

  const drop = (key: string) => setFilters(({ [key]: _, ...rest }) => rest)
  const panelFilters = Object.keys(filters).filter((k) => k !== 'date').length

  return (
    <div className="flex w-full max-w-3xl flex-col gap-3">
      <div className="flex items-center gap-2">
        <Input className="flex-1" placeholder="Cari transaksi atau kartu…" aria-label="Cari transaksi" leading={<Icon icon={Search01Icon} />} />
        <FilterPanel value={filters} onValueChange={setFilters}>
          <FilterPanelTrigger icon={Calendar03Icon} chevron count={0}>
            {date ? dateRangeLabel(date, TODAY) : 'Tanggal'}
          </FilterPanelTrigger>
          <FilterPanelContent title="Tanggal" width={340}>
            <FilterPanelSection label="Rentang">
              <FilterPanelDateRange name="date" today={TODAY} />
            </FilterPanelSection>
          </FilterPanelContent>
        </FilterPanel>
        <FilterPanel value={filters} onValueChange={setFilters} countExclude={['date']}>
          <FilterPanelTrigger>Filter</FilterPanelTrigger>
          <FilterPanelContent>
            <FilterPanelSection label="Status">
              <FilterPanelChips name="status" options={STATUS} />
            </FilterPanelSection>
            <FilterPanelSection label="Tipe">
              <FilterPanelChips name="type" options={TYPES} />
            </FilterPanelSection>
            <FilterPanelSection label="Kartu">
              <FilterPanelChecklist name="card" options={CARDS} searchable />
            </FilterPanelSection>
            <FilterPanelSection label="Jumlah">
              <FilterPanelAmount name="amount" />
            </FilterPanelSection>
            <FilterPanelSection label="Sumber">
              <FilterPanelSelect name="source" options={SOURCES} allLabel="Semua sumber" />
            </FilterPanelSection>
          </FilterPanelContent>
        </FilterPanel>
      </div>

      {Object.keys(filters).length > 0 ? (
        <FilterActiveBar>
          <FilterChipList>
            {date ? <FilterChip onRemove={() => drop('date')}>{`Tanggal: ${dateRangeLabel(date, TODAY)}`}</FilterChip> : null}
            {status.length ? <FilterChip onRemove={() => drop('status')}>{`Status: ${labelOf(STATUS, status)}`}</FilterChip> : null}
            {types.length ? <FilterChip onRemove={() => drop('type')}>{`Tipe: ${labelOf(TYPES, types)}`}</FilterChip> : null}
            {cards.length ? <FilterChip onRemove={() => drop('card')}>{`Kartu: ${labelOf(CARDS, cards)}`}</FilterChip> : null}
            {amount ? <FilterChip onRemove={() => drop('amount')}>{`Jumlah: ${formatAmountRange(amount)}`}</FilterChip> : null}
            {typeof filters.source === 'string' ? (
              <FilterChip onRemove={() => drop('source')}>{`Sumber: ${labelOf(SOURCES, [filters.source])}`}</FilterChip>
            ) : null}
            {panelFilters > 0 || date ? <FilterChipClearAll onClick={() => setFilters({})} /> : null}
          </FilterChipList>
          <FilterResultCount count={rows.length} />
        </FilterActiveBar>
      ) : null}

      <div className="overflow-clip rounded-2xl bg-surface shadow-control">
        {rows.length === 0 ? (
          <FilterEmptyResult onClear={() => setFilters({})} />
        ) : (
          <ul className="m-0 list-none p-0">
            {rows.map((r) => (
              <li key={r.id} className="flex h-14 items-center justify-between border-b border-border-subtle px-4 text-body-sm last:border-b-0">
                <span className="font-medium text-ink">{r.merchant}</span>
                <span className="text-ink tabular-nums">{formatRupiah(r.amount)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
