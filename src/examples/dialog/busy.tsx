import { useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

export default function DialogBusy() {
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  function save() {
    setSaving(true)
    window.setTimeout(() => {
      setSaving(false)
      setOpen(false)
    }, 1500)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen} busy={saving}>
      <DialogTrigger render={<Button variant="secondary" />}>Turunkan saldo</DialogTrigger>
      <DialogContent size="sm">
        <DialogHeader>
          <DialogTitle>Turunkan saldo</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <p className="m-0 text-body-sm text-ink-2">Rp 500.000 kembali ke akun utama.</p>
        </DialogBody>
        <DialogFooter>
          <DialogClose render={<Button variant="secondary" size="lg" />} disabled={saving}>
            Batal
          </DialogClose>
          <Button size="lg" loading={saving} onClick={save}>
            Turunkan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
