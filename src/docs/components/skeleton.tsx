import { Skeleton } from '@/components/ui/skeleton'
import type { ComponentDoc, PropValue } from '@/docs/types'
import { toJsx } from '@/gallery/jsx'
import source from '@/registry/ui/skeleton.tsx?raw'

type Radius = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
type Fill = 'well' | 'component'

const RADII = ['sm', 'md', 'lg', 'xl', '2xl', 'full'] as const satisfies readonly Radius[]
const SHAPES: Record<Radius, { width: number; height: number }> = {
  sm: { width: 120, height: 12 },
  md: { width: 72, height: 22 },
  lg: { width: 140, height: 32 },
  xl: { width: 160, height: 36 },
  '2xl': { width: 160, height: 56 },
  full: { width: 36, height: 36 },
}
const DEFAULTS = { radius: 'sm', fill: 'well', width: '100%', height: 12 }

function render(props: Record<string, PropValue>) {
  const radius = (props.radius ?? 'sm') as Radius
  return (
    <Skeleton
      radius={radius}
      fill={(props.fill ?? 'well') as Fill}
      shimmer={Boolean(props.shimmer)}
      width={props.width === undefined ? SHAPES[radius].width : String(props.width)}
      height={props.height === undefined ? SHAPES[radius].height : Number(props.height)}
    />
  )
}

function code(props: Record<string, PropValue>) {
  const radius = (props.radius ?? 'sm') as Radius
  return toJsx(
    'Skeleton',
    {
      width: props.width ?? SHAPES[radius].width,
      height: props.height === undefined ? SHAPES[radius].height : Number(props.height),
      radius,
      fill: props.fill,
      shimmer: props.shimmer,
    },
    undefined,
    DEFAULTS,
  )
}

export const doc: ComponentDoc = {
  slug: 'skeleton',
  name: 'Skeleton',
  group: 'Feedback',
  description: 'A placeholder bone for content that is still loading. Compose bones in the shape of the real content.',
  spec: 'code-only',
  registry: 'skeleton',
  source: [{ path: 'components/ui/skeleton.tsx', code: source }],
  playground: {
    controls: [
      { name: 'radius', type: 'select', options: RADII, default: 'sm' },
      { name: 'fill', type: 'select', options: ['well', 'component'], default: 'well' },
      { name: 'width', type: 'text', default: '160px' },
      { name: 'shimmer', type: 'boolean', default: false },
    ],
    render,
    code,
  },
  matrices: [
    {
      title: 'Radius × fill',
      description: 'sm text line, md chip, lg button or balance, xl field, 2xl card face, full pill or avatar.',
      rows: RADII.map((r) => ({ label: r, props: { radius: r }, codeOnly: true })),
      columns: [
        { label: 'Well', props: { fill: 'well' } },
        { label: 'Component', props: { fill: 'component' } },
        { label: 'Well + shimmer', props: { fill: 'well', shimmer: true }, codeOnly: true },
        { label: 'Component + shimmer', props: { fill: 'component', shimmer: true }, codeOnly: true },
      ],
      render,
      code,
      cellWidth: 180,
    },
  ],
  examples: [
    {
      id: 'skeleton/list-row',
      title: 'List rows',
      description: 'The container owns role="status", aria-busy and the label. Each bone is aria-hidden.',
      codeOnly: true,
    },
    { id: 'skeleton/balance-card', title: 'Balance card with shimmer', description: 'Shimmer stops for reduced motion.', codeOnly: true },
  ],
  props: [
    { name: 'width', type: 'number | string', default: '"100%"', description: 'A number is px; a string is any CSS length.' },
    { name: 'height', type: 'number | string', default: '12', description: '10 / 12 / 14 text, 20–24 chip, 36 field.' },
    { name: 'radius', type: '"sm" | "md" | "lg" | "xl" | "2xl" | "full"', default: '"sm"', description: 'Corner radius token.' },
    { name: 'fill', type: '"well" | "component"', default: '"well"', description: 'Component is a little darker.' },
    { name: 'shimmer', type: 'boolean', default: 'false', description: 'A moving highlight. Off for reduced motion.' },
  ],
  guidelines: {
    do: [
      'Match the size and place of the real content, so nothing moves when it loads.',
      'Put role="status", aria-busy="true" and an aria-label on the loading container.',
    ],
    dont: ['Do not use a skeleton for a load under about 300ms.', 'Do not label each bone.'],
  },
  notes: [
    'Code-only: Skeleton has no specimen on the Wonder Design System page. Values come from Skeleton.svelte.',
    'Every app skeleton is static, and the app code is final (decision, 12 Nov 2026). The shimmer prop is an opt-in addition of this port (animate-shimmer, motion-safe only). It is off by default, so a default bone equals the app bone.',
  ],
}
