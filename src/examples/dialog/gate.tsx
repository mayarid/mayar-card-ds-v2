import { useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export default function DialogGate() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button onClick={() => setOpen(true)}>Mulai verifikasi</Button>
      <Dialog open={open} onOpenChange={setOpen} dismiss="none">
        <DialogContent mobileSheet>
          <DialogHeader aside={<span className="text-caption-lg text-ink-2">Langkah 1 dari 3</span>}>
            <DialogTitle>Verifikasi KYC</DialogTitle>
            <DialogDescription>Lengkapi data diri untuk memakai kartu.</DialogDescription>
          </DialogHeader>
          <DialogBody>
            <p className="m-0 text-body-sm text-ink-2">Siapkan KTP dan NPWP perusahaan.</p>
          </DialogBody>
          <DialogFooter>
            <Button variant="ghost" size="lg" className="mr-auto" onClick={() => setOpen(false)}>
              Keluar
            </Button>
            <Button size="lg">Lanjut</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
