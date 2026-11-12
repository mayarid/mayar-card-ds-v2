import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { expectNoAxeViolations } from '@/test/axe'

import {
  TransactionAmount,
  TransactionGroup,
  TransactionList,
  TransactionListSkeleton,
  TransactionRow,
  TransactionRowContent,
  TransactionRowEnd,
  TransactionRowIcon,
  TransactionRowMeta,
  TransactionRowTime,
  TransactionRowStatus,
  TransactionRowTitle,
  TransactionStatusBadge,
  categoryStyle,
  categoryToken,
  formatTransactionAmount,
  formatTransactionDay,
  formatTransactionTime,
  groupTransactionsByDay,
  transactionIconStyle,
  type TransactionStatus,
} from './transaction-list'

function List({ onOpen = () => {}, selected = false, status = 'PENDING' as TransactionStatus }) {
  return (
    <TransactionList>
      <TransactionGroup label="Hari ini · Kamis, 12 Nov" summary="Keluar Rp 1.250.000">
        <TransactionRow aria-label="Lihat detail: Tokopedia" onClick={onOpen} selected={selected}>
          <TransactionRowIcon icon={categoryStyle('Operasional').icon} />
          <TransactionRowContent>
            <TransactionRowTitle>Tokopedia</TransactionRowTitle>
            <TransactionRowMeta>
              <span>Operasional</span>
              <TransactionRowTime dateTime="2026-11-12T01:15:00Z" timeZone="Asia/Jakarta" />
            </TransactionRowMeta>
          </TransactionRowContent>
          <TransactionRowEnd>
            <TransactionAmount amount={1250000} direction="DEBIT" />
            <TransactionRowStatus status={status} />
          </TransactionRowEnd>
        </TransactionRow>
      </TransactionGroup>
    </TransactionList>
  )
}

describe('TransactionList data', () => {
  it('formats amounts with a sign and time with a colon', () => {
    expect(formatTransactionAmount(1250000, 'DEBIT')).toBe('− Rp 1.250.000')
    expect(formatTransactionAmount(5000, 'CREDIT', 'USD')).toBe('+ USD 5.000')
    expect(formatTransactionTime('2026-11-12T01:15:00Z', 'Asia/Jakarta')).toBe('08:15')
    expect(formatTransactionTime('nope')).toBe('nope')
  })

  it('labels today and yesterday', () => {
    const now = new Date(2026, 10, 12, 10)
    expect(formatTransactionDay(new Date(2026, 10, 12, 8).toISOString(), now)).toMatch(/^Hari ini · /)
    expect(formatTransactionDay(new Date(2026, 10, 11, 8).toISOString(), now)).toMatch(/^Kemarin · /)
    expect(formatTransactionDay(new Date(2025, 0, 2).toISOString(), now)).toContain('2025')
  })

  it('maps categories to fixed chart slots and unknown names stably', () => {
    expect(categoryToken('Pemasaran')).toBe(1)
    expect(categoryToken('  transport   &  logistik ')).toBe(4)
    expect([3, 5]).toContain(categoryToken('Kopi Tim'))
    expect(categoryToken('Kopi Tim')).toBe(categoryToken('kopi tim'))
    expect(categoryStyle('Operasional').color).toBe('var(--color-chart-2)')
  })

  it('resolves the row disc: type, credit, merchant, category', () => {
    const refund = transactionIconStyle({ type: 'REFUND', direction: 'CREDIT' })
    const credit = transactionIconStyle({ type: 'PURCHASE', direction: 'CREDIT' })
    const merchant = transactionIconStyle({ type: 'PURCHASE', direction: 'DEBIT', merchantName: 'AWS EMEA' })
    const category = transactionIconStyle({ type: 'PURCHASE', direction: 'DEBIT', merchantName: 'Warung', category: 'Pemasaran' })
    expect(refund.color).toBe('var(--color-chart-5)')
    expect(credit.color).toBe('var(--color-chart-5)')
    expect(merchant.color).toBe('var(--color-chart-2)')
    expect(category.color).toBe('var(--color-chart-1)')
  })

  it('groups by day and leaves void rows out of the totals', () => {
    const now = new Date(2026, 10, 12, 12)
    const groups = groupTransactionsByDay(
      [
        { id: '1', occurredAt: new Date(2026, 10, 12, 9).toISOString(), amount: 100000, direction: 'DEBIT', status: 'SETTLED' },
        { id: '2', occurredAt: new Date(2026, 10, 12, 8).toISOString(), amount: 50000, direction: 'DEBIT', status: 'DECLINED' },
        { id: '3', occurredAt: new Date(2026, 10, 12, 7).toISOString(), amount: 300000, direction: 'CREDIT', status: 'SETTLED' },
        { id: '4', occurredAt: new Date(2026, 10, 11, 7).toISOString(), amount: 20000, direction: 'DEBIT', status: 'PENDING' },
      ],
      now,
    )
    expect(groups).toHaveLength(2)
    expect(groups[0]?.rows).toHaveLength(3)
    expect(groups[0]?.summary).toBe('Keluar Rp 100.000 · Masuk Rp 300.000')
    expect(groups[1]?.label).toMatch(/^Kemarin/)
  })
})

