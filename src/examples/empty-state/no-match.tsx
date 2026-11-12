import { Search01Icon } from '@hugeicons/core-free-icons'

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

export default function EmptyStateNoMatch() {
  return (
    <div className="w-80 rounded-card bg-surface shadow-ring">
      <EmptyState size="sm">
        <EmptyStateIcon shape="square">
          <Icon icon={Search01Icon} />
        </EmptyStateIcon>
        <EmptyStateText>
          <EmptyStateTitle>Tidak ada yang cocok</EmptyStateTitle>
          <EmptyStateDescription>Ubah kata kunci atau hapus filter.</EmptyStateDescription>
        </EmptyStateText>
        <EmptyStateActions>
          <Button variant="ghost" size="sm">
            Hapus filter
          </Button>
        </EmptyStateActions>
      </EmptyState>
    </div>
  )
}
