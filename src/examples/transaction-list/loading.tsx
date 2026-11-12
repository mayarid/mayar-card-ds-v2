import { TransactionList, TransactionListSkeleton } from '@/components/ui/transaction-list'

export default function TransactionListLoading() {
  return (
    <TransactionList className="w-full">
      <TransactionListSkeleton groups={[3, 2]} />
    </TransactionList>
  )
}
