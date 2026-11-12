import { SnowIcon } from '@hugeicons/core-free-icons'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { CardFace } from '@/components/ui/card-face'
import { Icon } from '@/components/ui/icon'

export default function CardFaceHammer() {
  const [frozen, setFrozen] = useState(true)
  const [notice, setNotice] = useState('')

  return (
    <div className="flex flex-col items-center gap-4">
      {/* onShatter makes the ice breakable: hammer it with the pointer, or press Enter three times. */}
      <CardFace
        skin="royal"
        label="Langganan SaaS"
        last4="4821"
        holder="RINA WULANDARI"
        status={frozen ? 'frozen' : 'active'}
        width={420}
        className="max-w-full"
        elevated
        animated
        onShatter={() => {
          // In the app this sends the unfreeze request; the card turns active when it succeeds.
          setFrozen(false)
          setNotice('Blokir kartu dibuka')
        }}
      />
      <p className="text-center text-body-sm text-ink-2">
        {frozen ? 'Pukul es dengan palu sampai pecah untuk membuka blokir.' : 'Kartu aktif lagi.'}
      </p>
      {frozen ? null : (
        <Button
          variant="secondary"
          onClick={() => {
            setFrozen(true)
            setNotice('Kartu dibekukan')
          }}
        >
          <Icon icon={SnowIcon} />
          Bekukan lagi
        </Button>
      )}
      <p role="status" className="sr-only">
        {notice}
      </p>
    </div>
  )
}
