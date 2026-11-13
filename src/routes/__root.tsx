import { Dialog } from '@base-ui/react/dialog'
import { Cancel01Icon, Menu01Icon, Search01Icon } from '@hugeicons/core-free-icons'
import { createRootRoute, Link, Outlet, useRouterState } from '@tanstack/react-router'
import { useCallback, useEffect, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { Kbd } from '@/components/ui/kbd'
import { CommandPalette, useModKey, usePaletteShortcut } from '@/gallery/command-palette'
import { Logo, SiteFooter } from '@/gallery/logo'
import { SidebarNav } from '@/gallery/sidebar'
import { REPO_URL } from '@/site'

export const Route = createRootRoute({
  component: RootLayout,
  notFoundComponent: NotFound,
})

function RootLayout() {
  const [navOpen, setNavOpen] = useState(false)
  const [paletteOpen, setPaletteOpen] = useState(false)
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const main = useRef<HTMLElement>(null)
  const mod = useModKey()

  const openPalette = useCallback(() => {
    setNavOpen(false)
    setPaletteOpen(true)
  }, [])
  usePaletteShortcut(openPalette)

  // Move focus to the page after a route change, so keyboard and screen-reader users land on it.
  const first = useRef(true)
  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    main.current?.focus({ preventScroll: true })
  }, [pathname])

  return (
    <div className="min-h-dvh bg-canvas text-ink">
      <a
        href="#main"
        className="sr-only z-(--z-toast) rounded-lg bg-surface px-3 py-2 text-body-sm shadow-popover focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to content
      </a>

      <header className="sticky top-0 z-(--z-sticky) flex h-14 items-center border-b border-border-subtle bg-canvas">
        <div className="flex h-full shrink-0 items-center px-4 lg:w-64 lg:px-5">
          <Link to="/" aria-label="Mayar Card design system, overview" className="rounded-lg outline-none focus-visible:outline-focus">
            <Logo />
          </Link>
        </div>

        <div className="flex min-w-0 flex-1 items-center justify-end gap-2 px-3 md:px-6 lg:justify-between lg:px-10">
          <button
            type="button"
            onClick={openPalette}
            aria-label="Search"
            aria-keyshortcuts="Control+K Meta+K"
            className="hidden h-8 w-64 items-center gap-2 rounded-lg bg-surface pr-1.5 pl-2.5 text-body-sm text-muted shadow-control outline-none transition-colors duration-(--motion-quick) hover-fine:text-ink-2 focus-visible:outline-focus lg:flex"
          >
            <Icon icon={Search01Icon} />
            <span className="flex-1 text-left">Search</span>
            <span className="flex gap-0.5" aria-hidden>
              <Kbd>{mod}</Kbd>
              <Kbd>K</Kbd>
            </span>
          </button>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon-md"
              aria-label="Search"
              onClick={openPalette}
              className="relative hit-44 lg:hidden"
            >
              <Icon icon={Search01Icon} />
            </Button>
            <a
              href={REPO_URL}
              className="hidden h-8 items-center rounded-lg px-2.5 text-body-sm font-medium text-ink-2 outline-none transition-colors duration-(--motion-quick) hover-fine:bg-state-hover hover-fine:text-ink focus-visible:outline-focus lg:inline-flex"
            >
              GitHub
            </a>
            <Dialog.Root open={navOpen} onOpenChange={setNavOpen}>
              <Dialog.Trigger
                render={<Button variant="ghost" size="icon-md" aria-label="Open navigation" className="relative hit-44 lg:hidden" />}
              >
                <Icon icon={Menu01Icon} />
              </Dialog.Trigger>
              <Dialog.Portal>
                <Dialog.Backdrop className="fixed inset-0 z-(--z-modal) bg-overlay transition-opacity duration-(--motion-fast) data-ending-style:opacity-0 data-starting-style:opacity-0 motion-reduce:transition-none" />
                <Dialog.Popup className="fixed inset-y-0 left-0 z-(--z-modal) flex w-[min(320px,88vw)] flex-col bg-canvas shadow-drawer outline-none transition-transform duration-(--motion-fast) ease-smooth-out data-ending-style:-translate-x-full data-starting-style:-translate-x-full motion-reduce:transition-none">
                  <div className="flex h-14 shrink-0 items-center justify-between border-b border-border-subtle px-4">
                    <Dialog.Title render={<span />}>
                      <Logo />
                    </Dialog.Title>
                    <Dialog.Close render={<Button variant="ghost" size="icon-md" aria-label="Close navigation" className="relative hit-44" />}>
                      <Icon icon={Cancel01Icon} />
                    </Dialog.Close>
                  </div>
                  <div className="flex-1 overflow-y-auto overscroll-contain px-3">
                    <SidebarNav onNavigate={() => setNavOpen(false)} />
                  </div>
                  <div className="shrink-0 border-t border-border-subtle px-4 pt-3 pb-[max(12px,env(safe-area-inset-bottom))]">
                    <a
                      href={REPO_URL}
                      className="flex h-11 items-center rounded-lg px-2 text-body-sm font-medium text-ink-2 outline-none hover-fine:text-ink focus-visible:outline-focus"
                    >
                      Source on GitHub
                    </a>
                  </div>
                </Dialog.Popup>
              </Dialog.Portal>
            </Dialog.Root>
          </div>
        </div>
      </header>

      <div className="flex">
        <aside className="sticky top-14 hidden h-[calc(100dvh-3.5rem)] w-64 shrink-0 flex-col border-r border-border-subtle lg:flex">
          <div className="flex-1 overflow-y-auto overscroll-contain px-3">
            <SidebarNav />
          </div>
        </aside>

        <main id="main" ref={main} tabIndex={-1} className="min-w-0 flex-1 outline-none">
          <Outlet />
          <SiteFooter repoUrl={REPO_URL} />
        </main>
      </div>

      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
    </div>
  )
}

function NotFound() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-start gap-3 px-5 py-24">
      <p className="font-mono text-body-sm text-muted">404</p>
      <h1 className="text-title-lg text-balance text-ink">This page does not exist</h1>
      <p className="text-body-lg text-ink-2">The link may be old. Search for the page, or go back to the overview.</p>
      <Button render={<Link to="/" />} className="mt-3">
        Go to the overview
      </Button>
    </div>
  )
}
