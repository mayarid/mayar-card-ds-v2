import {
  PlanQuota,
  PlanQuotaAction,
  PlanQuotaBar,
  PlanQuotaBody,
  PlanQuotaDescription,
  PlanQuotaLegend,
  PlanQuotaTier,
} from '@/components/ui/plan-quota'
import type { ComponentDoc, MatrixAxisItem, PropValue } from '@/docs/types'
import { indent } from '@/gallery/jsx'
import source from '@/registry/ui/plan-quota.tsx?raw'

const STATUSES: MatrixAxisItem[] = [
  { label: 'Normal', props: { max: 10, used: 3 } },
  { label: 'Near limit (80%+)', props: { max: 10, used: 8 } },
  { label: 'Full', props: { max: 10, used: 10, action: true } },
  { label: 'Over', props: { max: 10, used: 12, action: true }, codeOnly: true },
  { label: 'Unlimited', props: { max: 'unlimited', used: 48 }, codeOnly: true },
  { label: 'Usage unknown', props: { max: 10 }, codeOnly: true },
  { label: 'Suspended', props: { max: 0, used: 3, suspended: true }, codeOnly: true },
]

function parse(props: Record<string, PropValue>) {
  const max = props.max === 'unlimited' || props.max === '' ? null : Number(props.max ?? 10)
  const usedRaw = props.used === '' || props.used === undefined ? null : Number(props.used)
  return {
    max: max !== null && Number.isFinite(max) ? max : null,
    used: usedRaw !== null && Number.isFinite(usedRaw) ? usedRaw : null,
    suspended: Boolean(props.suspended),
  }
}

function render(props: Record<string, PropValue>, force?: MatrixAxisItem['force']) {
  const { max, used, suspended } = parse(props)
  return (
    <PlanQuota
      max={max}
      used={used}
      suspended={suspended}
      render={props.link ? <a href="#settings" /> : undefined}
      data-force-state={force}
      className="w-60"
    >
      <PlanQuotaTier>{String(props.tier ?? 'Paket Business')}</PlanQuotaTier>
      <PlanQuotaBody>
        <PlanQuotaDescription />
        <PlanQuotaBar />
        <PlanQuotaLegend />
        {props.action && !props.link ? <PlanQuotaAction /> : null}
      </PlanQuotaBody>
    </PlanQuota>
  )
}

function code(props: Record<string, PropValue>) {
  const { max, used, suspended } = parse(props)
  const attrs = [
    `max={${max === null ? 'null' : max}}`,
    used === null ? '' : `used={${used}}`,
    suspended ? 'suspended' : '',
    props.link ? 'render={<a href="/settings" />}' : '',
  ]
    .filter(Boolean)
    .join(' ')
  const body = [
    '<PlanQuotaDescription />',
    '<PlanQuotaBar />',
    '<PlanQuotaLegend />',
    props.action && !props.link ? '<PlanQuotaAction render={<a href="mailto:halo@mayar.id" />} />' : '',
  ]
    .filter(Boolean)
    .join('\n')
  return [
    `<PlanQuota ${attrs}>`,
    indent(`<PlanQuotaTier>${String(props.tier ?? 'Paket Business')}</PlanQuotaTier>`),
    indent(`<PlanQuotaBody>\n${indent(body)}\n</PlanQuotaBody>`),
    '</PlanQuota>',
  ].join('\n')
}

