import { AlertCircleIcon, Clock01Icon, Tick02Icon } from '@hugeicons/core-free-icons'

import { Badge } from '@/components/ui/badge'
import { Icon } from '@/components/ui/icon'

export default function BadgeWithIcon() {
  return (
    <>
      <Badge variant="success">
        <Icon icon={Tick02Icon} size={12} />
        Terverifikasi
      </Badge>
      <Badge variant="warning" shape="pill">
        <Icon icon={Clock01Icon} size={12} />
        Ditinjau
      </Badge>
      <Badge variant="danger" size="lg" shape="pill" className="[&_svg]:size-3.5">
        <Icon icon={AlertCircleIcon} size={14} />
        Ditolak
      </Badge>
    </>
  )
}
