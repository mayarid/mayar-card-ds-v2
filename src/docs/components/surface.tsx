import { Surface } from '@/components/ui/surface'
import type { ComponentDoc, PropValue } from '@/docs/types'
import { toJsx } from '@/gallery/jsx'
import surfaceSource from '@/registry/ui/surface.tsx?raw'

type Kind = 'container' | 'subtle' | 'strong' | 'card' | 'transparent'
type Radius = 'lg' | 'xl' | '2xl' | '3xl'

const KINDS = ['container', 'subtle', 'strong', 'card', 'transparent'] as const
const RADII = ['lg', 'xl', '2xl', '3xl'] as const
const DEFAULTS = { variant: 'container', radius: '2xl' }

const label = (v: string) => v[0]?.toUpperCase() + v.slice(1)

function render(props: Record<string, PropValue>) {
  if (props.layout === 'divided') {
    return (
      <Surface variant={props.variant as Kind} radius={props.radius as Radius} elevated={Boolean(props.elevated)} divided className="w-52">
        <div className="px-4 py-3 text-body-sm">Limit harian</div>
        <div className="px-4 py-3 text-body-sm">Limit bulanan</div>
      </Surface>
    )
  }
  if (props.layout === 'nested') {
    return (
      <Surface variant="card" radius="3xl" padding={4} className="w-52">
        <Surface elevated padding={12} nested={{ outerRadius: '3xl', padding: 4, ring: 'subtle' }} className="text-body-sm">
          3 dari 10 kartu
        </Surface>
      </Surface>
    )
  }
  return (
    <Surface variant={props.variant as Kind} radius={props.radius as Radius} elevated={Boolean(props.elevated)} className="w-40 text-body-sm">
      {label(String(props.variant ?? 'container'))}
    </Surface>
  )
}

function code(props: Record<string, PropValue>) {
  const { layout, ...rest } = props
  if (layout === 'divided') {
    return toJsx(
      'Surface',
      { ...rest, divided: true },
      '<div className="px-4 py-3">Limit harian</div>\n<div className="px-4 py-3">Limit bulanan</div>',
      DEFAULTS,
    )
  }
  if (layout === 'nested') {
    return `<Surface variant="card" radius="3xl" padding={4}>\n  <Surface elevated padding={12} nested={{ outerRadius: '3xl', padding: 4, ring: 'subtle' }}>\n    3 dari 10 kartu\n  </Surface>\n</Surface>`
  }
  return toJsx('Surface', rest, label(String(props.variant ?? 'container')), DEFAULTS)
}

export const doc: ComponentDoc = {
  slug: 'surface',
  name: 'Surface',
  group: 'Surfaces',
  description: 'A generic layout surface for panels, grouped rows and nested related cards. Not the bank card face.',
  spec: 'wonder',
  wonderRef: 'Mayar Card Design System › Card (Surface)',
  registry: 'surface',
  baseUi: { name: 'useRender', url: 'https://base-ui.com/react/utils/use-render' },
  source: [{ path: 'components/ui/surface.tsx', code: surfaceSource }],
  playground: {
    controls: [
      { name: 'variant', type: 'select', options: KINDS, default: 'container' },
      { name: 'radius', type: 'select', options: RADII, default: '2xl' },
      { name: 'elevated', type: 'boolean', default: true },
      { name: 'layout', type: 'select', options: ['plain', 'divided', 'nested'], default: 'plain' },
    ],
    render: (values) => render(values.layout === 'plain' ? { ...values, layout: undefined } : values),
    code: (values) => code(values.layout === 'plain' ? { ...values, layout: undefined } : values),
  },
  matrices: [
    {
      title: 'Kinds × elevation',
      description: 'Radius 2xl. Container is the white surface.',
      rows: KINDS.map((k) => ({ label: label(k), props: { variant: k } })),
      columns: [{ label: 'Flat' }, { label: 'Elevated', props: { elevated: true } }],
      render,
      code,
      cellWidth: 200,
    },
    {
      title: 'Radius (Container, elevated)',
      rows: RADII.map((r) => ({ label: r, props: { radius: r, elevated: true } })),
      columns: [{ label: 'Container', props: { variant: 'container' } }, { label: 'Subtle', props: { variant: 'subtle' } }],
      render,
      code,
      cellWidth: 200,
    },
    {
      title: 'Layouts',
      description: 'Wonder specimens: Elevated, Container Elevated, Divided and Nested.',
      rows: [
        { label: 'Elevated', props: { variant: 'container', elevated: true } },
        { label: 'Divided', props: { layout: 'divided', elevated: true } },
        { label: 'Nested', props: { layout: 'nested' } },
      ],
      columns: [{ label: 'Specimen' }],
      render,
      code,
      cellWidth: 240,
    },
  ],
  examples: [
    { id: 'surface/elevated', title: 'Elevated', description: 'A container surface with the control shadow.' },
    { id: 'surface/divided', title: 'Divided', description: 'Rows own their padding. The line starts 16px in.' },
    { id: 'surface/nested', title: 'Nested', description: 'Inner radius = outer radius − padding (16 − 4 = 12).' },
    { id: 'surface/kinds', title: 'Kinds' },
  ],
  props: [
    { name: 'variant', type: KINDS.map((k) => `"${k}"`).join(' | '), default: '"container"', description: 'Fill. container is white.' },
    { name: 'radius', type: '"lg" | "xl" | "2xl" | "3xl"', default: '"2xl"', description: '8 / 10 / 12 / 16px.' },
    { name: 'elevated', type: 'boolean', default: 'false', description: 'The control shadow (ring + drop + ambient).' },
    { name: 'divided', type: 'boolean', default: 'false', description: 'A hairline between direct children. Padding becomes 0.' },
    { name: 'padding', type: 'number', default: '16 (0 when divided)', description: 'Padding in px.' },
    { name: 'nested', type: "{ outerRadius, padding, ring?: 'subtle' }", description: 'Only for a visibly related child: radius = outer − padding.' },
    { name: 'render', type: 'ReactElement | (props, state) => ReactElement', description: 'Render another element, e.g. <section />.' },
  ],
  guidelines: {
    do: ['Use nested only for a child that is visibly related to its parent.', 'Let divided rows own their 16px / 12px padding.'],
    dont: ['Do not rebuild the bank card face with Surface.', 'Do not nest when the gap is more than 24px; the child keeps its own radius.'],
  },
  notes: [
    'Wonder could not be read during this port (the Wonder endpoint did not answer). The values come from the shipped Svelte component (Wonder one.mop). Check them against Wonder again.',
    'variant="container" paints the white surface, not the code-only `container` colour token.',
    'The related ring is requested on the child (nested.ring) and drawn by the parent with :has().',
    'The app deprecated `surface` prop alias is not ported.',
  ],
}
