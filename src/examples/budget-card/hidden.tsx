import { useState } from 'react'

import {
  BudgetCard,
  BudgetCardFooter,
  BudgetCardHeader,
  BudgetCardItem,
  BudgetCardList,
  BudgetCardTitle,
  BudgetCardTotal,
} from '@/components/ui/budget-card'
import { Switch } from '@/components/ui/switch'

export default function BudgetCardHidden() {
  const [hidden, setHidden] = useState(true)
  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      <Switch checked={hidden} onCheckedChange={setHidden}>
        Sembunyikan saldo
      </Switch>
      <BudgetCard hidden={hidden}>
        <BudgetCardHeader>
          <BudgetCardTitle>Anggaran Desember</BudgetCardTitle>
        </BudgetCardHeader>
        <BudgetCardList>
          <BudgetCardItem category="Pemasaran" spent={3_100_000} amount={6_000_000} />
          <BudgetCardItem category="Operasional" spent={3_500_000} amount={4_000_000} index={1} />
        </BudgetCardList>
        <BudgetCardFooter>
          <span>Total sisa</span>
          <BudgetCardTotal remaining={3_400_000} total={10_000_000} />
        </BudgetCardFooter>
      </BudgetCard>
    </div>
  )
}
