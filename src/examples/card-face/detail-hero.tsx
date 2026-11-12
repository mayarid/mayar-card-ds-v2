import { ViewIcon, ViewOffSlashIcon } from '@hugeicons/core-free-icons'
import { useId, useState } from 'react'

import { Button } from '@/components/ui/button'
import { CardFace } from '@/components/ui/card-face'
import { Icon } from '@/components/ui/icon'

// Fake data. In the app the number comes from a PIN-gated reveal and stays in memory only.
const card = { last4: '4821', number: '5412751234564821', expiry: '08/29', holder: 'RINA WULANDARI' }

export default function CardFaceDetailHero() {
  const [revealed, setRevealed] = useState(false)
  const faceId = useId()

  return (
    <div className="flex w-full max-w-[452px] flex-col items-center gap-5 rounded-2xl bg-surface p-4 shadow-control">
      <CardFace
        id={faceId}
        skin="royal"
        label="Langganan SaaS"
        last4={card.last4}
        number={revealed ? card.number : null}
        expiry={revealed ? card.expiry : '••/••'}
        holder={card.holder}
        width={420}
        elevated
        className="max-w-full"
      />
      <Button
        variant="secondary"
        aria-pressed={revealed}
        aria-controls={faceId}
        onClick={() => setRevealed((v) => !v)}
      >
        <Icon icon={revealed ? ViewOffSlashIcon : ViewIcon} />
        {revealed ? 'Sembunyikan detail' : 'Lihat detail kartu'}
      </Button>
      <p role="status" className="sr-only">
        {revealed ? 'Nomor kartu ditampilkan.' : ''}
      </p>
    </div>
  )
}
