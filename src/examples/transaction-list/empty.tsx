import { ArrowDataTransferHorizontalIcon, Search01Icon } from '@hugeicons/core-free-icons'

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
import { TransactionList } from '@/components/ui/transaction-list'

export default function TransactionListEmpty() {
  return (
    <div className="flex w-full flex-col gap-4">
      <TransactionList>
        <EmptyState>
          <EmptyStateIcon>
            <Icon icon={ArrowDataTransferHorizontalIcon} />
          </EmptyStateIcon>
          <EmptyStateText>
            <EmptyStateTitle>Belum ada transaksi</EmptyStateTitle>
            <EmptyStateDescription>
              Transaksi akan muncul di sini begitu ada pembayaran, top-up, atau biaya.
            </EmptyStateDescription>
          </EmptyStateText>
        </EmptyState>
      </TransactionList>
      <TransactionList>
        <EmptyState>
          <EmptyStateIcon>
            <Icon icon={Search01Icon} />
          </EmptyStateIcon>
          <EmptyStateText>
            <EmptyStateTitle>Tidak ada transaksi yang cocok</EmptyStateTitle>
            <EmptyStateDescription>Ubah atau hapus filter untuk melihat transaksi lain.</EmptyStateDescription>
          </EmptyStateText>
          <EmptyStateActions>
            <Button variant="secondary">Hapus filter</Button>
          </EmptyStateActions>
        </EmptyState>
      </TransactionList>
    </div>
  )
}
