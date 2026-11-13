import mayarCardIcon from '@/assets/brand/mayar-card-icon.png'
import mayarWordmark from '@/assets/brand/mayar-wordmark-compact.svg'
import { cn } from '@/lib/utils'

export const MAYAR_URL = 'https://mayar.id'

/** The Mayar Card app icon with the site name. The link around it gives the accessible name. */
export function Logo() {
  return (
    <span className="flex items-center gap-2.5">
      <img src={mayarCardIcon} alt="" width={28} height={28} className="size-7 shrink-0" />
      <span className="flex flex-col">
        <span className="text-body-sm font-semibold text-ink">Mayar Card</span>
        <span className="text-caption-sm text-muted">Design system v2</span>
      </span>
    </span>
  )
}

/** A quiet "By Mayar" credit that links to mayar.id. */
export function ByMayar({ className }: { className?: string }) {
  return (
    <a
      href={MAYAR_URL}
      className={cn(
        'group relative inline-flex items-center gap-1.5 rounded-sm text-caption-lg text-muted outline-none transition-colors duration-(--motion-quick) hit-44 hover-fine:text-ink-2 focus-visible:outline-focus',
        className,
      )}
    >
      <span>By</span>
      <img
        src={mayarWordmark}
        alt="Mayar"
        width={46}
        height={15}
        className="h-[15px] w-auto opacity-90 transition-opacity duration-(--motion-quick) group-hover:opacity-100"
      />
    </a>
  )
}

/** The site footer: the repository link and the Mayar credit. */
export function SiteFooter({ repoUrl }: { repoUrl: string }) {
  return (
    <footer className="border-t border-border-subtle">
      <div className="mx-auto flex w-full max-w-[1184px] flex-wrap items-center justify-between gap-x-6 gap-y-2 px-5 py-6 pointer-coarse:gap-y-7 md:px-10">
        <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-caption-lg pointer-coarse:gap-y-7 text-muted">
          <span>Mayar Card design system v2</span>
          <a
            href={repoUrl}
            className="relative rounded-sm underline decoration-border underline-offset-[3px] outline-none transition-colors duration-(--motion-quick) hit-44 hover-fine:text-ink-2 hover-fine:decoration-ink-2 focus-visible:outline-focus"
          >
            Source on GitHub
          </a>
        </p>
        <ByMayar />
      </div>
    </footer>
  )
}
