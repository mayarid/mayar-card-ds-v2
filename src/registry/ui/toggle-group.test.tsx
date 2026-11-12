import { GridViewIcon, Menu01Icon } from '@hugeicons/core-free-icons'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { expectNoAxeViolations } from '@/test/axe'

import { Icon } from './icon'
import { ToggleGroup, ToggleGroupItem, type ToggleGroupSingleProps } from './toggle-group'

function Period(props: Omit<ToggleGroupSingleProps, 'children'>) {
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

  it('Tab into the group lands on the pressed item', async () => {
    render(
      <>
        <button type="button">Sebelum</button>
        <Period defaultValue="30" />
      </>,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Sebelum' }))
    await userEvent.tab()
    expect(document.activeElement).toBe(screen.getByRole('button', { name: '30 hari' }))
  })

  it('names an icon-only item in its title too', () => {
    render(
      <ToggleGroup aria-label="Tampilan" size="icon" defaultValue="grid">
        <ToggleGroupItem value="grid" aria-label="Grid">
          <Icon icon={GridViewIcon} />
        </ToggleGroupItem>
      </ToggleGroup>,
    )
    expect(screen.getByRole('button', { name: 'Grid' }).getAttribute('title')).toBe('Grid')
  })

  describe('multiple', () => {
    function Status(props: { defaultValue?: string[]; value?: string[]; onValueChange?: (value: string[]) => void }) {
      return (
        <ToggleGroup aria-label="Status" multiple size="sm" {...props}>
          <ToggleGroupItem value="success">Berhasil</ToggleGroupItem>
          <ToggleGroupItem value="pending">Tertunda</ToggleGroupItem>
          <ToggleGroupItem value="failed">Gagal</ToggleGroupItem>
        </ToggleGroup>
      )
    }

    it('presses several items and calls onValueChange with an array', async () => {
      const onValueChange = vi.fn()
      render(<Status defaultValue={['success']} onValueChange={onValueChange} />)
      await userEvent.click(screen.getByRole('button', { name: 'Gagal' }))
      expect(onValueChange).toHaveBeenLastCalledWith(['success', 'failed'])
      expect(pressed('Berhasil')).toBe('true')
      expect(pressed('Gagal')).toBe('true')
    })

    it('can release every item', async () => {
      const onValueChange = vi.fn()
      render(<Status defaultValue={['pending']} onValueChange={onValueChange} />)
      await userEvent.click(screen.getByRole('button', { name: 'Tertunda' }))
      expect(onValueChange).toHaveBeenLastCalledWith([])
      expect(pressed('Tertunda')).toBe('false')
    })

    it('works controlled', async () => {
      function Controlled() {
        const [value, setValue] = useState<string[]>([])
        return (
          <>
            <span data-testid="v">{value.join(',')}</span>
            <Status value={value} onValueChange={setValue} />
          </>
        )
      }
      render(<Controlled />)
      await userEvent.click(screen.getByRole('button', { name: 'Berhasil' }))
      await userEvent.click(screen.getByRole('button', { name: 'Tertunda' }))
      expect(screen.getByTestId('v').textContent).toBe('success,pending')
      await userEvent.click(screen.getByRole('button', { name: 'Berhasil' }))
      expect(screen.getByTestId('v').textContent).toBe('pending')
    })

    it('a track in multiple mode has no sliding pill', () => {
      const { container } = render(
        <ToggleGroup aria-label="Status" variant="track" multiple defaultValue={['a']}>
          <ToggleGroupItem value="a">A</ToggleGroupItem>
          <ToggleGroupItem value="b">B</ToggleGroupItem>
        </ToggleGroup>,
      )
      expect(container.querySelector('[data-slot="toggle-group-pill"]')).toBeNull()
    })

    it('has no axe violations', async () => {
      const { container } = render(<Status defaultValue={['success', 'failed']} />)
      await expectNoAxeViolations(container)
    })
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
