import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { expectNoAxeViolations } from '@/test/axe'

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
  FilterPanelTrigger,
  FilterResultCount,
  countFilters,
  datePresetRange,
  dateRangeLabel,
  formatAmountRange,
  type FilterValues,
} from './filter-panel'

const STATUS = [
  { value: 'settled', label: 'Berhasil' },
  { value: 'pending', label: 'Menunggu' },
  { value: 'declined', label: 'Ditolak' },
]
const CARDS = [
  { value: 'c1', label: 'Operasional Jakarta', description: '•••• 4821' },
  { value: 'c2', label: 'Iklan Meta', description: '•••• 1907' },
]

function Panel(props: Partial<React.ComponentProps<typeof FilterPanel>>) {
  return (
    <FilterPanel {...props}>
      <FilterPanelTrigger>Filter</FilterPanelTrigger>
      <FilterPanelContent>
        <FilterPanelSection label="Status">
          <FilterPanelChips name="status" options={STATUS} />
        </FilterPanelSection>
        <FilterPanelSection label="Kartu">
          <FilterPanelChecklist name="card" options={CARDS} searchable />
        </FilterPanelSection>
        <FilterPanelSection label="Jumlah">
          <FilterPanelAmount name="amount" />
        </FilterPanelSection>
        <FilterPanelSection label="Tanggal">
          <FilterPanelDateRange name="date" today="2026-11-12" />
        </FilterPanelSection>
      </FilterPanelContent>
    </FilterPanel>
  )
}

const trigger = () => screen.getByRole('button', { name: /^Filter/ })

