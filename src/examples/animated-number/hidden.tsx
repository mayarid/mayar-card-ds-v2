import { ViewIcon, ViewOffSlashIcon } from '@hugeicons/core-free-icons'
import { useState } from 'react'

import { AnimatedNumber } from '@/components/ui/animated-number'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'

export default function AnimatedNumberHidden() {
  const [hidden, setHidden] = useState(true)

  return (
    <div className="flex items-center gap-2">
      <AnimatedNumber
        value={12_500_000}
        prefix="Rp "
        hidden={hidden}
        hiddenLabel="Saldo disembunyikan"
        className="text-title-md text-ink"
      />
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label={hidden ? 'Tampilkan saldo' : 'Sembunyikan saldo'}
        aria-pressed={!hidden}
        onClick={() => setHidden((h) => !h)}
      >
        <Icon icon={hidden ? ViewIcon : ViewOffSlashIcon} />
      </Button>
    </div>
  )
}
