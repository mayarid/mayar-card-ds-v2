import { BudgetCard, BudgetCardHeader, BudgetCardPeriod, BudgetCardSkeleton, BudgetCardTitle } from '@/components/ui/budget-card'

export default function BudgetCardLoading() {
  return (
    <BudgetCard className="w-full max-w-md">
      <BudgetCardHeader>
        <div>
          <BudgetCardTitle>Anggaran November</BudgetCardTitle>
          <BudgetCardPeriod>Sisa 18 hari</BudgetCardPeriod>
        </div>
      </BudgetCardHeader>
      <BudgetCardSkeleton rows={4} />
    </BudgetCard>
  )
}
