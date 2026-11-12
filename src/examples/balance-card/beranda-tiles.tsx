import { ChartBarIncreasingIcon, CreditCardIcon, QrCodeIcon, Wallet01Icon } from '@hugeicons/core-free-icons'
import { useState } from 'react'

import {
  BalanceCard,
  BalanceCardAmount,
  BalanceCardCaption,
  BalanceCardDelta,
  BalanceCardError,
  BalanceCardGroup,
  BalanceCardHideToggle,
  BalanceCardLabel,
  BalanceCardValue,
} from '@/components/ui/balance-card'
import { Icon } from '@/components/ui/icon'

type Tab = 'akun' | 'kartu' | 'qris' | 'anggaran'

export default function BalanceCardBerandaTiles() {
  const [tab, setTab] = useState<Tab>('akun')
  const [hidden, setHidden] = useState(false)

  const tile = (key: Tab) => ({
    render: (
      <button
        type="button"
        role="tab"
        id={`saldo-tab-${key}`}
        aria-selected={tab === key}
        aria-controls="saldo-panel"
        tabIndex={tab === key ? 0 : -1}
        onClick={() => setTab(key)}
      />
    ),
  })

  return (
    <div className="flex w-full flex-col gap-3">
      <BalanceCardGroup
        role="tablist"
        aria-label="Ringkasan saldo"
        columns={2}
        hidden={hidden}
        onHiddenChange={setHidden}
      >
        <BalanceCard {...tile('akun')}>
          <BalanceCardLabel>
            <Icon icon={Wallet01Icon} />
            Saldo akun
          </BalanceCardLabel>
          <BalanceCardValue value={48250000} />
          <BalanceCardCaption>
            <BalanceCardDelta direction="up" tone="positive">
              12,5%
            </BalanceCardDelta>
            vs 30 hari lalu
          </BalanceCardCaption>
        </BalanceCard>
        <BalanceCard {...tile('kartu')}>
          <BalanceCardLabel>
            <Icon icon={CreditCardIcon} />
            Saldo kartu
          </BalanceCardLabel>
          <BalanceCardValue value={18750000} />
          <BalanceCardCaption>Total saldo di 12 kartu</BalanceCardCaption>
        </BalanceCard>
        <BalanceCard {...tile('qris')}>
          <BalanceCardLabel>
            <Icon icon={QrCodeIcon} />
            Saldo QRIS
          </BalanceCardLabel>
          <BalanceCardValue value={null} />
          <BalanceCardError>Gagal memuat saldo QRIS.</BalanceCardError>
        </BalanceCard>
        <BalanceCard {...tile('anggaran')}>
          <BalanceCardLabel>
            <Icon icon={ChartBarIncreasingIcon} />
            Anggaran
          </BalanceCardLabel>
          <BalanceCardValue value={62} suffix="%" money={false}>
            terpakai
          </BalanceCardValue>
          <BalanceCardCaption>
            <BalanceCardAmount value={4150000} /> tersisa
          </BalanceCardCaption>
        </BalanceCard>
      </BalanceCardGroup>
      <div
        id="saldo-panel"
        role="tabpanel"
        aria-labelledby={`saldo-tab-${tab}`}
        className="flex items-center justify-between gap-3 rounded-2xl bg-surface px-4 py-3 text-body-sm text-ink-2 shadow-control"
      >
        Grafik untuk tab yang dipilih tampil di sini.
        <BalanceCardHideToggle pressed={hidden} onPressedChange={setHidden} className="m-0" />
      </div>
    </div>
  )
}
