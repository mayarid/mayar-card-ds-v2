import { Field, FieldDescription, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'

export default function FieldBasic() {
  return (
    <div className="flex w-80 flex-col gap-4">
      <Field>
        <FieldLabel required>Nama kartu</FieldLabel>
        <Input required placeholder="Contoh: Iklan Meta" />
        <FieldDescription>Tampil di daftar kartu dan di laporan.</FieldDescription>
      </Field>
      <Field>
        <FieldLabel optional>Kode referensi</FieldLabel>
        <Input placeholder="REF-001" />
      </Field>
      <Field disabled>
        <FieldLabel>Mata uang</FieldLabel>
        <Input defaultValue="IDR" />
      </Field>
    </div>
  )
}
