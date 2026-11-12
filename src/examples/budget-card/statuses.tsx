import { BudgetCard, BudgetCardHeader, BudgetCardItem, BudgetCardList, BudgetCardTitle } from '@/components/ui/budget-card'

export default function BudgetCardStatuses() {
  return (
    <BudgetCard className="w-full max-w-md">
      <BudgetCardHeader>
        <BudgetCardTitle>Status anggaran</BudgetCardTitle>
      </BudgetCardHeader>
      <BudgetCardList>
        <BudgetCardItem category="Operasional · sesuai rencana" spent={1_800_000} amount={4_000_000} />
        <BudgetCardItem category="Perjalanan Dinas · hampir habis" spent={2_700_000} amount={3_000_000} index={1} />
        <BudgetCardItem category="Software & Langganan · habis" spent={2_000_000} amount={2_000_000} index={2} />
        <BudgetCardItem category="Pemasaran · terlampaui" spent={6_900_000} amount={6_000_000} index={3} />
      </BudgetCardList>
    </BudgetCard>
  )
}
