import { Search01Icon } from '@hugeicons/core-free-icons'
import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field'
import { Icon } from '@/components/ui/icon'
import { Kbd } from '@/components/ui/kbd'
import { expectNoAxeViolations } from '@/test/axe'

import { Input, InputPrefix } from './input'

describe('Input', () => {
  it('renders a textbox, spreads native props on the <input> and className on the box', () => {
    render(<Input aria-label="Nama" placeholder="Nama kartu" data-testid="i" className="w-64" />)
    const input = screen.getByRole('textbox', { name: 'Nama' })
    expect(input.dataset.testid).toBe('i')
    expect(input.getAttribute('placeholder')).toBe('Nama kartu')
    expect(input.getAttribute('autocomplete')).toBe('off')
    const box = input.closest('[data-slot=input-box]') as HTMLElement
    expect(box.className).toContain('w-64')
    expect(box.dataset.size).toBe('lg')
    expect(box.dataset.variant).toBe('default')
  })

  it('works uncontrolled', async () => {
    render(<Input aria-label="Nama" defaultValue="Ali" />)
    const input = screen.getByRole('textbox') as HTMLInputElement
    await userEvent.type(input, 'f')
    expect(input.value).toBe('Alif')
  })

  it('works controlled with onValueChange', async () => {
    const onValueChange = vi.fn()
    function Controlled() {
      const [value, setValue] = useState('')
      return (
        <Input
          aria-label="Nama"
          value={value}
          onValueChange={(v) => {
            onValueChange(v)
            setValue(v.toUpperCase())
          }}
        />
      )
    }
    render(<Controlled />)
    await userEvent.type(screen.getByRole('textbox'), 'ab')
    expect((screen.getByRole('textbox') as HTMLInputElement).value).toBe('AB')
    expect(onValueChange).toHaveBeenLastCalledWith('Ab')
  })

  it('invalid sets aria-invalid', () => {
    render(<Input aria-label="Email" invalid />)
    expect(screen.getByRole('textbox').getAttribute('aria-invalid')).toBe('true')
  })

  it('shakes once when it turns invalid, not on mount', () => {
    const { rerender } = render(<Input aria-label="Email" invalid />)
    const box = () => screen.getByRole('textbox').closest('[data-slot=input-box]') as HTMLElement
    expect(box().hasAttribute('data-shaking')).toBe(false)
    rerender(<Input aria-label="Email" />)
    rerender(<Input aria-label="Email" invalid />)
    expect(box().hasAttribute('data-shaking')).toBe(true)
  })

  it('disabled blocks typing', async () => {
    render(<Input aria-label="Nama" disabled defaultValue="x" />)
    const input = screen.getByRole('textbox') as HTMLInputElement
    expect(input.disabled).toBe(true)
    await userEvent.type(input, 'y')
    expect(input.value).toBe('x')
  })

  it('leading content is hidden from assistive tech; a click on the box focuses the input', async () => {
    render(<Input aria-label="Cari" leading={<Icon icon={Search01Icon} />} trailing={<Kbd aria-hidden>⌘K</Kbd>} />)
    const leading = document.querySelector('[data-slot=input-leading]') as HTMLElement
    expect(leading.getAttribute('aria-hidden')).toBe('true')
    await userEvent.click(screen.getByText('⌘K'))
    expect(document.activeElement).toBe(screen.getByRole('textbox'))
  })

  it('clear button shows with text, empties the value, calls onClear and refocuses', async () => {
    const onClear = vi.fn()
    render(<Input aria-label="Cari" type="search" onClear={onClear} />)
    expect(screen.queryByRole('button', { name: 'Hapus teks' })).toBeNull()
    const input = screen.getByRole('searchbox') as HTMLInputElement
    await userEvent.type(input, 'kartu')
    await userEvent.click(screen.getByRole('button', { name: 'Hapus teks' }))
    expect(input.value).toBe('')
    expect(onClear).toHaveBeenCalledOnce()
    expect(document.activeElement).toBe(input)
    expect(screen.queryByRole('button', { name: 'Hapus teks' })).toBeNull()
  })

  it('clear works when controlled', async () => {
    function Controlled() {
      const [value, setValue] = useState('saldo')
      return <Input aria-label="Cari" value={value} onValueChange={setValue} onClear={() => {}} />
    }
    render(<Controlled />)
    await userEvent.click(screen.getByRole('button', { name: 'Hapus teks' }))
    expect((screen.getByRole('textbox') as HTMLInputElement).value).toBe('')
  })

  it('takes its label, description, error and invalid state from Field', () => {
    render(
      <Field invalid>
        <FieldLabel>Email</FieldLabel>
        <Input />
        <FieldDescription>Kami kirim struk ke sini.</FieldDescription>
        <FieldError>Email tidak valid.</FieldError>
      </Field>,
    )
    const input = screen.getByRole('textbox', { name: 'Email' })
    expect(input.getAttribute('aria-invalid')).toBe('true')
    const describedBy = input.getAttribute('aria-describedby') ?? ''
    expect(describedBy).toContain(screen.getByRole('alert').id)
  })

  it('forwards the ref to the native input', () => {
    let node: HTMLInputElement | null = null
    render(<Input aria-label="Ref" ref={(el) => void (node = el)} />)
    expect(node).toBeInstanceOf(HTMLInputElement)
  })

  it('has no axe violations', async () => {
    const { container } = render(
      <div>
        <Input aria-label="Cari" leading={<Icon icon={Search01Icon} />} trailing={<Kbd aria-hidden>/</Kbd>} />
        <Input aria-label="Nominal" leading={<InputPrefix>Rp</InputPrefix>} defaultValue="150.000" />
        <Input aria-label="Email" invalid variant="ghost" size="sm" />
        <Input aria-label="Nama" disabled variant="inline" />
      </div>,
    )
    await act(async () => {
      await expectNoAxeViolations(container)
    })
  })
})
