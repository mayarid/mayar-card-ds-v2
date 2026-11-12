import { Add01Icon, CreditCardIcon, Wallet01Icon } from '@hugeicons/core-free-icons'

import {
  BalanceCard,
  BalanceCardActions,
  BalanceCardCaption,
  BalanceCardContent,
  BalanceCardDelta,
  BalanceCardError,
  BalanceCardHeader,
  BalanceCardHideToggle,
  BalanceCardLabel,
  BalanceCardValue,
} from '@/components/ui/balance-card'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import type { ComponentDoc, MatrixAxisItem, PropValue } from '@/docs/types'
import { indent, toJsx } from '@/gallery/jsx'
import source from '@/registry/ui/balance-card.tsx?raw'

type Variant = 'card' | 'tile' | 'strip'
type CaptionKind = 'text' | 'delta-positive' | 'delta-negative' | 'delta-warning' | 'delta-neutral' | 'low' | 'error'

const VARIANTS = ['card', 'tile', 'strip'] as const
const CAPTIONS = ['text', 'delta-positive', 'delta-negative', 'delta-warning', 'delta-neutral', 'low', 'error'] as const

function Caption({ kind }: { kind: CaptionKind }) {
  switch (kind) {
    case 'error':
      return <BalanceCardError>Gagal memuat saldo QRIS.</BalanceCardError>
    case 'low':
      return <BalanceCardCaption tone="warning">Saldo menipis</BalanceCardCaption>
    case 'text':
      return <BalanceCardCaption>Saldo akun perusahaan</BalanceCardCaption>
    default: {
      const tone = kind.replace('delta-', '') as 'positive' | 'negative' | 'warning' | 'neutral'
      return (
        <BalanceCardCaption>
          <BalanceCardDelta direction={tone === 'negative' ? 'down' : 'up'} tone={tone}>
            4,2%
          </BalanceCardDelta>
          vs 30 hari lalu
        </BalanceCardCaption>
      )
    }
  }
}

function captionCode(kind: CaptionKind): string {
  switch (kind) {
    case 'error':
      return '<BalanceCardError>Gagal memuat saldo QRIS.</BalanceCardError>'
    case 'low':
      return '<BalanceCardCaption tone="warning">Saldo menipis</BalanceCardCaption>'
    case 'text':
      return '<BalanceCardCaption>Saldo akun perusahaan</BalanceCardCaption>'
    default: {
      const tone = kind.replace('delta-', '')
      return `<BalanceCardCaption>\n  <BalanceCardDelta direction="${tone === 'negative' ? 'down' : 'up'}" tone="${tone}">4,2%</BalanceCardDelta>\n  vs 30 hari lalu\n</BalanceCardCaption>`
    }
  }
}

function render(props: Record<string, PropValue>, force?: MatrixAxisItem['force']) {
  const variant = (props.variant as Variant | undefined) ?? 'card'
  const caption = (props.caption as CaptionKind | undefined) ?? 'text'
  const value = props.caption === 'error' ? null : props.caption === 'low' ? 85000 : 48250000
  const label = String(props.label ?? 'Saldo akun')
  const common = {
    variant,
    hidden: Boolean(props.hidden),
    loading: Boolean(props.loading),
    'data-force-state': variant === 'tile' ? force : undefined,
    className: variant === 'card' ? 'w-full max-w-80' : 'w-full',
  }

  if (variant === 'strip') {
    return (
      <BalanceCard {...common}>
        <BalanceCardContent>
          <BalanceCardLabel>{label}</BalanceCardLabel>
          <BalanceCardValue value={value} />
        </BalanceCardContent>
        <BalanceCardActions>
          <Button variant="secondary">Perbarui</Button>
        </BalanceCardActions>
      </BalanceCard>
    )
  }

  const body = (
    <>
      <BalanceCardHeader>
        <BalanceCardLabel>
          <Icon icon={variant === 'tile' ? CreditCardIcon : Wallet01Icon} />
          {label}
        </BalanceCardLabel>
        {variant === 'card' && props.toggle !== false ? <BalanceCardHideToggle /> : null}
      </BalanceCardHeader>
      <BalanceCardValue value={value} />
      <Caption kind={caption} />
      {props.actions ? (
        <BalanceCardActions>
          <Button size="sm">
            <Icon icon={Add01Icon} />
            Top up saldo
          </Button>
        </BalanceCardActions>
      ) : null}
    </>
  )

  if (variant === 'tile') {
    return (
      <div className="w-full overflow-hidden rounded-2xl bg-surface shadow-control" role="tablist" aria-label={label}>
        <BalanceCard
          {...common}
          render={<button type="button" role="tab" aria-selected={Boolean(props.selected)} />}
        >
          {body}
        </BalanceCard>
      </div>
    )
  }
  return <BalanceCard {...common}>{body}</BalanceCard>
}

