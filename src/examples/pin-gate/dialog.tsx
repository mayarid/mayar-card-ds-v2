import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { DialogDescription, DialogTitle } from '@/components/ui/dialog'
import {
  PinGate,
  PinGateActionSeparator,
  PinGateActions,
  PinGateDialog,
  PinGateField,
  PinGateHeader,
  PinGateIcon,
} from '@/components/ui/pin-gate'

/** Demo only: the right PIN is 246810. Check the PIN on your server. */
async function checkPin(pin: string) {
  await new Promise((resolve) => window.setTimeout(resolve, 800))
  return pin === '246810'
}

export default function PinGateInDialog() {
  const [open, setOpen] = useState(false)
  const [revealed, setRevealed] = useState(false)

  return (
    <div className="flex flex-col items-center gap-3">
      <Button variant="secondary" onClick={() => setOpen(true)}>
        {revealed ? 'Detail kartu terbuka' : 'Lihat detail kartu'}
      </Button>
      <PinGateDialog open={open} onOpenChange={setOpen}>
        <PinGate
          onSubmit={checkPin}
          onSuccess={() => {
            setRevealed(true)
            window.setTimeout(() => setOpen(false), 600)
          }}
        >
          <PinGateHeader>
            <PinGateIcon />
            <DialogTitle>Masukkan PIN Anda</DialogTitle>
            <DialogDescription className="text-ink-2">Masukkan 6 digit PIN Anda untuk melanjutkan</DialogDescription>
          </PinGateHeader>
          <PinGateField />
          <PinGateActions>
            <Button variant="link">Lupa PIN?</Button>
            <PinGateActionSeparator />
            <Button variant="link-muted">Atur PIN baru</Button>
          </PinGateActions>
        </PinGate>
      </PinGateDialog>
    </div>
  )
}
