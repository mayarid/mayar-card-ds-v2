import { CARD_SKIN_LABELS, CARD_SKINS, CardFace, CardFaceSkeleton, type CardSkin, type CardStatus } from '@/components/ui/card-face'
import type { ComponentDoc, MatrixAxisItem, PropValue } from '@/docs/types'
import { toJsx } from '@/gallery/jsx'
import cardFaceSource from '@/registry/ui/card-face.tsx?raw'

const STATUSES = ['active', 'frozen', 'pending', 'closed'] as const satisfies readonly CardStatus[]
const SIZES = { hero: 420, tile: 250, thumb: 48 } as const
type Size = keyof typeof SIZES

const SAMPLE = { last4: '4821', number: '5412751234564821', expiry: '08/29', holder: 'RINA WULANDARI' }

const DEFAULTS: Record<string, PropValue> = { skin: 'midnight', status: 'active', width: 420, expiry: '••/••' }

const STATE_COLUMNS: MatrixAxisItem[] = [
  { label: 'Active (masked)', props: { status: 'active' } },
  { label: 'Revealed', props: { status: 'active', revealed: true } },
  { label: 'Frozen', props: { status: 'frozen' } },
  { label: 'Pending', props: { status: 'pending' } },
  { label: 'Closed', props: { status: 'closed', closedLabel: '28 Okt 2026, 14:20' } },
]

function render(props: Record<string, PropValue>) {
  const width = typeof props.width === 'number' ? props.width : SIZES[(props.size as Size) ?? 'hero']
  if (props.loading) return <CardFaceSkeleton width={width} />
  return (
    <CardFace
      skin={(props.skin as CardSkin) ?? 'midnight'}
      status={(props.status as CardStatus) ?? 'active'}
      last4={String(props.last4 ?? SAMPLE.last4)}
      number={props.revealed ? SAMPLE.number : null}
      expiry={props.revealed ? SAMPLE.expiry : '••/••'}
      holder={String(props.holder ?? SAMPLE.holder)}
      closedLabel={props.closedLabel ? String(props.closedLabel) : null}
      width={width}
      elevated={Boolean(props.elevated)}
    />
  )
}

function code(props: Record<string, PropValue>) {
  const width = typeof props.width === 'number' ? props.width : SIZES[(props.size as Size) ?? 'hero']
  if (props.loading) return toJsx('CardFaceSkeleton', { width }, undefined, { width: 420 })
  return toJsx(
    'CardFace',
    {
      skin: props.skin,
      status: props.status,
      last4: String(props.last4 ?? SAMPLE.last4),
      number: props.revealed ? SAMPLE.number : undefined,
      expiry: props.revealed ? SAMPLE.expiry : undefined,
      holder: String(props.holder ?? SAMPLE.holder),
      closedLabel: props.closedLabel,
      width,
      elevated: props.elevated,
    },
    undefined,
    DEFAULTS,
  )
}

