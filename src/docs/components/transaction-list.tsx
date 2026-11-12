import {
  CATEGORY_TOKENS,
  TRANSACTION_TYPE_LABEL,
  TransactionAmount,
  TransactionGroup,
  TransactionList,
  TransactionListSkeleton,
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
  categoryStyle,
  isVoidTransaction,
  transactionIconStyle,
  type TransactionDirection,
  type TransactionListVariant,
  type TransactionStatus,
  type TransactionType,
} from '@/components/ui/transaction-list'
import type { ComponentDoc, MatrixAxisItem, PropValue } from '@/docs/types'
import { toJsx } from '@/gallery/jsx'
import source from '@/registry/ui/transaction-list.tsx?raw'

const TYPES = Object.keys(TRANSACTION_TYPE_LABEL) as TransactionType[]
const STATUSES = ['SETTLED', 'PENDING', 'DECLINED', 'REVERSED'] as const satisfies readonly TransactionStatus[]
const OCCURRED = '2026-11-12T01:15:00Z'

const SAMPLE: Record<TransactionType, { merchant: string; category: string | null; direction: TransactionDirection; amount: number }> = {
  PURCHASE: { merchant: 'Tokopedia', category: 'Operasional', direction: 'DEBIT', amount: 1250000 },
  TOPUP_CREDIT: { merchant: 'Top-up Saldo', category: null, direction: 'CREDIT', amount: 10000000 },
  REFUND: { merchant: 'Pengembalian Dana', category: null, direction: 'CREDIT', amount: 349000 },
  REVERSAL: { merchant: 'Pembalikan', category: null, direction: 'CREDIT', amount: 2500000 },
  ADJUSTMENT: { merchant: 'Penyesuaian', category: null, direction: 'DEBIT', amount: 150000 },
  REJECTION_FEE: { merchant: 'Biaya Penolakan', category: null, direction: 'DEBIT', amount: 5000 },
}

interface RowOptions {
  type: TransactionType
  status: TransactionStatus
  variant: TransactionListVariant
  disc: 'neutral' | 'accent'
  selected?: boolean
  force?: MatrixAxisItem['force']
}

function Row({ type, status, variant, disc, selected, force }: RowOptions) {
  const s = SAMPLE[type]
  const style = transactionIconStyle({ type, direction: s.direction, merchantName: s.merchant, category: s.category })
  return (
    <TransactionList variant={variant} className="w-full">
      <TransactionGroup label="Hari ini">
        <TransactionRow aria-label={`Lihat detail: ${s.merchant}`} selected={selected} data-force-state={force}>
          {disc === 'accent' ? (
            <TransactionRowIcon icon={style.icon} tone="accent" accent={style} />
          ) : (
            <TransactionRowIcon icon={style.icon} tone={s.direction === 'CREDIT' ? 'credit' : 'neutral'} />
          )}
          <TransactionRowContent>
            <TransactionRowTitle>{s.merchant}</TransactionRowTitle>
            <TransactionRowMeta>
              <span className="truncate">{s.category ?? TRANSACTION_TYPE_LABEL[type]}</span>
              <TransactionRowSeparator />
              <TransactionRowTime dateTime={OCCURRED} timeZone="Asia/Jakarta" />
            </TransactionRowMeta>
          </TransactionRowContent>
          <TransactionRowEnd>
            <TransactionAmount amount={s.amount} direction={s.direction} void={isVoidTransaction(status)} />
            <TransactionRowStatus status={status} />
          </TransactionRowEnd>
        </TransactionRow>
      </TransactionGroup>
    </TransactionList>
  )
}

function renderRow(props: Record<string, PropValue>, force?: MatrixAxisItem['force']) {
  return (
    <Row
      type={(props.type as TransactionType | undefined) ?? 'PURCHASE'}
      status={(props.status as TransactionStatus | undefined) ?? 'SETTLED'}
      variant={(props.variant as TransactionListVariant | undefined) ?? 'feed'}
      disc={props.disc === 'accent' ? 'accent' : 'neutral'}
      selected={Boolean(props.selected)}
      force={force}
    />
  )
}

