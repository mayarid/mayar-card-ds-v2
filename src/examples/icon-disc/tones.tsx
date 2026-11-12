import {
  Alert02Icon,
  CheckmarkCircle02Icon,
  CreditCardIcon,
  Loading03Icon,
  LockIcon,
  Search01Icon,
} from '@hugeicons/core-free-icons'

import { Icon } from '@/components/ui/icon'
import { IconDisc } from '@/components/ui/icon-disc'

export default function IconDiscTones() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <IconDisc>
        <Icon icon={Search01Icon} />
      </IconDisc>
      <IconDisc tone="primary">
        <Icon icon={LockIcon} />
      </IconDisc>
      <IconDisc tone="tint">
        <Icon icon={Loading03Icon} />
      </IconDisc>
      <IconDisc tone="success">
        <Icon icon={CheckmarkCircle02Icon} />
      </IconDisc>
      <IconDisc tone="danger">
        <Icon icon={Alert02Icon} />
      </IconDisc>
      <IconDisc tone="warning" shape="square">
        <Icon icon={CreditCardIcon} />
      </IconDisc>
    </div>
  )
}
