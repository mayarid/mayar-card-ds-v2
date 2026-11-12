import { CARD_SKIN_LABELS, CARD_SKINS, CardFace, CardFaceSkeleton, type CardSkin, type CardStatus } from '@/components/ui/card-face'
import type { ComponentDoc, MatrixAxisItem, PropValue } from '@/docs/types'
import { toJsx } from '@/gallery/jsx'
import cardFaceSource from '@/registry/ui/card-face.tsx?raw'

const STATUSES = ['active', 'frozen', 'pending', 'closed'] as const satisfies readonly CardStatus[]
const SIZES = { hero: 420, tile: 250, thumb: 48 } as const
type Size = keyof typeof SIZES

const SAMPLE = { last4: '4821', number: '5412751234564821', expiry: '08/29', holder: 'RINA WULANDARI' }

const DEFAULTS: Record<string, PropValue> = { skin: 'midnight', status: 'active', width: 420, expiry: '••/••', freezeEffect: 'webgl' }

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
      freezeEffect={props.freezeEffect === 'css' ? 'css' : 'webgl'}
    />
  )
}

/* Matrices stay static: the CSS frost, so a grid of frozen cells opens no WebGL context. */
const renderStatic = (props: Record<string, PropValue>) => render({ ...props, freezeEffect: 'css' })

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
      freezeEffect: props.freezeEffect,
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
      { name: 'freezeEffect', type: 'select', options: ['webgl', 'css'], default: 'webgl' },
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
      render: (props) => renderStatic({ ...props, width: 300 }),
      code: (props) => code({ ...props, width: 300, freezeEffect: 'css' }),
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
      render: renderStatic,
      code: (props) => code({ ...props, freezeEffect: 'css' }),
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
      description:
        'With animated, the WebGL ice grows in on freeze (water to ice) and melts on unfreeze. Without WebGL the CSS frost does the same. Reduced motion shows the end state at once.',
      codeOnly: true,
    },
    {
      id: 'card-face/hammer',
      title: 'Interactive: hammer to unfreeze',
      description:
        'onShatter makes the ice breakable. Hit it with the hammer cursor: cracks run along the plates, plates fall out as shards, and at about 70% the rest collapses and onShatter fires. Keyboard: focus the card, then Enter or Space three times.',
      codeOnly: true,
    },
    { id: 'card-face/skins', title: 'All skins' },
    { id: 'card-face/loading', title: 'Loading', description: 'Put role="status" on the grid, not on each bone.' },
    { id: 'card-face/thumbnail', title: 'Thumbnail', description: 'The 48px face of the close-card dialog.', codeOnly: true },
  ],
  props: [
    { name: 'skin', type: CARD_SKINS.map((s) => `"${s}"`).join(' | '), default: '"midnight"', description: 'Card design (the app CARD_GRADIENTS).' },
    { name: 'last4', type: 'string', description: 'Last four digits. Shown as ••••  ••••  ••••  4821 while masked.' },
    { name: 'number', type: 'string | null', default: 'null', description: 'The full number after a reveal. Its presence is the revealed state.' },
    { name: 'holder', type: 'string', description: 'Holder line, as printed (capitals).' },
    { name: 'expiry', type: 'string', default: '"••/••"', description: 'BERLAKU value. MM/YY only when revealed.' },
    { name: 'status', type: '"active" | "frozen" | "pending" | "closed"', default: '"active"', description: 'Every status except active puts a veil and a label over the face.' },
    { name: 'closedLabel', type: 'string | null', description: 'Second line of the closed overlay, e.g. the close date.' },
    { name: 'label', type: 'string', description: 'Card nickname for the accessible name. Default: the skin name.' },
    { name: 'width', type: 'number | "auto"', default: '420', description: 'Width in px; the height follows 420:264. "auto" fills the parent.' },
    { name: 'elevated', type: 'boolean', default: 'false', description: 'The floating hero shadow of Detail Kartu (the app shadow).' },
    { name: 'animated', type: 'boolean', default: 'false', description: 'Play the freeze / thaw motion when status changes after mount.' },
    {
      name: 'freezeEffect',
      type: '"webgl" | "css"',
      default: '"webgl"',
      description: 'How a frozen card looks: the WebGL ice (the CSS frost shows until it is ready, and without WebGL), or the CSS frost only. Thumbnails below 120px always use CSS.',
    },
    {
      name: 'onShatter',
      type: '() => void',
      description: 'Makes the frozen ice breakable (hammer, or three Enter / Space hits on its control). Called once it breaks: set the card active. The card is then a named group, not an image.',
    },
    { name: 'CardFaceSkeleton width', type: 'number | "auto"', default: '420', description: 'The loading bone with the same size and corner.' },
  ],
  guidelines: {
    do: [
      'Show the number masked by default. Reveal it only after the PIN, and hide it again after a short time.',
      'Put the reveal and copy controls next to the card, as buttons with their own names.',
      'Give the card a nickname with label, so the name reads "Kartu Langganan SaaS, berakhiran 4821".',
      'Use width="auto" in a grid track and a fixed width for the hero.',
      'Use freezeEffect="css" in long lists and static grids. Keep at most a few WebGL cards on one screen.',
      'Set onShatter only on the Detail Kartu hero, together with animated, and move focus to a sensible place (the freeze button) after the card unfreezes.',
    ],
    dont: [
      'Do not put buttons or links inside the card face. It is one image for assistive tech.',
      'Do not set animated on a list that loads with frozen cards; only flip it on a status change.',
      'Do not use the card face as a colour picker swatch without a visible skin name.',
    ],
  },
  notes: [
    'Source of truth: the shipped app (CardFace.svelte, CardTile.svelte, card-gradients.ts). Wonder is the visual reference; where they differ, this port follows the app.',
    'Number and expiry use font-mono (Paper Mono), the one mono font of the system, as in the app. Wonder card/mono names JetBrains Mono.',
    'Mastercard mark: the real logo of the app (mastercard.svg), 30px high. Wonder draws two circles (card/mc-red, card/mc-orange at 90%).',
    'Chip lines: rgba(120,90,30,0.5) and Mayar swoosh #E91E78, as in the app. Wonder uses skin/gold-3 at 60% and brand/pink.',
    'Hero shadow (elevated): the app float, 0 30px 60px -22px ink 60% and 0 14px 28px -16px primary 35%. Wonder shows a smaller 0 6px 16px -6px navy shadow. The app turns the shadow on by default and off on tiles and thumbnails; here elevated is opt-in.',
    'Hero veils, as in the app: ink at 55% with a 3px blur for frozen, pending and closed. Frozen: snowflake 34px (#9DB7FF), "Kartu dibekukan" 15px, "Transaksi untuk sementara ditolak". Pending: a 32px ring spinner, "Sedang diproses", "Kartu sedang diaktifkan". Closed: circle-x 34px, "Kartu ditutup" and the date in body-sm medium. Wonder shows a midnight / royal tint, 36px Hugeicons and other copy.',
    'Tile overlay (below 300px), as in the app CardTile: frozen is a soft centre scrim (inverted 52%) with a 24px snowflake and a caption-lg title, also over the WebGL ice; pending is primary-deep at 55% with a spinning loader; a closed tile goes grey at 70% opacity with no overlay.',
    'Theme request: the app colours --color-card-swoosh (#e91e78), --color-card-chip-line (#785a1e80), --color-card-mc-overlap (#ff5f00) and --color-card-frost-icon (#9db7ff) have no token yet. The component reads these vars and falls back to the exact app value.',
    'The holder line truncates at 190px (not in the app), so a long name never runs into BERLAKU.',
    'Code-only: the WebGL ice of the app (card-freeze-effect). It refracts a snapshot of the face (html-to-image) through procedural ice (fbm noise and voronoi plates): the ice grows in on freeze, melts on thaw, and with onShatter the holder can hammer it apart. Same shader, timings (1500ms freeze, 1600ms thaw) and break rules as the app.',
    'While the WebGL ice is on screen, the hero veil and the "Kartu dibekukan" label are not shown, as in the app. The card name still ends in "dibekukan". The CSS frost and label show before the snapshot is ready, without WebGL, when the shader fails or the context is lost, in matrices (freezeEffect="css") and on thumbnails.',
    'Not in the app: a keyboard path for the hammer. The breakable card has a "Pecahkan es untuk membuka kartu" control; Enter or Space is one hit, and three hits break the ice (also without WebGL). A polite status line counts the hits.',
    'The CSS frost (corners, cold tint, sheen) is the fallback for the WebGL ice. The app fallback also draws frost ferns, an idle shimmer and an animated hammer; this port leaves those out.',
    'WebGL budget: a breakable card holds one live context while it is frozen. Look-only frozen cards share at most 4 short-lived contexts on the page, and each one is released when its ice settles.',
    'Code-only (not on the Wonder page): the 48px thumbnail and width="auto". The app has no expired state, so there is none here.',
  ],
}
