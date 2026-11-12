import { useState } from 'react'

import {
  FilterPanel,
  FilterPanelChecklist,
  FilterPanelContent,
  FilterPanelSection,
  FilterPanelTrigger,
  type FilterValues,
} from '@/components/ui/filter-panel'

const STATUS = [
  { value: 'active', label: 'Aktif', trailing: <span className="text-caption-lg text-muted tabular-nums">12</span> },
  { value: 'frozen', label: 'Dibekukan', trailing: <span className="text-caption-lg text-muted tabular-nums">3</span> },
  { value: 'processing', label: 'Diproses', trailing: <span className="text-caption-lg text-muted tabular-nums">1</span> },
  { value: 'closed', label: 'Ditutup', trailing: <span className="text-caption-lg text-muted tabular-nums">4</span> },
]

export default function FilterPanelCardStatus() {
  const [filters, setFilters] = useState<FilterValues>({ status: ['active'] })
  const count = (filters.status as string[] | undefined)?.length ?? 0

  return (
    <FilterPanel value={filters} onValueChange={setFilters}>
      <FilterPanelTrigger count={count}>Status kartu</FilterPanelTrigger>
      <FilterPanelContent title="Status kartu" width={280} align="start">
        <FilterPanelSection label="Tampilkan kartu">
          <FilterPanelChecklist name="status" options={STATUS} />
        </FilterPanelSection>
      </FilterPanelContent>
    </FilterPanel>
  )
}