function rowCode(props: Record<string, PropValue>) {
  const type = (props.type as TransactionType | undefined) ?? 'PURCHASE'
  const status = (props.status as TransactionStatus | undefined) ?? 'SETTLED'
  const s = SAMPLE[type]
  const icon =
    props.disc === 'accent'
      ? '<TransactionRowIcon icon={disc.icon} tone="accent" accent={disc} />'
      : `<TransactionRowIcon icon={disc.icon}${s.direction === 'CREDIT' ? ' tone="credit"' : ''} />`
  const row = toJsx(
    'TransactionRow',
    { 'aria-label': `Lihat detail: ${s.merchant}`, selected: props.selected },
    `${icon}\n<TransactionRowContent>\n  <TransactionRowTitle>${s.merchant}</TransactionRowTitle>\n  <TransactionRowMeta>\n    <span className="truncate">${
      s.category ?? TRANSACTION_TYPE_LABEL[type]
    }</span>\n    <TransactionRowSeparator />\n    <TransactionRowTime dateTime="${OCCURRED}" />\n  </TransactionRowMeta>\n</TransactionRowContent>\n<TransactionRowEnd>\n  <TransactionAmount amount={${s.amount}} direction="${s.direction}"${
      isVoidTransaction(status) ? ' void' : ''
    } />\n  <TransactionRowStatus status="${status}" />\n</TransactionRowEnd>`,
  )
  const group = toJsx('TransactionGroup', { label: 'Hari ini' }, row)
  return toJsx('TransactionList', { variant: props.variant === 'cards' ? 'cards' : undefined }, group)
}

const ROW_STATES: MatrixAxisItem[] = [
  { label: 'Default' },
  { label: 'Hover', force: 'hover', codeOnly: true },
  { label: 'Pressed', force: 'pressed', codeOnly: true },
  { label: 'Focus', force: 'focus', codeOnly: true },
  { label: 'Selected', props: { selected: true }, codeOnly: true },
]

const CATEGORY_NAMES = [...new Set(Object.keys(CATEGORY_TOKENS)), 'Kopi Tim']

