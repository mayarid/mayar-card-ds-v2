import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Field, FieldLabel } from '@/components/ui/field'
import { Kbd } from '@/components/ui/kbd'
import { Textarea } from '@/components/ui/textarea'

export default function TextareaSubmitShortcut() {
  const [sent, setSent] = useState('')

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    setSent(String(data.get('reason') ?? ''))
  }

  return (
    <form onSubmit={submit} className="flex w-80 flex-col gap-3">
      <Field>
        <FieldLabel>Alasan penolakan</FieldLabel>
        <Textarea name="reason" placeholder="Tulis alasan" />
      </Field>
      <div className="flex items-center justify-between gap-3">
        <span className="text-caption-lg text-ink-2">
          <Kbd>⌘</Kbd> <Kbd>Enter</Kbd> untuk kirim
        </span>
        <Button type="submit">Kirim</Button>
      </div>
      {sent ? <p className="text-caption-lg text-success-text">Terkirim: {sent}</p> : null}
    </form>
  )
}
