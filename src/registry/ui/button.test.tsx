import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { expectNoAxeViolations } from '@/test/axe'

import { Button } from './button'

describe('Button', () => {
  it('is a type="button" by default and spreads props', () => {
    render(<Button data-testid="b">Simpan</Button>)
    const button = screen.getByRole('button', { name: 'Simpan' })
    expect(button).toHaveProperty('type', 'button')
    expect(button.dataset.testid).toBe('b')
    expect(button.dataset.variant).toBe('primary')
  })

  it('calls onClick', async () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Go</Button>)
    await userEvent.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('loading: busy, disabled, keeps the label as its name', async () => {
    const onClick = vi.fn()
    render(
      <Button loading onClick={onClick}>
        Simpan
      </Button>,
    )
    const button = screen.getByRole('button', { name: 'Simpan' })
    expect(button.getAttribute('aria-busy')).toBe('true')
    expect(button).toHaveProperty('disabled', true)
    await userEvent.click(button)
    expect(onClick).not.toHaveBeenCalled()
  })

  it('loadingLabel becomes the accessible name while loading', () => {
    render(
      <Button loading loadingLabel="Memperbarui…">
        Perbarui
      </Button>,
    )
    expect(screen.getByRole('button', { name: 'Memperbarui…' })).toBeTruthy()
  })

  it('renders a link with render and marks it aria-disabled when disabled', () => {
    render(
      <Button render={<a href="/x" />} disabled>
        Masuk
      </Button>,
    )
    const link = screen.getByRole('link', { name: 'Masuk' })
    expect(link.getAttribute('aria-disabled')).toBe('true')
    expect(link.getAttribute('type')).toBeNull()
  })

  it('forwards the ref', () => {
    let node: HTMLButtonElement | null = null
    render(<Button ref={(el) => void (node = el)}>Ref</Button>)
    expect(node).toBeInstanceOf(HTMLButtonElement)
  })

  it('merges className last', () => {
    render(<Button className="w-full">Wide</Button>)
    expect(screen.getByRole('button').className).toContain('w-full')
  })

  it('has no axe violations', async () => {
    const { container } = render(
      <div>
        <Button>Primary</Button>
        <Button variant="secondary" disabled>
          Disabled
        </Button>
        <Button size="icon-md" aria-label="Tambah">
          +
        </Button>
      </div>,
    )
    await expectNoAxeViolations(container)
  })
})
