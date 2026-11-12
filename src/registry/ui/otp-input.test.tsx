import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { Field, FieldLabel } from '@/components/ui/field'
import { expectNoAxeViolations } from '@/test/axe'

import { OtpInput } from './otp-input'

function Labelled(props: React.ComponentProps<typeof OtpInput>) {
  return (
    <Field>
      <FieldLabel>Kode verifikasi</FieldLabel>
      <OtpInput {...props} />
    </Field>
  )
}

const slots = () => screen.getAllByRole('textbox') as HTMLInputElement[]

describe('OtpInput', () => {
  it('renders 6 numeric slots, two groups of 3, labelled', () => {
    render(<Labelled />)
    expect(slots()).toHaveLength(6)
    expect(screen.getByRole('textbox', { name: 'Kode verifikasi' })).toBe(slots()[0])
    expect(screen.getByRole('textbox', { name: 'Digit 2 of 6' })).toBe(slots()[1])
    expect(slots()[0]?.getAttribute('autocomplete')).toBe('one-time-code')
    expect(slots()[0]?.getAttribute('inputmode')).toBe('numeric')
    expect(document.querySelectorAll('[data-slot=otp-input-separator]')).toHaveLength(1)
  })

  it('LG has no separator; length 4 has 4 slots', () => {
    render(<Labelled size="lg" length={4} />)
    expect(slots()).toHaveLength(4)
    expect(document.querySelector('[data-slot=otp-input-separator]')).toBeNull()
  })

  it('typing moves forward, rejects letters and completes', async () => {
    const onValueComplete = vi.fn()
    render(<Labelled length={4} onValueComplete={onValueComplete} />)
    await userEvent.click(slots()[0]!)
    await userEvent.keyboard('1a2')
    expect(slots().map((s) => s.value)).toEqual(['1', '2', '', ''])
    await userEvent.keyboard('34')
    expect(onValueComplete).toHaveBeenCalledWith('1234', expect.anything())
  })

  it('paste fills the slots', async () => {
    const onValueChange = vi.fn()
    render(<Labelled onValueChange={onValueChange} />)
    await userEvent.click(slots()[0]!)
    await userEvent.paste('12-34 56')
    expect(slots().map((s) => s.value).join('')).toBe('123456')
  })

  it('Backspace and arrow keys move between slots', async () => {
    render(<Labelled length={4} defaultValue="12" />)
    await userEvent.click(slots()[2]!)
    await userEvent.keyboard('{Backspace}')
    expect(slots().map((s) => s.value)).toEqual(['1', '', '', ''])
    await userEvent.keyboard('{ArrowLeft}')
    expect(document.activeElement).toBe(slots()[0])
  })

  it('works controlled', async () => {
    function Controlled() {
      const [value, setValue] = useState('')
      return (
        <>
          <Labelled length={4} value={value} onValueChange={setValue} />
          <output>{value}</output>
        </>
      )
    }
    render(<Controlled />)
    await userEvent.click(slots()[0]!)
    await userEvent.keyboard('98')
    expect(screen.getByRole('status').textContent).toBe('98')
  })

  it('mask uses password slots; LG shows a dot', () => {
    const { container } = render(<Labelled size="lg" mask defaultValue="1" length={4} />)
    expect(container.querySelectorAll('input[type=password]')).toHaveLength(4)
    expect(container.querySelectorAll('[data-slot=otp-input-dot]')).toHaveLength(4)
  })

  it('invalid marks every slot and shakes once when it turns true', () => {
    const { rerender, container } = render(<Labelled length={4} />)
    const root = container.querySelector('[data-slot=otp-input]') as HTMLElement
    expect(root.hasAttribute('data-shaking')).toBe(false)
    rerender(<Labelled length={4} invalid />)
    expect(slots().every((s) => s.getAttribute('aria-invalid') === 'true')).toBe(true)
    expect(root.hasAttribute('data-shaking')).toBe(true)
  })

  it('disabled disables every slot', () => {
    render(<Labelled disabled />)
    expect(slots().every((s) => s.disabled)).toBe(true)
  })

  it('spreads props on the root and forwards the ref', () => {
    let node: HTMLDivElement | null = null
    render(<Labelled data-testid="otp" ref={(el) => void (node = el)} />)
    expect(screen.getByTestId('otp')).toBe(node)
    fireEvent.focus(slots()[0]!)
  })

  it('has no axe violations', async () => {
    const { container } = render(
      <div>
        <Labelled defaultValue="123" />
        <Field>
          <FieldLabel>PIN</FieldLabel>
          <OtpInput size="lg" length={6} mask autoComplete="off" invalid />
        </Field>
      </div>,
    )
    await expectNoAxeViolations(container)
  })

  it('autoFocus focuses the first slot, and again when a controlled value clears', async () => {
    function Retry() {
      const [value, setValue] = useState('')
      return (
        <>
          <Labelled length={4} autoFocus value={value} onValueChange={setValue} />
          <button type="button" onClick={() => setValue('')}>
            Ulangi
          </button>
        </>
      )
    }
    render(<Retry />)
    expect(document.activeElement).toBe(slots()[0])
    await userEvent.keyboard('12')
    await userEvent.click(screen.getByRole('button', { name: 'Ulangi' }))
    expect(document.activeElement).toBe(slots()[0])
  })
})
