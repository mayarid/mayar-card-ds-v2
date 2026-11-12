import { AlertCircleIcon, ArrowRight01Icon, Invoice01Icon } from '@hugeicons/core-free-icons'

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
} from '@/components/ui/budget-card'
import { Button } from '@/components/ui/button'
import {
  EmptyState,
  EmptyStateActions,
  EmptyStateDescription,
  EmptyStateIcon,
  EmptyStateText,
  EmptyStateTitle,
} from '@/components/ui/empty-state'
import { Icon } from '@/components/ui/icon'
import type { ComponentDoc, MatrixAxisItem, PropValue } from '@/docs/types'
import { toJsx } from '@/gallery/jsx'
import source from '@/registry/ui/budget-card.tsx?raw'

/** spent per 1.000.000 limit for each status. */
const STATUS_SPENT = { under: 450_000, near: 900_000, at: 1_000_000, over: 1_040_000 } as const
type Status = keyof typeof STATUS_SPENT

function Item({ status, category, hidden }: { status: Status; category: string; hidden?: boolean }) {
  return (
    <BudgetCard hidden={hidden} aria-label={`Anggaran ${category}`} className="w-full">
      <BudgetCardList>
        <BudgetCardItem category={category} spent={STATUS_SPENT[status] * 3} amount={3_000_000} />
      </BudgetCardList>
    </BudgetCard>
  )
}

function Panel({ state, hidden }: { state: string; hidden?: boolean }) {
  const head = (
    <BudgetCardHeader>
      <div>
        <BudgetCardTitle>Anggaran November</BudgetCardTitle>
        <BudgetCardPeriod>Sisa 28 hari</BudgetCardPeriod>
      </div>
      {state === 'filled' ? (
        <Button variant="link" render={<a href="#anggaran" />}>
          Kelola anggaran
          <Icon icon={ArrowRight01Icon} />
        </Button>
      ) : null}
    </BudgetCardHeader>
  )
  let body
  if (state === 'loading') body = <BudgetCardSkeleton rows={3} />
  else if (state === 'empty' || state === 'error') {
    const error = state === 'error'
    body = (
      <EmptyState size="sm" role={error ? 'alert' : undefined}>
        <EmptyStateIcon tone={error ? 'danger' : 'neutral'}>
          <Icon icon={error ? AlertCircleIcon : Invoice01Icon} />
        </EmptyStateIcon>
        <EmptyStateText>
          <EmptyStateTitle>{error ? 'Gagal memuat anggaran.' : 'Belum ada anggaran'}</EmptyStateTitle>
          <EmptyStateDescription>
            {error ? 'Periksa koneksi Anda, lalu coba lagi.' : 'Atur batas pengeluaran per kategori.'}
          </EmptyStateDescription>
        </EmptyStateText>
        <EmptyStateActions>
          <Button variant="secondary" size="sm">
            {error ? 'Coba lagi' : 'Atur anggaran'}
          </Button>
        </EmptyStateActions>
      </EmptyState>
    )
  } else {
    body = (
      <>
        <BudgetCardList>
          <BudgetCardItem category="Pemasaran" spent={8_240_000} amount={10_000_000} />
          <BudgetCardItem category="Operasional" spent={4_500_000} amount={10_000_000} index={1} />
          <BudgetCardItem category="Perjalanan Dinas" spent={3_120_000} amount={3_000_000} index={2} />
        </BudgetCardList>
        <BudgetCardFooter>
          <span>Total sisa</span>
          <BudgetCardTotal remaining={7_140_000} total={23_000_000} />
        </BudgetCardFooter>
      </>
    )
  }
  return (
    <BudgetCard hidden={hidden} className="w-full max-w-86">
      {head}
      {body}
    </BudgetCard>
  )
}

const ITEM_CODE = (status: Status, category: string, hidden?: PropValue) =>
  toJsx(
    'BudgetCard',
    { hidden },
    `<BudgetCardList>\n  <BudgetCardItem category="${category}" spent={${STATUS_SPENT[status] * 3}} amount={3000000} />\n</BudgetCardList>`,
  )

function panelCode(props: Record<string, PropValue>) {
  const state = String(props.state ?? 'filled')
  const head = `<BudgetCardHeader>\n  <div>\n    <BudgetCardTitle>Anggaran November</BudgetCardTitle>\n    <BudgetCardPeriod>Sisa 28 hari</BudgetCardPeriod>\n  </div>\n</BudgetCardHeader>`
  const body =
    state === 'loading'
      ? '<BudgetCardSkeleton rows={3} />'
      : state === 'empty' || state === 'error'
        ? `<EmptyState size="sm"${state === 'error' ? ' role="alert"' : ''}>…</EmptyState>`
        : `<BudgetCardList>\n  <BudgetCardItem category="Pemasaran" spent={8240000} amount={10000000} />\n  <BudgetCardItem category="Operasional" spent={4500000} amount={10000000} index={1} />\n</BudgetCardList>\n<BudgetCardFooter>\n  <span>Total sisa</span>\n  <BudgetCardTotal remaining={7140000} total={23000000} />\n</BudgetCardFooter>`
  return toJsx('BudgetCard', { hidden: props.hidden }, `${head}\n${body}`)
}

