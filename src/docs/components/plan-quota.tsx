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
  { label: 'Full', props: { max: 10, used: 10 } },
  { label: 'Full + upgrade action', props: { max: 10, used: 10, action: true } },
  { label: 'Over', props: { max: 10, used: 12 }, codeOnly: true },
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
    'Shows how many cards of the plan quota are used: a usage bar on the blue ramp that turns red when the quota is full, and a one-line legend.',
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
        'Normal, near limit and full are on the Wonder page. As in the app, only the bar changes: darker blue as usage grows, red at 100%. Focus applies when the whole card is a link (code-only).',
      rows: STATUSES,
      columns: [
        { label: 'Default' },
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
      title: 'Upgrade when full',
      description: 'usePlanQuota reads the status, so the optional upgrade button shows only when the quota is full or over.',
    },
    { id: 'plan-quota/no-bar', title: 'Unlimited and suspended', description: 'No bar when there is nothing to measure.', codeOnly: true },
  ],
  props: [
    { name: 'max', type: 'number | null', description: 'Card quota. null = unlimited.' },
    { name: 'used', type: 'number | null', description: 'Cards in use. null = unknown: the legend prints "10 kartu".' },
    { name: 'suspended', type: 'boolean', default: 'false', description: 'The plan has ended. Checked before the numbers.' },
    { name: 'render', type: 'ReactElement', description: 'Make the card a link, e.g. <a href="/settings" />.' },
    { name: 'PlanQuotaTier', type: 'component', description: 'Tier line, caption-lg semibold primary.' },
    { name: 'PlanQuotaDescription', type: 'component', description: '"Kuota kartu aktif paket Anda."; children replace it.' },
    { name: 'PlanQuotaBar', type: 'component', description: 'UsageBar on a well track: the blue ramp, red at 100%. Hidden with no percent.' },
    { name: 'PlanQuotaLegend', type: 'component', description: 'One line: "3 terpakai · 7 tersedia", "10 kartu", "Kartu tanpa batas" or "Paket berakhir".' },
    { name: 'PlanQuotaAction', type: 'ButtonProps', description: 'Optional full-width primary MD Button, "Upgrade paket" by default. Not in the app sidebar card.' },
    { name: 'getPlanQuota / usePlanQuota', type: 'function / hook', description: 'Status, percent, used, available and legend text.' },
  ],
  guidelines: {
    do: [
      'Show the upgrade action when the quota is full or over.',
      'Pass suspended for a lapsed plan, so the card says "Paket berakhir" instead of "0 tersedia".',
      'Make the whole card a link in the sidebar; then leave out PlanQuotaAction (no link inside a link).',
    ],
    dont: ['Do not colour the card by status; the bar already turns red when the quota is full.', 'Do not put two actions in the body.'],
  },
  notes: [
    'Source of truth: the app Sidebar.svelte plan quota card. Wonder is the visual reference; where they differ, this port follows the app.',
    'Radius 16px (3xl), as in the app. Wonder shows 14px.',
    'Tones: the app keeps the well card and the primary tier at every status, and the bar uses the blue usage ramp (red only at 100%). Wonder shows a warning card and fill near the limit and a danger card and fill when full.',
    'Legend: one line "3 terpakai · 7 tersedia" in muted caption-lg, as in the app. Over the quota it reads "12 terpakai · 0 tersedia". Wonder splits it into two parts with semibold numbers.',
    'Description: always "Kuota kartu aktif paket Anda." (the app). Wonder changes it near the limit and when full.',
    'Upgrade action: Wonder shows an "Upgrade paket" button on the full card. The app sidebar card has none (the whole card links to settings), so PlanQuotaAction is opt-in.',
    'status (ok, near, at, over, unlimited, unknown, suspended) stays in getPlanQuota and data-status as information, e.g. to show the upgrade action. near (80%+) changes nothing on screen.',
    'Over quota, unlimited, unknown usage and suspended are code-only (from the app). Focus on a linked card is code-only; the app has no hover style on the card.',
  ],
}
