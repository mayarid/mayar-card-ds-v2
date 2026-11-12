import { useState } from 'react'

import { ChoiceCard, ChoiceCardGroup, ChoiceCardPair } from '@/components/ui/choice-card'

export default function ChoiceCardPairExample() {
  const [type, setType] = useState('virtual')

  return (
    <div className="flex w-full max-w-2xl flex-col gap-2.5">
      <span id="card-type-label" className="text-body-sm font-medium text-ink">
        Jenis kartu
      </span>
      <ChoiceCardGroup
        aria-labelledby="card-type-label"
        name="card-type"
        value={type}
        onValueChange={(value) => setType(String(value))}
      >
        <ChoiceCardPair>
          <ChoiceCard value="virtual" title="Kartu virtual" description="Langsung aktif untuk belanja online." />
          <ChoiceCard value="physical" title="Kartu fisik" description="Dikirim ke alamat Anda dalam 3–5 hari." />
        </ChoiceCardPair>
      </ChoiceCardGroup>
    </div>
  )
}
