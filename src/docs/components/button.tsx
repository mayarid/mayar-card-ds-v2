import { Add01Icon } from '@hugeicons/core-free-icons'

import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import type { ComponentDoc, MatrixAxisItem, PropValue } from '@/docs/types'
import { toJsx } from '@/gallery/jsx'
import buttonSource from '@/registry/ui/button.tsx?raw'

type ButtonVariant = NonNullable<React.ComponentProps<typeof Button>['variant']>
type ButtonSize = NonNullable<React.ComponentProps<typeof Button>['size']>

const VARIANTS = [
  'primary',
  'secondary',
  'tertiary',
  'ghost',
  'inverted',
  'danger',
  'danger-subtle',
  'success-subtle',
  'link',
  'link-muted',
] as const satisfies readonly ButtonVariant[]
const CODE_ONLY_VARIANTS = new Set(['success-subtle', 'link-muted'])
const SIZES = ['sm', 'md', 'lg', 'xl'] as const satisfies readonly ButtonSize[]

const STATES: MatrixAxisItem[] = [
  { label: 'Default' },
  { label: 'Hover', force: 'hover' },
  { label: 'Pressed', force: 'pressed' },
  { label: 'Focus', force: 'focus' },
  { label: 'Open', force: 'open' },
  { label: 'Disabled', props: { disabled: true } },
  { label: 'Loading', props: { loading: true } },
]

const DEFAULTS = { variant: 'primary', size: 'md', shape: 'rounded' }

const label = (v: string) => v.replace(/(^|-)(\w)/g, (_, dash: string, c: string) => (dash ? ' ' : '') + c.toUpperCase())

function render(props: Record<string, PropValue>, force?: string) {
  return (
    <Button
      variant={props.variant as ButtonVariant}
      size={props.size as ButtonSize}
      shape={props.shape as 'rounded' | 'pill'}
      disabled={Boolean(props.disabled)}
      loading={Boolean(props.loading)}
      data-force-state={force}
    >
      {props.withIcon ? <Icon icon={Add01Icon} /> : null}
      {String(props.children ?? 'Button')}
    </Button>
  )
}

function code(props: Record<string, PropValue>) {
  const { children = 'Button', withIcon, ...rest } = props
  const inner = withIcon ? `<Icon icon={Add01Icon} />\n${String(children)}` : String(children)
  return toJsx('Button', rest, inner, DEFAULTS)
}

export const doc: ComponentDoc = {
  slug: 'button',
  name: 'Button',
  group: 'Actions',
  description:
    'Starts an action. One primary button for each view; the other actions use secondary, tertiary or ghost.',
  spec: 'wonder',
  wonderRef: 'Mayar Card Design System › Button Guide Section',
  registry: 'button',
  baseUi: { name: 'useRender', url: 'https://base-ui.com/react/utils/use-render' },
  source: [{ path: 'components/ui/button.tsx', code: buttonSource }],
  playground: {
    controls: [
      { name: 'variant', type: 'select', options: VARIANTS, default: 'primary' },
      { name: 'size', type: 'select', options: SIZES, default: 'md' },
      { name: 'shape', type: 'select', options: ['rounded', 'pill'], default: 'rounded' },
      { name: 'children', label: 'label', type: 'text', default: 'Simpan' },
      { name: 'withIcon', label: 'icon', type: 'boolean', default: false },
      { name: 'loading', type: 'boolean', default: false },
      { name: 'disabled', type: 'boolean', default: false },
    ],
    render: (values) => render(values),
    code,
  },
  matrices: [
    {
      title: 'Variants × states (MD)',
      description: 'Every variant at size MD in each state. Hover, pressed, focus and open are forced.',
      rows: VARIANTS.map((v) => ({ label: label(v), props: { variant: v }, codeOnly: CODE_ONLY_VARIANTS.has(v) })),
      columns: STATES,
      render,
      code,
    },
    {
      title: 'Sizes × states (Primary)',
      rows: SIZES.map((s) => ({ label: s.toUpperCase(), props: { size: s }, codeOnly: s === 'xl' })),
      columns: STATES,
      render,
      code,
    },
    {
      title: 'Options (MD)',
      description: 'Icon start, icon end, icon only and pill for each filled variant.',
      rows: VARIANTS.filter((v) => !v.startsWith('link')).map((v) => ({
        label: label(v),
        props: { variant: v },
        codeOnly: CODE_ONLY_VARIANTS.has(v),
      })),
      columns: [
        { label: 'Icon start', props: { withIcon: true } },
        { label: 'Pill', props: { shape: 'pill' } },
        { label: 'Icon only', props: { size: 'icon-md', iconOnly: true } },
      ],
      render: (props, force) =>
        props.iconOnly ? (
          <Button variant={props.variant as ButtonVariant} size="icon-md" aria-label="Tambah" data-force-state={force}>
            <Icon icon={Add01Icon} />
          </Button>
        ) : (
          render(props, force)
        ),
      code: (props) =>
        props.iconOnly
          ? toJsx('Button', { variant: props.variant, size: 'icon-md', 'aria-label': 'Tambah' }, '<Icon icon={Add01Icon} />', DEFAULTS)
          : code(props),
    },
  ],
  examples: [
    { id: 'button/with-icon', title: 'With icon', description: 'Icons go in children. SM uses 14px, the other sizes 16px.' },
    { id: 'button/icon-only', title: 'Icon only', description: 'Use an icon size and always set aria-label.' },
    {
      id: 'button/loading',
      title: 'Loading',
      description: 'The label stays in place at opacity 0, so the width does not change.',
    },
    { id: 'button/pill', title: 'Pill' },
    { id: 'button/as-link', title: 'As a link', description: 'Use render to keep the look on an <a>.' },
  ],
  props: [
    { name: 'variant', type: VARIANTS.map((v) => `"${v}"`).join(' | '), default: '"primary"', description: 'Visual weight of the action.' },
    { name: 'size', type: '"sm" | "md" | "lg" | "xl" | "icon-sm" | "icon-md" | "icon-lg" | "icon-xl"', default: '"md"', description: 'Height 28 / 32 / 36 / 40. Icon sizes are square.' },
    { name: 'shape', type: '"rounded" | "pill"', default: '"rounded"', description: 'Pill uses the full radius.' },
    { name: 'loading', type: 'boolean', default: 'false', description: 'Spinner overlay, aria-busy, no clicks.' },
    { name: 'loadingLabel', type: 'string', description: 'Text next to the spinner while loading.' },
    { name: 'disabled', type: 'boolean', default: 'false', description: 'Native disabled. On a rendered link it sets aria-disabled.' },
    { name: 'render', type: 'ReactElement | (props, state) => ReactElement', description: 'Render another element, e.g. <a href="…" />.' },
  ],
  guidelines: {
    do: [
      'Use one primary button for each view or dialog.',
      'Start the label with a verb: "Simpan", "Buat kartu".',
      'Use danger only for an action that destroys data, and confirm it first.',
    ],
    dont: ['Do not put two primary buttons next to each other.', 'Do not use link buttons for form submit.'],
  },
  notes: [
    'Wonder has an r-btn token of 12px, but every Button specimen uses 8px (SM/MD) and 10px (LG). The specimens win.',
    'success-subtle, link-muted and XL come from the shipped app and are not on the Wonder page yet.',
    'Every button has a hit area of at least 44×44 (an invisible ::before), so touch targets pass without a change to the visible size.',
  ],
}
