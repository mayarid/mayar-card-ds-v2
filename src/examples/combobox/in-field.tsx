import { Field } from '@base-ui/react/field'

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxEmptyTitle,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
  ComboboxValue,
} from '@/components/ui/combobox'

interface City {
  value: string
  label: string
}

const cities: City[] = [
  { value: 'jakarta', label: 'Jakarta' },
  { value: 'bandung', label: 'Bandung' },
  { value: 'surabaya', label: 'Surabaya' },
  { value: 'yogyakarta', label: 'Yogyakarta' },
]

export default function ComboboxInField() {
  return (
    <Field.Root className="flex w-64 flex-col gap-1.5">
      <Field.Label className="text-body-sm font-medium text-ink">Kota pengiriman</Field.Label>
      <Combobox items={cities} required>
        <ComboboxTrigger>
          <ComboboxValue placeholder="Pilih kota" />
        </ComboboxTrigger>
        <ComboboxContent>
          <ComboboxInput placeholder="Cari kota" aria-label="Cari kota" />
          <ComboboxEmpty>
            <ComboboxEmptyTitle>Kota tidak ditemukan</ComboboxEmptyTitle>
          </ComboboxEmpty>
          <ComboboxList>
            {(city: City) => (
              <ComboboxItem key={city.value} value={city}>
                {city.label}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
      <Field.Description className="text-caption-lg text-ink-2">Kartu fisik dikirim ke kota ini.</Field.Description>
    </Field.Root>
  )
}
