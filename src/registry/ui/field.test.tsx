import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { Input, InputPrefix } from '@/components/ui/input'
import { expectNoAxeViolations } from '@/test/axe'

import { Field, FieldDescription, FieldError, FieldHeader, FieldLabel, FieldPair, FieldPairLegend } from './field'

describe('Field', () => {
  it('labels the control and links the description', async () => {
    render(
      <Field>
        <FieldLabel>Nama kartu</FieldLabel>
        <Input />
        <FieldDescription>Tampil di kartu fisik.</FieldDescription>
      </Field>,
    )
    const input = screen.getByRole('textbox', { name: 'Nama kartu' })
    const description = screen.getByText('Tampil di kartu fisik.')
    expect(input.getAttribute('aria-describedby')).toContain(description.id)
    await userEvent.click(screen.getByText('Nama kartu'))
    expect(document.activeElement).toBe(input)
  })

  it('required shows a hidden "*"; optional shows "(opsional)"', () => {
    render(
      <>
        <Field>
          <FieldLabel required>Email</FieldLabel>
          <Input required />
        </Field>
        <Field>
          <FieldLabel optional>Catatan</FieldLabel>
          <Input />
        </Field>
      </>,
    )
    expect(screen.getByText('*').getAttribute('aria-hidden')).toBe('true')
    expect(screen.getByRole('textbox', { name: 'Email' })).toBeTruthy()
    expect(screen.getByText('(opsional)')).toBeTruthy()
  })

  it('error shows as an alert, marks the control invalid and is linked', () => {
    render(
      <Field invalid>
        <FieldLabel>Email</FieldLabel>
        <Input />
        <FieldDescription>Bantuan</FieldDescription>
        <FieldError>Email tidak valid.</FieldError>
      </Field>,
    )
    const input = screen.getByRole('textbox', { name: 'Email' })
    const alert = screen.getByRole('alert')
    expect(alert.textContent).toContain('Email tidak valid.')
    expect(input.getAttribute('aria-invalid')).toBe('true')
    expect(input.getAttribute('aria-describedby')).toContain(alert.id)
  })

  it('FieldError with a validity match stays hidden until that check fails', () => {
    render(
      <Field>
        <FieldLabel>Nama</FieldLabel>
        <Input required />
        <FieldError match="valueMissing">Nama wajib diisi.</FieldError>
      </Field>,
    )
    expect(screen.queryByRole('alert')).toBeNull()
  })

  it('disabled reaches the control', () => {
    render(
      <Field disabled>
        <FieldLabel>Nominal</FieldLabel>
        <Input leading={<InputPrefix>Rp</InputPrefix>} />
      </Field>,
    )
    expect((screen.getByRole('textbox', { name: 'Nominal' }) as HTMLInputElement).disabled).toBe(true)
  })

  it('FieldPair is a named group with two labelled fields', () => {
    render(
      <FieldPair>
        <FieldPairLegend>Masa berlaku</FieldPairLegend>
        <Field>
          <FieldLabel>Bulan</FieldLabel>
          <Input />
        </Field>
        <Field>
          <FieldLabel>Tahun</FieldLabel>
          <Input />
        </Field>
      </FieldPair>,
    )
    expect(screen.getByRole('group', { name: 'Masa berlaku' })).toBeTruthy()
    expect(screen.getByRole('textbox', { name: 'Bulan' })).toBeTruthy()
    expect(screen.getByRole('textbox', { name: 'Tahun' })).toBeTruthy()
  })

  it('spreads props and merges className on the root', () => {
    render(<Field data-testid="f" className="max-w-80" />)
    const root = screen.getByTestId('f')
    expect(root.dataset.slot).toBe('field')
    expect(root.className).toContain('max-w-80')
  })

  it('has no axe violations', async () => {
    const { container } = render(
      <form>
        <Field>
          <FieldHeader>
            <FieldLabel required>NIK</FieldLabel>
            <span>16/16</span>
          </FieldHeader>
          <Input required />
        </Field>
        <Field invalid>
          <FieldLabel>Email</FieldLabel>
          <Input />
          <FieldError>Email tidak valid.</FieldError>
        </Field>
        <FieldPair>
          <FieldPairLegend className="sr-only">Masa berlaku</FieldPairLegend>
          <Field>
            <FieldLabel>Bulan</FieldLabel>
            <Input />
          </Field>
          <Field>
            <FieldLabel>Tahun</FieldLabel>
            <Input />
          </Field>
        </FieldPair>
      </form>,
    )
    await expectNoAxeViolations(container)
  })
})
