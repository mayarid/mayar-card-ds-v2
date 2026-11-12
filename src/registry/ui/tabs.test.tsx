import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { expectNoAxeViolations } from '@/test/axe'

import { Tabs, TabsCount, TabsHeader, TabsLink, TabsList, TabsNav, TabsPanel, TabsTab } from './tabs'

function Example(props: React.ComponentProps<typeof Tabs>) {
  return (
    <Tabs defaultValue="all" {...props}>
      <TabsList aria-label="Kartu">
        <TabsTab value="all">
          Semua
          <TabsCount label="kartu">12</TabsCount>
        </TabsTab>
        <TabsTab value="mine">Kartu saya</TabsTab>
        <TabsTab value="off" disabled>
          Diblokir
        </TabsTab>
        <TabsTab value="team">Tim</TabsTab>
      </TabsList>
      <TabsPanel value="all">Panel semua</TabsPanel>
      <TabsPanel value="mine">Panel saya</TabsPanel>
      <TabsPanel value="off">Panel blokir</TabsPanel>
      <TabsPanel value="team">Panel tim</TabsPanel>
    </Tabs>
  )
}

describe('Tabs', () => {
  it('renders a tablist with the active tab selected and its panel shown', () => {
    render(<Example />)
    expect(screen.getByRole('tablist', { name: 'Kartu' })).toBeTruthy()
    const tab = screen.getByRole('tab', { name: /^Semua,\s?12\s?kartu$/ })
    expect(tab.getAttribute('aria-selected')).toBe('true')
    expect(screen.getByRole('tabpanel').textContent).toBe('Panel semua')
  })

  it('switches on click (uncontrolled) and calls onValueChange', async () => {
    const onValueChange = vi.fn()
    render(<Example onValueChange={onValueChange} />)
    await userEvent.click(screen.getByRole('tab', { name: 'Kartu saya' }))
    expect(onValueChange).toHaveBeenCalledWith('mine', expect.anything())
    expect(screen.getByRole('tabpanel').textContent).toBe('Panel saya')
  })

  it('arrow keys move the focus and activate the tab; a disabled tab stays inactive', async () => {
    render(<Example />)
    await userEvent.click(screen.getByRole('tab', { name: 'Kartu saya' }))
    await userEvent.keyboard('{ArrowLeft}')
    const first = screen.getByRole('tab', { name: /^Semua/ })
    expect(document.activeElement).toBe(first)
    expect(first.getAttribute('aria-selected')).toBe('true')
    await userEvent.keyboard('{ArrowRight}{ArrowRight}')
    expect(screen.getByRole('tab', { name: 'Diblokir' }).getAttribute('aria-selected')).toBe('false')
  })

  it('does not select a disabled tab', async () => {
    render(<Example />)
    const off = screen.getByRole('tab', { name: 'Diblokir' })
    expect(off.hasAttribute('data-disabled')).toBe(true)
    await userEvent.click(off)
    expect(off.getAttribute('aria-selected')).toBe('false')
  })

  it('works controlled', async () => {
    function Controlled() {
      const [value, setValue] = useState('team')
      return (
        <>
          <span data-testid="value">{value}</span>
          <Example value={value} onValueChange={(v) => setValue(String(v))} />
        </>
      )
    }
    render(<Controlled />)
    expect(screen.getByRole('tab', { name: 'Tim' }).getAttribute('aria-selected')).toBe('true')
    await userEvent.click(screen.getByRole('tab', { name: 'Kartu saya' }))
    expect(screen.getByTestId('value').textContent).toBe('mine')
  })

  it('renders the sliding indicator and the variant on the root', () => {
    const { container } = render(<Example variant="line" tone="primary" />)
    expect(container.querySelector('[data-slot="tabs"]')?.getAttribute('data-variant')).toBe('line')
    expect(container.querySelector('[data-slot="tabs-indicator"]')).toBeTruthy()
  })

  it('a loading count is a hidden bone', () => {
    const { container } = render(
      <Tabs defaultValue="a">
        <TabsList aria-label="Status">
          <TabsTab value="a">
            Menunggu
            <TabsCount loading />
          </TabsTab>
        </TabsList>
      </Tabs>,
    )
    const bone = container.querySelector('[data-slot="tabs-count"]')
    expect(bone?.getAttribute('aria-hidden')).toBe('true')
    expect(screen.getByRole('tab', { name: 'Menunggu' })).toBeTruthy()
  })

  it('arrow keys stop at the ends of the list, as in the app', async () => {
    render(<Example />)
    await userEvent.click(screen.getByRole('tab', { name: 'Tim' }))
    await userEvent.keyboard('{ArrowRight}')
    expect(document.activeElement).toBe(screen.getByRole('tab', { name: 'Tim' }))
  })

  it('a header sits on the list row', () => {
    const { container } = render(
      <Tabs defaultValue="va" size="sm">
        <TabsHeader>
          <h4>Cara transfer ke BCA</h4>
          <TabsList aria-label="Cara transfer ke BCA">
            <TabsTab value="va">ATM</TabsTab>
            <TabsTab value="mb">m-BCA</TabsTab>
          </TabsList>
        </TabsHeader>
        <TabsPanel value="va">Langkah ATM</TabsPanel>
        <TabsPanel value="mb">Langkah m-BCA</TabsPanel>
      </Tabs>,
    )
    const header = container.querySelector('[data-slot="tabs-header"]')
    expect(header?.querySelector('[role="tablist"]')).toBeTruthy()
    expect(header?.textContent).toContain('Cara transfer ke BCA')
  })

  it('fullHeight stretches the line list and drops its hairline', () => {
    render(<Example variant="line" fullHeight />)
    const list = screen.getByRole('tablist')
    expect(list.className).toContain('flex-1')
    expect(list.className).toContain('shadow-none')
    expect(screen.getByRole('tab', { name: 'Kartu saya' }).className).toContain('h-auto')
  })

  it('a scrollable line list marks itself for the inset focus ring', () => {
    render(
      <Tabs variant="line" defaultValue="a">
        <TabsList aria-label="Status" scrollable>
          <TabsTab value="a">A</TabsTab>
        </TabsList>
      </Tabs>,
    )
    expect(screen.getByRole('tablist').hasAttribute('data-scrollable')).toBe(true)
  })

  describe('TabsNav', () => {
    function Nav({ value = '/admin/users' }: { value?: string }) {
      return (
        <TabsNav variant="line" tone="primary" countTone="tint" aria-label="Konsol admin" value={value}>
          <TabsLink value="/admin/users" href="/admin/users">
            Pengguna
          </TabsLink>
          <TabsLink value="/admin/kyc" href="/admin/kyc">
            KYC
            <TabsCount label="menunggu">4</TabsCount>
          </TabsLink>
          <TabsLink value="/admin/logs" href="/admin/logs" disabled>
            Log
          </TabsLink>
        </TabsNav>
      )
    }

    it('is a named nav of links; the active one is the current page', () => {
      render(<Nav />)
      expect(screen.getByRole('navigation', { name: 'Konsol admin' })).toBeTruthy()
      expect(screen.queryByRole('tablist')).toBeNull()
      const active = screen.getByRole('link', { name: 'Pengguna' })
      expect(active.getAttribute('aria-current')).toBe('page')
      expect(active.getAttribute('href')).toBe('/admin/users')
      expect(screen.getByRole('link', { name: /^KYC/ }).getAttribute('aria-current')).toBeNull()
    })

    it('renders the indicator only when a link is active', () => {
      const { container, rerender } = render(<Nav />)
      expect(container.querySelector('[data-slot="tabs-indicator"]')?.getAttribute('aria-hidden')).toBe('true')
      rerender(<Nav value="/elsewhere" />)
      expect(container.querySelector('[data-slot="tabs-indicator"]')).toBeNull()
    })

    it('a disabled link has no href and does not call onClick', async () => {
      const onClick = vi.fn()
      render(
        <TabsNav aria-label="Nav" value="a">
          <TabsLink value="a" href="/a">
            A
          </TabsLink>
          <TabsLink value="b" href="/b" disabled onClick={onClick}>
            B
          </TabsLink>
        </TabsNav>,
      )
      const link = screen.getByText('B')
      expect(link.getAttribute('href')).toBeNull()
      expect(link.getAttribute('aria-disabled')).toBe('true')
      await userEvent.click(link)
      expect(onClick).not.toHaveBeenCalled()
    })

    it('renders through a router link with render', () => {
      render(
        <TabsNav aria-label="Nav" value="a">
          <TabsLink value="a" render={<a href="/router-a" data-router="" />}>
            A
          </TabsLink>
        </TabsNav>,
      )
      const link = screen.getByRole('link', { name: 'A' })
      expect(link.hasAttribute('data-router')).toBe(true)
      expect(link.getAttribute('aria-current')).toBe('page')
    })

    it('has no axe violations', async () => {
      const { container } = render(<Nav />)
      await expectNoAxeViolations(container)
    })
  })

  it('has no axe violations', async () => {
    const { container } = render(<Example />)
    await expectNoAxeViolations(container)
  })
})
