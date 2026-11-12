import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field'
import { Input, InputPrefix } from '@/components/ui/input'

const LIMIT = 10_000_000

export default function FieldValidation() {
  const [amount, setAmount] = useState('25.000.000')
  const [error, setError] = useState('')

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const value = Number(amount.replace(/\D/g, ''))
    if (!value) setError('Nominal wajib diisi.')
    else if (value > LIMIT) setError('Nominal melebihi batas Rp10.000.000.')
    else setError('')
  }

  return (
    <form onSubmit={submit} noValidate className="flex w-80 flex-col gap-3">
      <Field invalid={error !== ''}>
        <FieldLabel required>Nominal top up</FieldLabel>
        <Input inputMode="numeric" value={amount} onValueChange={setAmount} leading={<InputPrefix>Rp</InputPrefix>} />
        <FieldDescription>Saldo masuk dalam 1 menit.</FieldDescription>
        {error ? <FieldError>{error}</FieldError> : null}
      </Field>
      <Button type="submit" className="self-start">
        Top up
      </Button>
    </form>
  )
}
