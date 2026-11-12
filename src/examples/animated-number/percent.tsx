import { useState } from 'react'

import { AnimatedNumber } from '@/components/ui/animated-number'
import { Button } from '@/components/ui/button'

const PERIODS = { '7 hari': 12.4, '30 hari': 38.75, '90 hari': 71.2 } as const

export default function AnimatedNumberPercent() {
  const [period, setPeriod] = useState<keyof typeof PERIODS>('30 hari')

  return (
    <div className="flex flex-col items-start gap-3">
      <AnimatedNumber
        value={PERIODS[period]}
        suffix="%"
        format={{ minimumFractionDigits: 1, maximumFractionDigits: 1 }}
        className="text-title-md text-ink"
      />
      <div className="flex gap-1">
        {(Object.keys(PERIODS) as (keyof typeof PERIODS)[]).map((p) => (
          <Button key={p} variant="ghost" size="sm" aria-pressed={p === period} onClick={() => setPeriod(p)}>
            {p}
          </Button>
        ))}
      </div>
    </div>
  )
}