function code(props: Record<string, PropValue>) {
  const variant = (props.variant as Variant | undefined) ?? 'card'
  const caption = (props.caption as CaptionKind | undefined) ?? 'text'
  const label = String(props.label ?? 'Saldo akun')
  const value = caption === 'error' ? 'null' : caption === 'low' ? '85000' : '48250000'
  const rootProps = { variant: variant === 'card' ? undefined : variant, hidden: props.hidden, loading: props.loading }

  if (variant === 'strip') {
    return toJsx(
      'BalanceCard',
      rootProps,
      `<BalanceCardContent>\n  <BalanceCardLabel>${label}</BalanceCardLabel>\n  <BalanceCardValue value={${value}} />\n</BalanceCardContent>\n<BalanceCardActions>\n  <Button variant="secondary">Perbarui</Button>\n</BalanceCardActions>`,
    )
  }
  const header = `<BalanceCardHeader>\n  <BalanceCardLabel>\n    <Icon icon={Wallet01Icon} />\n    ${label}\n  </BalanceCardLabel>${
    variant === 'card' && props.toggle !== false ? '\n  <BalanceCardHideToggle />' : ''
  }\n</BalanceCardHeader>`
  const actions = props.actions
    ? `\n<BalanceCardActions>\n  <Button size="sm">\n    <Icon icon={Add01Icon} />\n    Top up saldo\n  </Button>\n</BalanceCardActions>`
    : ''
  const children = `${header}\n<BalanceCardValue value={${value}} />\n${captionCode(caption)}${actions}`
  if (variant === 'tile') {
    return `<BalanceCardGroup role="tablist" aria-label="Ringkasan saldo">\n${indent(
      toJsx('BalanceCard', { render: undefined }, children).replace(
        '<BalanceCard>',
        `<BalanceCard render={<button type="button" role="tab" aria-selected={${Boolean(props.selected)}} />}>`,
      ),
    )}\n</BalanceCardGroup>`
  }
  return toJsx('BalanceCard', rootProps, children)
}

const STATES: MatrixAxisItem[] = [
  { label: 'Default' },
  { label: 'Hidden', props: { hidden: true } },
  { label: 'Loading', props: { loading: true }, codeOnly: true },
]

const TILE_STATES: MatrixAxisItem[] = [
  { label: 'Default' },
  { label: 'Hover', force: 'hover', codeOnly: true },
  { label: 'Pressed', force: 'pressed', codeOnly: true },
  { label: 'Focus', force: 'focus', codeOnly: true },
  { label: 'Selected', props: { selected: true } },
  { label: 'Hidden', props: { hidden: true } },
]

