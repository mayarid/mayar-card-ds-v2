import { Field } from '@base-ui/react/field'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { expectNoAxeViolations } from '@/test/axe'

import { Checkbox } from './checkbox'

describe('Checkbox', () => {
  it('is a checkbox named by its label and toggles from a click on the label', async () => {
    const onCheckedChange = vi.fn()
    render(<Checkbox onCheckedChange={onCheckedChange}>Kirim struk</Checkbox>)
    const box = screen.getByRole('checkbox', { name: 'Kirim struk' })
    expect(box.getAttribute('aria-checked')).toBe('false')
    await userEvent.click(screen.getByText('Kirim struk'))
    expect(box.getAttribute('aria-checked')).toBe('true')
    expect(onCheckedChange).toHaveBeenCalledTimes(1)
    expect(onCheckedChange.mock.calls[0]?.[0]).toBe(true)
  })

  it('toggles with Space', async () => {
    render(<Checkbox aria-label="Setuju" />)
    const box = screen.getByRole('checkbox', { name: 'Setuju' })
    box.focus()
    await userEvent.keyboard(' ')
    expect(box.getAttribute('aria-checked')).toBe('true')
  })

  it('works controlled', async () => {
    function Controlled() {
      const [checked, setChecked] = useState(true)
      return (
        <>
          <Checkbox checked={checked} onCheckedChange={setChecked}>
            Aktif
          </Checkbox>
          <output>{String(checked)}</output>
        </>
      )
    }
    render(<Controlled />)
    await userEvent.click(screen.getByRole('checkbox'))
    expect(screen.getByRole('status').textContent).toBe('false')
  })

  it('indeterminate reads as mixed', () => {
    render(<Checkbox indeterminate aria-label="Semua" />)
    expect(screen.getByRole('checkbox').getAttribute('aria-checked')).toBe('mixed')
  })

  it('disabled does not toggle and marks the row', async () => {
    render(
      <Checkbox disabled description="Butuh verifikasi">
        Kartu fisik
      </Checkbox>,
    )
    const box = screen.getByRole('checkbox')
    await userEvent.click(screen.getByText('Kartu fisik'))
    expect(box.getAttribute('aria-checked')).toBe('false')
    expect(box.getAttribute('aria-disabled')).toBe('true')
    expect(box.closest('label')?.hasAttribute('data-disabled')).toBe(true)
  })

  it('tile variant, className on the row, ref on the control', () => {
    let node: HTMLElement | null = null
    render(
      <Checkbox variant="tile" className="w-full" ref={(el) => void (node = el)} defaultChecked>
        KTP
      </Checkbox>,
    )
    const label = screen.getByText('KTP').closest('label')
    expect(label?.dataset.variant).toBe('tile')
    expect(label?.className).toContain('w-full')
    expect(node).toBe(screen.getByRole('checkbox'))
  })

  it('submits its value in a form', () => {
    render(
      <form data-testid="f">
        <Checkbox name="terms" value="ya" defaultChecked>
          Syarat
        </Checkbox>
      </form>,
    )
    const data = new FormData(screen.getByTestId('f') as HTMLFormElement)
    expect(data.get('terms')).toBe('ya')
  })

  it('takes its name from Field.Label inside Field.Root', () => {
    render(
      <Field.Root>
        <Field.Label>
          <Checkbox />
          Ingat saya
        </Field.Label>
      </Field.Root>,
    )
    expect(screen.getByRole('checkbox', { name: 'Ingat saya' })).toBeTruthy()
  })

  it('has no axe violations', async () => {
    const { container } = render(
      <div>
        <Checkbox defaultChecked>Kirim struk</Checkbox>
        <Checkbox indeterminate aria-label="Pilih semua" />
        <Checkbox disabled description="Tidak tersedia">
          Kartu fisik
        </Checkbox>
        <Checkbox variant="tile">Selfie dengan KTP</Checkbox>
      </div>,
    )
    await expectNoAxeViolations(container)
  })
})
