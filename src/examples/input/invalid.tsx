import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'

export default function InputInvalid() {
  const [email, setEmail] = useState('budi@')
  const [error, setError] = useState('')

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(/^\S+@\S+\.\S+$/.test(email) ? '' : 'Masukkan email yang valid, misalnya budi@mayar.id.')
  }

  return (
    <form onSubmit={submit} noValidate className="flex w-80 flex-col gap-3">
      <Field invalid={error !== ''}>
        <FieldLabel>Email</FieldLabel>
        <Input type="email" value={email} onValueChange={setEmail} />
        {error ? <FieldError>{error}</FieldError> : null}
      </Field>
      <Button type="submit" className="self-start">
        Simpan
      </Button>
    </form>
  )
}
