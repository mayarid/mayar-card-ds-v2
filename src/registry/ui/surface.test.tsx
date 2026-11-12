import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { expectNoAxeViolations } from '@/test/axe'

import { resolveSurfaceRadius, Surface } from './surface'

describe('Surface', () => {
  it('defaults to a white container, radius 2xl, 16px padding', () => {
    render(<Surface data-testid="s">Isi</Surface>)
    const s = screen.getByTestId('s')
    expect(s.dataset.variant).toBe('container')
    expect(s.className).toContain('bg-surface')
    expect(s.className).toContain('rounded-2xl')
    expect(s.style.getPropertyValue('--surface-padding')).toBe('16px')
  })

  it('divided defaults to no padding', () => {
    render(
      <Surface divided data-testid="s">
        <div>A</div>
        <div>B</div>
      </Surface>,
    )
    const s = screen.getByTestId('s')
    expect(s.style.getPropertyValue('--surface-padding')).toBe('0px')
    expect(s.hasAttribute('data-divided')).toBe(true)
  })

  it('elevated adds the control shadow', () => {
    render(<Surface elevated data-testid="s" />)
    expect(screen.getByTestId('s').className).toContain('shadow-control')
  })

  it('nested: inner radius = outer radius − padding, and marks the related ring', () => {
    render(
      <Surface variant="card" radius="3xl" padding={4} data-testid="parent">
        <Surface elevated padding={12} nested={{ outerRadius: '3xl', padding: 4, ring: 'subtle' }} data-testid="inner">
          3 dari 10 kartu
        </Surface>
      </Surface>,
    )
    const inner = screen.getByTestId('inner')
    expect(inner.style.borderRadius).toBe('12px')
    expect(inner.dataset.relatedRing).toBe('subtle')
  })

  it('resolveSurfaceRadius keeps its own radius above 24px padding', () => {
    expect(resolveSurfaceRadius('2xl', { outerRadius: '3xl', padding: 4 })).toBe(12)
    expect(resolveSurfaceRadius('2xl', { outerRadius: '3xl', padding: 32 })).toBe(12)
    expect(resolveSurfaceRadius('lg', { outerRadius: 'lg', padding: 12 })).toBe(0)
  })

  it('has no axe violations', async () => {
    const { container } = render(<Surface elevated>Saldo</Surface>)
    await expectNoAxeViolations(container)
  })
})
