import { SnowIcon } from '@hugeicons/core-free-icons'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { CardFace } from '@/components/ui/card-face'
import { Icon } from '@/components/ui/icon'

export default function CardFaceFreeze() {
  const [frozen, setFrozen] = useState(false)

  return (
    <div className="flex flex-col items-center gap-4">
      {/* animated: the WebGL ice grows in on freeze and melts on unfreeze (CSS frost without WebGL). */}
      <CardFace
        skin="emerald"
        label="Operasional Gudang"
        last4="3058"
        holder="ANDI PRATAMA"
        status={frozen ? 'frozen' : 'active'}
        width={360}
        animated
      />
      <Button variant={frozen ? 'primary' : 'secondary'} onClick={() => setFrozen((v) => !v)}>
        <Icon icon={SnowIcon} />
        {frozen ? 'Buka bekukan' : 'Bekukan kartu'}
      </Button>
    </div>
  )
}