const STATUSES: MatrixAxisItem[] = [
  { label: 'Under (< 85%)', props: { status: 'under' } },
  { label: 'Near (85–99%)', props: { status: 'near' }, codeOnly: true },
  { label: 'At (100%)', props: { status: 'at' }, codeOnly: true },
  { label: 'Over (> 100%)', props: { status: 'over' } },
]

export const doc: ComponentDoc = {
  slug: 'budget-card',
  name: 'Budget Card',
  group: 'Patterns',
  description:
    'Category budgets for the period: what is left (or over) per category on the blue usage ramp, and the total left.',
  spec: 'wonder',
  wonderRef: 'Dashboard › Budget Card Option B Remaining Rows, Budget Error v2',
  registry: 'budget-card',
  source: [{ path: 'components/ui/budget-card.tsx', code: source }],
  playground: {
    controls: [
      { name: 'state', type: 'select', options: ['filled', 'empty', 'loading', 'error'], default: 'filled' },
      { name: 'hidden', type: 'boolean', default: false },
    ],
    render: (values) => <Panel state={String(values.state)} hidden={Boolean(values.hidden)} />,
    code: panelCode,
  },
  matrices: [
    {
      title: 'Item status',
      description: 'One row per status. Only "over" turns red; near and at show in the bar ramp and the spoken status.',
      rows: [
        { label: 'Default' },
        { label: 'Hidden balance', props: { hidden: true }, codeOnly: true },
      ],
      columns: STATUSES,
      render: (props) => <Item status={props.status as Status} category="Perjalanan Dinas" hidden={Boolean(props.hidden)} />,
      code: (props) => ITEM_CODE(props.status as Status, 'Perjalanan Dinas', props.hidden),
      cellWidth: 300,
    },
    {
      title: 'Card states',
      rows: [{ label: 'Card' }],
      columns: [
        { label: 'Filled', props: { state: 'filled' } },
        { label: 'Empty', props: { state: 'empty' }, codeOnly: true },
        { label: 'Loading', props: { state: 'loading' }, codeOnly: true },
        { label: 'Error', props: { state: 'error' } },
      ],
      render: (props) => <Panel state={String(props.state)} />,
      code: panelCode,
      cellWidth: 344,
    },
  ],
  examples: [
    { id: 'budget-card/beranda-module', title: 'Beranda module', description: 'Most used first, with the total left in the foot.' },
    { id: 'budget-card/statuses', title: 'Every status', description: 'Under, near, at and over the limit.' },
    { id: 'budget-card/hidden', title: 'Hidden balance', description: 'hidden masks money; percents stay visible.', codeOnly: true },
    { id: 'budget-card/empty', title: 'No budget', description: 'An EmptyState in place of the list.', codeOnly: true },
    { id: 'budget-card/loading', title: 'Loading', codeOnly: true },
    { id: 'budget-card/error', title: 'Load error', description: 'Wonder Budget Error v2.' },
  ],
  props: [
    { name: 'BudgetCard hidden', type: 'boolean', default: 'false', description: 'Masks every money figure. A named region (labelled by BudgetCardTitle).' },
    { name: 'BudgetCardItem category', type: 'string', description: 'The category name. Truncates.' },
    { name: 'BudgetCardItem spent / amount', type: 'number', description: 'Whole Rupiah. Status: under < 85% ≤ near < 100% = at < over.' },
    { name: 'BudgetCardItem index', type: 'number', default: '0', description: 'Staggers the bar fill by 40ms per row.' },
    { name: 'BudgetCardTotal remaining / total', type: 'number', description: '"Rp … dari Rp …". A negative remainder is red with a true minus.' },
    { name: 'BudgetCardSkeleton rows / label', type: 'number / string', default: '4 / "Memuat anggaran"', description: 'Bones at the row height, role="status".' },
    { name: 'getBudgetStatus(spent, amount)', type: '"none" | "under" | "near" | "at" | "over"', description: 'The status rule from the backend (near = 85%).' },
  ],
  guidelines: {
    do: [
      'Sort the rows most used first, and show at most four on the dashboard.',
      'Link to the full Anggaran page with "Kelola anggaran".',
      'Say "Lebih" with the overage, never a negative "Sisa".',
    ],
    dont: [
      'Do not paint near or at the limit amber or green; the usage ramp is blue until 100%.',
      'Do not imply the budget blocks spending; it only reports.',
    ],
  },
  notes: [
    'Wonder has four Budget Card options; Option B "Remaining Rows" is the one the app ships, so this port follows it. "Budget Card Current" (spent "dari" limit in the top row, no foot) is not ported.',
    'Wonder writes "Rp 8.240.000 dari Rp 10.000.000" and the foot "… dari …"; the app writes " / ". This port uses Wonder ("dari").',
    'Wonder fills the foot with ui-well; the app has no fill. This port uses bg-well.',
    'Wonder paints the bar fill with primary-300 / primary-500 steps; the UsageBar primitive mixes primary into surface (45 / 65 / 82 / 100%) as the app does. Close, not identical.',
    'Near and at the limit have no Wonder specimen; their thresholds come from the backend (near ≥ 85%, at = exactly 100%).',
  ],
}
