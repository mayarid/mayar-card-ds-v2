import { Dialog } from '@base-ui/react/dialog'
import { Cancel01Icon, Menu01Icon } from '@hugeicons/core-free-icons'
import { createRootRoute, Link, Outlet, useRouterState } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { Logo } from '@/gallery/logo'
import { SidebarNav } from '@/gallery/sidebar'
import { REPO_URL } from '@/site'

export const Route = createRootRoute({
  component: RootLayout,
  notFoundComponent: NotFound,
})

function RootLayout() {
  const [navOpen, setNavOpen] = useState(false)
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const main = useRef<HTMLElement>(null)

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

      {/* Phone header */}
      <header className="sticky top-0 z-(--z-sticky) flex h-14 items-center justify-between border-b border-border-subtle bg-canvas/90 px-4 backdrop-blur lg:hidden">
        <Link to="/" className="rounded-lg outline-none focus-visible:outline-focus">
          <Logo />
        </Link>
        <Dialog.Root open={navOpen} onOpenChange={setNavOpen}>
          <Dialog.Trigger render={<Button variant="ghost" size="icon-md" aria-label="Open navigation" />}>
            <Icon icon={Menu01Icon} />
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Backdrop className="fixed inset-0 z-(--z-modal) bg-overlay transition-opacity duration-(--motion-fast) data-ending-style:opacity-0 data-starting-style:opacity-0" />
            <Dialog.Popup className="fixed inset-y-0 left-0 z-(--z-modal) flex w-[min(320px,88vw)] flex-col bg-canvas shadow-popover outline-none transition-transform duration-(--motion-fast) ease-smooth-out data-ending-style:-translate-x-full data-starting-style:-translate-x-full">
              <div className="flex h-14 items-center justify-between px-4">
                <Dialog.Title render={<span />}>
                  <Logo />
                </Dialog.Title>
                <Dialog.Close render={<Button variant="ghost" size="icon-md" aria-label="Close navigation" />}>
                  <Icon icon={Cancel01Icon} />
                </Dialog.Close>
              </div>
              <div className="flex-1 overflow-y-auto overscroll-contain px-3">
                <SidebarNav onNavigate={() => setNavOpen(false)} />
              </div>
            </Dialog.Popup>
          </Dialog.Portal>
        </Dialog.Root>
      </header>

      <div className="flex">
        <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-border-subtle lg:flex">
          <div className="flex h-16 items-center px-5">
            <Link to="/" className="rounded-lg outline-none focus-visible:outline-focus">
              <Logo />
            </Link>
          </div>
          <div className="flex-1 overflow-y-auto overscroll-contain px-3">
            <SidebarNav />
          </div>
          <div className="border-t border-border-subtle px-5 py-3">
            <a
              href={REPO_URL}
              className="rounded-sm text-caption-lg text-muted outline-none hover-fine:text-ink focus-visible:outline-focus"
            >
              GitHub · mayarid/mayar-card-ds-v2
            </a>
          </div>
        </aside>

        <main id="main" ref={main} tabIndex={-1} className="min-w-0 flex-1 outline-none">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

function NotFound() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-start gap-4 px-5 py-24">
      <p className="text-overline text-muted uppercase">404</p>
      <h1 className="text-title-lg text-ink">This page does not exist</h1>
      <p className="text-body-base text-ink-2">The link may be old. Use the sidebar to find a component.</p>
      <Button render={<Link to="/" />}>Go to the overview</Button>
    </div>
  )
}