describe('TransactionList', () => {
  it('a group is named by its day, rows are list items with buttons', () => {
    render(<List />)
    expect(screen.getByRole('group', { name: 'Hari ini · Kamis, 12 Nov' })).toBeTruthy()
    const button = screen.getByRole('button', { name: 'Lihat detail: Tokopedia' })
    expect(button).toHaveProperty('type', 'button')
    expect(button.closest('li')).toBeTruthy()
  })

  it('calls onClick from the mouse and the keyboard', async () => {
    const onOpen = vi.fn()
    render(<List onOpen={onOpen} />)
    await userEvent.click(screen.getByRole('button'))
    screen.getByRole('button').focus()
    await userEvent.keyboard('{Enter}')
    expect(onOpen).toHaveBeenCalledTimes(2)
  })

  it('selected sets aria-current and data-selected', () => {
    render(<List selected />)
    const button = screen.getByRole('button')
    expect(button.getAttribute('aria-current')).toBe('true')
    expect(button.dataset.selected).toBe('')
  })

  it('renders a row as a link', () => {
    render(
      <TransactionList>
        <TransactionGroup label="Hari ini">
          <TransactionRow render={<a href="#tx-1" />}>
            <TransactionRowTitle>Gojek</TransactionRowTitle>
          </TransactionRow>
        </TransactionGroup>
      </TransactionList>,
    )
    const link = screen.getByRole('link', { name: 'Gojek' })
    expect(link.getAttribute('type')).toBeNull()
  })

  it('row status: coloured text, nothing for SETTLED', () => {
    const { rerender } = render(<TransactionRowStatus status="PENDING" />)
    expect(screen.getByText('Menunggu').className).toContain('text-warning-text')
    rerender(<TransactionRowStatus status="SETTLED" />)
    expect(screen.queryByText('Berhasil')).toBeNull()
  })

  it('status badge and void amount', () => {
    render(
      <>
        <TransactionStatusBadge status="DECLINED" withIcon />
        <TransactionAmount amount={1000} direction="DEBIT" void data-testid="amount" />
      </>,
    )
    expect(screen.getByText('Ditolak')).toBeTruthy()
    expect(screen.getByTestId('amount').className).toContain('line-through')
  })

  it('the icon disc paints an accent and is hidden from assistive tech', () => {
    const { container } = render(
      <TransactionRowIcon tone="accent" accent={categoryStyle('Pemasaran')} icon={categoryStyle('Pemasaran').icon} />,
    )
    const disc = container.querySelector('[data-slot="transaction-row-icon"]') as HTMLElement
    expect(disc.getAttribute('aria-hidden')).toBe('true')
    expect(disc.style.background).toContain('color-mix')
  })

  it('skeleton is a busy status', () => {
    render(
      <TransactionList>
        <TransactionListSkeleton groups={[2]} />
      </TransactionList>,
    )
    expect(screen.getByRole('status').textContent).toContain('Memuat transaksi')
  })

  it('has no axe violations', async () => {
    const { container } = render(
      <div>
        <List />
        <List selected status="REVERSED" />
      </div>,
    )
    await expectNoAxeViolations(container)
  })
})
