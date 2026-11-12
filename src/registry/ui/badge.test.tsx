import { Tick02Icon } from '@hugeicons/core-free-icons'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { expectNoAxeViolations } from '@/test/axe'

import { Badge } from './badge'
import { Icon } from './icon'

describe('Badge', () => {
  it('renders a span with the defaults and spreads props', () => {
    render(<Badge data-testid="b">Aktif</Badge>)
    const badge = screen.getByTestId('b')
    expect(badge.tagName).toBe('SPAN')
    expect(badge.dataset.variant).toBe('default')
    expect(badge.dataset.size).toBe('md')
    expect(badge.textContent).toBe('Aktif')
  })

  it('applies variant, size and shape classes', () => {
    render(
      <Badge variant="success" size="lg" shape="pill">
        Lunas
      </Badge>,
    )
    const badge = screen.getByText('Lunas')
    expect(badge.className).toContain('bg-success-light')
    expect(badge.className).toContain('h-6')
    expect(badge.className).toContain('rounded-pill')
  })

  it('keeps the icon decorative', () => {
    render(
      <Badge variant="brand">
        <Icon icon={Tick02Icon} size={12} />
        Terverifikasi
      </Badge>,
    )
    expect(screen.getByText('Terverifikasi').querySelector('svg')?.getAttribute('aria-hidden')).toBe('true')
  })

  it('forwards the ref and merges className', () => {
    let node: HTMLSpanElement | null = null
    render(
      <Badge ref={(el) => void (node = el)} className="ms-2">
        Ref
      </Badge>,
    )
    expect(node).toBeInstanceOf(HTMLSpanElement)
    expect(screen.getByText('Ref').className).toContain('ms-2')
  })

  it('has no axe violations', async () => {
    const { container } = render(
      <div>
        <Badge>Default</Badge>
        <Badge variant="danger">Gagal</Badge>
        <Badge variant="outline" size="sm">
          Draft
        </Badge>
      </div>,
    )
    await expectNoAxeViolations(container)
  })
})
