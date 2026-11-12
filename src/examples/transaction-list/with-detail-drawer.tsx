import { useState } from 'react'

import { Dialog, DialogBody, DialogContent, DialogTitle } from '@/components/ui/dialog'
import {
  TransactionAmount,
  TransactionGroup,
  TransactionList,
  TransactionRow,
  TransactionRowContent,
  TransactionRowEnd,
  TransactionRowIcon,
  TransactionRowMeta,
  TransactionRowSeparator,
  TransactionRowStatus,
  TransactionRowTime,
  TransactionRowTitle,
  TransactionStatusBadge,
  formatTransactionAmount,
  transactionIconStyle,
  type TransactionDirection,
  type TransactionStatus,
  type TransactionType,
} from '@/components/ui/transaction-list'

interface Tx {
  id: string
  occurredAt: string
  merchantName: string
  category: string
  card: string
  amount: number
  direction: TransactionDirection
  type: TransactionType
  status: TransactionStatus
}

const today = new Date()
const at = (h: number, m: number) => new Date(today.getFullYear(), today.getMonth(), today.getDate(), h, m).toISOString()

const transactions: Tx[] = [
  { id: 'trx_01', occurredAt: at(9, 12), merchantName: 'Tokopedia', category: 'Operasional', card: 'Operasional •••• 4821', amount: 1250000, direction: 'DEBIT', type: 'PURCHASE', status: 'SETTLED' },
  { id: 'trx_02', occurredAt: at(8, 40), merchantName: 'Figma', category: 'Software & Langganan', card: 'Desain •••• 0912', amount: 675000, direction: 'DEBIT', type: 'PURCHASE', status: 'PENDING' },
  { id: 'trx_03', occurredAt: at(7, 5), merchantName: 'Gojek', category: 'Transportasi', card: 'Tim Sales •••• 3310', amount: 48000, direction: 'CREDIT', type: 'REFUND', status: 'SETTLED' },
]

export default function TransactionListWithDetailDrawer() {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const selected = transactions.find((tx) => tx.id === selectedId) ?? null

  return (
    <>
      <TransactionList className="w-full">
        <TransactionGroup label="Hari ini">
          {transactions.map((tx) => {
            const disc = transactionIconStyle(tx)
            return (
              <TransactionRow
                key={tx.id}
                selected={tx.id === selectedId}
                aria-label={`Lihat detail: ${tx.merchantName}`}
                onClick={() => setSelectedId(tx.id)}
              >
                <TransactionRowIcon icon={disc.icon} tone="accent" accent={disc} />
                <TransactionRowContent>
                  <TransactionRowTitle>{tx.merchantName}</TransactionRowTitle>
                  <TransactionRowMeta>
                    <span className="truncate">{tx.category}</span>
                    <TransactionRowSeparator />
                    <TransactionRowTime dateTime={tx.occurredAt} />
                  </TransactionRowMeta>
                </TransactionRowContent>
                <TransactionRowEnd>
                  <TransactionAmount amount={tx.amount} direction={tx.direction} />
                  <TransactionRowStatus status={tx.status} />
                </TransactionRowEnd>
              </TransactionRow>
            )
          })}
        </TransactionGroup>
      </TransactionList>

      <Dialog open={selected !== null} onOpenChange={(open) => !open && setSelectedId(null)}>
        <DialogContent placement="drawer" header="none" aria-label="Detail transaksi">
          {selected ? (
            <DialogBody className="pt-16">
              <TransactionStatusBadge status={selected.status} size="lg" withIcon />
              <DialogTitle className="mt-3 text-title-lg tabular-nums">
                {formatTransactionAmount(selected.amount, selected.direction)}
              </DialogTitle>
              <dl className="mt-6 flex flex-col gap-3">
                {[
                  ['Merchant', selected.merchantName],
                  ['Kategori', selected.category],
                  ['Kartu', selected.card],
                  ['ID transaksi', selected.id],
                ].map(([term, value]) => (
                  <div key={term} className="flex justify-between gap-4 text-body-sm">
                    <dt className="text-ink-2">{term}</dt>
                    <dd className="m-0 font-medium">{value}</dd>
                  </div>
                ))}
              </dl>
            </DialogBody>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  )
}
