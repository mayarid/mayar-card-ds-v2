import { Alert02Icon, CreditCardIcon } from '@hugeicons/core-free-icons'

import {
  BalanceCard,
  BalanceCardActions,
  BalanceCardCaption,
  BalanceCardLabel,
  BalanceCardValue,
} from '@/components/ui/balance-card'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'

export default function BalanceCardLowBalance() {
  return (
    <BalanceCard className="w-full max-w-sm">
      <BalanceCardLabel>
        <Icon icon={CreditCardIcon} />
        Saldo kartu Marketing
      </BalanceCardLabel>
      <BalanceCardValue value={85000} />
      <BalanceCardCaption tone="warning">
        <Icon icon={Alert02Icon} />
        Saldo menipis. Tambah saldo agar pembayaran tidak ditolak.
      </BalanceCardCaption>
      <BalanceCardActions>
        <Button size="sm">Tambah saldo</Button>
      </BalanceCardActions>
    </BalanceCard>
  )
}
