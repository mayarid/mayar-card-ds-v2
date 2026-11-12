import { useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  TRANSACTION_TYPE_LABEL,
  TransactionAmount,
  TransactionGroup,
  TransactionList,
  TransactionListFooter,
  TransactionRow,
  TransactionRowContent,
  TransactionRowDetail,
  TransactionRowEnd,
  TransactionRowIcon,
  TransactionRowMeta,
  TransactionRowSeparator,
  TransactionRowStatus,
  TransactionRowTime,
  TransactionRowTitle,
  groupTransactionsByDay,
  isVoidTransaction,
  transactionIconStyle,
  type TransactionDirection,
  type TransactionStatus,
  type TransactionType,
} from '@/components/ui/transaction-list'

interface Tx {
  id: string
  occurredAt: string
  merchantName: string
  category: string | null
  cardName: string | null
  cardMaskedNumber: string | null
  amount: number
  direction: TransactionDirection
  type: TransactionType
  status: TransactionStatus
}

const hoursAgo = (h: number) => new Date(Date.now() - h * 3_600_000).toISOString()

const transactions: Tx[] = [
  { id: 't1', occurredAt: hoursAgo(1), merchantName: 'Google Workspace', category: 'Software & Langganan', cardName: 'Operasional', cardMaskedNumber: '•••• 4821', amount: 711000, direction: 'DEBIT', type: 'PURCHASE', status: 'SETTLED' },
  { id: 't2', occurredAt: hoursAgo(2), merchantName: 'Top-up Saldo', category: null, cardName: null, cardMaskedNumber: null, amount: 10000000, direction: 'CREDIT', type: 'TOPUP_CREDIT', status: 'SETTLED' },
  { id: 't3', occurredAt: hoursAgo(26), merchantName: 'Notion Labs', category: 'Perangkat lunak', cardName: 'Langganan SaaS', cardMaskedNumber: '•••• 1907', amount: 1120000, direction: 'DEBIT', type: 'PURCHASE', status: 'PENDING' },
  { id: 't4', occurredAt: hoursAgo(27), merchantName: 'Grab', category: 'Transportasi', cardName: 'Tim Sales', cardMaskedNumber: '•••• 3310', amount: 86500, direction: 'DEBIT', type: 'PURCHASE', status: 'SETTLED' },
  { id: 't5', occurredAt: hoursAgo(28), merchantName: 'Meta Ads', category: 'Pemasaran', cardName: 'Marketing', cardMaskedNumber: '•••• 7752', amount: 2500000, direction: 'DEBIT', type: 'PURCHASE', status: 'DECLINED' },
  { id: 't6', occurredAt: hoursAgo(29), merchantName: 'Biaya Penolakan', category: null, cardName: 'Marketing', cardMaskedNumber: '•••• 7752', amount: 5000, direction: 'DEBIT', type: 'REJECTION_FEE', status: 'SETTLED' },
]

export default function TransactionListFeed() {
  const [loadingMore, setLoadingMore] = useState(false)
  const groups = groupTransactionsByDay(transactions)

  return (
    <TransactionList className="w-full">
      {groups.map((group) => (
        <TransactionGroup key={group.key} label={group.label} summary={group.summary}>
          {group.rows.map((tx) => (
            <TransactionRow key={tx.id} aria-label={`Lihat detail: ${tx.merchantName}`}>
              <TransactionRowIcon
                icon={transactionIconStyle(tx).icon}
                tone={tx.direction === 'CREDIT' ? 'credit' : 'neutral'}
              />
              <TransactionRowContent>
                <TransactionRowTitle>{tx.merchantName}</TransactionRowTitle>
                <TransactionRowMeta>
                  <TransactionRowDetail>
                    {tx.category ?? TRANSACTION_TYPE_LABEL[tx.type]} · {tx.cardName ?? 'Saldo Akun Perusahaan'}{' '}
                    {tx.cardMaskedNumber}
                  </TransactionRowDetail>
                  <TransactionRowSeparator />
                  <TransactionRowTime dateTime={tx.occurredAt} />
                </TransactionRowMeta>
              </TransactionRowContent>
              <TransactionRowEnd>
                <TransactionAmount amount={tx.amount} direction={tx.direction} void={isVoidTransaction(tx.status)} />
                <TransactionRowStatus status={tx.status} />
              </TransactionRowEnd>
            </TransactionRow>
          ))}
        </TransactionGroup>
      ))}
      <TransactionListFooter>
        <Button
          variant="link"
          loading={loadingMore}
          onClick={() => {
            setLoadingMore(true)
            window.setTimeout(() => setLoadingMore(false), 1200)
          }}
        >
          Muat transaksi lainnya
        </Button>
      </TransactionListFooter>
    </TransactionList>
  )
}
