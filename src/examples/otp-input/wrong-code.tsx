import { useState } from 'react'

import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { OtpInput } from '@/components/ui/otp-input'

const CORRECT = '123456'

export default function OtpInputWrongCode() {
  const [code, setCode] = useState('')
  const [error, setError] = useState('')

  return (
    <Field invalid={error !== ''} className="w-auto">
      <FieldLabel>Kode verifikasi</FieldLabel>
      <OtpInput
        value={code}
        onValueChange={(next) => {
          setCode(next)
          setError('')
        }}
        onValueComplete={(next) => setError(next === CORRECT ? '' : 'Kode salah. Coba lagi.')}
      />
      {error ? <FieldError>{error}</FieldError> : null}
    </Field>
  )
}
