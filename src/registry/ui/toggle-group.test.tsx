import { GridViewIcon, Menu01Icon } from '@hugeicons/core-free-icons'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { expectNoAxeViolations } from '@/test/axe'

import { Icon } from './icon'
import { ToggleGroup, ToggleGroupItem } from './toggle-group'

function Period(props: React.ComponentProps<typeof ToggleGroup>) {
  return (
    <ToggleGroup aria-label="Periode" defaultValue="7" {...props}>
      <ToggleGroupItem value="7">7 hari</ToggleGroupItem>
      <ToggleGroupItem value="30">30 hari</ToggleGroupItem>
      <ToggleGroupItem value="90" disabled>
        90 hari
      </ToggleGroupItem>
    </ToggleGroup>
  )
}

const pressed = (name: string) => screen.getByRole('button', { name }).getAttribute('aria-pressed')

describe('ToggleGroup', () => {
  it('is a named group of pressed buttons', () => {
    render(<Period />)
    expect(screen.getByRole('group', { name: 'Periode' })).toBeTruthy()
    expect(pressed('7 hari')).toBe('true')
    expect(pressed('30 hari')).toBe('false')
  })

  it('presses one item at a time and calls onValueChange with a string', async () => {
    const onValueChange = vi.fn()
    render(<Period onValueChange={onValueChange} />)
    await userEvent.click(screen.getByRole('button', { name: '30 hari' }))
    expect(onValueChange).toHaveBeenCalledWith('30')
    expect(pressed('30 hari')).toBe('true')
    expect(pressed('7 hari')).toBe('false')
  })

  it('keeps the pressed item pressed when it is pressed again', async () => {
    const onValueChange = vi.fn()
    render(<Period onValueChange={onValueChange} />)
    await userEvent.click(screen.getByRole('button', { name: '7 hari' }))
    expect(pressed('7 hari')).toBe('true')
    expect(onValueChange).not.toHaveBeenCalled()
  })

  it('disabled items cannot be pressed', async () => {
    render(<Period />)
    const item = screen.getByRole('button', { name: '90 hari' })
    expect(item).toHaveProperty('disabled', true)
    await userEvent.click(item)
    expect(pressed('90 hari')).toBe('false')
  })

  it('arrow keys move the focus', async () => {
    render(<Period />)
    await userEvent.click(screen.getByRole('button', { name: '7 hari' }))
    await userEvent.keyboard('{ArrowRight}')
    expect(document.activeElement).toBe(screen.getByRole('button', { name: '30 hari' }))
  })

  it('works controlled', async () => {
    function Controlled() {
      const [value, setValue] = useState('30')
      return (
        <>
          <span data-testid="v">{value}</span>
          <Period value={value} onValueChange={setValue} />
        </>
      )
    }
    render(<Controlled />)
    expect(pressed('30 hari')).toBe('true')
    await userEvent.click(screen.getByRole('button', { name: '7 hari' }))
    expect(screen.getByTestId('v').textContent).toBe('7')
    expect(pressed('7 hari')).toBe('true')
  })

  it('track renders a hidden sliding pill', () => {
    const { container } = render(<Period variant="track" />)
    const pill = container.querySelector('[data-slot="toggle-group-pill"]')
    expect(pill?.getAttribute('aria-hidden')).toBe('true')
  })

  it('has no axe violations', async () => {
    const { container } = render(
      <div>
        <Period />
        <ToggleGroup aria-label="Tampilan" variant="track" size="icon" defaultValue="grid">
          <ToggleGroupItem value="grid" aria-label="Grid">
            <Icon icon={GridViewIcon} />
          </ToggleGroupItem>
          <ToggleGroupItem value="list" aria-label="Daftar">
            <Icon icon={Menu01Icon} />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>,
    )
    await expectNoAxeViolations(container)
  })
})
