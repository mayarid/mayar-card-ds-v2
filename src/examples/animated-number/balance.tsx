import { useState } from 'react'

import { AnimatedNumber } from '@/components/ui/animated-number'
import { Button } from '@/components/ui/button'

export default function AnimatedNumberBalance() {
  const [balance, setBalance] = useState(48_250_000)

  return (
    <div className="flex flex-col items-start gap-3">
      <p className="m-0 text-caption-lg text-ink-2">Saldo</p>
      <AnimatedNumber value={balance} prefix="Rp " className="text-title-lg text-ink" />
      <Button variant="secondary" size="sm" onClick={() => setBalance((b) => b + 5_000_000)}>
        Top up Rp 5.000.000
      </Button>
    </div>
  )
}
