import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

/** The canvas that every live preview sits on. */
export function PreviewFrame({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      data-slot="preview"
      className={cn(
        'preview-dots flex min-h-48 min-w-0 flex-wrap items-center justify-center gap-4 overflow-x-auto rounded-2xl bg-surface p-4 shadow-ring sm:p-8 [&>*]:max-w-full',
        className,
      )}
    >
      {children}
    </div>
  )
}
