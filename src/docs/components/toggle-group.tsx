import { GridViewIcon, Menu01Icon } from '@hugeicons/core-free-icons'
import type { IconSvgElement } from '@hugeicons/react'

import { Icon } from '@/components/ui/icon'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import type { ComponentDoc, MatrixAxisItem, PropValue } from '@/docs/types'
import { toJsx } from '@/gallery/jsx'
import toggleGroupSource from '@/registry/ui/toggle-group.tsx?raw'

type Variant = 'chips' | 'segmented' | 'track'
type Size = 'md' | 'sm' | 'icon'
type Force = MatrixAxisItem['force']

const DEFAULTS = { variant: 'chips', size: 'md' }
interface Item {
  value: string
  label: string
  icon?: IconSvgElement
  iconName?: string
}

const TEXT_ITEMS: Item[] = [
  { value: '7', label: '7 hari' },
  { value: '30', label: '30 hari' },
  { value: '90', label: '90 hari' },
]
const ICON_ITEMS: Item[] = [
  { value: 'grid', label: 'Grid', icon: GridViewIcon, iconName: 'GridViewIcon' },
  { value: 'list', label: 'Daftar', icon: Menu01Icon, iconName: 'Menu01Icon' },
]

/* The first item is pressed. The state goes on `target` (default: the second item). */
function render(props: Record<string, PropValue>, force?: Force) {
  const size = props.size as Size
  const target = props.target === undefined ? 1 : Number(props.target)
  const items = size === 'icon' ? ICON_ITEMS : TEXT_ITEMS
  return (
    <ToggleGroup
      aria-label={size === 'icon' ? 'Tampilan' : 'Periode'}
      variant={props.variant as Variant}
      size={size}
      fill={Boolean(props.fill)}
      defaultValue={items[0]?.value}
      className={props.variant === 'segmented' ? 'w-64' : undefined}
    >
      {items.map((item, index) => (
        <ToggleGroupItem
          key={item.value}
          value={item.value}
          disabled={Boolean(props.disabled) && index === target}
          aria-label={item.icon ? item.label : undefined}
          data-force-state={index === target ? force : undefined}
        >
          {item.icon ? <Icon icon={item.icon} /> : item.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  )
}

function code(props: Record<string, PropValue>) {
  const { disabled, target = 1, ...rest } = props
  const icon = props.size === 'icon'
  const items = (icon ? ICON_ITEMS : TEXT_ITEMS)
    .map((item, index) =>
      toJsx(
        'ToggleGroupItem',
        {
          value: item.value,
          'aria-label': icon ? item.label : undefined,
          disabled: Boolean(disabled) && index === Number(target),
        },
        item.iconName ? `<Icon icon={${item.iconName}} />` : item.label,
      ),
    )
    .join('\n')
  return toJsx(
    'ToggleGroup',
    { 'aria-label': icon ? 'Tampilan' : 'Periode', ...rest, defaultValue: icon ? 'grid' : '7' },
    items,
    DEFAULTS,
  )
}

const STATES: MatrixAxisItem[] = [
  { label: 'Default' },
  { label: 'Hover (2nd)', force: 'hover' },
  { label: 'Focus (2nd)', force: 'focus' },
  { label: 'Disabled (2nd)', props: { disabled: true } },
  { label: 'Disabled selected', props: { disabled: true, target: 0 } },
]

export const doc: ComponentDoc = {
  slug: 'toggle-group',
  name: 'Toggle Group',
  group: 'Selection',
  description:
    'A single-select set of toggle buttons for a filter, a period or a view switch. Exactly one item stays pressed.',
  spec: 'wonder',
  wonderRef: 'Mayar Card Design System › Selection › Toggle Group',
  registry: 'toggle-group',
  baseUi: { name: 'ToggleGroup', url: 'https://base-ui.com/react/components/toggle-group' },
  source: [{ path: 'components/ui/toggle-group.tsx', code: toggleGroupSource }],
  playground: {
    controls: [
      { name: 'variant', type: 'select', options: ['chips', 'segmented', 'track'], default: 'chips' },
      { name: 'size', type: 'select', options: ['md', 'sm', 'icon'], default: 'md' },
      { name: 'fill', label: 'fill (track)', type: 'boolean', default: false },
      { name: 'disabled', label: 'disable 2nd item', type: 'boolean', default: false },
    ],
    render: (values) => render(values),
    code,
  },
  matrices: [
    {
      title: 'Variants × states',
      description: 'The first item is pressed; the state is on the second item.',
      rows: [
        { label: 'Chips MD', props: { variant: 'chips', size: 'md' } },
        { label: 'Chips SM', props: { variant: 'chips', size: 'sm' }, codeOnly: true },
        { label: 'Segmented', props: { variant: 'segmented', size: 'md' }, codeOnly: true },
        { label: 'Track MD', props: { variant: 'track', size: 'md' }, codeOnly: true },
        { label: 'Track SM', props: { variant: 'track', size: 'sm' }, codeOnly: true },
        { label: 'Track icon', props: { variant: 'track', size: 'icon' }, codeOnly: true },
        { label: 'Chips icon', props: { variant: 'chips', size: 'icon' }, codeOnly: true },
      ],
      columns: STATES,
      render,
      code,
      cellWidth: 280,
    },
  ],
  examples: [
    { id: 'toggle-group/chips', title: 'Chips (controlled)', description: 'A toolbar filter. Selected = primary tint and a primary ring.' },
    { id: 'toggle-group/small-chips', title: 'Small chips', description: 'The filter panel chip. Rows sit 12px apart.', codeOnly: true },
    { id: 'toggle-group/amount-presets', title: 'Amount presets', description: 'variant="segmented": equal columns.', codeOnly: true },
    { id: 'toggle-group/period-track', title: 'Period track', description: 'The Tabs Segmented look for a filter. The pill slides.', codeOnly: true },
    { id: 'toggle-group/view-switch', title: 'View switch', description: 'size="icon": give each item an aria-label.', codeOnly: true },
  ],
  props: [
    { name: 'variant', type: '"chips" | "segmented" | "track"', default: '"chips"', description: 'Chips, equal grid columns, or a track with a sliding pill.' },
    { name: 'size', type: '"md" | "sm" | "icon"', default: '"md"', description: '32 / 28px items; icon = 28px square items.' },
    { name: 'fill', type: 'boolean', default: 'false', description: 'Track only: spans its container with equal items.' },
    { name: 'value', type: 'string', description: 'The pressed item (controlled).' },
    { name: 'defaultValue', type: 'string', description: 'The pressed item at first render (uncontrolled).' },
    { name: 'onValueChange', type: '(value: string) => void', description: 'Called with the newly pressed item.' },
    { name: 'aria-label', type: 'string', description: 'Names the group. Required in practice.' },
    { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables every item (Base UI).' },
    { name: 'orientation / loopFocus', type: 'Base UI', description: 'Arrow-key direction and wrap.' },
    { name: 'ToggleGroupItem value', type: 'string', description: 'The item value. Also takes disabled and aria-label.' },
  ],
  guidelines: {
    do: [
      'Use it for a compact filter on a toolbar (period, status) or a grid/list switch.',
      'Name the group with aria-label, and each icon-only item with aria-label.',
    ],
    dont: ['Do not use it to switch panels. Use Tabs.', 'Do not add a close icon to a chip.'],
  },
  notes: [
    'Wonder could not be read during this port (the Wonder endpoint did not answer). The values come from the shipped Svelte component. Check them against Wonder again.',
    'Base UI ToggleGroup renders aria-pressed buttons in a group. The app default used radio semantics; this port always uses the app "pressed" mode (exactly one stays pressed).',
    'Code-only: chips SM, segmented, track (with its sliding pill) and the icon size. The app detected icon-only items by their data; this port uses size="icon".',
    'The track pill is measured with a small layout effect (local offsets) and tweens with --motion-tabs; a resize snaps it.',
  ],
}
