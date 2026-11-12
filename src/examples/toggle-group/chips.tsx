import { useState } from 'react'

import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

export default function ToggleGroupChips() {
  const [status, setStatus] = useState('all')

  return (
    <ToggleGroup aria-label="Status transaksi" value={status} onValueChange={setStatus}>
      <ToggleGroupItem value="all">Semua</ToggleGroupItem>
      <ToggleGroupItem value="success">Berhasil</ToggleGroupItem>
      <ToggleGroupItem value="pending">Diproses</ToggleGroupItem>
      <ToggleGroupItem value="failed">Gagal</ToggleGroupItem>
    </ToggleGroup>
  )
}
