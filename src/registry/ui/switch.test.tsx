import { Field } from '@base-ui/react/field'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { expectNoAxeViolations } from '@/test/axe'

import { Switch } from './switch'

describe('Switch', () => {
  it('is a switch named by its label and toggles from the label', async () => {
    const onCheckedChange = vi.fn()
    render(<Switch onCheckedChange={onCheckedChange}>Notifikasi transaksi</Switch>)
    const control = screen.getByRole('switch', { name: 'Notifikasi transaksi' })
    expect(control.getAttribute('aria-checked')).toBe('false')
    await userEvent.click(screen.getByText('Notifikasi transaksi'))
    expect(control.getAttribute('aria-checked')).toBe('true')
    expect(onCheckedChange).toHaveBeenCalledTimes(1)
  })

  it('toggles with Space and Enter', async () => {
    render(<Switch aria-label="Mode gelap" />)
    const control = screen.getByRole('switch')
    control.focus()
    await userEvent.keyboard(' ')
    expect(control.getAttribute('aria-checked')).toBe('true')
    await userEvent.keyboard('{Enter}')
    expect(control.getAttribute('aria-checked')).toBe('false')
  })

  it('works controlled', async () => {
    function Controlled() {
      const [on, setOn] = useState(false)
      return (
        <>
          <Switch checked={on} onCheckedChange={setOn}>
            Bekukan kartu
          </Switch>
          <output>{String(on)}</output>
        </>
      )
    }
    render(<Controlled />)
    await userEvent.click(screen.getByRole('switch'))
    expect(screen.getByRole('status').textContent).toBe('true')
  })

  it('disabled does not toggle', async () => {
    render(<Switch disabled>Limit harian</Switch>)
    const control = screen.getByRole('switch')
    await userEvent.click(control)
    expect(control.getAttribute('aria-checked')).toBe('false')
    expect(control.getAttribute('aria-disabled')).toBe('true')
  })

  it('size sm, className on the row, ref on the control', () => {
    let node: HTMLElement | null = null
    render(
      <Switch size="sm" className="justify-between" ref={(el) => void (node = el)}>
        Kecil
      </Switch>,
    )
    const control = screen.getByRole('switch')
    expect(control.dataset.size).toBe('sm')
    expect(control.closest('label')?.className).toContain('justify-between')
    expect(node).toBe(control)
  })

  it('takes its name from Field.Label inside Field.Root', () => {
    render(
      <Field.Root>
        <Field.Label>
          <Switch />
          Auto top-up
        </Field.Label>
      </Field.Root>,
    )
    expect(screen.getByRole('switch', { name: 'Auto top-up' })).toBeTruthy()
  })

  it('has no axe violations', async () => {
    const { container } = render(
      <div>
        <Switch defaultChecked description="Kirim email setiap transaksi">
          Notifikasi
        </Switch>
        <Switch size="sm" aria-label="Kecil" />
        <Switch disabled>Mati</Switch>
      </div>,
    )
    await expectNoAxeViolations(container)
  })
})
