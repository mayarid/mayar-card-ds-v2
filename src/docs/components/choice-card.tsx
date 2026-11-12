import { BankIcon } from '@hugeicons/core-free-icons'

import { ChoiceCard, ChoiceCardGroup, ChoiceCardList, ChoiceCardPair } from '@/components/ui/choice-card'
import { Icon } from '@/components/ui/icon'
import type { ComponentDoc, MatrixAxisItem, PropValue } from '@/docs/types'
import { indent, toJsx } from '@/gallery/jsx'
import choiceCardSource from '@/registry/ui/choice-card.tsx?raw'

type Variant = 'default' | 'leading' | 'icon' | 'method' | 'list'
type Force = MatrixAxisItem['force']

const VARIANTS = ['default', 'leading', 'icon', 'method', 'list'] as const
const COPY: Record<Variant, { title: string; description?: string }> = {
  default: { title: 'Kartu virtual', description: 'Langsung aktif' },
  leading: { title: 'Tambah saldo', description: 'Dari saldo utama' },
  icon: { title: 'Perorangan', description: 'Verifikasi dengan KTP' },
  method: { title: 'Virtual account', description: 'Diproses otomatis' },
  list: { title: 'BCA' },
}

function card(variant: Variant, props: Record<string, PropValue>, force?: Force) {
  const copy = COPY[variant]
  return (
    <ChoiceCard
      variant={variant}
      value="a"
      title={copy.title}
      description={copy.description}
      icon={variant === 'icon' || variant === 'method' ? <Icon icon={BankIcon} /> : undefined}
      disabled={Boolean(props.disabled)}
      data-force-state={force}
    />
  )
}

function render(props: Record<string, PropValue>, force?: Force) {
  const variant = (props.variant as Variant | undefined) ?? 'default'
  const one = card(variant, props, force)
  return (
    <ChoiceCardGroup aria-label="Pilihan" defaultValue={props.checked ? 'a' : undefined} className="w-56">
      {variant === 'list' ? <ChoiceCardList>{one}</ChoiceCardList> : one}
    </ChoiceCardGroup>
  )
}

function code(props: Record<string, PropValue>) {
  const variant = (props.variant as Variant | undefined) ?? 'default'
  const copy = COPY[variant]
  const hasIcon = variant === 'icon' || variant === 'method'
  const cardJsx = toJsx(
    'ChoiceCard',
    {
      variant: variant === 'default' ? undefined : variant,
      value: 'a',
      title: copy.title,
      description: copy.description,
      disabled: Boolean(props.disabled),
    },
  ).replace(' />', hasIcon ? '\n  icon={<Icon icon={BankIcon} />}\n/>' : ' />')
  const inner = variant === 'list' ? `<ChoiceCardList>\n${indent(cardJsx)}\n</ChoiceCardList>` : cardJsx
  return toJsx('ChoiceCardGroup', { 'aria-label': 'Pilihan', defaultValue: props.checked ? 'a' : undefined }, inner)
}

const STATES: MatrixAxisItem[] = [
  { label: 'Default' },
  { label: 'Hover', force: 'hover' },
  { label: 'Focus', force: 'focus' },
  { label: 'Selected', props: { checked: true } },
  { label: 'Selected · focus', props: { checked: true }, force: 'focus' },
  { label: 'Disabled', props: { disabled: true } },
]

