import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { DialogDescription, DialogTitle } from '@/components/ui/dialog'
import {
  PinGate,
  PinGateDialog,
  PinGateField,
  PinGateHeader,
  PinGateIcon,
  usePinGate,
} from '@/components/ui/pin-gate'

function SetPinHeader() {
  const { step } = usePinGate()
  return (
    <PinGateHeader>
      <PinGateIcon />
      <DialogTitle>{step === 'confirm' ? 'Konfirmasi PIN baru' : 'Buat PIN kartu baru'}</DialogTitle>
      <DialogDescription className="text-ink-2">
        {step === 'confirm'
          ? 'Masukkan ulang PIN 6 digit untuk memastikan sama'
          : 'Buat PIN 6 digit baru untuk mengamankan detail kartu Anda'}
      </DialogDescription>
    </PinGateHeader>
  )
}

async function savePin() {
  await new Promise((resolve) => window.setTimeout(resolve, 800))
  return true
}

export default function PinGateSetPin() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button onClick={() => setOpen(true)}>Atur PIN kartu</Button>
      <PinGateDialog open={open} onOpenChange={setOpen}>
        <PinGate
          confirm
          onSubmit={savePin}
          successMessage="PIN kartu berhasil dibuat."
          onSuccess={() => window.setTimeout(() => setOpen(false), 600)}
        >
          <SetPinHeader />
          <PinGateField />
        </PinGate>
      </PinGateDialog>
    </>
  )
}
