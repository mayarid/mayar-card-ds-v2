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
      {/* The actions sit in the header row, at the right of the label and above the figure. */}
      <BalanceCardHeader>
        <BalanceCardLabel>
          <Icon icon={Wallet01Icon} />
          Saldo akun
        </BalanceCardLabel>
        <BalanceCardActions>
          <Button size="sm" render={<a href="#top-up" />}>
            <Icon icon={Add01Icon} />
            Top up
          </Button>
          <Button size="sm" variant="secondary" render={<a href="#transaksi" />}>
            Transaksi
          </Button>
          <BalanceCardHideToggle className="my-0 me-0" />
        </BalanceCardActions>
      </BalanceCardHeader>
      <BalanceCardValue value={48250000} />
      <BalanceCardCaption>Saldo akun perusahaan</BalanceCardCaption>
    </BalanceCard>
  )
}