export const doc: ComponentDoc = {
  slug: 'plan-quota',
  name: 'Plan Quota',
  group: 'Patterns',
  description:
    'Shows how many cards of the plan quota are used. The card turns warning near the limit and danger when it is full, with an upgrade action.',
  spec: 'wonder',
  wonderRef: 'Mayar Card Dashboard › Dashboard › Plan Quota Card Normal / Near Limit / Full v2',
  registry: 'plan-quota',
  baseUi: { name: 'useRender', url: 'https://base-ui.com/react/utils/use-render' },
  source: [{ path: 'components/ui/plan-quota.tsx', code: source }],
  playground: {
    controls: [
      { name: 'tier', type: 'text', default: 'Paket Business' },
      { name: 'max', label: 'max (blank = unlimited)', type: 'text', default: '10' },
      { name: 'used', label: 'used (blank = unknown)', type: 'text', default: '3' },
      { name: 'suspended', type: 'boolean', default: false },
      { name: 'action', label: 'upgrade action', type: 'boolean', default: false },
      { name: 'link', label: 'card is a link', type: 'boolean', default: false },
    ],
    render: (v) => render(v),
    code,
  },
  matrices: [
    {
      title: 'Status × state',
      description:
        'Normal, near limit and full are the Wonder cards. Hover and focus apply when the whole card is a link (code-only).',
      rows: STATUSES,
      columns: [
        { label: 'Default' },
        { label: 'Link · hover', props: { link: true }, force: 'hover', codeOnly: true },
        { label: 'Link · focus', props: { link: true }, force: 'focus', codeOnly: true },
      ],
      cellWidth: 260,
      render,
      code,
    },
  ],
  examples: [
    { id: 'plan-quota/sidebar-card', title: 'Sidebar card', description: 'The whole card links to the plan settings.' },
    {
      id: 'plan-quota/upgrade',
      title: 'Near limit, full and over',
      description: 'usePlanQuota reads the status, so the upgrade button shows only when it is needed.',
    },
    { id: 'plan-quota/no-bar', title: 'Unlimited and suspended', description: 'No bar when there is nothing to measure.', codeOnly: true },
  ],
  props: [
    { name: 'max', type: 'number | null', description: 'Card quota. null = unlimited.' },
    { name: 'used', type: 'number | null', description: 'Cards in use. null = unknown: the legend prints "10 kartu".' },
    { name: 'suspended', type: 'boolean', default: 'false', description: 'The plan has ended. Checked before the numbers.' },
    { name: 'render', type: 'ReactElement', description: 'Make the card a link, e.g. <a href="/settings" />.' },
    { name: 'PlanQuotaTier', type: 'component', description: 'Tier line. Primary, warning-text or danger-text by status.' },
    { name: 'PlanQuotaDescription', type: 'component', description: 'Default text by status; children replace it.' },
    { name: 'PlanQuotaBar', type: 'component', description: 'UsageBar on a well track. Primary, warning or danger fill. Hidden with no percent.' },
    { name: 'PlanQuotaLegend', type: 'component', description: '"3 terpakai" and "7 tersedia" (or "2 di atas kuota").' },
    { name: 'PlanQuotaAction', type: 'ButtonProps', description: 'Full-width primary MD Button, "Upgrade paket" by default.' },
    { name: 'getPlanQuota / usePlanQuota', type: 'function / hook', description: 'Status, percent, used, available and legend text.' },
  ],
  guidelines: {
    do: [
      'Show the upgrade action when the quota is full or over.',
      'Pass suspended for a lapsed plan, so the card says "Paket berakhir" instead of "0 tersedia".',
      'Make the whole card a link in the sidebar; then leave out PlanQuotaAction (no link inside a link).',
    ],
    dont: ['Do not use the near-limit tone below 80%.', 'Do not put two actions in the body.'],
  },
  notes: [
    'Wonder card radius is 14px; the app uses 16px (3xl). This port uses 14px (an arbitrary value, there is no 14px token).',
    'Wonder fills the bar flat primary, then warning at 80%+ and danger when full. The app used the blue usage ramp (red only at 100%) on a plain well card. The Wonder tones win; the bar uses UsageBar with tone/colour overrides.',
    'The near-limit fill passes color="var(--color-warning)" to UsageBar, because UsageBar has no warning tone.',
    'Wonder splits the legend into "3 terpakai" and "7 tersedia" with semibold numbers; the app printed one line "3 terpakai · 7 tersedia". Wonder wins; the one-line text stays as summary.legend.',
    'The upgrade button is semibold in Wonder; Button is medium, so PlanQuotaAction adds font-semibold.',
    'Over quota, unlimited, unknown usage and suspended are code-only (from the app). Hover and focus on a linked card are code-only.',
  ],
}
