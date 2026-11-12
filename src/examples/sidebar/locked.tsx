import {
  ArrowDataTransferHorizontalIcon,
  CreditCardIcon,
  DashboardSquare01Icon,
  Settings01Icon,
  UserGroupIcon,
} from '@hugeicons/core-free-icons'

import { Icon } from '@/components/ui/icon'
import {
  Sidebar,
  SidebarAccount,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarItem,
  SidebarNav,
  SidebarNotice,
} from '@/components/ui/sidebar'

// Live while the account waits for KYC.
const UNLOCKED = new Set(['/settings'])

const items = [
  { href: '/', label: 'Beranda', icon: DashboardSquare01Icon },
  { href: '/cards', label: 'Kartu', icon: CreditCardIcon },
  { href: '/transactions', label: 'Transaksi', icon: ArrowDataTransferHorizontalIcon },
  { href: '/teams', label: 'Tim', icon: UserGroupIcon },
  { href: '/settings', label: 'Pengaturan', icon: Settings01Icon },
]

export default function SidebarLocked() {
  return (
    <div className="flex h-[600px] overflow-hidden rounded-card border border-border-subtle">
      <Sidebar layout="static">
        <SidebarHeader>
          <span className="text-title-md text-primary">mayar</span>
        </SidebarHeader>
        <SidebarNav>
          <SidebarGroup>
            <SidebarGroupLabel>Menu</SidebarGroupLabel>
            <SidebarGroupContent>
              {items.map((item) => (
                <SidebarItem
                  key={item.href}
                  href={`#${item.href}`}
                  label={item.label}
                  locked={!UNLOCKED.has(item.href)}
                  active={item.href === '/settings'}
                >
                  <Icon icon={item.icon} />
                </SidebarItem>
              ))}
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarNav>
        <SidebarFooter>
          {/* The KYC card replaces the plan quota while the nav is locked. */}
          <SidebarNotice title="Verifikasi diperlukan">
            Menu lain terbuka setelah verifikasi KYC Anda disetujui.
          </SidebarNotice>
          <SidebarAccount name="Ayu Lestari" email="ayu@warungayu.id" />
        </SidebarFooter>
      </Sidebar>
      <div className="flex-1 bg-canvas" />
    </div>
  )
}