export const doc: ComponentDoc = {
  slug: 'balance-card',
  name: 'Balance Card',
  group: 'Patterns',
  description:
    'The saldo summary: a label, an animated Rupiah figure, a caption or delta, and actions. One hide toggle masks every figure.',
  spec: 'wonder',
  wonderRef: 'Dashboard › Balance Card Tab Saldo Akun v2, Balance Card Hidden v2, Balance Card Error v2',
  registry: 'balance-card',
  baseUi: { name: 'Toggle', url: 'https://base-ui.com/react/components/toggle' },
  source: [{ path: 'components/ui/balance-card.tsx', code: source }],
  playground: {
    controls: [
      { name: 'variant', type: 'select', options: VARIANTS, default: 'card' },
      { name: 'caption', type: 'select', options: CAPTIONS, default: 'delta-positive' },
      { name: 'label', type: 'text', default: 'Saldo akun' },
      { name: 'actions', type: 'boolean', default: false },
      { name: 'hidden', type: 'boolean', default: false },
      { name: 'loading', type: 'boolean', default: false },
    ],
    render: (values) => render(values),
    code,
  },
  matrices: [
    {
      title: 'Variants × states',
      description: 'Card (standalone), tile (inside a group, here as a tab) and strip (top-up page).',
      rows: VARIANTS.map((v) => ({ label: v, props: { variant: v }, codeOnly: v !== 'tile' })),
      columns: STATES,
      render,
      code,
      cellWidth: 320,
    },
    {
      title: 'Tile interaction states',
      description: 'A tile that is a tab. Wonder shows the selected fill (component); hover, pressed and focus come from the app.',
      rows: [{ label: 'Tile', props: { variant: 'tile' } }],
      columns: TILE_STATES,
      render,
      code,
      cellWidth: 260,
    },
    {
      title: 'Captions',
      description: 'Delta tones: positive (success), negative (danger), warning (Anggaran tab). Neutral and the low-balance warning are code-only.',
      rows: [{ label: 'Card', props: { variant: 'card', toggle: false } }],
      columns: CAPTIONS.map((c) => ({
        label: c,
        props: { caption: c },
        codeOnly: c === 'delta-neutral' || c === 'low' || c === 'text',
      })),
      render,
      code,
      cellWidth: 280,
    },
  ],
  examples: [
    { id: 'balance-card/beranda-tiles', title: 'Beranda tiles', description: 'A group of tabs. One hide toggle in the chart header masks every tile.' },
    { id: 'balance-card/with-actions', title: 'With actions', description: 'A standalone card. Persist the hidden choice in onHiddenChange.', codeOnly: true },
    { id: 'balance-card/top-up-strip', title: 'Top-up strip', description: 'The refresh row from the top-up page.', codeOnly: true },
    { id: 'balance-card/low-balance', title: 'Low balance', description: 'A warning caption. The app has no low-balance rule yet.', codeOnly: true },
    { id: 'balance-card/loading', title: 'Loading', description: 'Bones replace the value and the caption; the card is aria-busy.', codeOnly: true },
  ],
  props: [
    { name: 'variant', type: '"card" | "tile" | "strip"', default: '"card" ("tile" in a group)', description: 'Card chrome, a tile for BalanceCardGroup, or a one-row strip.' },
    { name: 'hidden / defaultHidden', type: 'boolean', default: 'false', description: 'Masks every money figure inside. Controlled / uncontrolled.' },
    { name: 'onHiddenChange', type: '(hidden: boolean) => void', description: 'Called by BalanceCardHideToggle. Persist the choice here.' },
    { name: 'loading', type: 'boolean', default: 'false', description: 'Bones for the value and caption; aria-busy.' },
    { name: 'render', type: 'ReactElement', description: 'Render the card as another element, e.g. a tab button.' },
    { name: 'BalanceCardGroup columns', type: 'number', default: '4', description: 'Tiles per row from 1280px. It owns hidden / loading for its tiles.' },
    { name: 'BalanceCardValue value', type: 'number | null', description: 'Whole Rupiah. null shows "—". children: a suffix word ("terpakai").' },
    { name: 'BalanceCardValue money', type: 'boolean', default: 'true', description: 'false: not masked and no "Rp" (a percent).' },
    { name: 'BalanceCardDelta', type: 'direction: "up" | "down", tone: "positive" | "negative" | "warning" | "neutral"', description: 'Arrow and spoken word from direction, colour from tone.' },
    { name: 'BalanceCardCaption tone', type: '"muted" | "warning" | "danger"', default: '"muted"', description: 'Danger for an overspend, warning for a low balance.' },
    { name: 'BalanceCardHideToggle', type: 'Toggle props', description: 'aria-pressed while hidden. Outside a card pass pressed / onPressedChange.' },
    { name: 'BalanceCardAmount value', type: 'number', description: 'Inline money that masks with the card.' },
  ],
  guidelines: {
    do: [
      'Keep the accessible name of the hide toggle constant ("Sembunyikan saldo"); aria-pressed carries the state.',
      'Pick the delta tone from meaning: spend going up is negative, a balance going up is positive.',
      'Use BalanceCardAmount for money in captions so it masks with the figure.',
    ],
    dont: [
      'Do not mask percents; they are not money.',
      'Do not show a delta and a context caption at the same time; the delta wins.',
    ],
  },
  notes: [
    'Wonder shows the value and its delta row 6px apart inside the 12px tile gap; the caption pulls up 6px after the value.',
    'Wonder: the hide toggle is 32px with radius md and a muted glyph. It renders the ghost Button with rounded-md text-muted.',
    'Wonder prints short figures ("Rp 48,25 jt"); the app and this port print the full figure ("Rp 48.250.000") with tabular digits.',
    'The strip variant, the neutral delta, the low-balance warning and the loading bones come from the app (top-up page, Beranda), not from a Wonder specimen.',
    'The app animates with NumberFlow; this port uses the AnimatedNumber primitive (tween, no count-up on mount, reduced motion snaps).',
    'Tiles as tabs: the app wires role="tab", arrow keys and the chart panel itself. This pattern styles aria-selected and leaves the tab logic to the page (or the Tabs primitive).',
  ],
}
