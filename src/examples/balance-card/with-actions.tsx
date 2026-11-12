import { Add01Icon, Wallet01Icon } from '@hugeicons/core-free-icons'

import {
  BalanceCard,
  BalanceCardActions,
  BalanceCardCaption,
  BalanceCardHeader,
  BalanceCardHideToggle,
  BalanceCardLabel,
  BalanceCardValue,
} from '@/components/ui/balance-card'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'

export default function BalanceCardWithActions() {
  return (
    <BalanceCard className="w-full max-w-sm" onHiddenChange={(hidden) => localStorage.setItem('mcard:hide-balance', hidden ? '1' : '0')}>
      <BalanceCardHeader>
        <BalanceCardLabel>
          <Icon icon={Wallet01Icon} />
          Saldo akun
        </BalanceCardLabel>
        <BalanceCardHideToggle />
      </BalanceCardHeader>
      <BalanceCardValue value={48250000} />
      <BalanceCardCaption>Saldo akun perusahaan</BalanceCardCaption>
      <BalanceCardActions>
        <Button render={<a href="#top-up" />}>
          <Icon icon={Add01Icon} />
          Top up saldo
        </Button>
        <Button variant="secondary" render={<a href="#transaksi" />}>
          Lihat transaksi
        </Button>
      </BalanceCardActions>
    </BalanceCard>
  )
}
