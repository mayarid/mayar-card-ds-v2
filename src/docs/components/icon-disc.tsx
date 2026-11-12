import { Alert02Icon, CheckmarkCircle02Icon, CreditCardIcon, LockIcon, Search01Icon } from '@hugeicons/core-free-icons'

import { Icon } from '@/components/ui/icon'
import { IconDisc, type IconDiscShape, type IconDiscSize, type IconDiscTone } from '@/components/ui/icon-disc'
import type { ComponentDoc, PropValue } from '@/docs/types'
import { toJsx } from '@/gallery/jsx'
import source from '@/registry/ui/icon-disc.tsx?raw'

const SIZES = ['24', '28', '32', '36', '40', '44', '48', '56'] as const
const TONES = [
  'neutral',
  'well',
  'primary',
  'tint',
  'success',
  'warning',
  'danger',
  'ring',
  'surface',
] as const satisfies readonly IconDiscTone[]

const GLYPH: Record<IconDiscTone, typeof Search01Icon> = {
  neutral: Search01Icon,
  well: Search01Icon,
  primary: LockIcon,
  tint: CreditCardIcon,
  success: CheckmarkCircle02Icon,
  warning: Alert02Icon,
  danger: Alert02Icon,
  ring: CreditCardIcon,
  surface: Search01Icon,
}
const GLYPH_NAME: Record<IconDiscTone, string> = {
  neutral: 'Search01Icon',
  well: 'Search01Icon',
  primary: 'LockIcon',
  tint: 'CreditCardIcon',
  success: 'CheckmarkCircle02Icon',
  warning: 'Alert02Icon',
  danger: 'Alert02Icon',
  ring: 'CreditCardIcon',
  surface: 'Search01Icon',
}

const DEFAULTS = { size: 40, tone: 'neutral', shape: 'circle' }
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

function render(props: Record<string, PropValue>) {
  const tone = (props.tone ?? 'neutral') as IconDiscTone
  return (
    <IconDisc
      size={Number(props.size ?? 40) as IconDiscSize}
      tone={tone}
      shape={(props.shape ?? 'circle') as IconDiscShape}
    >
      <Icon icon={GLYPH[tone]} />
    </IconDisc>
  )
}

function code(props: Record<string, PropValue>) {
  const tone = (props.tone ?? 'neutral') as IconDiscTone
  const { size, ...rest } = props
  return toJsx('IconDisc', { size: size === undefined ? undefined : Number(size), ...rest }, `<Icon icon={${GLYPH_NAME[tone]}} />`, DEFAULTS)
}

export const doc: ComponentDoc = {
  slug: 'icon-disc',
  name: 'Icon Disc',
  group: 'Display',
  description:
    'A tinted circle or rounded square that holds one icon, for empty states, status pages, result views and notification rows.',
  spec: 'code-only',
  registry: 'icon-disc',
  source: [{ path: 'components/ui/icon-disc.tsx', code: source }],
  playground: {
    controls: [
      { name: 'tone', type: 'select', options: TONES, default: 'neutral' },
      { name: 'size', type: 'select', options: SIZES, default: '40' },
      { name: 'shape', type: 'select', options: ['circle', 'square'], default: 'circle' },
    ],
    render,
    code,
  },
  matrices: [
    {
      title: 'Tones × shapes (40)',
      description: 'Every tone as a circle and as a rounded square. Code-only: there is no Wonder specimen.',
      rows: TONES.map((t) => ({ label: cap(t), props: { tone: t }, codeOnly: true })),
      columns: [
        { label: 'Circle', props: { shape: 'circle' } },
        { label: 'Square', props: { shape: 'square' } },
      ],
      render,
      code,
    },
    {
      title: 'Sizes × shapes (Primary)',
      description: 'The glyph size follows the disc: 14 / 16 / 16 / 18 / 20 / 20 / 20 / 24.',
      rows: SIZES.map((s) => ({ label: s, props: { size: s, tone: 'primary' }, codeOnly: true })),
      columns: [
        { label: 'Circle', props: { shape: 'circle' } },
        { label: 'Square', props: { shape: 'square' } },
      ],
      render,
      code,
    },
  ],
  examples: [
    { id: 'icon-disc/tones', title: 'Tones', description: 'One tone for each meaning.', codeOnly: true },
    {
      id: 'icon-disc/notification-row',
      title: 'Notification row',
      description: 'The disc is decorative: the title next to it carries the meaning.',
      codeOnly: true,
    },
  ],
  props: [
    {
      name: 'size',
      type: '24 | 28 | 32 | 36 | 40 | 44 | 48 | 56',
      default: '40',
      description:
        'Diameter in px. A child svg gets the matching glyph size (24→14, 28→16, 32→16, 36→18, 40/44/48→20, 56→24). 28 is the small row disc: the step dot of the request-access tracker and the Plan Badge row (pass className="[&_svg]:size-[15px]" for its 15px sparkles glyph).',
    },
    { name: 'tone', type: TONES.map((t) => `"${t}"`).join(' | '), default: '"neutral"', description: 'Fill and glyph colour.' },
    { name: 'shape', type: '"circle" | "square"', default: '"circle"', description: 'Square uses radius md (24, 28) to 3xl (56), by size.' },
    { name: 'aria-hidden', type: 'boolean', default: 'true', description: 'Pass false (with role="img" and aria-label) only when the disc stands alone.' },
    { name: 'render', type: 'ReactElement | (props, state) => ReactElement', description: 'Render another element.' },
  ],
  guidelines: {
    do: [
      'Use neutral for "nothing here", danger for an error and success for a done result.',
      'Use ring on a tinted panel and surface on a well panel, so the disc stays visible.',
      'Use the icon size map (iconDiscIconSize) when you set the glyph size by hand.',
    ],
    dont: ['Do not use a disc as a button. It is not interactive.', 'Do not put text or two icons in one disc.'],
  },
  notes: [
    'Code-only: Icon Disc has no specimen on the Wonder Design System page. Values come from the shipped app (IconDisc.svelte); the app code is final (decision, 12 Nov 2026).',
    'Size 28 is not in the app IconDisc scale. The app draws 28px discs by hand: the request-access and KYC tracker dots (circle, 16px glyph) and the budget category chip (radius md). This port adds 28 so those and the Plan Badge row can use the primitive.',
    'The app passes the glyph size by hand; this port also sizes a child svg from the disc size, so the Icon default (16px) is overridden.',
    'Tone ring uses a 1px Tailwind ring in primary-light; the app uses the same 0 0 0 1px box-shadow.',
  ],
}
