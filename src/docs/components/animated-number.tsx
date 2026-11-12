import { AnimatedNumber } from '@/components/ui/animated-number'
import type { ComponentDoc, PropValue } from '@/docs/types'
import { toJsx } from '@/gallery/jsx'
import source from '@/registry/ui/animated-number.tsx?raw'

const SIZE_CLASS: Record<string, string> = {
  'title-lg': 'text-title-lg text-ink',
  'title-md': 'text-title-md text-ink',
  'body-base': 'text-body-base text-ink',
}

function render(props: Record<string, PropValue>) {
  const kind = String(props.kind ?? 'rupiah')
  return (
    <AnimatedNumber
      value={Number(props.value ?? 48250000)}
      prefix={kind === 'rupiah' ? 'Rp ' : undefined}
      suffix={kind === 'percent' ? '%' : undefined}
      format={kind === 'percent' ? { minimumFractionDigits: 1, maximumFractionDigits: 1 } : undefined}
      hidden={Boolean(props.hidden)}
      hiddenLabel={props.hidden ? 'Saldo disembunyikan' : undefined}
      className={SIZE_CLASS[String(props.text ?? 'title-lg')]}
    />
  )
}

function code(props: Record<string, PropValue>) {
  const kind = String(props.kind ?? 'rupiah')
  let out = toJsx('AnimatedNumber', {
    value: Number(props.value ?? 48250000),
    prefix: kind === 'rupiah' ? 'Rp ' : undefined,
    suffix: kind === 'percent' ? '%' : undefined,
    hidden: props.hidden,
    hiddenLabel: props.hidden ? 'Saldo disembunyikan' : undefined,
    className: SIZE_CLASS[String(props.text ?? 'title-lg')],
  })
  if (kind === 'percent') out = out.replace('<AnimatedNumber', '<AnimatedNumber format={{ minimumFractionDigits: 1 }}')
  return out
}

export const doc: ComponentDoc = {
  slug: 'animated-number',
  name: 'Animated Number',
  group: 'Display',
  description:
    'A summary figure (a balance, a total, a stat tile) that moves to its new value when it changes, in tabular digits.',
  spec: 'code-only',
  registry: 'animated-number',
  source: [{ path: 'components/ui/animated-number.tsx', code: source }],
  playground: {
    controls: [
      { name: 'value', type: 'select', options: ['48250000', '53250000', '1250000', '72.5'], default: '48250000' },
      { name: 'kind', type: 'select', options: ['rupiah', 'plain', 'percent'], default: 'rupiah' },
      { name: 'text', label: 'type step', type: 'select', options: ['title-lg', 'title-md', 'body-base'], default: 'title-lg' },
      { name: 'hidden', type: 'boolean', default: false },
    ],
    render,
    code,
  },
  matrices: [
    {
      title: 'Format × state',
      description: 'Formatting is Intl.NumberFormat("id-ID"): dots group the thousands, a comma marks the fraction.',
      rows: [
        { label: 'Rupiah', props: { kind: 'rupiah', value: 48250000 }, codeOnly: true },
        { label: 'Plain', props: { kind: 'plain', value: 1284 }, codeOnly: true },
        { label: 'Percent', props: { kind: 'percent', value: 72.5 }, codeOnly: true },
      ],
      columns: [
        { label: 'Shown', props: {} },
        { label: 'Hidden', props: { hidden: true } },
      ],
      render,
      code,
      cellWidth: 240,
    },
  ],
  examples: [
    { id: 'animated-number/balance', title: 'Balance after a top-up', description: 'Rupiah with prefix="Rp ". No count-up on mount.', codeOnly: true },
    { id: 'animated-number/hidden', title: 'Hidden balance', description: 'The value is not rendered; a screen reader hears the hidden label.', codeOnly: true },
    { id: 'animated-number/percent', title: 'Period switch', description: 'format sets the fraction digits.', codeOnly: true },
  ],
  props: [
    { name: 'value', type: 'number', description: 'The number. Required.' },
    { name: 'prefix', type: 'string', default: '""', description: 'Text before the number, e.g. "Rp ".' },
    { name: 'suffix', type: 'string', default: '""', description: 'Text after the number, e.g. "%".' },
    { name: 'format', type: 'Intl.NumberFormatOptions', description: 'Default: grouped, up to 3 fraction digits.' },
    { name: 'locale', type: 'Intl.LocalesArgument', default: '"id-ID"', description: 'Number locale.' },
    { name: 'hidden', type: 'boolean', default: 'false', description: 'Masks the value.' },
    { name: 'hiddenText', type: 'string', default: '"•••"', description: 'The mask.' },
    { name: 'hiddenLabel', type: 'string', description: 'Spoken in place of the mask.' },
  ],
  guidelines: {
    do: [
      'Use it for summary figures only: a balance, a total, a stat tile.',
      'Set hiddenLabel when the balance can be hidden.',
    ],
    dont: [
      'Do not use it in table rows, tooltips, inputs or bar percentages. Many moving numbers are noise.',
      'Do not count up from zero on first paint.',
    ],
  },
  notes: [
    'Code-only: Animated Number has no specimen on the Wonder Design System page. Behaviour comes from AnimatedNumber.svelte; the app code is final (decision, 12 Nov 2026).',
    'Same as the app: NumberFlow (@number-flow/react) rolls each changed digit, with transform and spin timing 350ms and opacity 150ms on the smooth-out curve. Where NumberFlow cannot animate, the same text renders in a plain span.',
    'Digits use tabular-nums on the inherited font, as in the app (no monospace font).',
    'Screen readers get the final value once (an sr-only copy), and the moving text is aria-hidden. Under reduced motion the value snaps.',
  ],
}
