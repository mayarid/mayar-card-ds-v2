import { Field, FieldDescription, FieldLabel } from '@/components/ui/field'
import { Input, InputPrefix } from '@/components/ui/input'

export default function InputAmount() {
  return (
    <Field className="w-72">
      <FieldLabel>Batas harian</FieldLabel>
      <Input inputMode="numeric" defaultValue="2.500.000" leading={<InputPrefix>Rp</InputPrefix>} />
      <FieldDescription>Maksimal Rp10.000.000 per hari.</FieldDescription>
    </Field>
  )
}