export const doc: ComponentDoc = {
  slug: 'card-face',
  name: 'Card Face',
  group: 'Patterns',
  description: 'The Mayar virtual card: one of nine skins, the chip, number, holder, expiry and Mastercard mark, with a veil for frozen, pending and closed cards.',
  spec: 'wonder',
  wonderRef: 'Dashboard › Card Face Master v2, Card Skin * v2, Kartu Owner Grid v2, Detail Kartu * v2, Kartu Loading v2',
  registry: 'card-face',
  source: [{ path: 'components/ui/card-face.tsx', code: cardFaceSource }],
  playground: {
    controls: [
      { name: 'skin', type: 'select', options: CARD_SKINS, default: 'midnight' },
      { name: 'status', type: 'select', options: STATUSES, default: 'active' },
      { name: 'size', type: 'select', options: ['hero', 'tile', 'thumb'], default: 'hero' },
      { name: 'revealed', type: 'boolean', default: false },
      { name: 'elevated', type: 'boolean', default: true },
      { name: 'holder', type: 'text', default: SAMPLE.holder },
      { name: 'last4', type: 'text', default: SAMPLE.last4 },
    ],
    render: (values) => render({ ...values, closedLabel: values.status === 'closed' ? '28 Okt 2026, 14:20' : undefined }),
    code: (values) => code({ ...values, closedLabel: values.status === 'closed' ? '28 Okt 2026, 14:20' : undefined }),
  },
  matrices: [
    {
      title: 'Skins × states (300px)',
      description:
        'All nine skins in every state. 300px is the smallest width with the full overlay (icon, title and body).',
      rows: CARD_SKINS.map((skin) => ({ label: CARD_SKIN_LABELS[skin], props: { skin } })),
      columns: STATE_COLUMNS,
      render: (props) => render({ ...props, width: 300 }),
      code: (props) => code({ ...props, width: 300 }),
      cellWidth: 316,
    },
    {
      title: 'Sizes × states (Midnight)',
      description:
        'Hero 420 (Detail Kartu), tile 250 (Kartu grid, fills its track with width="auto"), thumbnail 48 (close-card dialog). A tile shows a compact overlay; a closed tile goes grey with no overlay.',
      rows: [
        { label: 'Hero 420', props: { size: 'hero', elevated: true } },
        { label: 'Tile 250', props: { size: 'tile' } },
        { label: 'Thumb 48', props: { size: 'thumb' }, codeOnly: true },
      ],
      columns: [...STATE_COLUMNS, { label: 'Loading', props: { loading: true } }],
      render,
      code,
      cellWidth: 436,
    },
  ],
  examples: [
    {
      id: 'card-face/detail-hero',
      title: 'Detail hero with reveal',
      description:
        'The reveal control sits next to the card, with aria-pressed and aria-controls. The card name gets the full number only while it is revealed.',
    },
    {
      id: 'card-face/grid-tile',
      title: 'Grid tile',
      description: 'width="auto" fills the tile. The card name is the link and stretches over the tile.',
    },
    {
      id: 'card-face/freeze',
      title: 'Freeze and unfreeze',
      description: 'With animated, the frost grows in on freeze and fades on unfreeze. Reduced motion shows the end state at once.',
      codeOnly: true,
    },
    { id: 'card-face/skins', title: 'All skins' },
    { id: 'card-face/loading', title: 'Loading', description: 'Put role="status" on the grid, not on each bone.' },
    { id: 'card-face/thumbnail', title: 'Thumbnail', description: 'The 48px face of the close-card dialog.', codeOnly: true },
  ],
  props: [
    { name: 'skin', type: CARD_SKINS.map((s) => `"${s}"`).join(' | '), default: '"midnight"', description: 'Card design (Wonder skin/* gradient).' },
    { name: 'last4', type: 'string', description: 'Last four digits. Shown as ••••  ••••  ••••  4821 while masked.' },
    { name: 'number', type: 'string | null', default: 'null', description: 'The full number after a reveal. Its presence is the revealed state.' },
    { name: 'holder', type: 'string', description: 'Holder line, as printed (capitals).' },
    { name: 'expiry', type: 'string', default: '"••/••"', description: 'BERLAKU value. MM/YY only when revealed.' },
    { name: 'status', type: '"active" | "frozen" | "pending" | "closed"', default: '"active"', description: 'Every status except active puts a veil and a label over the face.' },
    { name: 'closedLabel', type: 'string | null', description: 'Second line of the closed overlay, e.g. the close date.' },
    { name: 'label', type: 'string', description: 'Card nickname for the accessible name. Default: the skin name.' },
    { name: 'width', type: 'number | "auto"', default: '420', description: 'Width in px; the height follows 420:264. "auto" fills the parent.' },
    { name: 'elevated', type: 'boolean', default: 'false', description: 'The floating hero shadow of Detail Kartu.' },
    { name: 'animated', type: 'boolean', default: 'false', description: 'Play the freeze / thaw motion when status changes after mount.' },
    { name: 'CardFaceSkeleton width', type: 'number | "auto"', default: '420', description: 'The loading bone with the same size and corner.' },
  ],
  guidelines: {
    do: [
      'Show the number masked by default. Reveal it only after the PIN, and hide it again after a short time.',
      'Put the reveal and copy controls next to the card, as buttons with their own names.',
      'Give the card a nickname with label, so the name reads "Kartu Langganan SaaS, berakhiran 4821".',
      'Use width="auto" in a grid track and a fixed width for the hero.',
    ],
    dont: [
      'Do not put buttons or links inside the card face. It is one image for assistive tech.',
      'Do not set animated on a list that loads with frozen cards; only flip it on a status change.',
      'Do not use the card face as a colour picker swatch without a visible skin name.',
    ],
  },
  notes: [
    'Number and expiry use font-mono (Paper Mono), the one mono font of the system. Wonder card/mono names JetBrains Mono; by decision, Paper Mono replaces it, as in the shipped app.',
    'Mastercard mark: Wonder draws two circles (card/mc-red, card/mc-orange at 90%). The app uses the real mastercard.svg. This port follows Wonder.',
    'Chip lines: Wonder skin/gold-3 at 60%; the app rgba(120,90,30,0.5). Mayar swoosh: Wonder brand/pink; the app #E91E78. This port follows Wonder.',
    'Hero shadow: Wonder 0 6px 16px -6px and 0 1px 3px in #0e0f1a; the app uses a larger ink + primary float. This port follows Wonder (built from the overlay token).',
    'Frozen veil: Wonder skin/midnight-1 at 62%, snowflake primary-300 36px, title body-base, body "Transaksi baru ditolak sampai kartu dibuka". The app: ink 55%, #9db7ff 34px, 15px, "Transaksi untuk sementara ditolak". This port follows Wonder.',
    'Pending veil: Wonder skin/royal-3 at 55% with Loading03; the app ink 55% (hero) and primary-deep 55% (tile). This port follows Wonder. Closed veil: ink 55% + grayscale in both.',
    'Code-only: the frost layer over the frozen veil and the freeze / thaw motion. The app has a WebGL ice sheet that the holder can break with a hammer, procedural frost ferns and an idle shimmer; this port keeps the CSS frost (corners, cold tint, sheen) and leaves out WebGL, the hammer, ferns and shimmer.',
    'Code-only: the 48px thumbnail, width="auto", and the closed tile (grey at 70% opacity, no overlay). The app has no expired state, so there is none here.',
    'The Wonder skin specimens leave out the number text-shadow that the master has. This port keeps it (master and app).',
  ],
}
