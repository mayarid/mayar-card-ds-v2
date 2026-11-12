import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { expectNoAxeViolations } from '@/test/axe'

import { getPlanLabel, PlanBadge, PlanBadgeChip } from './plan-badge'

describe('PlanBadge', () => {
  it('shows the tier and the quota line', () => {
    render(<PlanBadge tier="starter" max={2} data-testid="b" />)
    const badge = screen.getByTestId('b')
    expect(badge.dataset.tier).toBe('starter')
    expect(badge.textContent).toBe('Paket Starter2 kartu')
  })

  it('reads unlimited, usage and suspended quotas', () => {
    const { rerender } = render(<PlanBadge tier="enterprise" max={null} data-testid="b" />)
    expect(screen.getByText('Kartu tanpa batas')).toBeTruthy()
    rerender(<PlanBadge tier="business" max={10} used={7} data-testid="b" />)
    expect(screen.getByText('7 terpakai · 3 tersedia')).toBeTruthy()
    rerender(<PlanBadge tier="business" max={0} suspended data-testid="b" />)
    expect(screen.getByText('Paket berakhir')).toBeTruthy()
    expect(screen.getByTestId('b').hasAttribute('data-suspended')).toBe(true)
  })

  it('shows only the tier without a quota', () => {
    render(<PlanBadge tier="free" data-testid="b" />)
    expect(screen.getByTestId('b').textContent).toBe('Paket Free')
  })

  it('rail keeps the text for assistive tech and as a title', () => {
    render(<PlanBadge tier="starter" max={2} layout="rail" data-testid="b" />)
    const badge = screen.getByTestId('b')
    expect(badge.getAttribute('title')).toBe('Paket Starter · 2 kartu')
    expect(badge.querySelector('.sr-only')?.textContent).toBe('Paket Starter · 2 kartu')
  })

  it('renders a link with render', () => {
    render(<PlanBadge tier="starter" max={2} render={<a href="/settings" />} />)
    expect(screen.getByRole('link').getAttribute('href')).toBe('/settings')
  })

  it('chip: brand for every tier (the app), warning when suspended', () => {
    const { rerender } = render(<PlanBadgeChip tier="business" data-testid="c" />)
    expect(screen.getByTestId('c').dataset.variant).toBe('brand')
    expect(screen.getByTestId('c').textContent).toBe('Paket Business')
    rerender(<PlanBadgeChip tier="free" data-testid="c" />)
    expect(screen.getByTestId('c').dataset.variant).toBe('brand')
    expect(screen.getByTestId('c').dataset.size).toBe('md')
    rerender(<PlanBadgeChip tier="starter" suspended prefix={false} data-testid="c" />)
    expect(screen.getByTestId('c').dataset.variant).toBe('warning')
    expect(screen.getByTestId('c').textContent).toBe('Starter berakhir')
  })

  it('the disc is a 28px primary IconDisc', () => {
    render(<PlanBadge tier="starter" data-testid="b" />)
    const disc = screen.getByTestId('b').querySelector('[data-slot="plan-badge-icon"]')
    expect(disc?.getAttribute('data-size')).toBe('28')
    expect(disc?.getAttribute('data-tone')).toBe('primary')
  })

  it('getPlanLabel', () => {
    expect(getPlanLabel('enterprise')).toBe('Paket Enterprise')
    expect(getPlanLabel('enterprise', { prefix: false })).toBe('Enterprise')
  })

  it('has no axe violations', async () => {
    const { container } = render(
      <div>
        <PlanBadge tier="starter" max={2} />
        <PlanBadge tier="business" max={0} suspended render={<a href="/settings" />} />
        <PlanBadge tier="enterprise" max={null} layout="rail" />
        <PlanBadgeChip tier="starter" />
      </div>,
    )
    await expectNoAxeViolations(container)
  })
})
