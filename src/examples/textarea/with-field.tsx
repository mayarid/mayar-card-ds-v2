import { Field, FieldDescription, FieldLabel } from '@/components/ui/field'
import { Textarea } from '@/components/ui/textarea'

export default function TextareaWithField() {
  return (
    <Field className="w-80">
      <FieldLabel optional>Catatan untuk pemegang kartu</FieldLabel>
      <Textarea placeholder="Contoh: dipakai untuk iklan bulan ini" maxLength={200} />
      <FieldDescription>Maksimal 200 karakter.</FieldDescription>
    </Field>
  )
}
