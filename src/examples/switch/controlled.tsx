import { useState } from 'react'

import { Switch } from '@/components/ui/switch'

export default function SwitchControlled() {
  const [frozen, setFrozen] = useState(false)
  return (
    <div className="flex flex-col gap-2">
      <Switch checked={frozen} onCheckedChange={setFrozen}>
        Bekukan kartu
      </Switch>
      <p className="text-caption-lg text-ink-2">{frozen ? 'Kartu dibekukan. Transaksi baru ditolak.' : 'Kartu aktif.'}</p>
    </div>
  )
}
