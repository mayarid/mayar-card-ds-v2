import { BankIcon, CreditCardIcon, QrCodeIcon } from '@hugeicons/core-free-icons'

import { ChoiceCard, ChoiceCardGroup } from '@/components/ui/choice-card'
import { Icon } from '@/components/ui/icon'

export default function ChoiceCardMethod() {
  return (
    <ChoiceCardGroup aria-label="Metode top up" defaultValue="va" className="w-full max-w-sm">
      <ChoiceCard variant="method" value="va" icon={<Icon icon={BankIcon} />} title="Virtual account" description="Diproses otomatis" />
      <ChoiceCard variant="method" value="qris" icon={<Icon icon={QrCodeIcon} />} title="QRIS" description="Maks. Rp10.000.000" />
      <ChoiceCard
        variant="method"
        value="card"
        icon={<Icon icon={CreditCardIcon} />}
        title="Kartu kredit"
        description="Segera hadir"
        disabled
      />
    </ChoiceCardGroup>
  )
}
