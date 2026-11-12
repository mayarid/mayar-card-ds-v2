import { Loading03Icon } from '@hugeicons/core-free-icons'

import { Icon, type IconProps } from '@/components/ui/icon'
import { cn } from '@/lib/utils'

type SpinnerProps = Omit<IconProps, 'icon'>

/** A decorative loading spinner. Stops turning when the user asks for reduced motion. */
function Spinner({ className, ...props }: SpinnerProps) {
  return (
    <Icon
      icon={Loading03Icon}
      data-slot="spinner"
      className={cn('motion-safe:animate-spin', className)}
      {...props}
    />
  )
}

export { Spinner }
