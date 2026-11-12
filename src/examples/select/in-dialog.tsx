import { Dialog } from '@base-ui/react/dialog'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const periods = [
  { value: 'harian', label: 'Harian' },
  { value: 'bulanan', label: 'Bulanan' },
]

export default function SelectInDialog() {
  const [period, setPeriod] = useState<string | null>('bulanan')
  return (
    <Dialog.Root>
      <Dialog.Trigger render={<Button variant="secondary" />}>Ubah batas</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-(--z-modal) bg-overlay" />
        <Dialog.Popup className="fixed top-1/2 left-1/2 z-(--z-modal) flex w-80 -translate-1/2 flex-col gap-4 rounded-2xl bg-surface p-5 shadow-popover">
          <Dialog.Title className="text-title-sm text-ink">Ubah batas</Dialog.Title>
          <Select items={periods} value={period} onValueChange={setPeriod}>
            <SelectTrigger aria-label="Periode">
              <SelectValue placeholder="Pilih periode" />
            </SelectTrigger>
            <SelectContent>
              {periods.map((p) => (
                <SelectItem key={p.value} value={p.value}>
                  {p.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Dialog.Close render={<Button />}>Simpan</Dialog.Close>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
