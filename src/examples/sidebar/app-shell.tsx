import {
  ArrowDataTransferHorizontalIcon,
  ChartHistogramIcon,
  CreditCardIcon,
  DashboardSquare01Icon,
  HelpCircleIcon,
  Invoice01Icon,
  Logout01Icon,
  MoreHorizontalIcon,
  Notification03Icon,
  QrCodeIcon,
  Search01Icon,
  Settings01Icon,
  UserGroupIcon,
  UserIcon,
  Wallet01Icon,
} from '@hugeicons/core-free-icons'
import { useState } from 'react'

import {
  ActionMenu,
  ActionMenuContent,
  ActionMenuLinkItem,
  ActionMenuSeparator,
  ActionMenuTrigger,
} from '@/components/ui/action-menu'
import { Icon } from '@/components/ui/icon'
import { Input } from '@/components/ui/input'
import { Kbd } from '@/components/ui/kbd'
import {
  PlanQuota,
  PlanQuotaBar,
  PlanQuotaBody,
  PlanQuotaDescription,
  PlanQuotaLegend,
  PlanQuotaTier,
} from '@/components/ui/plan-quota'
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
  SidebarIconButton,
  SidebarItem,
  SidebarNav,
  SidebarRailOnly,
} from '@/components/ui/sidebar'

const main = [
  { href: '/', label: 'Beranda', icon: DashboardSquare01Icon },
  { href: '/cards', label: 'Kartu', icon: CreditCardIcon },
  { href: '/qris', label: 'QRIS', icon: QrCodeIcon },
  { href: '/transactions', label: 'Transaksi', icon: ArrowDataTransferHorizontalIcon },
  { href: '/expenses', label: 'Pengeluaran', icon: Invoice01Icon },
  { href: '/budgets', label: 'Anggaran', icon: Wallet01Icon },
]
const organisation = [
  { href: '/teams', label: 'Tim', icon: UserGroupIcon },
  { href: '/reports', label: 'Laporan', icon: ChartHistogramIcon },
  { href: '/settings', label: 'Pengaturan', icon: Settings01Icon },
]

const isActive = (pathname: string, href: string) =>
  href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`)

export default function SidebarAppShell() {
  // In the app this comes from the router.
  const [pathname, setPathname] = useState('/cards')
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)

  const item = (entry: (typeof main)[number]) => (
    <SidebarItem
      key={entry.href}
      href={`#${entry.href}`}
      label={entry.label}
      active={isActive(pathname, entry.href)}
      onClick={(event) => {
        event.preventDefault()
        setPathname(entry.href)
      }}
    >
      <Icon icon={entry.icon} />
    </SidebarItem>
  )

  return (
    <div className="flex h-[760px] w-full overflow-hidden rounded-card border border-border-subtle">
      <Sidebar layout="static" collapsed={collapsed} onCollapsedChange={setCollapsed}>
        <SidebarHeader>
          <SidebarExpandedOnly>
            <span className="text-title-md text-primary">mayar</span>
          </SidebarExpandedOnly>
          <SidebarRailOnly>
            <span aria-hidden className="text-title-md text-primary">m</span>
          </SidebarRailOnly>
          <SidebarActions>
            <SidebarIconButton
              label="Notifikasi, 2 belum dibaca"
              dot
              aria-haspopup="dialog"
              aria-expanded={notificationsOpen}
              onClick={() => setNotificationsOpen((open) => !open)}
            >
              <Icon icon={Notification03Icon} size={18} />
            </SidebarIconButton>
            <SidebarCollapseTrigger />
          </SidebarActions>
        </SidebarHeader>

        <SidebarExpandedOnly>
          <form role="search" onSubmit={(event) => event.preventDefault()}>
            <Input
              type="search"
              placeholder="Cari…"
              aria-label="Cari transaksi"
              leading={<Icon icon={Search01Icon} />}
              trailing={<Kbd aria-hidden>⌘K</Kbd>}
            />
          </form>
        </SidebarExpandedOnly>
        <SidebarRailOnly>
          {/* On the rail, search expands the sidebar first. */}
          <SidebarIconButton variant="surface" label="Cari transaksi" onClick={() => setCollapsed(false)}>
            <Icon icon={Search01Icon} />
          </SidebarIconButton>
        </SidebarRailOnly>

        <SidebarNav>
          <SidebarGroup>
            <SidebarGroupLabel>Utama</SidebarGroupLabel>
            <SidebarGroupContent>{main.map(item)}</SidebarGroupContent>
          </SidebarGroup>
          <SidebarGroup collapsible>
            <SidebarGroupLabel>Organisasi</SidebarGroupLabel>
            <SidebarGroupContent>{organisation.map(item)}</SidebarGroupContent>
          </SidebarGroup>
        </SidebarNav>

        <SidebarFooter>
          <SidebarExpandedOnly>
            <PlanQuota max={10} used={3} render={<a href="#/settings" />}>
              <PlanQuotaTier>Paket Business</PlanQuotaTier>
              <PlanQuotaBody>
                <PlanQuotaDescription />
                <PlanQuotaBar />
                <PlanQuotaLegend />
              </PlanQuotaBody>
            </PlanQuota>
          </SidebarExpandedOnly>
          <SidebarAccount name="Rina Wulandari" email="rina@tokobajurina.id">
            <ActionMenu>
              <ActionMenuTrigger variant="icon-ghost" aria-label="Menu akun">
                <Icon icon={MoreHorizontalIcon} />
              </ActionMenuTrigger>
              <ActionMenuContent side="top" className="w-57">
                <ActionMenuLinkItem href="#/settings">
                  <Icon icon={UserIcon} />
                  Profil saya
                </ActionMenuLinkItem>
                <ActionMenuLinkItem href="mailto:halo@mayar.id">
                  <Icon icon={HelpCircleIcon} />
                  Bantuan
                </ActionMenuLinkItem>
                <ActionMenuSeparator />
                <ActionMenuLinkItem href="#/logout" tone="danger">
                  <Icon icon={Logout01Icon} />
                  Keluar
                </ActionMenuLinkItem>
              </ActionMenuContent>
            </ActionMenu>
          </SidebarAccount>
        </SidebarFooter>
      </Sidebar>
      <div className="flex-1 bg-canvas p-2">
        <div className="h-full rounded-card border border-border-subtle bg-surface p-4">
          <p className="text-title-lg text-ink">{[...main, ...organisation].find((e) => isActive(pathname, e.href))?.label}</p>
        </div>
      </div>
    </div>
  )
}
