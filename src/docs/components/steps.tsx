import { Step, Steps } from '@/components/ui/steps'
import type { ComponentDoc, PropValue } from '@/docs/types'
import { toJsx } from '@/gallery/jsx'
import source from '@/registry/ui/steps.tsx?raw'

const LABELS = ['Data diri', 'Dokumen', 'Paket']

function render(props: Record<string, PropValue>) {
  const count = Number(props.count ?? 3)
  const labels = count === 4 ? [...LABELS, 'Selesai'] : count === 2 ? LABELS.slice(0, 2) : LABELS
  return (
    <Steps current={Number(props.current ?? 2)} className="w-72">
      {labels.map((l) => (
        <Step key={l}>{l}</Step>
      ))}
    </Steps>
  )
}

function code(props: Record<string, PropValue>) {
  const count = Number(props.count ?? 3)
  const labels = count === 4 ? [...LABELS, 'Selesai'] : count === 2 ? LABELS.slice(0, 2) : LABELS
  return toJsx(
    'Steps',
    { current: Number(props.current ?? 2) },
    labels.map((l) => toJsx('Step', {}, l)).join('\n'),
  )
}

export const doc: ComponentDoc = {
  slug: 'steps',
  name: 'Steps',
  group: 'Display',
  description: 'The bar progress of a multi-step flow, such as the account verification header.',
  spec: 'code-only',
  registry: 'steps',
  source: [{ path: 'components/ui/steps.tsx', code: source }],
  playground: {
    controls: [
      { name: 'current', type: 'select', options: ['1', '2', '3', '4'], default: '2' },
      { name: 'count', label: 'steps', type: 'select', options: ['2', '3', '4'], default: '3' },
    ],
    render,
    code,
  },
  matrices: [
    {
      title: 'Current step × step count',
      description: 'Done and current bars are primary. Labels: current ink, done ink-2, later muted. One past the end = all done.',
      rows: [1, 2, 3, 4].map((c) => ({ label: `Current ${c}`, props: { current: c }, codeOnly: true })),
      columns: [
        { label: '3 steps', props: { count: 3 } },
        { label: '4 steps', props: { count: 4 } },
      ],
      render,
      code,
      cellWidth: 300,
    },
  ],
  examples: [
    { id: 'steps/kyc', title: 'Verification flow', description: 'The colours fade over --motion-quick.', codeOnly: true },
    { id: 'steps/long-labels', title: 'Long labels', description: 'Labels truncate; the columns stay equal.', codeOnly: true },
  ],
  props: [
    { name: 'current', type: 'number', description: 'The current step, 1-based. Required.' },
    { name: 'aria-label', type: 'string', default: '"Langkah"', description: 'Name of the list.' },
    { name: 'Step children', type: 'ReactNode', description: 'The step label.' },
  ],
  guidelines: {
    do: ['Keep labels to one or two words.', 'Use three to five steps.'],
    dont: ['Do not make the steps links. Use the Back button to go back.', 'Do not change the label weight for the current step; only the colour changes.'],
  },
  notes: [
    'Code-only: Steps has no specimen on the Wonder Design System page. Values come from Steps.svelte.',
    'The app takes a steps array; this port uses <Step> children, so each label can hold any content.',
  ],
}
