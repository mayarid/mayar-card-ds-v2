import { SnowIcon } from '@hugeicons/core-free-icons'
import { useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import { CardFreezeEffect } from '@/components/ui/card-freeze-effect'
import { Icon } from '@/components/ui/icon'

export default function CardFreezeEffectCustomSurface() {
  const [frozen, setFrozen] = useState(false)
  const [noWebGl, setNoWebGl] = useState(false)
  const faceRef = useRef<HTMLDivElement>(null)

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        role="img"
        aria-label={frozen ? 'Kartu Gold, berakhiran 1907, dibekukan' : 'Kartu Gold, berakhiran 1907'}
        className="relative h-[189px] w-[300px] overflow-clip rounded-2xl"
      >
        <div
          ref={faceRef}
          className="flex size-full flex-col justify-end gap-1 bg-linear-140 from-skin-gold-1 via-skin-gold-2 to-skin-gold-3 p-5 text-on-brand"
        >
          <span className="font-mono text-body-base tracking-widest">••••  1907</span>
          <span className="text-caption-lg font-semibold">BUDI SANTOSO</span>
        </div>
        {/* Without WebGL the effect draws nothing: the host shows its own frost. */}
        {frozen && noWebGl ? <div className="absolute inset-0 bg-primary-300/40 backdrop-blur-[3px]" /> : null}
        <CardFreezeEffect
          frozen={frozen}
          interactive={false}
          renderScale={300 / 420}
          targetRef={faceRef}
          onFail={() => setNoWebGl(true)}
        />
      </div>
      <Button variant="secondary" onClick={() => setFrozen((v) => !v)}>
        <Icon icon={SnowIcon} />
        {frozen ? 'Buka bekukan' : 'Bekukan'}
      </Button>
    </div>
  )
}
