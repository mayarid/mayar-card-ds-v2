import { ArrowRight01Icon } from '@hugeicons/core-free-icons'

import {
  BudgetCard,
  BudgetCardFooter,
  BudgetCardHeader,
  BudgetCardItem,
  BudgetCardList,
  BudgetCardPeriod,
  BudgetCardTitle,
  BudgetCardTotal,
} from '@/components/ui/budget-card'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'

const budgets = [
  { category: 'Pemasaran', spent: 6_350_000, amount: 6_000_000 },
  { category: 'Software & Langganan', spent: 2_000_000, amount: 2_000_000 },
  { category: 'Perjalanan Dinas', spent: 2_720_000, amount: 3_000_000 },
  { category: 'Operasional', spent: 1_180_000, amount: 4_000_000 },
]

export default function BudgetCardBerandaModule() {
  const total = budgets.reduce((sum, b) => sum + b.amount, 0)
  const spent = budgets.reduce((sum, b) => sum + b.spent, 0)

  return (
    <BudgetCard className="w-full max-w-md">
      <BudgetCardHeader>
        <div>
          <BudgetCardTitle>Anggaran November</BudgetCardTitle>
          <BudgetCardPeriod>Sisa 18 hari</BudgetCardPeriod>
        </div>
        <Button variant="link" render={<a href="#anggaran" />}>
          Kelola anggaran
          <Icon icon={ArrowRight01Icon} />
        </Button>
      </BudgetCardHeader>
      <BudgetCardList>
        {budgets.map((budget, index) => (
          <BudgetCardItem key={budget.category} index={index} {...budget} />
        ))}
      </BudgetCardList>
      <BudgetCardFooter>
        <span>Total sisa</span>
        <BudgetCardTotal remaining={total - spent} total={total} />
      </BudgetCardFooter>
    </BudgetCard>
  )
}
