import { useState } from 'react'

import { Field, FieldDescription, FieldHeader, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'

export default function FieldWithCounter() {
  const [nik, setNik] = useState('320101')

  return (
    <Field className="w-80">
      <FieldHeader>
        <FieldLabel required>NIK</FieldLabel>
        <span className="text-caption-lg text-muted tabular-nums" aria-live="polite">
          {nik.length}/16
        </span>
      </FieldHeader>
      <Input required inputMode="numeric" maxLength={16} value={nik} onValueChange={(v) => setNik(v.replace(/\D/g, ''))} />
      <FieldDescription>Nomor induk kependudukan di KTP.</FieldDescription>
    </Field>
  )
}
