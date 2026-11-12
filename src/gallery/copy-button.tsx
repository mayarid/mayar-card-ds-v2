import { Copy01Icon, Tick02Icon } from '@hugeicons/core-free-icons'

import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { cn } from '@/lib/utils'

import { useCopy } from './use-copy'

interface CopyButtonProps {
  value: string
  label?: string
  className?: string
  /** Shows the word "Copy" next to the icon. */
  withText?: boolean
}

export function CopyButton({ value, label = 'Copy code', className, withText = false }: CopyButtonProps) {
  const { copied, copy } = useCopy()
  return (
    <Button
      variant="ghost"
      size={withText ? 'sm' : 'icon-sm'}
      aria-label={withText ? undefined : copied ? 'Copied' : label}
      onClick={() => void copy(value)}
      className={cn(copied && 'text-success-text', className)}
    >
      <Icon icon={copied ? Tick02Icon : Copy01Icon} />
      {withText ? (copied ? 'Copied' : 'Copy') : null}
      <span className="sr-only" aria-live="polite">
        {copied ? 'Copied to clipboard' : ''}
      </span>
    </Button>
  )
}
