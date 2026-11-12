import { Button } from '@/components/ui/button'
import {
  PinGate,
  PinGateActions,
  PinGateDescription,
  PinGateField,
  PinGateHeader,
  PinGateIcon,
  PinGateTitle,
} from '@/components/ui/pin-gate'

/** Demo only: the right PIN is 246810. */
async function checkPin(pin: string) {
  await new Promise((resolve) => window.setTimeout(resolve, 600))
  return pin === '246810'
}

export default function PinGateInline() {
  return (
    <section className="w-full max-w-sm rounded-card bg-surface px-6 pt-8 pb-6 shadow-control">
      <PinGate onSubmit={checkPin} maxAttempts={3} lockoutSeconds={30} autoFocus={false}>
        <PinGateHeader>
          <PinGateIcon />
          <PinGateTitle>Konfirmasi pemindahan saldo</PinGateTitle>
          <PinGateDescription>Rp 2.500.000 ke kartu Operasional Jakarta</PinGateDescription>
        </PinGateHeader>
        <PinGateField />
        <PinGateActions>
          <Button variant="link">Lupa PIN?</Button>
        </PinGateActions>
      </PinGate>
    </section>
  )
}
