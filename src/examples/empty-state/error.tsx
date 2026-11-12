import { Alert02Icon } from '@hugeicons/core-free-icons'

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

export default function EmptyStateError() {
  return (
    <EmptyState role="alert">
      <EmptyStateIcon tone="danger">
        <Icon icon={Alert02Icon} />
      </EmptyStateIcon>
      <EmptyStateText>
        <EmptyStateTitle>Gagal memuat transaksi</EmptyStateTitle>
        <EmptyStateDescription>Periksa koneksi, lalu coba lagi.</EmptyStateDescription>
      </EmptyStateText>
      <EmptyStateActions>
        <Button variant="secondary">Coba lagi</Button>
      </EmptyStateActions>
    </EmptyState>
  )
}
