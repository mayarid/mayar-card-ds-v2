import { Wallet01Icon } from '@hugeicons/core-free-icons'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { Icon } from '@/components/ui/icon'
import { expectNoAxeViolations } from '@/test/axe'

import {
  BalanceCard,
  BalanceCardAmount,
  BalanceCardCaption,
  BalanceCardDelta,
  BalanceCardError,
  BalanceCardGroup,
  BalanceCardHeader,
  BalanceCardHideToggle,
  BalanceCardLabel,
  BalanceCardValue,
  formatRupiah,
} from './balance-card'

function Saldo(props: React.ComponentProps<typeof BalanceCard>) {
  return (
    <BalanceCard data-testid="card" {...props}>
      <BalanceCardHeader>
        <BalanceCardLabel>
          <Icon icon={Wallet01Icon} />
          Saldo akun
        </BalanceCardLabel>
        <BalanceCardHideToggle />
      </BalanceCardHeader>
      <BalanceCardValue value={48250000} />
      <BalanceCardCaption>
        <BalanceCardAmount value={2000000} /> masuk hari ini
      </BalanceCardCaption>
    </BalanceCard>
  )
}

describe('BalanceCard', () => {
  it('formats Rupiah with a true minus', () => {
    expect(formatRupiah(48250000)).toBe('Rp 48.250.000')
    expect(formatRupiah(-1000)).toBe('−Rp 1.000')
    expect(formatRupiah(12, 'USD')).toBe('USD 12')
  })

  it('shows the value and the caption amount', () => {
    render(<Saldo />)
    expect(screen.getAllByText('Rp 48.250.000').length).toBeGreaterThan(0)
    expect(screen.getByText(/Rp 2\.000\.000/)).toBeTruthy()
  })

  it('uncontrolled: the toggle masks every figure and sets aria-pressed', async () => {
    const onHiddenChange = vi.fn()
    render(<Saldo onHiddenChange={onHiddenChange} />)
    const toggle = screen.getByRole('button', { name: 'Sembunyikan saldo' })
    expect(toggle.getAttribute('aria-pressed')).toBe('false')
    await userEvent.click(toggle)
    expect(toggle.getAttribute('aria-pressed')).toBe('true')
    expect(onHiddenChange).toHaveBeenCalledWith(true)
    expect(screen.queryByText('Rp 48.250.000')).toBeNull()
    expect(screen.getAllByText('saldo disembunyikan')).toHaveLength(2)
    expect(screen.getByTestId('card').dataset.hidden).toBe('')
  })

  it('controlled: hidden follows the prop', async () => {
    function Controlled() {
      const [hidden, setHidden] = useState(true)
      return (
        <>
          <Saldo hidden={hidden} onHiddenChange={setHidden} />
          <output>{String(hidden)}</output>
        </>
      )
    }
    render(<Controlled />)
    expect(screen.getAllByText('saldo disembunyikan').length).toBeGreaterThan(0)
    await userEvent.click(screen.getByRole('button', { name: 'Sembunyikan saldo' }))
    expect(screen.getByText('false')).toBeTruthy()
    expect(screen.getAllByText('Rp 48.250.000').length).toBeGreaterThan(0)
  })

  it('the group owns one hidden state for every tile', async () => {
    render(
      <BalanceCardGroup aria-label="Ringkasan saldo" columns={2}>
        <BalanceCard>
          <BalanceCardHeader>
            <BalanceCardLabel>Saldo akun</BalanceCardLabel>
            <BalanceCardHideToggle />
          </BalanceCardHeader>
          <BalanceCardValue value={1000} />
        </BalanceCard>
        <BalanceCard data-testid="second">
          <BalanceCardLabel>Saldo kartu</BalanceCardLabel>
          <BalanceCardValue value={2000} />
        </BalanceCard>
      </BalanceCardGroup>,
    )
    expect(screen.getByTestId('second').dataset.variant).toBe('tile')
    await userEvent.click(screen.getByRole('button', { name: 'Sembunyikan saldo' }))
    expect(screen.getAllByText('saldo disembunyikan')).toHaveLength(2)
  })

  it('loading: aria-busy and no value', () => {
    render(<Saldo loading />)
    expect(screen.getByTestId('card').getAttribute('aria-busy')).toBe('true')
    expect(screen.queryByText('Rp 48.250.000')).toBeNull()
  })

  it('a null value shows a dash; a percent is not masked', () => {
    render(
      <BalanceCard defaultHidden>
        <BalanceCardValue value={null} />
        <BalanceCardValue value={62} suffix="%" money={false} />
      </BalanceCard>,
    )
    expect(screen.getByText('—')).toBeTruthy()
    expect(screen.getAllByText('62%').length).toBeGreaterThan(0)
  })

  it('delta speaks its direction; the error is an alert', () => {
    render(
      <BalanceCard>
        <BalanceCardCaption>
          <BalanceCardDelta direction="down" tone="negative">
            4,2%
          </BalanceCardDelta>
          vs 30 hari lalu
        </BalanceCardCaption>
        <BalanceCardError>Gagal memuat saldo QRIS.</BalanceCardError>
      </BalanceCard>,
    )
    expect(screen.getByText('Turun')).toBeTruthy()
    expect(screen.getByRole('alert').textContent).toContain('Gagal memuat saldo QRIS.')
  })

  it('renders a tile as a tab and forwards the ref', () => {
    let node: HTMLElement | null = null
    render(
      <BalanceCardGroup role="tablist" aria-label="Saldo">
        <BalanceCard ref={(el) => void (node = el)} render={<button type="button" role="tab" aria-selected />}>
          <BalanceCardLabel>Saldo akun</BalanceCardLabel>
        </BalanceCard>
      </BalanceCardGroup>,
    )
    expect(screen.getByRole('tab', { selected: true })).toBeTruthy()
    expect(node).toBeInstanceOf(HTMLButtonElement)
  })

  it('has no axe violations', async () => {
    const { container } = render(
      <div>
        <Saldo />
        <Saldo defaultHidden />
        <Saldo loading />
      </div>,
    )
    await expectNoAxeViolations(container)
  })
})
