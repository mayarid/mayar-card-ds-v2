import { useState } from 'react'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const plans = [
  { value: '', label: 'Semua paket' },
  { value: 'starter', label: 'Starter' },
  { value: 'business', label: 'Business' },
]

export default function SelectFilter() {
  const [plan, setPlan] = useState<string | null>('business')
  const label = plans.find((p) => p.value === plan)?.label
  return (
    <Select items={plans} value={plan} onValueChange={setPlan}>
      <SelectTrigger aria-label="Paket" size="md" tone={plan ? 'active' : 'default'} className="w-auto">
        <SelectValue>{plan ? `Paket: ${label}` : 'Semua paket'}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        {plans.map((p) => (
          <SelectItem key={p.value} value={p.value}>
            {p.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
