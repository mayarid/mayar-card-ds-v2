import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxEmptyTitle,
  ComboboxGroup,
  ComboboxGroupLabel,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxSeparator,
  ComboboxTrigger,
  ComboboxValue,
} from '@/components/ui/combobox'

interface Member {
  value: string
  label: string
}

interface Division {
  value: string
  items: Member[]
}

const divisions: Division[] = [
  {
    value: 'Marketing',
    items: [
      { value: 'andi', label: 'Andi Pratama' },
      { value: 'sari', label: 'Sari Wulandari' },
    ],
  },
  {
    value: 'Finance',
    items: [
      { value: 'budi', label: 'Budi Santoso' },
      { value: 'rina', label: 'Rina Kusuma' },
    ],
  },
]

export default function ComboboxGroups() {
  return (
    <Combobox items={divisions}>
      <ComboboxTrigger aria-label="Pemegang kartu" className="w-64">
        <ComboboxValue placeholder="Pilih pemegang kartu" />
      </ComboboxTrigger>
      <ComboboxContent>
        <ComboboxInput placeholder="Cari nama" aria-label="Cari nama" />
        <ComboboxEmpty>
          <ComboboxEmptyTitle>Nama tidak ditemukan</ComboboxEmptyTitle>
        </ComboboxEmpty>
        <ComboboxList>
          {(division: Division, index: number) => (
            <ComboboxGroup key={division.value} items={division.items}>
              {index > 0 ? <ComboboxSeparator /> : null}
              <ComboboxGroupLabel>{division.value}</ComboboxGroupLabel>
              {division.items.map((member) => (
                <ComboboxItem key={member.value} value={member}>
                  {member.label}
                </ComboboxItem>
              ))}
            </ComboboxGroup>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}
