import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { expectNoAxeViolations } from '@/test/axe'

import {
  getPlanQuota,
  PlanQuota,
  PlanQuotaAction,
  PlanQuotaBar,
  PlanQuotaBody,
  PlanQuotaDescription,
  PlanQuotaLegend,
  PlanQuotaTier,
} from './plan-quota'

function Quota(props: { max: number | null; used?: number | null; suspended?: boolean; link?: boolean }) {
  const { link, ...input } = props
  return (
    <PlanQuota data-testid="q" {...input} render={link ? <a href="/settings" /> : undefined}>
      <PlanQuotaTier>Paket Starter</PlanQuotaTier>
      <PlanQuotaBody>
        <PlanQuotaDescription />
        <PlanQuotaBar />
        <PlanQuotaLegend data-testid="legend" />
      </PlanQuotaBody>
    </PlanQuota>
  )
}

describe('getPlanQuota', () => {
  it('works out each status', () => {
    expect(getPlanQuota({ max: 10, used: 4 })).toEqual({
      status: 'ok',
      percent: 40,
      used: 4,
      available: 6,
      legend: '4 terpakai · 6 tersedia',
    })
    expect(getPlanQuota({ max: 10, used: 7 }).status).toBe('ok')
    expect(getPlanQuota({ max: 10, used: 8 }).status).toBe('near')
    expect(getPlanQuota({ max: 10, used: 10 }).status).toBe('at')
    expect(getPlanQuota({ max: 10, used: 12 })).toMatchObject({
      status: 'over',
      percent: 120,
      legend: '12 terpakai · 2 di atas kuota',
    })
    expect(getPlanQuota({ max: null, used: 3 }).status).toBe('unlimited')
    expect(getPlanQuota({ max: 10 })).toMatchObject({ status: 'unknown', percent: null, legend: '10 kartu' })
    expect(getPlanQuota({ max: 0, used: 3, suspended: true })).toMatchObject({
      status: 'suspended',
      percent: null,
      legend: 'Paket berakhir',
    })
  })
})

describe('PlanQuota', () => {
  it('prints the legend and shows the bar when it can measure', () => {
    const { container } = render(<Quota max={10} used={7} />)
    expect(screen.getByTestId('legend').textContent).toBe('7terpakai3tersedia')
    expect(screen.getByTestId('q').dataset.status).toBe('ok')
    expect(screen.getByText('Kuota kartu aktif paket Anda.')).toBeTruthy()
    expect(container.querySelector('[data-slot="plan-quota-bar"]')).not.toBeNull()
  })

  it('hides the bar when unlimited or suspended', () => {
    const { container, rerender } = render(<Quota max={null} used={2} />)
    expect(container.querySelector('[data-slot="plan-quota-bar"]')).toBeNull()
    rerender(<Quota max={0} used={2} suspended />)
    expect(container.querySelector('[data-slot="plan-quota-bar"]')).toBeNull()
    expect(screen.getByTestId('legend').dataset.status).toBe('suspended')
  })

  it('renders as a link with render', () => {
    render(<Quota max={10} used={2} link />)
    expect(screen.getByRole('link').getAttribute('href')).toBe('/settings')
  })

  it('near and full change the description and the tone', () => {
    const { rerender } = render(<Quota max={10} used={8} />)
    expect(screen.getByTestId('q').dataset.status).toBe('near')
    expect(screen.getByText('Kuota kartu hampir penuh.')).toBeTruthy()
    rerender(<Quota max={10} used={10} />)
    expect(screen.getByTestId('q').dataset.status).toBe('at')
    expect(screen.getByText('Kuota kartu penuh. Upgrade paket untuk menambah kartu.')).toBeTruthy()
    rerender(<Quota max={10} used={12} />)
    expect(screen.getByTestId('legend').textContent).toBe('12terpakai2di atas kuota')
  })

  it('action is an "Upgrade paket" button by default and can be a link', () => {
    const { rerender } = render(<PlanQuotaAction />)
    expect(screen.getByRole('button', { name: 'Upgrade paket' })).toHaveProperty('type', 'button')
    rerender(<PlanQuotaAction render={<a href="mailto:halo@mayar.id" />} />)
    expect(screen.getByRole('link', { name: 'Upgrade paket' })).toBeTruthy()
  })

  it('has no axe violations', async () => {
    const { container } = render(
      <div>
        <Quota max={10} used={7} link />
        <Quota max={10} used={12} />
        <PlanQuota max={10} used={10}>
          <PlanQuotaBody>
            <PlanQuotaLegend />
            <PlanQuotaAction />
          </PlanQuotaBody>
        </PlanQuota>
      </div>,
    )
    await expectNoAxeViolations(container)
  })
})
