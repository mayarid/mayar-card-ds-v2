import { Wallet01Icon } from '@hugeicons/core-free-icons'

import { BalanceCard, BalanceCardCaption, BalanceCardLabel, BalanceCardValue } from '@/components/ui/balance-card'
import { Icon } from '@/components/ui/icon'

export default function BalanceCardLoading() {
  return (
    <BalanceCard loading className="w-full max-w-sm">
      <BalanceCardLabel>
        <Icon icon={Wallet01Icon} />
        Saldo akun
      </BalanceCardLabel>
      <BalanceCardValue value={0} />
      <BalanceCardCaption>Saldo akun perusahaan</BalanceCardCaption>
    </BalanceCard>
  )
}
