import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

/** The plain canvas that every live preview sits on. Frames give it an edge; it has none of its own. */
export function PreviewFrame({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      data-slot="preview"
      className={cn(
        'flex min-h-56 min-w-0 flex-wrap items-center justify-center gap-4 overflow-x-auto bg-surface px-5 py-10 sm:px-10 sm:py-12 [&>*]:max-w-full',
        className,
      )}
    >
      {children}
    </div>
  )
}

/** The one frame of the gallery: a hairline edge, a 10px radius, no shadow. */
export const frameClass = 'overflow-hidden rounded-xl bg-surface shadow-ring'
