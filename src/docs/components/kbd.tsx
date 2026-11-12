import { Kbd } from '@/components/ui/kbd'
import type { ComponentDoc, PropValue } from '@/docs/types'
import { toJsx } from '@/gallery/jsx'
import kbdSource from '@/registry/ui/kbd.tsx?raw'

const KEYS = ['⌘K', 'Esc', 'Enter', '/'] as const

function render(props: Record<string, PropValue>) {
  return <Kbd disabled={Boolean(props.disabled)}>{String(props.children ?? '⌘K')}</Kbd>
}

function code(props: Record<string, PropValue>) {
  const { children = '⌘K', ...rest } = props
  return toJsx('Kbd', rest, String(children))
}

export const doc: ComponentDoc = {
  slug: 'kbd',
  name: 'Kbd',
  group: 'Forms',
  description: 'Shows a keyboard key or shortcut, in text or at the end of an input.',
  spec: 'wonder',
  wonderRef: 'Mayar Forms Inputs Guide › Kbd',
  registry: 'kbd',
  source: [{ path: 'components/ui/kbd.tsx', code: kbdSource }],
  playground: {
    controls: [
      { name: 'children', label: 'key', type: 'text', default: '⌘K' },
      { name: 'disabled', type: 'boolean', default: false },
    ],
    render,
    code,
  },
  matrices: [
    {
      title: 'Keys × states',
      description: 'The four keys of the Wonder row. Disabled is the in-input hint of a disabled field.',
      rows: [{ label: 'Default' }, { label: 'Disabled', props: { disabled: true } }],
      columns: KEYS.map((k) => ({ label: k, props: { children: k } })),
      render,
      code,
      cellWidth: 80,
    },
  ],
  examples: [
    { id: 'kbd/shortcuts', title: 'Shortcuts', description: 'The keys from the Wonder row.' },
    { id: 'kbd/in-text', title: 'In text', description: 'A hint inside a sentence.' },
    { id: 'input/search', title: 'In an input', description: 'Pass it as the trailing content of Input, with aria-hidden.' },
  ],
  props: [
    { name: 'children', type: 'ReactNode', description: 'The key text: "⌘K", "Esc", "Enter", "/".' },
    { name: 'disabled', type: 'boolean', default: 'false', description: 'Disabled-foreground text, for a hint in a disabled control.' },
  ],
  guidelines: {
    do: [
      'Use the symbols people see on the keyboard: ⌘, ⇧, ⌥, Enter, Esc.',
      'Add aria-hidden when the shortcut only repeats what the control already says.',
    ],
    dont: ['Do not use Kbd for a tag or a status. Use Badge.', 'Do not show a shortcut that does not work on the current platform.'],
  },
  notes: [
    'Renders a native <kbd>. Size: 20px tall, min-width 20px, 6px side padding, radius sm, caption-sm 11/16 medium.',
    'Values come from the shipped app (Kbd.svelte), which is the source of truth (decision, 12 Nov 2026). Wonder is the visual reference.',
    'The app takes the text as a keys prop or children; this port takes children only.',
  ],
}
