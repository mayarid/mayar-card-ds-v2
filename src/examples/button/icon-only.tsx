import { Delete02Icon, MoreHorizontalIcon, Settings01Icon } from '@hugeicons/core-free-icons'

import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'

export default function ButtonIconOnly() {
  return (
    <>
      <Button variant="secondary" size="icon-sm" aria-label="Pengaturan">
        <Icon icon={Settings01Icon} />
      </Button>
      <Button variant="ghost" size="icon-md" aria-label="Opsi lain">
        <Icon icon={MoreHorizontalIcon} />
      </Button>
      <Button variant="danger-subtle" size="icon-lg" aria-label="Hapus">
        <Icon icon={Delete02Icon} />
      </Button>
    </>
  )
}
