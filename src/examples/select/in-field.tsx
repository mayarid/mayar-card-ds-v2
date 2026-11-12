import { Field } from '@base-ui/react/field'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const categories = { operasional: 'Operasional', pemasaran: 'Pemasaran', perjalanan: 'Perjalanan' }

export default function SelectInField() {
  return (
    <Field.Root invalid className="flex w-64 flex-col gap-1.5">
      <Field.Label className="text-body-sm font-medium text-ink">Kategori pengeluaran</Field.Label>
      <Select items={categories} required>
        <SelectTrigger>
          <SelectValue placeholder="Pilih kategori" />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(categories).map(([value, label]) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Field.Error match className="text-caption-lg text-danger-text">
        Pilih kategori dulu.
      </Field.Error>
    </Field.Root>
  )
}
