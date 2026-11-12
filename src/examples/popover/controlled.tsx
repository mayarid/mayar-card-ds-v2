import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

export default function PopoverControlled() {
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState('—')

  return (
    <div className="flex items-center gap-3">
      <Popover
        open={open}
        onOpenChange={(next, details) => {
          setOpen(next)
          setReason(details.reason)
        }}
      >
        <PopoverTrigger render={<Button variant="secondary" />}>Cari kartu</PopoverTrigger>
        <PopoverContent aria-label="Hasil pencarian" align="start" className="w-64">
          <p className="m-0 p-4 text-body-sm text-ink-2">3 kartu cocok dengan "Mark".</p>
        </PopoverContent>
      </Popover>
      <span className="text-caption-lg text-ink-2">Alasan terakhir: {reason}</span>
    </div>
  )
}
