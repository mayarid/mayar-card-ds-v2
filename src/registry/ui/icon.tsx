import { HugeiconsIcon, type HugeiconsIconProps } from '@hugeicons/react'

import { cn } from '@/lib/utils'

export type IconProps = HugeiconsIconProps

/**
 * A Hugeicons icon with the Mayar defaults: 16px, stroke 1.5, `currentColor`, hidden from
 * assistive tech. Give it an `aria-label` and `aria-hidden={false}` when it carries meaning alone.
 *
 * @example <Icon icon={Add01Icon} />
 */
function Icon({ size = 16, strokeWidth = 1.5, className, ...props }: IconProps) {
  return (
    <HugeiconsIcon
      aria-hidden
      focusable="false"
      size={size}
      strokeWidth={strokeWidth}
      className={cn('shrink-0', className)}
      {...props}
    />
  )
}

export { Icon }
