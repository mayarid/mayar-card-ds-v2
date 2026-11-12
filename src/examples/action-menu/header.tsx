import { CreditCardIcon, Delete02Icon, Settings01Icon } from '@hugeicons/core-free-icons'

import {
  ActionMenu,
  ActionMenuContent,
  ActionMenuItem,
  ActionMenuSeparator,
  ActionMenuTrigger,
} from '@/components/ui/action-menu'
import { Icon } from '@/components/ui/icon'

export default function ActionMenuHeaderExample() {
  return (
    <ActionMenu>
      <ActionMenuTrigger>Aksi lain</ActionMenuTrigger>
      <ActionMenuContent>
        <ActionMenuItem>
          <Icon icon={Settings01Icon} />
          Atur batas
        </ActionMenuItem>
        <ActionMenuItem disabled title="Kartu sudah dibekukan">
          <Icon icon={CreditCardIcon} />
          Bekukan kartu
        </ActionMenuItem>
        <ActionMenuSeparator />
        <ActionMenuItem tone="danger">
          <Icon icon={Delete02Icon} />
          Tutup kartu
        </ActionMenuItem>
      </ActionMenuContent>
    </ActionMenu>
  )
}
