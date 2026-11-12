import { Add01Icon, Alert02Icon, CreditCardIcon, Search01Icon } from '@hugeicons/core-free-icons'

import { Button } from '@/components/ui/button'
import {
  EmptyState,
  EmptyStateActions,
  EmptyStateDescription,
  EmptyStateIcon,
  EmptyStateText,
  EmptyStateTitle,
} from '@/components/ui/empty-state'
import { Icon } from '@/components/ui/icon'
import type { IconDiscShape, IconDiscTone } from '@/components/ui/icon-disc'
import type { ComponentDoc, PropValue } from '@/docs/types'
import { indent, toJsx } from '@/gallery/jsx'
import source from '@/registry/ui/empty-state.tsx?raw'

const TONES = ['neutral', 'well', 'primary', 'tint', 'success', 'warning', 'danger', 'ring', 'surface'] as const

const COPY: Record<string, { icon: typeof Search01Icon; iconName: string; title: string; text: string; action: string }> = {
  neutral: { icon: CreditCardIcon, iconName: 'CreditCardIcon', title: 'Belum ada kartu', text: 'Buat kartu pertama untuk mulai belanja.', action: 'Buat kartu' },
  danger: { icon: Alert02Icon, iconName: 'Alert02Icon', title: 'Gagal memuat', text: 'Periksa koneksi, lalu coba lagi.', action: 'Coba lagi' },
  search: { icon: Search01Icon, iconName: 'Search01Icon', title: 'Tidak ada yang cocok', text: 'Ubah kata kunci atau hapus filter.', action: 'Hapus filter' },
}

function copyFor(tone: string) {
  return tone === 'danger' ? COPY.danger! : tone === 'neutral' ? COPY.neutral! : COPY.search!
}

function render(props: Record<string, PropValue>) {
  const tone = String(props.tone ?? 'neutral')
  const c = copyFor(tone)
  return (
    <EmptyState size={(props.size ?? 'md') as 'sm' | 'md'} className="w-80">
      <EmptyStateIcon tone={tone as IconDiscTone} shape={(props.shape ?? 'circle') as IconDiscShape}>
        <Icon icon={c.icon} />
      </EmptyStateIcon>
      <EmptyStateText>
        <EmptyStateTitle>{c.title}</EmptyStateTitle>
        {props.description === false ? null : <EmptyStateDescription>{c.text}</EmptyStateDescription>}
      </EmptyStateText>
      {props.actions === false ? null : (
        <EmptyStateActions>
          <Button variant={tone === 'neutral' ? 'primary' : 'secondary'} size={props.size === 'sm' ? 'sm' : 'md'}>
            {tone === 'neutral' ? <Icon icon={Add01Icon} /> : null}
            {c.action}
          </Button>
        </EmptyStateActions>
      )}
    </EmptyState>
  )
}

function code(props: Record<string, PropValue>) {
  const tone = String(props.tone ?? 'neutral')
  const c = copyFor(tone)
  const text = [toJsx('EmptyStateTitle', {}, c.title)]
  if (props.description !== false) text.push(toJsx('EmptyStateDescription', {}, c.text))
  const parts = [
    toJsx('EmptyStateIcon', { tone, shape: props.shape }, `<Icon icon={${c.iconName}} />`, { tone: 'neutral', shape: 'circle' }),
    `<EmptyStateText>\n${indent(text.join('\n'))}\n</EmptyStateText>`,
  ]
  if (props.actions !== false) {
    parts.push(
      toJsx(
        'EmptyStateActions',
        {},
        toJsx('Button', { variant: tone === 'neutral' ? undefined : 'secondary', size: props.size === 'sm' ? 'sm' : undefined }, c.action),
      ),
    )
  }
  return toJsx('EmptyState', { size: props.size }, parts.join('\n'), { size: 'md' })
}

export const doc: ComponentDoc = {
  slug: 'empty-state',
  name: 'Empty State',
  group: 'Feedback',
  description:
    'A centred empty, error or no-match state: an icon disc, a title, one line of text and actions. It sits inside the panel it replaces.',
  spec: 'code-only',
  registry: 'empty-state',
  source: [{ path: 'components/ui/empty-state.tsx', code: source }],
  playground: {
    controls: [
      { name: 'size', type: 'select', options: ['md', 'sm'], default: 'md' },
      { name: 'tone', type: 'select', options: TONES, default: 'neutral' },
      { name: 'shape', type: 'select', options: ['circle', 'square'], default: 'circle' },
      { name: 'description', type: 'boolean', default: true },
      { name: 'actions', type: 'boolean', default: true },
    ],
    render,
    code,
  },
  matrices: [
    {
      title: 'Sizes × content',
      description: 'md: 48px disc, 16px gap (page panels). sm: 40px disc, 12px gap (modules, console cards).',
      rows: [
        { label: 'MD', props: { size: 'md' }, codeOnly: true },
        { label: 'SM', props: { size: 'sm' }, codeOnly: true },
      ],
      columns: [
        { label: 'Full', props: {} },
        { label: 'No actions', props: { actions: false } },
        { label: 'Title only', props: { actions: false, description: false } },
        { label: 'Square disc', props: { shape: 'square' } },
      ],
      render,
      code,
      cellWidth: 340,
    },
    {
      title: 'Disc tones (SM)',
      description: 'The disc takes every Icon Disc tone. Use neutral for empty, danger for an error.',
      rows: [
        { label: 'Neutral', props: { tone: 'neutral' }, codeOnly: true },
        { label: 'Danger', props: { tone: 'danger' }, codeOnly: true },
        { label: 'Primary', props: { tone: 'primary' }, codeOnly: true },
        { label: 'Well', props: { tone: 'well' }, codeOnly: true },
      ],
      columns: [{ label: 'Circle', props: { size: 'sm' } }],
      render,
      code,
      cellWidth: 340,
    },
  ],
  examples: [
    { id: 'empty-state/no-data', title: 'No data yet', description: 'The title is an h2 here, because it heads the panel.', codeOnly: true },
    { id: 'empty-state/error', title: 'Error', description: 'role="alert" so a screen reader announces it.', codeOnly: true },
    { id: 'empty-state/no-match', title: 'No match (SM, in a card)', description: 'A square disc and a ghost action.', codeOnly: true },
  ],
  props: [
    { name: 'size', type: '"sm" | "md"', default: '"md"', description: 'Disc size, gap and padding.' },
    { name: 'EmptyStateIcon', type: 'IconDisc props', description: 'tone and shape. The size follows the empty state.' },
    { name: 'EmptyStateText', type: 'div props', description: 'Groups title and description, 4px apart, max 440px.' },
    { name: 'EmptyStateTitle render', type: 'ReactElement', description: 'A <p> by default. Use render={<h2 />} when it heads the region.' },
    { name: 'EmptyStateDescription', type: 'p props', description: 'One line of help.' },
    { name: 'EmptyStateActions', type: 'div props', description: 'Buttons or links, 8px apart.' },
  ],
  guidelines: {
    do: [
      'Say what is missing and what to do next: "Belum ada kartu" + "Buat kartu".',
      'Use role="alert" for a load error, with a retry action.',
      'Use sm inside a module or a console card.',
    ],
    dont: ['Do not wrap it in a card of its own. It replaces the panel content.', 'Do not write more than one line of description.'],
  },
  notes: [
    'Code-only: Empty State has no specimen on the Wonder Design System page. The Dashboard page has empty panels; values come from EmptyState.svelte.',
    'The app takes title, description, icon and actions as props/snippets. This port uses compound parts; titleAs becomes render on EmptyStateTitle.',
  ],
}
