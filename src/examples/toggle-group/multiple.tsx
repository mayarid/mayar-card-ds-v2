import { useState } from 'react'

import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

export default function ToggleGroupMultiple() {
  const [status, setStatus] = useState<string[]>(['success'])

  return (
    <div className="flex flex-col gap-3">
      <ToggleGroup aria-label="Status transaksi" multiple size="sm" value={status} onValueChange={setStatus}>
        <ToggleGroupItem value="success">Berhasil</ToggleGroupItem>
        <ToggleGroupItem value="pending">Tertunda</ToggleGroupItem>
        <ToggleGroupItem value="failed">Gagal</ToggleGroupItem>
        <ToggleGroupItem value="refunded">Dikembalikan</ToggleGroupItem>
      </ToggleGroup>
      <p className="text-caption-lg text-ink-2">
        {status.length === 0 ? 'Semua status' : `${status.length} status dipilih`}
      </p>
    </div>
  )
}
