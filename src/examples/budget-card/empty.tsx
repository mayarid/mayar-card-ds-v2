import { Invoice01Icon } from '@hugeicons/core-free-icons'

import { BudgetCard, BudgetCardHeader, BudgetCardPeriod, BudgetCardTitle } from '@/components/ui/budget-card'
import { Button } from '@/components/ui/button'
import {
  EmptyState,
  EmptyStateActions,
  EmptyStateDescription,
  EmptyStateIcon,
  EmptyStateText,
  EmptyStateTitle,
} from '@/components/ui/empty-state'
import { Icon } from '@/components/ui/icon'

export default function BudgetCardEmpty() {
  return (
    <BudgetCard className="w-full max-w-md">
      <BudgetCardHeader>
        <div>
          <BudgetCardTitle>Anggaran November</BudgetCardTitle>
          <BudgetCardPeriod>Sisa 18 hari</BudgetCardPeriod>
        </div>
      </BudgetCardHeader>
      <EmptyState size="sm">
        <EmptyStateIcon>
          <Icon icon={Invoice01Icon} />
        </EmptyStateIcon>
        <EmptyStateText>
          <EmptyStateTitle>Belum ada anggaran</EmptyStateTitle>
          <EmptyStateDescription>Atur batas pengeluaran per kategori.</EmptyStateDescription>
        </EmptyStateText>
        <EmptyStateActions>
          <Button variant="secondary" size="sm" render={<a href="#anggaran" />}>
            Atur anggaran
          </Button>
        </EmptyStateActions>
      </EmptyState>
    </BudgetCard>
  )
}
