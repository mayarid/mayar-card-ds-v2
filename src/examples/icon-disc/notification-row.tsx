import { CheckmarkCircle02Icon } from '@hugeicons/core-free-icons'

import { Icon } from '@/components/ui/icon'
import { IconDisc } from '@/components/ui/icon-disc'

export default function IconDiscNotificationRow() {
  return (
    <div className="flex w-80 items-start gap-3">
      <IconDisc size={32} tone="success">
        <Icon icon={CheckmarkCircle02Icon} />
      </IconDisc>
      <div className="flex min-w-0 flex-col gap-0.5">
        <p className="m-0 text-body-sm font-medium text-ink">Top up berhasil</p>
        <p className="m-0 text-caption-lg text-ink-2">Saldo bertambah Rp 5.000.000.</p>
      </div>
    </div>
  )
}
