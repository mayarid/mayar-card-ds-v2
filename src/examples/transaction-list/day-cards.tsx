import { ArrowDownLeft01Icon } from '@hugeicons/core-free-icons'

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
} from '@/components/ui/transaction-list'

const today = new Date()
const at = (d: number, h: number) => new Date(today.getFullYear(), today.getMonth(), today.getDate() - d, h).toISOString()

export default function TransactionListDayCards() {
  return (
    <TransactionList variant="cards" className="w-full max-w-md">
      <TransactionGroup label="Hari ini" summary="+Rp 450.000">
        <TransactionRow aria-label="Lihat detail: Pembayaran QRIS dari Budi Santoso">
          <TransactionRowIcon icon={ArrowDownLeft01Icon} tone="credit" />
          <TransactionRowContent>
            <TransactionRowTitle>Budi Santoso</TransactionRowTitle>
            <TransactionRowMeta>
              <span className="truncate">Pembayaran QRIS</span>
              <TransactionRowSeparator />
              <TransactionRowTime dateTime={at(0, 10)} />
            </TransactionRowMeta>
          </TransactionRowContent>
          <TransactionRowEnd>
            <TransactionAmount amount={450000} direction="CREDIT" />
          </TransactionRowEnd>
        </TransactionRow>
      </TransactionGroup>
      <TransactionGroup label="Kemarin" summary="−Rp 125.000">
        <TransactionRow aria-label="Lihat detail: Kopi Kenangan">
          <TransactionRowIcon>K</TransactionRowIcon>
          <TransactionRowContent>
            <TransactionRowTitle>Kopi Kenangan</TransactionRowTitle>
            <TransactionRowMeta>
              <span className="truncate">Operasional</span>
              <TransactionRowSeparator />
              <TransactionRowTime dateTime={at(1, 15)} />
            </TransactionRowMeta>
          </TransactionRowContent>
          <TransactionRowEnd>
            <TransactionAmount amount={125000} direction="DEBIT" />
            <TransactionRowStatus status="PENDING" />
          </TransactionRowEnd>
        </TransactionRow>
      </TransactionGroup>
    </TransactionList>
  )
}
