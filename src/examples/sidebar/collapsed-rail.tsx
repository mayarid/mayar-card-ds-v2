import {
  ArrowDataTransferHorizontalIcon,
  CreditCardIcon,
  DashboardSquare01Icon,
  Settings01Icon,
  UserGroupIcon,
} from '@hugeicons/core-free-icons'
import { useState } from 'react'

import { Icon } from '@/components/ui/icon'
import {
  Sidebar,
  SidebarAccount,
  SidebarActions,
  SidebarCollapseTrigger,
  SidebarExpandedOnly,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarItem,
  SidebarItemCount,
  SidebarNav,
  SidebarRailOnly,
} from '@/components/ui/sidebar'

export default function SidebarCollapsedRail() {
  // Controlled: keep the choice, e.g. in localStorage.
  const [collapsed, setCollapsed] = useState(true)
  return (
    <div className="flex h-[560px] overflow-hidden rounded-card border border-border-subtle">
      <Sidebar layout="static" collapsed={collapsed} onCollapsedChange={setCollapsed}>
        <SidebarHeader>
          <SidebarExpandedOnly>
            <span className="text-title-md text-primary">mayar</span>
          </SidebarExpandedOnly>
          <SidebarRailOnly>
            <span aria-hidden className="text-title-md text-primary">m</span>
          </SidebarRailOnly>
          <SidebarActions>
            <SidebarCollapseTrigger />
          </SidebarActions>
        </SidebarHeader>
        <SidebarNav>
          <SidebarGroup>
            <SidebarGroupLabel>Menu</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarItem href="#/" label="Beranda">
                <Icon icon={DashboardSquare01Icon} />
              </SidebarItem>
              <SidebarItem href="#/cards" label="Kartu" active>
                <Icon icon={CreditCardIcon} />
              </SidebarItem>
              <SidebarItem href="#/transactions" label="Transaksi" badge={<SidebarItemCount>4</SidebarItemCount>}>
                <Icon icon={ArrowDataTransferHorizontalIcon} />
              </SidebarItem>
            </SidebarGroupContent>
          </SidebarGroup>
          <SidebarGroup collapsible>
            <SidebarGroupLabel>Organisasi</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarItem href="#/teams" label="Tim">
                <Icon icon={UserGroupIcon} />
              </SidebarItem>
              <SidebarItem href="#/settings" label="Pengaturan">
                <Icon icon={Settings01Icon} />
              </SidebarItem>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarNav>
        <SidebarFooter>
          <SidebarAccount name="Dimas Pratama" email="dimas@kopikenangan.id" />
        </SidebarFooter>
      </Sidebar>
      <div className="flex-1 bg-canvas" />
    </div>
  )
}
