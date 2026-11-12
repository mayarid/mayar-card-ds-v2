import {
  ArrowDataTransferHorizontalIcon,
  CreditCardIcon,
  DashboardSquare01Icon,
  Notification03Icon,
  Search01Icon,
  Settings01Icon,
  UserGroupIcon,
} from '@hugeicons/core-free-icons'

import { Icon } from '@/components/ui/icon'
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
  SidebarItemCount,
  SidebarNav,
  SidebarNotice,
  SidebarRailOnly,
} from '@/components/ui/sidebar'
import type { ComponentDoc, MatrixAxisItem, PropValue } from '@/docs/types'
import { toJsx } from '@/gallery/jsx'
import source from '@/registry/ui/sidebar.tsx?raw'

const ITEM_STATES: MatrixAxisItem[] = [
  { label: 'Default' },
  { label: 'Hover', force: 'hover' },
  { label: 'Pressed', force: 'pressed' },
  { label: 'Focus', force: 'focus' },
  { label: 'Active', props: { active: true } },
  { label: 'Locked', props: { locked: true } },
  { label: 'Badge', props: { badge: true } },
  { label: 'Disabled', props: { disabled: true }, codeOnly: true },
]

const LAYOUTS: MatrixAxisItem[] = [
  { label: 'Expanded', props: { collapsed: false } },
  { label: 'Collapsed rail', props: { collapsed: true } },
]

function ItemSpecimen({ props, force }: { props: Record<string, PropValue>; force?: MatrixAxisItem['force'] }) {
  const collapsed = Boolean(props.collapsed)
  return (
    <Sidebar layout="static" collapsed={collapsed} className={collapsed ? 'w-13 py-2' : 'w-60 px-2 py-2'}>
      <SidebarItem
        href="#cards"
        label="Kartu"
        active={Boolean(props.active)}
        locked={Boolean(props.locked)}
        disabled={Boolean(props.disabled)}
        badge={props.badge ? <SidebarItemCount>12</SidebarItemCount> : undefined}
        data-force-state={force}
      >
        <Icon icon={CreditCardIcon} />
      </SidebarItem>
    </Sidebar>
  )
}

function itemCode(props: Record<string, PropValue>) {
  const { badge, collapsed: _collapsed, ...rest } = props
  void _collapsed
  const attrs = { href: '/cards', label: 'Kartu', ...rest }
  const jsx = toJsx('SidebarItem', attrs, '<Icon icon={CreditCardIcon} />')
  return badge ? jsx.replace('<SidebarItem ', '<SidebarItem badge={<SidebarItemCount>12</SidebarItemCount>} ') : jsx
}

const MAIN = [
  { href: '/', label: 'Beranda', icon: DashboardSquare01Icon },
  { href: '/cards', label: 'Kartu', icon: CreditCardIcon },
  { href: '/transactions', label: 'Transaksi', icon: ArrowDataTransferHorizontalIcon },
]
const ORG = [
  { href: '/teams', label: 'Tim', icon: UserGroupIcon },
  { href: '/settings', label: 'Pengaturan', icon: Settings01Icon },
]

