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

/* The first item is pressed (the first two with `multiple`). The state goes on `target` (default: the second item). */
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
      {...(props.multiple
        ? { multiple: true as const, defaultValue: items.slice(0, 2).map((item) => item.value) }
        : { defaultValue: items[0]?.value })}
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
  const { disabled, target = 1, multiple, ...rest } = props
  const icon = props.size === 'icon'
  const first = icon ? 'grid' : '7'
  const defaultValue = multiple ? `{[${icon ? "'grid', 'list'" : "'7', '30'"}]}` : first
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
    { 'aria-label': icon ? 'Tampilan' : 'Periode', ...rest, multiple: Boolean(multiple) },
    items,
    DEFAULTS,
  ).replace(/^<ToggleGroup([^>]*?)>/, (_, attrs: string) =>
    multiple ? `<ToggleGroup${attrs} defaultValue=${defaultValue}>` : `<ToggleGroup${attrs} defaultValue="${first}">`,
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
      { name: 'multiple', type: 'boolean', default: false },
      { name: 'disabled', label: 'disable 2nd item', type: 'boolean', default: false },
    ],
    render: (values) => render(values),
    code,
  },
  matrices: [
    {
      title: 'Variants × states',
      description: 'The first item is pressed (the first two in the multiple rows); the state is on the second item.',
      rows: [
        { label: 'Chips MD', props: { variant: 'chips', size: 'md' } },
        { label: 'Chips SM', props: { variant: 'chips', size: 'sm' }, codeOnly: true },
        { label: 'Segmented', props: { variant: 'segmented', size: 'md' }, codeOnly: true },
        { label: 'Track MD', props: { variant: 'track', size: 'md' }, codeOnly: true },
        { label: 'Track SM', props: { variant: 'track', size: 'sm' }, codeOnly: true },
        { label: 'Track icon', props: { variant: 'track', size: 'icon' }, codeOnly: true },
        { label: 'Chips icon', props: { variant: 'chips', size: 'icon' }, codeOnly: true },
        { label: 'Chips SM multiple', props: { variant: 'chips', size: 'sm', multiple: true }, codeOnly: true },
        { label: 'Track multiple', props: { variant: 'track', size: 'md', multiple: true }, codeOnly: true },
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
    { id: 'toggle-group/multiple', title: 'Multiple (controlled)', description: 'multiple: any number of items, none included. The value is a string[].', codeOnly: true },
    { id: 'toggle-group/view-switch', title: 'View switch', description: 'size="icon": give each item an aria-label.', codeOnly: true },
  ],
  props: [
    { name: 'variant', type: '"chips" | "segmented" | "track"', default: '"chips"', description: 'Chips, equal grid columns, or a track with a sliding pill.' },
    { name: 'size', type: '"md" | "sm" | "icon"', default: '"md"', description: 'Chips and track: 32 / 28px items. icon: 28px square items. Segmented has one size (32px).' },
    { name: 'fill', type: 'boolean', default: 'false', description: 'Track only: spans its container with equal items.' },
    { name: 'multiple', type: 'boolean', default: 'false', description: 'false: exactly one item stays pressed, and value is a string. true: any number of items can be pressed (none included), and value, defaultValue and onValueChange use string[]. A track in multiple mode has no sliding pill: each pressed item gets the white pill look.' },
    { name: 'value', type: 'string | string[]', description: 'The pressed item (controlled). string[] when multiple.' },
    { name: 'defaultValue', type: 'string | string[]', description: 'The pressed item at first render (uncontrolled). string[] when multiple.' },
    { name: 'onValueChange', type: '(value: string) => void | (value: string[]) => void', description: 'Single: called with the newly pressed item (not on a re-press of the pressed item). Multiple: called with every pressed item; [] means none.' },
    { name: 'aria-label', type: 'string', description: 'Names the group. Required in practice.' },
    { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables every item (Base UI).' },
    { name: 'orientation', type: '"horizontal" | "vertical"', default: '"horizontal"', description: 'Arrow-key direction. Vertical stacks chips and track items in a column.' },
    { name: 'loopFocus', type: 'boolean', default: 'true', description: 'Arrow keys wrap at the ends (Base UI; the app loops too).' },
    { name: 'ToggleGroupItem value', type: 'string', description: 'The item value. Also takes disabled and aria-label (an icon-only item also uses it as its title).' },
  ],
  guidelines: {
    do: [
      'Use it for a compact filter on a toolbar (period, status) or a grid/list switch.',
      'Use multiple for a filter that takes several values (statuses, categories). Treat an empty array as "all".',
      'Name the group with aria-label, and each icon-only item with aria-label.',
    ],
    dont: ['Do not use it to switch panels. Use Tabs.', 'Do not add a close icon to a chip.'],
  },
  notes: [
    'The shipped app is the source of truth (decision, 12 Nov 2026). Values and behaviour come from ToggleGroup.svelte; Wonder is the visual reference.',
    'Semantics: the app default renders radios (role="radio") and its `pressed` mode renders aria-pressed buttons. Base UI ToggleGroup only renders aria-pressed buttons, so this port always uses the app `pressed` mode: exactly one item stays pressed.',
    'Focus: as in the app, Tab into the group lands on the pressed item (Base UI alone would start on the first item).',
    'multiple is new in this port (the app has no multi-select toggle group). It is the Base UI multiple mode with a string[] value.',
    'The app makes an item square (32px) when it holds only an icon, and switches to the 28px view-switch geometry when every item is icon-only. This port uses size="icon" for the view switch; a single icon item inside a text group is not square.',
    'The app has no small segmented item, so size="sm" on segmented keeps the 32px radius-lg item.',
    'Wonder shows only the chips (MD). Chips SM, segmented, track, the icon size and multiple are code-only.',
    'The track pill is measured with a small layout effect (local offsets) and tweens with --motion-tabs and ease-smooth-out, as the app slidingPill does; a resize snaps it.',
  ],
}