describe('FilterPanel', () => {
  it('trigger: no count when nothing is applied, a count pill when filters are applied', () => {
    const { unmount } = render(<Panel />)
    expect(trigger().dataset.count).toBeUndefined()
    unmount()
    render(<Panel defaultValue={{ status: 'pending', card: ['c1'] }} />)
    expect(trigger().dataset.count).toBe('2')
    expect(trigger().textContent).toContain('2')
  })

  it('opens a labelled panel; the trigger gets aria-expanded', async () => {
    render(<Panel />)
    await userEvent.click(trigger())
    expect(trigger().getAttribute('aria-expanded')).toBe('true')
    expect(await screen.findByRole('dialog', { name: 'Filter' })).toBeTruthy()
  })

  it('Terapkan commits the draft with the draft count; status chips allow one choice', async () => {
    const onValueChange = vi.fn()
    render(<Panel onValueChange={onValueChange} />)
    await userEvent.click(trigger())
    await userEvent.click(screen.getByRole('button', { name: 'Menunggu' }))
    await userEvent.click(screen.getByRole('button', { name: 'Ditolak' }))
    expect(screen.getByRole('button', { name: 'Menunggu' }).getAttribute('aria-pressed')).toBe('false')
    expect(screen.getByRole('button', { name: 'Ditolak' }).getAttribute('aria-pressed')).toBe('true')
    // A press on the pressed chip keeps it on, as the app.
    await userEvent.click(screen.getByRole('button', { name: 'Ditolak' }))
    expect(screen.getByRole('button', { name: 'Ditolak' }).getAttribute('aria-pressed')).toBe('true')
    await userEvent.click(screen.getByRole('checkbox', { name: /Iklan Meta/ }))
    await userEvent.click(screen.getByRole('button', { name: 'Terapkan (2)' }))
    expect(onValueChange).toHaveBeenCalledWith({ status: 'declined', card: ['c2'] })
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
    expect(trigger().dataset.count).toBe('2')
  })

  it('Batal drops the draft and the next open starts from the applied value', async () => {
    const onValueChange = vi.fn()
    render(<Panel defaultValue={{ status: 'settled' }} onValueChange={onValueChange} />)
    await userEvent.click(trigger())
    await userEvent.click(screen.getByRole('button', { name: 'Menunggu' }))
    await userEvent.click(screen.getByRole('button', { name: 'Batal' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
    expect(onValueChange).not.toHaveBeenCalled()
    await userEvent.click(trigger())
    expect(screen.getByRole('button', { name: 'Menunggu' }).getAttribute('aria-pressed')).toBe('false')
    expect(screen.getByRole('button', { name: 'Berhasil' }).getAttribute('aria-pressed')).toBe('true')
  })

  it('multiple chips build a list', async () => {
    const onValueChange = vi.fn()
    render(
      <FilterPanel onValueChange={onValueChange}>
        <FilterPanelTrigger>Filter</FilterPanelTrigger>
        <FilterPanelContent>
          <FilterPanelSection label="Status">
            <FilterPanelChips name="status" options={STATUS} multiple />
          </FilterPanelSection>
        </FilterPanelContent>
      </FilterPanel>,
    )
    await userEvent.click(trigger())
    await userEvent.click(screen.getByRole('button', { name: 'Menunggu' }))
    await userEvent.click(screen.getByRole('button', { name: 'Ditolak' }))
    await userEvent.click(screen.getByRole('button', { name: 'Terapkan (1)' }))
    expect(onValueChange).toHaveBeenCalledWith({ status: ['pending', 'declined'] })
  })

  it('Atur ulang clears the draft only', async () => {
    const onValueChange = vi.fn()
    render(<Panel defaultValue={{ status: 'settled', amount: { min: 100000 } }} onValueChange={onValueChange} />)
    await userEvent.click(trigger())
    expect(screen.getByRole('button', { name: 'Terapkan (2)' })).toBeTruthy()
    await userEvent.click(screen.getByRole('button', { name: 'Atur ulang' }))
    expect(screen.getByRole('button', { name: 'Terapkan' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Berhasil' }).getAttribute('aria-pressed')).toBe('false')
    expect(onValueChange).not.toHaveBeenCalled()
  })

  it('reset and the draft count touch only the filters in this panel', async () => {
    const onValueChange = vi.fn()
    render(<Panel defaultValue={{ status: 'settled', source: 'account' }} onValueChange={onValueChange} />)
    await userEvent.click(trigger())
    expect(screen.getByRole('button', { name: 'Terapkan (1)' })).toBeTruthy()
    await userEvent.click(screen.getByRole('button', { name: 'Atur ulang' }))
    await userEvent.click(screen.getByRole('button', { name: 'Terapkan' }))
    expect(onValueChange).toHaveBeenCalledWith({ source: 'account' })
  })

  it('amount: modes and Rp inputs build { min, max }', async () => {
    const onValueChange = vi.fn()
    render(<Panel onValueChange={onValueChange} />)
    await userEvent.click(trigger())
    await userEvent.type(screen.getByRole('textbox', { name: 'Jumlah minimum' }), '100000')
    expect((screen.getByRole('textbox', { name: 'Jumlah minimum' }) as HTMLInputElement).value).toBe('100.000')
    await userEvent.type(screen.getByRole('textbox', { name: 'Jumlah maksimum' }), '500000')
    await userEvent.click(screen.getByRole('button', { name: 'Kurang dari' }))
    expect(screen.queryByRole('textbox', { name: 'Jumlah maksimum' })).toBeNull()
    await userEvent.click(screen.getByRole('button', { name: /^Terapkan/ }))
    expect(onValueChange).toHaveBeenCalledWith({ amount: { max: 100000 } })
  })

  it('date presets set the range; the inputs show it', async () => {
    const onValueChange = vi.fn()
    render(<Panel onValueChange={onValueChange} />)
    await userEvent.click(trigger())
    await userEvent.click(screen.getByRole('button', { name: '7 hari terakhir' }))
    expect((screen.getByLabelText('Dari') as HTMLInputElement).value).toBe('2026-11-06')
    await userEvent.click(screen.getByRole('button', { name: /^Terapkan/ }))
    expect(onValueChange).toHaveBeenCalledWith({ date: { from: '2026-11-06', to: '2026-11-12' } })
  })

  it('checklist search filters options and shows the empty hint', async () => {
    render(<Panel />)
    await userEvent.click(trigger())
    await userEvent.type(screen.getByRole('searchbox', { name: 'Cari kartu' }), '1907')
    expect(screen.getAllByRole('checkbox')).toHaveLength(1)
    await userEvent.clear(screen.getByRole('searchbox', { name: 'Cari kartu' }))
    await userEvent.type(screen.getByRole('searchbox', { name: 'Cari kartu' }), 'zzz')
    expect(screen.getByText('Tidak ada kartu')).toBeTruthy()
  })

  it('works controlled, with open control', async () => {
    function Controlled() {
      const [value, setValue] = useState<FilterValues>({})
      const [open, setOpen] = useState(false)
      return (
        <>
          <Panel value={value} onValueChange={setValue} open={open} onOpenChange={setOpen} />
          <output>{JSON.stringify(value)}</output>
        </>
      )
    }
    render(<Controlled />)
    await userEvent.click(trigger())
    await userEvent.click(screen.getByRole('button', { name: 'Ditolak' }))
    await userEvent.click(screen.getByRole('button', { name: /^Terapkan/ }))
    expect(screen.getByText('{"status":"declined"}')).toBeTruthy()
  })

  it('active chips remove one filter; clear all; result count', async () => {
    const onRemove = vi.fn()
    const onClear = vi.fn()
    render(
      <FilterActiveBar>
        <FilterChipList>
          <FilterChip onRemove={onRemove}>Status: Ditolak</FilterChip>
          <FilterChipClearAll onClick={onClear} />
        </FilterChipList>
        <FilterResultCount count={2} />
      </FilterActiveBar>,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Hapus filter Status: Ditolak' }))
    expect(onRemove).toHaveBeenCalledOnce()
    await userEvent.click(screen.getByRole('button', { name: 'Hapus filter' }))
    expect(onClear).toHaveBeenCalledOnce()
    expect(screen.getByRole('status').textContent).toBe('2 transaksi')
    expect(within(screen.getByRole('list')).getAllByRole('listitem')).toHaveLength(2)
  })

  it('empty result offers Hapus filter', async () => {
    const onClear = vi.fn()
    render(<FilterEmptyResult onClear={onClear} />)
    expect(screen.getByText('Tidak ada transaksi yang cocok')).toBeTruthy()
    await userEvent.click(screen.getByRole('button', { name: 'Hapus filter' }))
    expect(onClear).toHaveBeenCalledOnce()
  })

  it('helpers count and format', () => {
    expect(countFilters({ a: ['x'], b: [], c: undefined, d: { min: 1 }, e: {} })).toBe(2)
    expect(countFilters({ a: ['x'], date: { from: '2026-11-01' } }, ['date'])).toBe(1)
    expect(formatAmountRange({ min: 100000, max: 500000 })).toBe('Rp 100.000–500.000')
    expect(formatAmountRange({ max: 50000 })).toBe('≤ Rp 50.000')
    expect(datePresetRange('lastMonth', '2026-11-12')).toEqual({ from: '2026-10-01', to: '2026-10-31' })
    expect(dateRangeLabel({ from: '2026-10-14', to: '2026-11-12' }, '2026-11-12')).toBe('30 hari terakhir')
  })

  it('has no axe violations (open panel inline, chips, empty result)', async () => {
    const { container } = render(
      <div>
        <FilterPanel defaultValue={{ status: 'pending' }}>
          <FilterPanelTrigger>Filter</FilterPanelTrigger>
          <FilterPanelContent inline>
            <FilterPanelSection label="Status">
              <FilterPanelChips name="status" options={STATUS} />
            </FilterPanelSection>
            <FilterPanelSection label="Jumlah">
              <FilterPanelAmount name="amount" />
            </FilterPanelSection>
          </FilterPanelContent>
        </FilterPanel>
        <FilterChipList>
          <FilterChip onRemove={() => {}}>Status: Menunggu</FilterChip>
        </FilterChipList>
        <FilterEmptyResult onClear={() => {}} />
      </div>,
    )
    await expectNoAxeViolations(container)
  })
})