function SidebarSpecimen(props: Record<string, PropValue>) {
  const locked = Boolean(props.locked)
  const active = String(props.active ?? '/')
  const item = (entry: (typeof MAIN)[number]) => (
    <SidebarItem
      key={entry.href}
      href={`#${entry.href}`}
      label={entry.label}
      active={!locked && entry.href === active}
      locked={locked && entry.href !== '/settings'}
      badge={props.badge && entry.href === '/transactions' ? <SidebarItemCount>4</SidebarItemCount> : undefined}
    >
      <Icon icon={entry.icon} />
    </SidebarItem>
  )
  return (
    <div className="flex h-[620px] overflow-hidden rounded-card border border-border-subtle">
      <Sidebar layout="static" collapsed={Boolean(props.collapsed)} className="h-full">
        <SidebarHeader>
          <SidebarExpandedOnly>
            <span className="text-title-md text-primary">mayar</span>
          </SidebarExpandedOnly>
          <SidebarRailOnly>
            <span aria-hidden className="text-title-md text-primary">
              m
            </span>
          </SidebarRailOnly>
          <SidebarActions>
            <SidebarIconButton label="Notifikasi" dot={Boolean(props.badge)}>
              <Icon icon={Notification03Icon} size={18} />
            </SidebarIconButton>
            <SidebarCollapseTrigger />
          </SidebarActions>
        </SidebarHeader>
        <SidebarRailOnly>
          <SidebarIconButton variant="surface" label="Cari transaksi">
            <Icon icon={Search01Icon} />
          </SidebarIconButton>
        </SidebarRailOnly>
        <SidebarNav aria-label={props.navLabel ? String(props.navLabel) : undefined}>
          <SidebarGroup>
            <SidebarGroupLabel>Menu</SidebarGroupLabel>
            <SidebarGroupContent>{MAIN.map(item)}</SidebarGroupContent>
          </SidebarGroup>
          <SidebarGroup collapsible defaultOpen={!props.groupClosed}>
            <SidebarGroupLabel>Organisasi</SidebarGroupLabel>
            <SidebarGroupContent>{ORG.map(item)}</SidebarGroupContent>
          </SidebarGroup>
        </SidebarNav>
        <SidebarFooter>
          {locked ? (
            <SidebarNotice title="Verifikasi diperlukan">Menu lain terbuka setelah verifikasi KYC Anda disetujui.</SidebarNotice>
          ) : props.plan === false ? null : (
            <SidebarExpandedOnly>
              <PlanQuota max={10} used={Number(props.used ?? 3)} render={<a href="#settings" />}>
                <PlanQuotaTier>Paket Business</PlanQuotaTier>
                <PlanQuotaBody>
                  <PlanQuotaDescription />
                  <PlanQuotaBar />
                  <PlanQuotaLegend />
                </PlanQuotaBody>
              </PlanQuota>
            </SidebarExpandedOnly>
          )}
          <SidebarAccount name="Budi Santoso" email="budi@tokobudi.id" />
        </SidebarFooter>
      </Sidebar>
    </div>
  )
}

function sidebarCode(props: Record<string, PropValue>) {
  const rootAttrs = toJsx('Sidebar', { collapsed: props.collapsed }, 'x').split('>')[0]
  return `${rootAttrs}>
  <SidebarHeader>
    <SidebarExpandedOnly><img src="/mayar-logo.png" alt="Mayar" /></SidebarExpandedOnly>
    <SidebarRailOnly><img src="/mayar-icon.png" alt="" /></SidebarRailOnly>
    <SidebarActions>
      <SidebarIconButton label="Notifikasi"${props.badge ? ' dot' : ''}><Icon icon={Notification03Icon} size={18} /></SidebarIconButton>
      <SidebarCollapseTrigger />
      <SidebarCloseTrigger />
    </SidebarActions>
  </SidebarHeader>
  <SidebarNav>
    <SidebarGroup>
      <SidebarGroupLabel>Menu</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarItem href="/" label="Beranda"${props.locked ? ' locked' : ' active'}><Icon icon={DashboardSquare01Icon} /></SidebarItem>
        <SidebarItem href="/cards" label="Kartu"${props.locked ? ' locked' : ''}><Icon icon={CreditCardIcon} /></SidebarItem>
      </SidebarGroupContent>
    </SidebarGroup>
    <SidebarGroup collapsible${props.groupClosed ? ' defaultOpen={false}' : ''}>
      <SidebarGroupLabel>Organisasi</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarItem href="/teams" label="Tim"${props.locked ? ' locked' : ''}><Icon icon={UserGroupIcon} /></SidebarItem>
      </SidebarGroupContent>
    </SidebarGroup>
  </SidebarNav>
  <SidebarFooter>
${
  props.locked
    ? '    <SidebarNotice title="Verifikasi diperlukan">Menu lain terbuka setelah verifikasi KYC Anda disetujui.</SidebarNotice>'
    : `    <SidebarExpandedOnly>
      <PlanQuota max={10} used={${Number(props.used ?? 3)}} render={<a href="/settings" />}>…</PlanQuota>
    </SidebarExpandedOnly>`
}
    <SidebarAccount name="Budi Santoso" email="budi@tokobudi.id">{accountMenu}</SidebarAccount>
  </SidebarFooter>
</Sidebar>`
}

const ICON_BUTTON_STATES: MatrixAxisItem[] = [
  { label: 'Default' },
  { label: 'Hover', force: 'hover' },
  { label: 'Pressed', force: 'pressed', codeOnly: true },
  { label: 'Focus', force: 'focus' },
  { label: 'Expanded (panel open)', props: { expanded: true }, codeOnly: true },
  { label: 'Dot', props: { dot: true } },
]

