import { useState } from 'react'

import { Checkbox } from '@/components/ui/checkbox'

const CARDS = [
  { id: 'marketing', label: 'Kartu Marketing' },
  { id: 'operasional', label: 'Kartu Operasional' },
  { id: 'perjalanan', label: 'Kartu Perjalanan' },
]

export default function CheckboxSelectAll() {
  const [selected, setSelected] = useState<string[]>(['marketing'])
  const all = selected.length === CARDS.length
  const some = selected.length > 0 && !all

  return (
    <div className="flex flex-col">
      <Checkbox
        checked={all}
        indeterminate={some}
        onCheckedChange={(checked) => setSelected(checked ? CARDS.map((c) => c.id) : [])}
      >
        Pilih semua kartu
      </Checkbox>
      <div className="flex flex-col pl-6">
        {CARDS.map((card) => (
          <Checkbox
            key={card.id}
            checked={selected.includes(card.id)}
            onCheckedChange={(checked) =>
              setSelected((prev) => (checked ? [...prev, card.id] : prev.filter((id) => id !== card.id)))
            }
          >
            {card.label}
          </Checkbox>
        ))}
      </div>
    </div>
  )
}
