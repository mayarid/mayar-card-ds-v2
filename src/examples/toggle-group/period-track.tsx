import { useState } from 'react'

import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

export default function ToggleGroupPeriodTrack() {
  const [period, setPeriod] = useState('30')

  return (
    <div className="flex flex-col items-start gap-3">
      <ToggleGroup aria-label="Periode laporan" variant="track" value={period} onValueChange={setPeriod}>
        <ToggleGroupItem value="7">7 hari</ToggleGroupItem>
        <ToggleGroupItem value="30">30 hari</ToggleGroupItem>
        <ToggleGroupItem value="90">90 hari</ToggleGroupItem>
      </ToggleGroup>
      <ToggleGroup aria-label="Periode grafik" variant="track" size="sm" value={period} onValueChange={setPeriod}>
        <ToggleGroupItem value="7">7H</ToggleGroupItem>
        <ToggleGroupItem value="30">30H</ToggleGroupItem>
        <ToggleGroupItem value="90">90H</ToggleGroupItem>
      </ToggleGroup>
    </div>
  )
}