export const doc: ComponentDoc = {
  slug: 'sidebar',
  name: 'Sidebar',
  group: 'Patterns',
  description:
    'The app navigation: logo row, grouped links, plan quota and the account row. Collapses to a 68px icon rail and becomes a drawer on phones.',
  spec: 'wonder',
  wonderRef:
    'Mayar Card Dashboard › Dashboard › Sidebar v2, Sidebar Collapsed v2, Sidebar Collapsed KYC Locked v2, Nav Item / Nav Icon State v2',
  registry: 'sidebar',
  baseUi: { name: 'Tooltip, Collapsible, useRender', url: 'https://base-ui.com/react/components/tooltip' },
  source: [{ path: 'components/ui/sidebar.tsx', code: source }],
  playground: {
    controls: [
      { name: 'collapsed', type: 'boolean', default: false },
      { name: 'active', type: 'select', options: ['/', '/cards', '/transactions', '/teams', '/settings'], default: '/' },
      { name: 'locked', label: 'locked (KYC)', type: 'boolean', default: false },
      { name: 'groupClosed', label: 'Organisasi closed', type: 'boolean', default: false },
      { name: 'badge', label: 'counts and dot', type: 'boolean', default: false },
      { name: 'used', label: 'cards used of 10', type: 'select', options: ['3', '8', '10'], default: '3' },
    ],
    render: (v) => <SidebarSpecimen {...v} />,
    code: sidebarCode,
  },
  matrices: [
    {
      title: 'Item × state, expanded and collapsed',
      description: 'Nav Item (expanded) and Nav Icon (rail) states. Hover, pressed and focus are forced.',
      rows: ITEM_STATES,
      columns: LAYOUTS,
      cellWidth: 260,
      render: (props, force) => <ItemSpecimen props={props} force={force} />,
      code: itemCode,
    },
    {
      title: 'Sidebar × layout',
      description: 'The owner sidebar, the KYC-locked sidebar and the closed Organisasi group, expanded and on the rail.',
      rows: [
        { label: 'Owner', props: {} },
        { label: 'KYC locked', props: { locked: true } },
        { label: 'Organisasi closed', props: { groupClosed: true } },
        { label: 'Quota near limit', props: { used: 8 }, codeOnly: true },
      ],
      columns: LAYOUTS,
      cellWidth: 300,
      render: (props) => <SidebarSpecimen {...props} />,
      code: sidebarCode,
    },
    {
      title: 'Icon buttons × state',
      description: 'Ghost buttons in the logo row (notifications, collapse) and the outlined rail search.',
      rows: [
        { label: 'Ghost · expanded', props: { variant: 'ghost', collapsed: false } },
        { label: 'Ghost · rail', props: { variant: 'ghost', collapsed: true } },
        { label: 'Surface · rail search', props: { variant: 'surface', collapsed: true } },
      ],
      columns: ICON_BUTTON_STATES,
      render: (props, force) => (
        <Sidebar layout="static" collapsed={Boolean(props.collapsed)} className="w-auto p-2">
          <SidebarIconButton
            label={props.variant === 'surface' ? 'Cari transaksi' : 'Notifikasi'}
            variant={props.variant as 'ghost' | 'surface'}
            dot={Boolean(props.dot)}
            aria-expanded={props.expanded ? true : undefined}
            data-force-state={force}
          >
            <Icon icon={props.variant === 'surface' ? Search01Icon : Notification03Icon} size={18} />
          </SidebarIconButton>
        </Sidebar>
      ),
      code: (props) =>
        toJsx(
          'SidebarIconButton',
          {
            label: props.variant === 'surface' ? 'Cari transaksi' : 'Notifikasi',
            variant: props.variant === 'surface' ? 'surface' : undefined,
            dot: props.dot,
            'aria-expanded': props.expanded ? 'true' : undefined,
          },
          props.variant === 'surface' ? '<Icon icon={Search01Icon} />' : '<Icon icon={Notification03Icon} size={18} />',
        ),
    },
  ],
  examples: [
    {
      id: 'sidebar/app-shell',
      title: 'App shell',
      description: 'Notifications, collapse, search, two groups, the plan quota card and the account menu.',
    },
    { id: 'sidebar/collapsed-rail', title: 'Collapsed rail', description: 'Controlled. Items keep an accessible name and show a tooltip.' },
    { id: 'sidebar/locked', title: 'Locked until KYC', description: 'Locked items are not links; the notice replaces the quota card.' },
    {
      id: 'sidebar/mobile-drawer',
      title: 'Mobile drawer',
      description: 'The responsive layout below 1024px: off-canvas, inert while closed, closes on Escape, the backdrop or a nav tap.',
      codeOnly: true,
    },
  ],
  props: [
    { name: 'collapsed / defaultCollapsed', type: 'boolean', default: 'false', description: 'The 68px icon rail. Ignored in the mobile drawer.' },
    { name: 'onCollapsedChange', type: '(collapsed: boolean) => void', description: 'Called by SidebarCollapseTrigger.' },
    { name: 'mobileOpen / defaultMobileOpen', type: 'boolean', default: 'false', description: 'Drawer open below lg (responsive layout).' },
    { name: 'onMobileOpenChange', type: '(open: boolean) => void', description: 'Close from the ✕, the backdrop, Escape or a nav tap.' },
    { name: 'layout', type: '"responsive" | "static"', default: '"responsive"', description: 'Static: always an in-flow column (cards, docs).' },
    { name: 'SidebarItem label', type: 'string', description: 'Text, and the accessible name and tooltip on the rail. The icon goes in children.' },
    { name: 'SidebarItem active', type: 'boolean', description: 'Current page: aria-current="page".' },
    { name: 'SidebarItem locked / disabled', type: 'boolean', description: 'No href, not focusable, clicks do nothing. Locked adds a lock and lockedHint.' },
    { name: 'SidebarItem badge', type: 'ReactNode', description: 'Trailing count (SidebarItemCount). A dot on the rail.' },
    { name: 'SidebarItem render', type: 'ReactElement', description: 'Router link, e.g. <Link to="/cards" />.' },
    { name: 'SidebarGroup collapsible / open / defaultOpen / onOpenChange', type: 'boolean / callback', description: 'The label toggles the group. Always open on the rail.' },
    { name: 'SidebarIconButton', type: 'label, dot, variant', description: 'Icon-only button. variant "surface" is the rail search.' },
    { name: 'SidebarNotice', type: 'title, children', description: 'Warning card (KYC). A warning square with a tooltip on the rail.' },
    { name: 'SidebarAccount', type: 'name, email, avatarSrc, children', description: 'Avatar, name, email and the account menu.' },
    { name: 'SidebarExpandedOnly / SidebarRailOnly', type: 'component', description: 'Show children only expanded or only on the rail.' },
    { name: 'useSidebar', type: 'hook', description: 'rail, drawer, collapsed, mobileOpen and their setters.' },
  ],
  guidelines: {
    do: [
      'Mark exactly one item active: the current route or its parent.',
      'Give every item a short label; on the rail it becomes the tooltip and the accessible name.',
      'Lock items (not hide them) while KYC is pending, and keep Pengaturan live.',
      'Use PlanQuota in the footer for owners; hide it on the rail (SidebarExpandedOnly).',
    ],
    dont: [
      'Do not put an interactive control inside a SidebarItem.',
      'Do not nest links: when PlanQuota is a link, leave out PlanQuotaAction.',
    ],
  },
  notes: [
    'Values come from the Wonder v2 specimens; they match the shipped Sidebar.svelte (264/68px, item 36px, radius xl, gap 10).',
    'Wonder names the first group "Menu"; the app prints "Utama". The examples follow Wonder. The <nav> is still named "Utama".',
    'Wonder rail icons are 18px, expanded icons 17px. This port does the same.',
    'Nav Item Badge (Wonder): primary-light pill, caption-sm semibold. The rail shows a 7px primary dot with a canvas ring.',
    'The app showed tooltips with CSS on hover and focus. This port uses Base UI Tooltip (portal, collision handling), disabled while expanded.',
    'Disabled items, the pressed and expanded icon button, and the "near limit" footer are code-only. The KYC rail notice is a focusable note, not a link (the app linked it to /settings); pass your own link next to it if you need one.',
    'Inactive items keep role="link" with aria-disabled: an <a> without href cannot carry aria-label on the rail.',
    'The mobile drawer does not trap focus (the app does not either); Escape, the backdrop and a nav tap close it, and it is inert while closed.',
    'The ⌘K shortcut and the search field are not part of this file: compose Input inside SidebarExpandedOnly (see the App shell example).',
  ],
}