export const doc: ComponentDoc = {
  slug: 'transaction-list',
  name: 'Transaction List',
  group: 'Patterns',
  description:
    'Transactions grouped by day with the money out and in. Each row is a button or link that opens a detail drawer.',
  spec: 'wonder',
  wonderRef: 'Dashboard › Transaksi C Default v2 (Day Grouped List)',
  registry: 'transaction-list',
  baseUi: { name: 'useRender', url: 'https://base-ui.com/react/utils/use-render' },
  source: [{ path: 'components/ui/transaction-list.tsx', code: source }],
  playground: {
    controls: [
      { name: 'type', type: 'select', options: TYPES, default: 'PURCHASE' },
      { name: 'status', type: 'select', options: STATUSES, default: 'PENDING' },
      { name: 'variant', type: 'select', options: ['feed', 'cards'], default: 'feed' },
      { name: 'disc', type: 'select', options: ['neutral', 'accent'], default: 'neutral' },
      { name: 'selected', type: 'boolean', default: false },
    ],
    render: (values) => renderRow(values),
    code: rowCode,
  },
  matrices: [
    {
      title: 'Type × status (feed)',
      description:
        'Money in is green with a "+"; declined and reversed amounts are struck through; the status shows only when it is not Berhasil.',
      rows: TYPES.map((t) => ({ label: TRANSACTION_TYPE_LABEL[t], props: { type: t } })),
      columns: STATUSES.map((s) => ({ label: s, props: { status: s }, codeOnly: s === 'REVERSED' })),
      render: renderRow,
      code: rowCode,
      cellWidth: 340,
    },
    {
      title: 'Row states',
      rows: [
        { label: 'Feed', props: { variant: 'feed' } },
        { label: 'Cards', props: { variant: 'cards' }, codeOnly: true },
      ],
      columns: ROW_STATES,
      render: renderRow,
      code: rowCode,
      cellWidth: 340,
    },
    {
      title: 'Category discs',
      description: 'tone="accent" with categoryStyle: the fixed chart slot of each category, or a stable hash into slot 3 or 5.',
      rows: [{ label: 'Disc' }],
      columns: CATEGORY_NAMES.map((name) => ({ label: name, props: { category: name }, codeOnly: true })),
      render: (props) => {
        const style = categoryStyle(String(props.category))
        return (
          <TransactionList className="w-fit shadow-none">
            <TransactionGroup label={String(props.category)}>
              <li className="flex justify-center p-2">
                <TransactionRowIcon icon={style.icon} tone="accent" accent={style} />
              </li>
            </TransactionGroup>
          </TransactionList>
        )
      },
      code: (props) =>
        `const disc = categoryStyle("${String(props.category)}")\n<TransactionRowIcon icon={disc.icon} tone="accent" accent={disc} />`,
      cellWidth: 140,
    },
    {
      title: 'Status badge',
      description: 'For the detail drawer and card tables (with `withIcon`). Rows use TransactionRowStatus, the same Badge without a glyph.',
      rows: [
        { label: 'Badge', codeOnly: true },
        { label: 'With icon', props: { withIcon: true }, codeOnly: true },
      ],
      columns: STATUSES.map((s) => ({ label: s, props: { status: s } })),
      render: (props) => (
        <TransactionStatusBadge status={props.status as TransactionStatus} size="lg" withIcon={Boolean(props.withIcon)} />
      ),
      code: (props) => toJsx('TransactionStatusBadge', { status: props.status, size: 'lg', withIcon: props.withIcon }),
      cellWidth: 120,
    },
    {
      title: 'Loading',
      rows: [
        { label: 'Feed', props: { variant: 'feed' } },
        { label: 'Cards', props: { variant: 'cards' }, codeOnly: true },
      ],
      columns: [{ label: 'Skeleton', codeOnly: true }],
      render: (props) => (
        <TransactionList variant={props.variant as TransactionListVariant} className="w-full">
          <TransactionListSkeleton groups={[2]} />
        </TransactionList>
      ),
      code: (props) =>
        toJsx('TransactionList', { variant: props.variant === 'cards' ? 'cards' : undefined }, '<TransactionListSkeleton groups={[2]} />'),
      cellWidth: 400,
    },
  ],
  examples: [
    { id: 'transaction-list/feed', title: 'Day feed', description: 'groupTransactionsByDay turns API rows into day groups with totals.' },
    {
      id: 'transaction-list/with-detail-drawer',
      title: 'With a detail drawer',
      description: 'A row opens a Dialog with placement="drawer"; the open row is selected.',
    },
    { id: 'transaction-list/day-cards', title: 'Day cards', description: 'The QRIS detail layout: a card per day.', codeOnly: true },
    { id: 'transaction-list/empty', title: 'Empty and no match', description: 'An EmptyState inside the panel.' },
    { id: 'transaction-list/loading', title: 'Loading', description: 'Bones at the filled heights.' },
  ],
  props: [
    { name: 'TransactionList variant', type: '"feed" | "cards"', default: '"feed"', description: 'One panel with day headers, or a card per day.' },
    { name: 'TransactionGroup label / summary', type: 'ReactNode', description: 'Day label (names the group) and the day totals.' },
    { name: 'TransactionRow selected', type: 'boolean', default: 'false', description: 'Primary tint and aria-current="true".' },
    { name: 'TransactionRow render', type: 'ReactElement', description: 'A link instead of a button: render={<a href="…" />}.' },
    { name: 'TransactionRowIcon', type: 'icon, tone: "neutral" | "credit" | "accent", accent', description: '36px disc (32 in cards). A letter as children for an initial.' },
    { name: 'TransactionRowTime', type: 'dateTime: string, timeZone?: string', description: '"08:15" in the viewer zone. Never truncates.' },
    { name: 'TransactionAmount', type: 'amount, direction, currency?, void?', description: '"− Rp …" / "+ Rp …"; void strikes it through.' },
    { name: 'TransactionRowStatus status', type: 'TransactionStatus', description: 'The status Badge (Menunggu, Ditolak, Dibalik); nothing for SETTLED.' },
    { name: 'TransactionStatusBadge', type: 'status, withIcon?, Badge props', description: 'The status chip for drawers and tables.' },
    { name: 'groupTransactionsByDay(rows, now?)', type: '(rows) => { key, label, summary, rows }[]', description: 'Day groups; declined and reversed rows are left out of the totals.' },
    { name: 'transactionIconStyle / categoryStyle', type: '(tx | name) => { icon, color, tint }', description: 'The ported transaction-style and category-style maps.' },
  ],
  guidelines: {
    do: [
      'Give each row an aria-label such as "Lihat detail: Tokopedia".',
      'Sign amounts from the API direction, never from a re-derived sign.',
      'Keep the time visible when the meta line truncates (TransactionRowTime does not shrink).',
    ],
    dont: [
      'Do not show "Berhasil" on every row; show only the exceptions.',
      'Do not use category colours for status.',
    ],
  },
  notes: [
    'The shipped app code is the source of truth (decision 2026-11-12). Wonder is the visual reference only.',
    'Row status: the app renders the status Badge ("Menunggu" warning, "Ditolak" danger, "Dibalik" default) 2px under the amount; TransactionRowStatus does the same. Wonder shows caption-lg medium coloured text with the labels "Pending" / "Gagal".',
    'Meta line: the app keeps the time out of the truncation. Wonder has one truncating meta line.',
    'REVERSED ("Dibalik"), hover, pressed, focus, selected and the day-cards layout come from the app; Wonder has no feed specimen for them.',
    'Pressed (sunken) and selected (primary tint) are additions of this port; the app has hover (canvas) and a highlight tint on the QRIS cards.',
    'The detail drawer stays out of this pattern; the example composes it with Dialog placement="drawer".',
  ],
}