export const doc: ComponentDoc = {
  slug: 'choice-card',
  name: 'Choice Card',
  group: 'Selection',
  description:
    'An exclusive option with a title and a description. The whole card is a radio in a radio group, so arrow keys move and select.',
  spec: 'wonder',
  wonderRef: 'Mayar Card Design System › Selection › Choice Card',
  registry: 'choice-card',
  baseUi: { name: 'RadioGroup + Radio', url: 'https://base-ui.com/react/components/radio' },
  source: [{ path: 'components/ui/choice-card.tsx', code: choiceCardSource }],
  playground: {
    controls: [
      { name: 'variant', type: 'select', options: VARIANTS, default: 'default' },
      { name: 'disabled', label: 'disable 2nd card', type: 'boolean', default: false },
    ],
    render: (values) => {
      const variant = values.variant as Variant
      const hasIcon = variant === 'icon' || variant === 'method'
      const cards = ['Kartu virtual', 'Kartu fisik'].map((title, index) => (
        <ChoiceCard
          key={title}
          variant={variant}
          value={String(index)}
          title={title}
          description={variant === 'list' ? undefined : index === 0 ? 'Langsung aktif' : 'Dikirim 3–5 hari'}
          icon={hasIcon ? <Icon icon={BankIcon} /> : undefined}
          disabled={Boolean(values.disabled) && index === 1}
        />
      ))
      return (
        <ChoiceCardGroup aria-label="Jenis kartu" defaultValue="0" className="w-full max-w-2xl">
          {variant === 'list' ? <ChoiceCardList>{cards}</ChoiceCardList> : <ChoiceCardPair>{cards}</ChoiceCardPair>}
        </ChoiceCardGroup>
      )
    },
    code: (values) => {
      const variant = values.variant === 'default' ? undefined : String(values.variant)
      const layout = values.variant === 'list' ? 'ChoiceCardList' : 'ChoiceCardPair'
      const cards = [
        toJsx('ChoiceCard', { variant, value: '0', title: 'Kartu virtual', description: values.variant === 'list' ? undefined : 'Langsung aktif' }),
        toJsx('ChoiceCard', {
          variant,
          value: '1',
          title: 'Kartu fisik',
          description: values.variant === 'list' ? undefined : 'Dikirim 3–5 hari',
          disabled: Boolean(values.disabled),
        }),
      ].join('\n')
      return toJsx(
        'ChoiceCardGroup',
        { 'aria-label': 'Jenis kartu', defaultValue: '0' },
        `<${layout}>\n${indent(cards)}\n</${layout}>`,
      )
    },
  },
  matrices: [
    {
      title: 'Variants × states',
      description: 'Hover and focus are forced. Selected cards pop the radio dot in with --motion-choice-pop.',
      rows: VARIANTS.map((v) => ({ label: v[0]?.toUpperCase() + v.slice(1), props: { variant: v }, codeOnly: v !== 'default' })),
      columns: STATES,
      render,
      code,
      cellWidth: 240,
    },
  ],
  examples: [
    { id: 'choice-card/pair', title: 'Pair', description: 'Two columns at a container width of 639px or more, one column below.' },
    { id: 'choice-card/leading', title: 'Leading radio', description: 'The option card of the card actions.', codeOnly: true },
    { id: 'choice-card/icon', title: 'Icon disc', description: 'No radio dot: the ring and the tint carry the selection.', codeOnly: true },
    { id: 'choice-card/method', title: 'Method', description: 'A disabled method is dashed ("Segera hadir").', codeOnly: true },
    { id: 'choice-card/bank-list', title: 'Bank list', description: 'Compact 44px rows in one ChoiceCardList.', codeOnly: true },
  ],
  props: [
    { name: 'variant', type: '"default" | "leading" | "icon" | "method" | "list"', default: '"default"', description: 'Card layout.' },
    { name: 'value', type: 'string', description: 'The option value in the group.' },
    { name: 'title', type: 'ReactNode', description: 'Names the option (aria-labelledby).' },
    { name: 'description', type: 'ReactNode', description: 'One short line (aria-describedby).' },
    { name: 'icon', type: 'ReactNode', description: 'icon / method: the glyph in the disc or tile.' },
    { name: 'leading', type: 'ReactNode', description: 'Decorative content before the text (bank logo, alt="").' },
    { name: 'disabled', type: 'boolean', default: 'false', description: 'The card cannot be selected.' },
    { name: 'ChoiceCardGroup value / defaultValue / onValueChange', type: 'Base UI RadioGroup', description: 'The selected value, controlled or uncontrolled.' },
    { name: 'ChoiceCardGroup name / required / disabled', type: 'Base UI RadioGroup', description: 'Form name, required, disable every card.' },
    { name: 'ChoiceCardPair / ChoiceCardList', type: 'div', description: 'Layout parts: the 2-column grid and the list panel.' },
  ],
  guidelines: {
    do: [
      'Use it for an exclusive choice that needs a title and a description.',
      'Name the group with aria-label or aria-labelledby.',
      'Keep the description to one short line.',
    ],
    dont: ['Do not use it for more than about 6 options; use ChoiceCardList rows or a Select.', 'Do not change the title weight when selected.'],
  },
  notes: [
    'Wonder could not be read during this port (the Wonder endpoint did not answer). The values come from the shipped Svelte component. Check them against Wonder again.',
    'The app used native radios inside a <label>. This port uses Base UI RadioGroup + Radio (render as a <div>), with a hidden native input for forms.',
    'The app soft-disable (aria-disabled, focusable) is not ported: use disabled, or readOnly on the card (Base UI) for a focusable card that cannot be picked.',
    'leading, icon, method and list are code-only (Top Up v2, KYC v2 and card actions screens).',
  ],
}
