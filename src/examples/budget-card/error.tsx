import { AlertCircleIcon, ArrowRight01Icon } from '@hugeicons/core-free-icons'

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

export default function BudgetCardError() {
  return (
    <BudgetCard className="w-full max-w-sm">
      <BudgetCardHeader>
        <div>
          <BudgetCardTitle>Anggaran November</BudgetCardTitle>
          <BudgetCardPeriod>Sisa 28 hari</BudgetCardPeriod>
        </div>
        <Button variant="link" render={<a href="#anggaran" />}>
          Kelola anggaran
          <Icon icon={ArrowRight01Icon} />
        </Button>
      </BudgetCardHeader>
      <EmptyState size="sm" role="alert" className="h-75 px-6 pt-0 pb-4">
        <EmptyStateIcon tone="danger">
          <Icon icon={AlertCircleIcon} />
        </EmptyStateIcon>
        <EmptyStateText>
          <EmptyStateTitle>Gagal memuat anggaran.</EmptyStateTitle>
          <EmptyStateDescription>Periksa koneksi Anda, lalu coba lagi.</EmptyStateDescription>
        </EmptyStateText>
        <EmptyStateActions>
          <Button variant="secondary">Coba lagi</Button>
        </EmptyStateActions>
      </EmptyState>
    </BudgetCard>
  )
}
