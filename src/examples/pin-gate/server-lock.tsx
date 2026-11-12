import { useRef } from 'react'

import {
  PinGate,
  PinGateDescription,
  PinGateField,
  PinGateHeader,
  PinGateIcon,
  PinGateTitle,
  type PinGateResult,
} from '@/components/ui/pin-gate'

export default function PinGateServerLock() {
  const tries = useRef(0)

  // Your server counts the tries and says when the lock ends. Any PIN is wrong in this demo.
  async function checkPin(): Promise<PinGateResult> {
    await new Promise((resolve) => window.setTimeout(resolve, 500))
    tries.current += 1
    const left = 3 - tries.current
    if (left > 0) return { attemptsLeft: left }
    tries.current = 0
    return { locked: true, retryAfter: 15 }
  }

  return (
    <PinGate onSubmit={checkPin} autoFocus={false} className="w-full max-w-sm">
      <PinGateHeader>
        <PinGateIcon />
        <PinGateTitle>Masukkan PIN Anda</PinGateTitle>
        <PinGateDescription>Tiga kali salah mengunci PIN selama 15 detik</PinGateDescription>
      </PinGateHeader>
      <PinGateField />
    </PinGate>
  )
}
