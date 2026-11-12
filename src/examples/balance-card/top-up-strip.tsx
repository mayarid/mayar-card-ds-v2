import { RefreshIcon } from '@hugeicons/core-free-icons'
import { useState } from 'react'

import {
  BalanceCard,
  BalanceCardActions,
  BalanceCardContent,
  BalanceCardLabel,
  BalanceCardValue,
} from '@/components/ui/balance-card'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'

export default function BalanceCardTopUpStrip() {
  const [balance, setBalance] = useState(48250000)
  const [refreshing, setRefreshing] = useState(false)

  function refresh() {
    setRefreshing(true)
    window.setTimeout(() => {
      setBalance((value) => value + 2500000)
      setRefreshing(false)
    }, 1200)
  }

  return (
    <BalanceCard variant="strip" className="w-full">
      <BalanceCardContent>
        <BalanceCardLabel>Saldo akun perusahaan</BalanceCardLabel>
        <BalanceCardValue value={balance} />
      </BalanceCardContent>
      <BalanceCardActions>
        <Button variant="secondary" loading={refreshing} onClick={refresh}>
          <Icon icon={RefreshIcon} />
          Perbarui
        </Button>
      </BalanceCardActions>
    </BalanceCard>
  )
}
