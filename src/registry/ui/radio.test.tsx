import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { expectNoAxeViolations } from '@/test/axe'

import { RadioGroup, RadioGroupItem } from './radio'

function Periods(props: React.ComponentProps<typeof RadioGroup>) {
  return (
    <RadioGroup aria-label="Periode" {...props}>
      <RadioGroupItem value="harian">Harian</RadioGroupItem>
      <RadioGroupItem value="bulanan" description="Direset tanggal 1">
        Bulanan
      </RadioGroupItem>
      <RadioGroupItem value="tahunan" disabled>
        Tahunan
      </RadioGroupItem>
    </RadioGroup>
  )
}

describe('RadioGroup', () => {
  it('renders a radiogroup of named radios', () => {
    render(<Periods defaultValue="bulanan" />)
    expect(screen.getByRole('radiogroup', { name: 'Periode' })).toBeTruthy()
    expect(screen.getByRole('radio', { name: /Bulanan/ }).getAttribute('aria-checked')).toBe('true')
    expect(screen.getByRole('radio', { name: 'Harian' }).getAttribute('aria-checked')).toBe('false')
  })

  it('selects from a click on the label and calls onValueChange', async () => {
    const onValueChange = vi.fn()
    render(<Periods onValueChange={onValueChange} />)
    await userEvent.click(screen.getByText('Harian'))
    expect(screen.getByRole('radio', { name: 'Harian' }).getAttribute('aria-checked')).toBe('true')
    expect(onValueChange.mock.calls[0]?.[0]).toBe('harian')
  })

  it('moves with arrow keys and skips the disabled radio', async () => {
    render(<Periods defaultValue="harian" />)
    screen.getByRole('radio', { name: 'Harian' }).focus()
    await userEvent.keyboard('{ArrowDown}')
    const monthly = screen.getByRole('radio', { name: /Bulanan/ })
    expect(monthly.getAttribute('aria-checked')).toBe('true')
    await userEvent.keyboard('{ArrowDown}')
    expect(screen.getByRole('radio', { name: 'Tahunan' }).getAttribute('aria-checked')).toBe('false')
  })

  it('works controlled', async () => {
    function Controlled() {
      const [value, setValue] = useState('harian')
      return (
        <>
          <Periods value={value} onValueChange={(v) => setValue(String(v))} />
          <output>{value}</output>
        </>
      )
    }
    render(<Controlled />)
    await userEvent.click(screen.getByText('Bulanan'))
    expect(screen.getByRole('status').textContent).toBe('bulanan')
  })

  it('disabled radio does not select', async () => {
    render(<Periods defaultValue="harian" />)
    await userEvent.click(screen.getByText('Tahunan'))
    expect(screen.getByRole('radio', { name: 'Tahunan' }).getAttribute('aria-checked')).toBe('false')
  })

  it('has no axe violations', async () => {
    const { container } = render(<Periods defaultValue="bulanan" />)
    await expectNoAxeViolations(container)
  })
})
