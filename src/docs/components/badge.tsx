import { Tick02Icon } from '@hugeicons/core-free-icons'

import { Badge } from '@/components/ui/badge'
import { Icon } from '@/components/ui/icon'
import type { ComponentDoc, PropValue } from '@/docs/types'
import { toJsx } from '@/gallery/jsx'
import badgeSource from '@/registry/ui/badge.tsx?raw'

type BadgeVariant = NonNullable<React.ComponentProps<typeof Badge>['variant']>
type BadgeSize = NonNullable<React.ComponentProps<typeof Badge>['size']>

const VARIANTS = [
  'default',
  'brand',
  'danger',
  'success',
  'warning',
  'inverted',
  'outline',
  'transparent',
  'well',
] as const satisfies readonly BadgeVariant[]
const SIZES = ['sm', 'md', 'lg'] as const satisfies readonly BadgeSize[]
const DEFAULTS = { variant: 'default', size: 'md', shape: 'rounded' }

const label = (v: string) => v[0]?.toUpperCase() + v.slice(1)

function render(props: Record<string, PropValue>) {
  return (
    <Badge variant={props.variant as BadgeVariant} size={props.size as BadgeSize} shape={props.shape as 'rounded' | 'pill'}>
      {props.withIcon ? <Icon icon={Tick02Icon} size={12} /> : null}
      {String(props.children ?? 'Badge')}
    </Badge>
  )
}

function code(props: Record<string, PropValue>) {
  const { children = 'Badge', withIcon, ...rest } = props
  const inner = withIcon ? `<Icon icon={Tick02Icon} size={12} />\n${String(children)}` : String(children)
  return toJsx('Badge', rest, inner, DEFAULTS)
}

export const doc: ComponentDoc = {
  slug: 'badge',
  name: 'Badge',
  group: 'Display',
  description: 'A static status or category label. Never a button, a link or a nav count.',
  spec: 'wonder',
  wonderRef: 'Mayar Card Design System › Badge',
  registry: 'badge',
  baseUi: { name: 'useRender', url: 'https://base-ui.com/react/utils/use-render' },
  source: [{ path: 'components/ui/badge.tsx', code: badgeSource }],
  playground: {
    controls: [
      { name: 'variant', type: 'select', options: VARIANTS, default: 'default' },
      { name: 'size', type: 'select', options: SIZES, default: 'md' },
      { name: 'shape', type: 'select', options: ['rounded', 'pill'], default: 'rounded' },
      { name: 'children', label: 'label', type: 'text', default: 'Aktif' },
      { name: 'withIcon', label: 'icon', type: 'boolean', default: false },
    ],
    render,
    code,
  },
  matrices: [
    {
      title: 'Variants × sizes',
      description: 'Rounded shape. LG uses radius md.',
      rows: VARIANTS.map((v) => ({ label: label(v), props: { variant: v }, codeOnly: v === 'well' })),
      columns: SIZES.map((s) => ({ label: s.toUpperCase(), props: { size: s } })),
      render,
      code,
      cellWidth: 120,
    },
    {
      title: 'Shapes and icon (MD)',
      rows: VARIANTS.map((v) => ({ label: label(v), props: { variant: v }, codeOnly: v === 'well' })),
      columns: [
        { label: 'Rounded' },
        { label: 'Pill', props: { shape: 'pill' } },
        { label: 'Icon', props: { withIcon: true } },
        { label: 'Pill + icon', props: { shape: 'pill', withIcon: true } },
      ],
      render,
      code,
      cellWidth: 140,
    },
    {
      title: 'Sizes × shapes (Brand)',
      rows: SIZES.map((s) => ({ label: s.toUpperCase(), props: { size: s, variant: 'brand' } })),
      columns: [
        { label: 'Rounded' },
        { label: 'Pill', props: { shape: 'pill' } },
        { label: 'Icon', props: { withIcon: true } },
        { label: 'Pill + icon', props: { shape: 'pill', withIcon: true } },
      ],
      render,
      code,
      cellWidth: 140,
    },
  ],
  examples: [
    { id: 'badge/status', title: 'Status', description: 'One variant for each meaning. well is the "not started" chip.' },
    { id: 'badge/with-icon', title: 'With icon', description: 'A 12px icon first in children. The review chip uses a 14px icon.' },
    { id: 'badge/sizes', title: 'Sizes', description: 'SM 16, MD 20, LG 24.' },
    { id: 'badge/in-a-row', title: 'In a list row' },
  ],
  props: [
    { name: 'variant', type: VARIANTS.map((v) => `"${v}"`).join(' | '), default: '"default"', description: 'Meaning and fill.' },
    { name: 'size', type: '"sm" | "md" | "lg"', default: '"md"', description: 'Height 16 / 20 / 24.' },
    { name: 'shape', type: '"rounded" | "pill"', default: '"rounded"', description: 'Pill adds 2px of side padding.' },
    { name: 'render', type: 'ReactElement | (props, state) => ReactElement', description: 'Render another element.' },
  ],
  guidelines: {
    do: ['Use one word or a short phrase.', 'Match the variant to the meaning: success, warning, danger.'],
    dont: ['Do not make a badge clickable. Use a Button or a Toggle Group chip.', 'Do not use a badge as a nav count. Use TabsCount.'],
  },
  notes: [
    'Wonder could not be read during this port (the Wonder endpoint did not answer). The values come from the shipped Svelte component (Wonder one.aaa geometry). Check them against Wonder again.',
    'well is code-only (the console "Belum" chip).',
    'The app had an icon prop (12 or 14px). This port takes the icon in children; the start padding shrinks by 2px when the first child is an svg.',
  ],
}
