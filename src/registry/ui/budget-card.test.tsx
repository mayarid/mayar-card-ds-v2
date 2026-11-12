import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { expectNoAxeViolations } from '@/test/axe'

import {
  BudgetCard,
  BudgetCardFooter,
  BudgetCardHeader,
  BudgetCardItem,
  BudgetCardList,
  BudgetCardPeriod,
  BudgetCardSkeleton,
  BudgetCardTitle,
  BudgetCardTotal,
  getBudgetStatus,
} from './budget-card'

function Card({ hidden = false }: { hidden?: boolean }) {
  return (
    <BudgetCard hidden={hidden} data-testid="card">
      <BudgetCardHeader>
        <div>
          <BudgetCardTitle>Anggaran November</BudgetCardTitle>
          <BudgetCardPeriod>Sisa 18 hari</BudgetCardPeriod>
        </div>
      </BudgetCardHeader>
      <BudgetCardList>
        <BudgetCardItem category="Pemasaran" spent={6_300_000} amount={6_000_000} />
        <BudgetCardItem category="Operasional" spent={1_200_000} amount={4_000_000} index={1} />
      </BudgetCardList>
      <BudgetCardFooter>
        <span>Total sisa</span>
        <BudgetCardTotal remaining={2_500_000} total={10_000_000} />
      </BudgetCardFooter>
    </BudgetCard>
  )
}

describe('BudgetCard', () => {
  it('derives the status from spent and amount', () => {
    expect(getBudgetStatus(10, null)).toBe('none')
    expect(getBudgetStatus(10, 0)).toBe('none')
    expect(getBudgetStatus(50, 100)).toBe('under')
    expect(getBudgetStatus(85, 100)).toBe('near')
    expect(getBudgetStatus(100, 100)).toBe('at')
    expect(getBudgetStatus(101, 100)).toBe('over')
  })

  it('is a region named by its title', () => {
    render(<Card />)
    expect(screen.getByRole('region', { name: 'Anggaran November' })).toBeTruthy()
    expect(screen.getByRole('list').children).toHaveLength(2)
  })

  it('over: "Lebih" with the overage, spoken status, data-status', () => {
    render(<Card />)
    const items = screen.getAllByRole('listitem')
    expect(items[0]?.dataset.status).toBe('over')
    expect(items[0]?.textContent).toContain('Terlampaui')
    expect(items[0]?.textContent).toContain('Lebih Rp 300.000')
    expect(items[0]?.textContent).toContain('105%')
    expect(items[1]?.dataset.status).toBe('under')
    expect(items[1]?.textContent).toContain('Sisa Rp 2.800.000')
  })

  it('hidden masks money but keeps percents', () => {
    render(<Card hidden />)
    expect(screen.queryByText(/Rp 300\.000/)).toBeNull()
    expect(screen.getByText('105%')).toBeTruthy()
  })

  it('a negative total reads with a true minus', () => {
    render(
      <BudgetCard>
        <BudgetCardTitle>Anggaran</BudgetCardTitle>
        <BudgetCardFooter>
          <span>Total sisa</span>
          <BudgetCardTotal remaining={-500_000} total={1_000_000} />
        </BudgetCardFooter>
      </BudgetCard>,
    )
    expect(screen.getByText('−Rp 500.000')).toBeTruthy()
  })

  it('skeleton is a busy status with a label', () => {
    render(<BudgetCardSkeleton rows={3} />)
    const status = screen.getByRole('status')
    expect(status.getAttribute('aria-busy')).toBe('true')
    expect(status.textContent).toContain('Memuat anggaran')
  })

  it('has no axe violations', async () => {
    const { container } = render(
      <div>
        <Card />
        <BudgetCard>
          <BudgetCardHeader>
            <BudgetCardTitle>Memuat</BudgetCardTitle>
          </BudgetCardHeader>
          <BudgetCardSkeleton />
        </BudgetCard>
      </div>,
    )
    await expectNoAxeViolations(container)
  })
})
