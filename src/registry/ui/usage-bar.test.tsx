import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { expectNoAxeViolations } from '@/test/axe'

import { getUsageTone, UsageBar, UsageBarLabel, UsageBarTrack, UsageBarValue } from './usage-bar'

describe('getUsageTone', () => {
  it.each([
    [null, 'none'],
    [0, 'p1'],
    [49, 'p1'],
    [50, 'p2'],
    [75, 'p3'],
    [90, 'p4'],
    [100, 'over'],
    [140, 'over'],
  ] as const)('%s → %s', (pct, tone) => {
    expect(getUsageTone(pct)).toBe(tone)
  })
})

describe('UsageBar', () => {
  it('is decorative with no label and no children', () => {
    const { container } = render(<UsageBar value={30} />)
    const root = container.querySelector('[data-slot="usage-bar"]') as HTMLElement
    expect(root.getAttribute('aria-hidden')).toBe('true')
    expect(root.dataset.tone).toBe('p1')
  })

  it('is a meter with an aria-label', () => {
    render(<UsageBar value={720} max={1000} aria-label="Limit bulanan" />)
    const meter = screen.getByRole('meter', { name: 'Limit bulanan' })
    expect(meter.getAttribute('aria-valuenow')).toBe('720')
    expect(meter.getAttribute('aria-valuemax')).toBe('1000')
    expect(meter.dataset.tone).toBe('p2')
  })

  it('composes label and value; the label names the meter', () => {
    render(
      <UsageBar value={92}>
        <UsageBarLabel>Kuota kartu</UsageBarLabel>
        <UsageBarValue />
        <UsageBarTrack />
      </UsageBar>,
    )
    const meter = screen.getByRole('meter', { name: 'Kuota kartu' })
    expect(meter.dataset.tone).toBe('p4')
    expect(meter.textContent).toContain('92%')
  })

  it('clamps the fill and turns red at 100%+', () => {
    const { container } = render(<UsageBar value={150} aria-label="Anggaran" />)
    const fill = container.querySelector('[data-slot="usage-bar-fill"]') as HTMLElement
    expect(fill.style.width).toBe('100%')
    expect(fill.className).toContain('bg-danger')
  })

  it('color wins over the tone; height and track change the track', () => {
    const { container } = render(
      <UsageBar value={40} color="var(--color-chart-3)" height={8} track="well" aria-label="Belanja" />,
    )
    const fill = container.querySelector('[data-slot="usage-bar-fill"]') as HTMLElement
    const track = container.querySelector('[data-slot="usage-bar-track"]') as HTMLElement
    expect(fill.style.background).toContain('var(--color-chart-3)')
    expect(track.className).toContain('h-2')
    expect(track.className).toContain('bg-well')
  })

  it('has no fill when there is nothing to measure', () => {
    const { container } = render(<UsageBar value={Number.NaN} max={0} aria-label="Kosong" />)
    expect(container.querySelector('[data-slot="usage-bar-fill"]')).toBeNull()
  })

  it('has no axe violations', async () => {
    const { container } = render(
      <div>
        <UsageBar value={30} />
        <UsageBar value={720} max={1000}>
          <UsageBarLabel>Limit bulanan</UsageBarLabel>
          <UsageBarValue />
          <UsageBarTrack />
        </UsageBar>
      </div>,
    )
    await expectNoAxeViolations(container)
  })
})
