import { useState } from 'react'

import {
  FilterActiveBar,
  FilterChip,
  FilterChipClearAll,
  FilterChipList,
  FilterEmptyResult,
  FilterResultCount,
} from '@/components/ui/filter-panel'

export default function FilterPanelNoMatch() {
  const [chips, setChips] = useState(['Status: Ditolak', 'Jumlah: ≥ Rp 10.000.000'])

  return (
    <div className="flex w-full max-w-2xl flex-col gap-3">
      {chips.length > 0 ? (
        <FilterActiveBar>
          <FilterChipList>
            {chips.map((chip) => (
              <FilterChip key={chip} onRemove={() => setChips((c) => c.filter((x) => x !== chip))}>
                {chip}
              </FilterChip>
            ))}
            <FilterChipClearAll onClick={() => setChips([])} />
          </FilterChipList>
          <FilterResultCount count={chips.length > 0 ? 0 : 4} />
        </FilterActiveBar>
      ) : null}
      <div className="rounded-2xl bg-surface shadow-control">
        {chips.length > 0 ? (
          <FilterEmptyResult className="min-h-80" onClear={() => setChips([])} />
        ) : (
          <p className="m-0 p-6 text-center text-body-sm text-ink-2">4 transaksi ditampilkan.</p>
        )}
      </div>
    </div>
  )
}
