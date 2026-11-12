import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Step, Steps } from '@/components/ui/steps'

const STEPS = ['Data diri', 'Dokumen', 'Paket']

export default function StepsKyc() {
  const [current, setCurrent] = useState(1)

  return (
    <div className="flex w-80 flex-col gap-4">
      <Steps current={current} aria-label="Verifikasi akun">
        {STEPS.map((label) => (
          <Step key={label}>{label}</Step>
        ))}
      </Steps>
      <div className="flex justify-between">
        <Button variant="secondary" disabled={current <= 1} onClick={() => setCurrent((c) => c - 1)}>
          Kembali
        </Button>
        <Button disabled={current > STEPS.length} onClick={() => setCurrent((c) => c + 1)}>
          {current >= STEPS.length ? 'Selesai' : 'Lanjut'}
        </Button>
      </div>
    </div>
  )
}
