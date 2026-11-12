import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { expectNoAxeViolations } from '@/test/axe'

import { Kbd } from './kbd'

describe('Kbd', () => {
  it('renders a native <kbd> and spreads props', () => {
    render(<Kbd data-testid="k">⌘K</Kbd>)
    const kbd = screen.getByTestId('k')
    expect(kbd.tagName).toBe('KBD')
    expect(kbd.textContent).toBe('⌘K')
    expect(kbd.dataset.slot).toBe('kbd')
  })

  it('marks disabled with data-disabled', () => {
    render(<Kbd disabled>Esc</Kbd>)
    expect(screen.getByText('Esc').hasAttribute('data-disabled')).toBe(true)
  })

  it('forwards the ref and merges className', () => {
    let node: HTMLElement | null = null
    render(
      <Kbd ref={(el) => void (node = el)} className="ms-2">
        /
      </Kbd>,
    )
    expect(node).toBeInstanceOf(HTMLElement)
    expect(screen.getByText('/').className).toContain('ms-2')
  })

  it('has no axe violations', async () => {
    const { container } = render(
      <p>
        Tekan <Kbd>⌘K</Kbd> untuk mencari, <Kbd>Esc</Kbd> untuk menutup.
      </p>,
    )
    await expectNoAxeViolations(container)
  })
})
