import { useState } from 'react'

import { RadioGroup, RadioGroupItem } from '@/components/ui/radio'

export default function RadioControlledInline() {
  const [type, setType] = useState('virtual')
  return (
    <div className="flex flex-col gap-1">
      <RadioGroup aria-label="Jenis kartu" value={type} onValueChange={(v) => setType(String(v))} className="flex-row gap-6">
        <RadioGroupItem value="virtual">Virtual</RadioGroupItem>
        <RadioGroupItem value="fisik">Fisik</RadioGroupItem>
      </RadioGroup>
      <p className="text-caption-lg text-ink-2">
        {type === 'virtual' ? 'Kartu langsung aktif setelah dibuat.' : 'Kartu dikirim ke alamat kantor.'}
      </p>
    </div>
  )
}
