import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { Field, FieldLabel } from '@/components/ui/field'
import { expectNoAxeViolations } from '@/test/axe'

import { Textarea } from './textarea'

describe('Textarea', () => {
  it('renders a textarea with 3 rows and spreads props', () => {
    render(<Textarea aria-label="Catatan" data-testid="t" maxLength={200} />)
    const textarea = screen.getByRole('textbox', { name: 'Catatan' })
    expect(textarea.tagName).toBe('TEXTAREA')
    expect(textarea.getAttribute('rows')).toBe('3')
    expect(textarea.getAttribute('maxlength')).toBe('200')
    expect(textarea.dataset.testid).toBe('t')
    expect(textarea.dataset.variant).toBe('default')
  })

  it('works uncontrolled and controlled', async () => {
    function Controlled() {
      const [value, setValue] = useState('')
      return <Textarea aria-label="B" value={value} onValueChange={(v) => setValue(v.slice(0, 3))} />
    }
    render(
      <>
        <Textarea aria-label="A" defaultValue="Hai" />
        <Controlled />
      </>,
    )
    const a = screen.getByRole('textbox', { name: 'A' }) as HTMLTextAreaElement
    await userEvent.type(a, '!')
    expect(a.value).toBe('Hai!')
    const b = screen.getByRole('textbox', { name: 'B' }) as HTMLTextAreaElement
    await userEvent.type(b, 'abcdef')
    expect(b.value).toBe('abc')
  })

  it('Enter adds a line; ⌘/Ctrl+Enter submits the form', async () => {
    const onSubmit = vi.fn((e: React.FormEvent) => e.preventDefault())
    render(
      <form onSubmit={onSubmit}>
        <Textarea aria-label="Catatan" />
      </form>,
    )
    const textarea = screen.getByRole('textbox') as HTMLTextAreaElement
    await userEvent.type(textarea, 'a{Enter}b')
    expect(textarea.value).toBe('a\nb')
    expect(onSubmit).not.toHaveBeenCalled()
    await userEvent.type(textarea, '{Control>}{Enter}{/Control}')
    expect(onSubmit).toHaveBeenCalledOnce()
  })

  it('invalid and disabled', () => {
    render(
      <>
        <Textarea aria-label="A" invalid />
        <Textarea aria-label="B" disabled />
      </>,
    )
    expect(screen.getByRole('textbox', { name: 'A' }).getAttribute('aria-invalid')).toBe('true')
    expect((screen.getByRole('textbox', { name: 'B' }) as HTMLTextAreaElement).disabled).toBe(true)
  })

  it('takes its label and invalid state from Field', () => {
    render(
      <Field invalid>
        <FieldLabel>Alasan</FieldLabel>
        <Textarea />
      </Field>,
    )
    expect(screen.getByRole('textbox', { name: 'Alasan' }).getAttribute('aria-invalid')).toBe('true')
  })

  it('forwards the ref', () => {
    let node: HTMLTextAreaElement | null = null
    render(<Textarea aria-label="R" ref={(el) => void (node = el)} />)
    expect(node).toBeInstanceOf(HTMLTextAreaElement)
  })

  it('has no axe violations', async () => {
    const { container } = render(
      <div>
        <Textarea aria-label="Catatan" placeholder="Tulis catatan" />
        <Textarea aria-label="Alasan" variant="ghost" invalid />
      </div>,
    )
    await expectNoAxeViolations(container)
  })
})
