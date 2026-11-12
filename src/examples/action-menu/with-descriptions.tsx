import { MoreHorizontalIcon } from '@hugeicons/core-free-icons'

import { ActionMenu, ActionMenuContent, ActionMenuItem, ActionMenuTrigger } from '@/components/ui/action-menu'
import { Icon } from '@/components/ui/icon'

export default function ActionMenuWithDescriptions() {
  return (
    <ActionMenu>
      <ActionMenuTrigger variant="icon" aria-label="Ubah peran">
        <Icon icon={MoreHorizontalIcon} />
      </ActionMenuTrigger>
      <ActionMenuContent className="w-72">
        <ActionMenuItem description="Bisa membuat kartu dan mengatur saldo">Jadikan Admin</ActionMenuItem>
        <ActionMenuItem description="Hanya melihat transaksi">Jadikan Finance</ActionMenuItem>
        <ActionMenuItem tone="danger" description="Akses ke semua kartu dicabut">
          Hapus dari tim
        </ActionMenuItem>
      </ActionMenuContent>
    </ActionMenu>
  )
}
