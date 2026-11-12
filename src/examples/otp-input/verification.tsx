import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field'
import { OtpInput } from '@/components/ui/otp-input'

export default function OtpInputVerification() {
  const [code, setCode] = useState('')

  return (
    <div className="flex flex-col items-start gap-3">
      <Field className="w-auto">
        <FieldLabel>Kode verifikasi</FieldLabel>
        <OtpInput value={code} onValueChange={setCode} />
        <FieldDescription>Kami kirim 6 digit kode ke +62 812-••••-1234.</FieldDescription>
      </Field>
      <Button variant="link">Kirim ulang kode</Button>
    </div>
  )
}
