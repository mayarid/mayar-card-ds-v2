import { Building03Icon, UserIcon } from '@hugeicons/core-free-icons'

import { ChoiceCard, ChoiceCardGroup, ChoiceCardPair } from '@/components/ui/choice-card'
import { Icon } from '@/components/ui/icon'

export default function ChoiceCardIcon() {
  return (
    <ChoiceCardGroup aria-label="Jenis akun" defaultValue="personal" className="w-full max-w-2xl">
      <ChoiceCardPair>
        <ChoiceCard
          variant="icon"
          value="personal"
          icon={<Icon icon={UserIcon} />}
          title="Perorangan"
          description="Verifikasi dengan KTP."
        />
        <ChoiceCard
          variant="icon"
          value="business"
          icon={<Icon icon={Building03Icon} />}
          title="Badan usaha"
          description="Verifikasi dengan NIB dan akta."
        />
      </ChoiceCardPair>
    </ChoiceCardGroup>
  )
}
