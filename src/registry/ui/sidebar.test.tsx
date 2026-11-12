import { CreditCardIcon, DashboardSquare01Icon, Settings01Icon, UserGroupIcon } from '@hugeicons/core-free-icons'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
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

/** A page with the "Buka menu" trigger and a responsive sidebar (a drawer in jsdom, below lg). */
function DrawerHarness() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Buka menu
      </button>
      <App layout="responsive" mobileOpen={open} onMobileOpenChange={setOpen} />
    </>
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

  it('responsive below lg: no drawer in the DOM until it opens; Escape and the ✕ close it', async () => {
    const onMobileOpenChange = vi.fn()
    const { rerender } = render(<App layout="responsive" mobileOpen={false} onMobileOpenChange={onMobileOpenChange} />)
    expect(document.querySelector('[data-slot="sidebar"]')).toBeNull()

    rerender(<App layout="responsive" mobileOpen onMobileOpenChange={onMobileOpenChange} />)
    const drawer = await screen.findByRole('dialog', { name: 'Menu' })
    expect(drawer.dataset.drawer).toBe('open')
    expect(screen.queryByRole('button', { name: 'Ciutkan menu' })).toBeNull()
    await userEvent.click(screen.getByRole('button', { name: 'Tutup menu' }))
    expect(onMobileOpenChange).toHaveBeenLastCalledWith(false)

    onMobileOpenChange.mockClear()
    screen.getByRole('link', { name: 'Tim' }).focus()
    await userEvent.keyboard('{Escape}')
    expect(onMobileOpenChange).toHaveBeenLastCalledWith(false)
  })

  it('phone drawer: focus moves in, Tab and Shift+Tab stay inside, focus returns to the trigger', async () => {
    const user = userEvent.setup()
    render(<DrawerHarness />)
    const trigger = screen.getByRole('button', { name: 'Buka menu' })
    await user.click(trigger)
    const drawer = await screen.findByRole('dialog', { name: 'Menu' })
    await waitFor(() => expect(drawer.contains(document.activeElement)).toBe(true))

    for (let i = 0; i < 12; i++) {
      await user.tab()
      // A focus guard at the edge sends focus back in (the browser does it in the same frame).
      await waitFor(() => expect(drawer.contains(document.activeElement)).toBe(true))
    }
    for (let i = 0; i < 12; i++) {
      await user.tab({ shift: true })
      await waitFor(() => expect(drawer.contains(document.activeElement)).toBe(true))
    }

    await user.keyboard('{Escape}')
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
    await waitFor(() => expect(document.activeElement).toBe(trigger))
  })

  it('phone drawer: a press on the backdrop and a nav tap close it', async () => {
    const user = userEvent.setup()
    render(<DrawerHarness />)
    const trigger = screen.getByRole('button', { name: 'Buka menu' })

    await user.click(trigger)
    await screen.findByRole('dialog', { name: 'Menu' })
    await user.click(document.querySelector('[data-slot="sidebar-backdrop"]') as HTMLElement)
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())

    await user.click(trigger)
    await user.click(await screen.findByRole('link', { name: 'Tim' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
  })

  it('the KYC notice on the rail is a link to the settings page; render takes a router link', () => {
    const { rerender } = render(<App locked collapsed />)
    const link = screen.getByRole('link', { name: 'Verifikasi diperlukan — buka Pengaturan' })
    expect(link.getAttribute('href')).toBe('/settings')
    expect(link.tabIndex).toBe(0)
    expect(screen.queryByRole('note')).toBeNull()

    rerender(
      <Sidebar layout="static" collapsed>
        <SidebarFooter>
          <SidebarNotice title="Verifikasi diperlukan" render={<a href="#settings" data-router="yes" />} linkLabel="Buka verifikasi">
            Menu lain terbuka setelah verifikasi.
          </SidebarNotice>
        </SidebarFooter>
      </Sidebar>,
    )
    const routed = screen.getByRole('link', { name: 'Buka verifikasi' })
    expect(routed.dataset.router).toBe('yes')
    expect(routed.getAttribute('href')).toBe('#settings')
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

  it('has no axe violations as an open drawer', async () => {
    render(<App layout="responsive" mobileOpen />)
    await screen.findByRole('dialog', { name: 'Menu' })
    await expectNoAxeViolations(document.body)
  })
})
