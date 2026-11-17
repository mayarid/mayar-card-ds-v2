import { Loading03Icon } from '@hugeicons/core-free-icons'

import { Icon, type IconProps } from '@/components/ui/icon'
import { cn } from '@/lib/utils'

type SpinnerProps = Omit<IconProps, 'icon'>

/**
 * A decorative loading spinner. Under reduced motion it does not turn; it shows at 60% opacity,
 * so it does not look like a frozen spinner.
 */
function Spinner({ className, ...props }: SpinnerProps) {
  return (
    <Icon
      icon={Loading03Icon}
      data-slot="spinner"
      className={cn('motion-safe:animate-spin motion-reduce:opacity-60', className)}
      {...props}
    />
  )
}

export { Spinner }
