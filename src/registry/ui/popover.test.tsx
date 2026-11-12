import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { expectNoAxeViolations } from '@/test/axe'

import { Button } from './button'
import { Popover, PopoverClose, PopoverContent, PopoverPanel, PopoverTitle, PopoverTrigger } from './popover'

function Example({ onOpenChange }: { onOpenChange?: (open: boolean) => void }) {
  return (
    <>
      <button type="button">Di luar</button>
      <Popover onOpenChange={onOpenChange}>
        <PopoverTrigger render={<Button variant="secondary" />}>Status</PopoverTrigger>
        <PopoverContent data-testid="panel">
          <PopoverTitle>Filter status</PopoverTitle>
          <button type="button">Di dalam</button>
          <PopoverClose render={<Button variant="ghost" />}>Selesai</PopoverClose>
        </PopoverContent>
      </Popover>
    </>
  )
}

describe('Popover', () => {
  it('toggles from the trigger, sets aria-expanded and data-popup-open', async () => {
    render(<Example />)
    const trigger = screen.getByRole('button', { name: 'Status' })
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
    await userEvent.click(trigger)
    const panel = await screen.findByRole('dialog', { name: 'Filter status' })
    expect(panel.dataset.slot).toBe('popover-content')
    expect(trigger.getAttribute('aria-expanded')).toBe('true')
    expect(trigger.hasAttribute('data-popup-open')).toBe(true)
    await userEvent.click(trigger)
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
  })

  it('Escape closes and returns focus to the trigger', async () => {
    render(<Example />)
    const trigger = screen.getByRole('button', { name: 'Status' })
    await userEvent.click(trigger)
    await screen.findByRole('dialog')
    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
    await waitFor(() => expect(document.activeElement).toBe(trigger))
  })

  it('a press outside closes and reports the change', async () => {
    const onOpenChange = vi.fn()
    render(<Example onOpenChange={onOpenChange} />)
    await userEvent.click(screen.getByRole('button', { name: 'Status' }))
    await screen.findByRole('dialog')
    await userEvent.click(screen.getByRole('button', { name: 'Di luar' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
    expect(onOpenChange).toHaveBeenLastCalledWith(false, expect.anything())
  })

  it('PopoverClose closes it', async () => {
    render(<Example />)
    await userEvent.click(screen.getByRole('button', { name: 'Status' }))
    await userEvent.click(await screen.findByRole('button', { name: 'Selesai' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
  })

  it('works controlled', async () => {
    function Controlled() {
      const [open, setOpen] = useState(false)
      return (
        <>
          <button type="button" onClick={() => setOpen(true)}>
            Buka dari luar
          </button>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger>Status</PopoverTrigger>
            <PopoverContent aria-label="Panel uji">Isi</PopoverContent>
          </Popover>
        </>
      )
    }
    render(<Controlled />)
    await userEvent.click(screen.getByRole('button', { name: 'Buka dari luar' }))
    expect(await screen.findByRole('dialog', { name: 'Panel uji' })).toBeTruthy()
  })

  it('PopoverPanel is a static surface', () => {
    render(<PopoverPanel data-testid="p">Isi</PopoverPanel>)
    const panel = screen.getByTestId('p')
    expect(panel.className).toContain('shadow-popover')
    expect(panel.className).toContain('rounded-2xl')
  })

  it('has no axe violations', async () => {
    const { baseElement } = render(<Example />)
    await userEvent.click(screen.getByRole('button', { name: 'Status' }))
    await screen.findByRole('dialog')
    await expectNoAxeViolations(baseElement)
  })
})
