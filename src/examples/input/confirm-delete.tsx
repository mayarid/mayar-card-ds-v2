import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'

export default function InputConfirmDelete() {
  const [value, setValue] = useState('')

  return (
    <div className="flex w-80 flex-col gap-3">
      <Field>
        <FieldLabel>Ketik HAPUS untuk menghapus akun</FieldLabel>
        <Input tone="danger" value={value} onValueChange={setValue} />
        <FieldDescription>Tindakan ini tidak bisa dibatalkan.</FieldDescription>
      </Field>
      <Button variant="danger" disabled={value !== 'HAPUS'} className="self-start">
        Hapus akun
      </Button>
    </div>
  )
}
