import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxEmptyDescription,
  ComboboxEmptyTitle,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
  ComboboxValue,
} from '@/components/ui/combobox'

interface Team {
  value: string
  label: string
}

const teams: Team[] = [
  { value: 'marketing', label: 'Marketing' },
  { value: 'marketplace', label: 'Marketplace' },
  { value: 'merchandising', label: 'Merchandising' },
  { value: 'finance', label: 'Finance' },
  { value: 'operasional', label: 'Operasional' },
  { value: 'legal', label: 'Legal' },
]

export default function ComboboxBasic() {
  return (
    <Combobox items={teams} name="tim">
      <ComboboxTrigger aria-label="Tim" className="w-64">
        <ComboboxValue placeholder="Pilih tim" />
      </ComboboxTrigger>
      <ComboboxContent>
        <ComboboxInput placeholder="Cari tim" aria-label="Cari tim" />
        <ComboboxEmpty>
          <ComboboxEmptyTitle>Tim tidak ditemukan</ComboboxEmptyTitle>
          <ComboboxEmptyDescription>Periksa ejaan atau buat tim baru.</ComboboxEmptyDescription>
        </ComboboxEmpty>
        <ComboboxList>
          {(team: Team) => (
            <ComboboxItem key={team.value} value={team}>
              {team.label}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}
