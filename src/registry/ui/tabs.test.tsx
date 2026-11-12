import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { expectNoAxeViolations } from '@/test/axe'

import { Tabs, TabsCount, TabsList, TabsPanel, TabsTab } from './tabs'

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

  it('has no axe violations', async () => {
    const { container } = render(<Example />)
    await expectNoAxeViolations(container)
  })
})
