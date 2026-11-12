import { Copy01Icon, Delete02Icon, Edit02Icon, MoreHorizontalIcon } from '@hugeicons/core-free-icons'

import {
  ActionMenu,
  ActionMenuContent,
  ActionMenuItem,
  ActionMenuSeparator,
  ActionMenuTrigger,
} from '@/components/ui/action-menu'
import { Icon } from '@/components/ui/icon'

export default function ActionMenuRow() {
  return (
    <div className="flex w-80 items-center justify-between rounded-xl bg-surface px-4 py-3 shadow-ring">
      <div className="flex flex-col">
        <span className="text-body-sm font-medium">Marketing</span>
        <span className="text-caption-lg text-ink-2">•••• 4821</span>
      </div>
      <ActionMenu>
        <ActionMenuTrigger variant="icon-ghost" aria-label="Aksi kartu Marketing">
          <Icon icon={MoreHorizontalIcon} />
        </ActionMenuTrigger>
        <ActionMenuContent>
          <ActionMenuItem>
            <Icon icon={Edit02Icon} />
            Ubah nama
          </ActionMenuItem>
          <ActionMenuItem>
            <Icon icon={Copy01Icon} />
            Salin nomor kartu
          </ActionMenuItem>
          <ActionMenuSeparator />
          <ActionMenuItem tone="danger">
            <Icon icon={Delete02Icon} />
            Tutup kartu
          </ActionMenuItem>
        </ActionMenuContent>
      </ActionMenu>
    </div>
  )
}
