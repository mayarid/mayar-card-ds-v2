import { CreditCardIcon, DashboardSquare01Icon, Settings01Icon, UserGroupIcon } from '@hugeicons/core-free-icons'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { expectNoAxeViolations } from '@/test/axe'

import { Icon } from './icon'
import {
  Sidebar,
  SidebarAccount,
  SidebarActions,
  SidebarCloseTrigger,
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
  SidebarNotice,
  SidebarRailOnly,
  type SidebarProps,
} from './sidebar'

function App(props: SidebarProps & { locked?: boolean }) {
  const { locked = false, ...rest } = props
  return (
    <Sidebar layout="static" {...rest}>
      <SidebarHeader>
        <SidebarExpandedOnly>
          <span>Mayar</span>
        </SidebarExpandedOnly>
        <SidebarRailOnly>
          <span>M</span>
        </SidebarRailOnly>
        <SidebarActions>
          <SidebarCollapseTrigger />
          <SidebarCloseTrigger />
        </SidebarActions>
      </SidebarHeader>
      <SidebarNav>
        <SidebarGroup>
          <SidebarGroupLabel>Utama</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarItem href="/" label="Beranda" active>
              <Icon icon={DashboardSquare01Icon} />
            </SidebarItem>
            <SidebarItem href="/cards" label="Kartu" locked={locked} badge={<SidebarItemCount>3</SidebarItemCount>}>
              <Icon icon={CreditCardIcon} />
            </SidebarItem>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup collapsible>
          <SidebarGroupLabel>Organisasi</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarItem href="/teams" label="Tim">
              <Icon icon={UserGroupIcon} />
            </SidebarItem>
            <SidebarItem href="/settings" label="Pengaturan" disabled>
              <Icon icon={Settings01Icon} />
            </SidebarItem>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarNav>
      <SidebarFooter>
        {locked ? <SidebarNotice title="Verifikasi diperlukan">Menu lain terbuka setelah verifikasi.</SidebarNotice> : null}
        <SidebarAccount name="Rina Wulandari" email="rina@tokobaju.id" />
      </SidebarFooter>
    </Sidebar>
  )
}

describe('Sidebar', () => {
  it('renders a named nav with the current page marked', () => {
    render(<App />)
    expect(screen.getByRole('navigation', { name: 'Utama' })).toBeTruthy()
    const home = screen.getByRole('link', { name: 'Beranda' })
    expect(home.getAttribute('aria-current')).toBe('page')
    expect(home.dataset.state).toBe('active')
    expect(screen.getByText('3')).toBeTruthy()
    expect(screen.getByText('Rina Wulandari')).toBeTruthy()
  })

  it('locked and disabled items are not links in the Tab order and ignore clicks', async () => {
    render(<App locked />)
    const cards = screen.getByText('Kartu').closest('a')
    expect(cards?.getAttribute('href')).toBeNull()
    expect(cards?.getAttribute('aria-disabled')).toBe('true')
    expect(cards?.getAttribute('tabindex')).toBe('-1')
    expect(cards?.dataset.state).toBe('locked')
    expect(cards?.getAttribute('title')).toBe('Selesaikan verifikasi untuk membuka menu')
    const settings = screen.getByText('Pengaturan').closest('a')
    expect(settings?.dataset.state).toBe('disabled')
    expect(screen.getByRole('note')).toBeTruthy()
  })

  it('collapses to the rail (uncontrolled) and names items by aria-label', async () => {
    const onCollapsedChange = vi.fn()
    render(<App onCollapsedChange={onCollapsedChange} />)
    const toggle = screen.getByRole('button', { name: 'Ciutkan menu' })
    expect(toggle.getAttribute('aria-pressed')).toBe('false')
    await userEvent.click(toggle)
    expect(onCollapsedChange).toHaveBeenCalledWith(true)
    const aside = document.querySelector('[data-slot="sidebar"]')
    expect(aside?.hasAttribute('data-collapsed')).toBe(true)
    expect(screen.getByRole('button', { name: 'Perluas menu' }).getAttribute('aria-pressed')).toBe('true')
    expect(screen.getByRole('link', { name: 'Tim' }).getAttribute('aria-label')).toBe('Tim')
    expect(screen.queryByText('Mayar')).toBeNull()
    expect(screen.getByText('M')).toBeTruthy()
    expect(screen.queryByText('Rina Wulandari')).toBeNull()
  })

  it('collapsed is controllable', () => {
    render(<App collapsed />)
    expect(document.querySelector('[data-slot="sidebar"]')?.hasAttribute('data-collapsed')).toBe(true)
  })

  it('a collapsible group opens and closes from its label', async () => {
    render(<App />)
    const label = screen.getByRole('button', { name: 'Organisasi' })
    expect(label.getAttribute('aria-expanded')).toBe('true')
    await userEvent.click(label)
    expect(label.getAttribute('aria-expanded')).toBe('false')
    expect(screen.queryByRole('link', { name: 'Tim' })).toBeNull()
  })

  it('responsive below lg: an inert drawer until opened, closes with Escape and the backdrop', async () => {
    const onMobileOpenChange = vi.fn()
    const { rerender } = render(<App layout="responsive" mobileOpen={false} onMobileOpenChange={onMobileOpenChange} />)
    const aside = document.querySelector('[data-slot="sidebar"]') as HTMLElement
    expect(aside.dataset.drawer).toBe('closed')
    expect(aside.hasAttribute('inert')).toBe(true)
    expect(screen.queryByRole('button', { name: 'Ciutkan menu', hidden: true })).toBeNull()

    rerender(<App layout="responsive" mobileOpen onMobileOpenChange={onMobileOpenChange} />)
    expect(aside.hasAttribute('inert')).toBe(false)
    const close = screen.getAllByRole('button', { name: 'Tutup menu' })
    expect(close).toHaveLength(2) // backdrop and the ✕
    await userEvent.click(close[1] as HTMLElement)
    expect(onMobileOpenChange).toHaveBeenLastCalledWith(false)

    onMobileOpenChange.mockClear()
    screen.getByRole('link', { name: 'Tim' }).focus()
    await userEvent.keyboard('{Escape}')
    expect(onMobileOpenChange).toHaveBeenLastCalledWith(false)
  })

  it('items render through render and close the drawer on click', async () => {
    const onMobileOpenChange = vi.fn()
    render(
      <Sidebar mobileOpen onMobileOpenChange={onMobileOpenChange}>
        <SidebarNav>
          <SidebarItem label="Kartu" render={<a href="#cards" data-router="yes" />}>
            <Icon icon={CreditCardIcon} />
          </SidebarItem>
        </SidebarNav>
      </Sidebar>,
    )
    const link = screen.getByRole('link', { name: 'Kartu' })
    expect(link.dataset.router).toBe('yes')
    await userEvent.click(link)
    expect(onMobileOpenChange).toHaveBeenCalledWith(false)
  })

  it('has no axe violations, expanded and collapsed', async () => {
    const { container, rerender } = render(<App locked />)
    await expectNoAxeViolations(container)
    rerender(<App locked collapsed />)
    await expectNoAxeViolations(container)
  })
})
