import { Add01Icon, CreditCardIcon } from '@hugeicons/core-free-icons'

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

export default function EmptyStateNoData() {
  return (
    <EmptyState>
      <EmptyStateIcon>
        <Icon icon={CreditCardIcon} />
      </EmptyStateIcon>
      <EmptyStateText>
        <EmptyStateTitle render={<h2 />}>Belum ada kartu</EmptyStateTitle>
        <EmptyStateDescription>Buat kartu pertama untuk mulai belanja.</EmptyStateDescription>
      </EmptyStateText>
      <EmptyStateActions>
        <Button>
          <Icon icon={Add01Icon} />
          Buat kartu
        </Button>
      </EmptyStateActions>
    </EmptyState>
  )
}
