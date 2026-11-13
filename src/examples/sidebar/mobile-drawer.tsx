import { CreditCardIcon, DashboardSquare01Icon, Menu01Icon } from '@hugeicons/core-free-icons'
import { useState } from 'react'

import mayarWordmark from '@/assets/brand/mayar-wordmark-compact.svg'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import {
  Sidebar,
  SidebarActions,
  SidebarCloseTrigger,
  SidebarCollapseTrigger,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarItem,
  SidebarNav,
} from '@/components/ui/sidebar'

/**
 * The app shell. `layout="responsive"` (the default) is a sticky column at lg and up and an
 * off-canvas drawer below it. Resize the window under 1024px to see the drawer.
 */
export default function SidebarMobileDrawer() {
  const [open, setOpen] = useState(false)
  return (
    <div className="flex min-h-[420px] w-full">
      <Sidebar mobileOpen={open} onMobileOpenChange={setOpen} className="h-auto! lg:static!">
        <SidebarHeader>
          <img src={mayarWordmark} alt="Mayar" width={61} height={20} className="h-5 w-auto" />
          <SidebarActions>
            <SidebarCollapseTrigger />
            <SidebarCloseTrigger />
          </SidebarActions>
        </SidebarHeader>
        <SidebarNav>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarItem href="#/" label="Beranda" active>
                <Icon icon={DashboardSquare01Icon} />
              </SidebarItem>
              <SidebarItem href="#/cards" label="Kartu">
                <Icon icon={CreditCardIcon} />
              </SidebarItem>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarNav>
      </Sidebar>
      <div className="flex-1 p-4">
        <Button
          variant="ghost"
          size="icon-md"
          aria-label="Buka menu"
          aria-expanded={open}
          className="lg:hidden"
          onClick={() => setOpen(true)}
        >
          <Icon icon={Menu01Icon} size={20} />
        </Button>
      </div>
    </div>
  )
}
