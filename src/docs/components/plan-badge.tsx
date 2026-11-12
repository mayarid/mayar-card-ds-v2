import { PlanBadge, PlanBadgeChip, type PlanTier } from '@/components/ui/plan-badge'
import type { ComponentDoc, MatrixAxisItem, PropValue } from '@/docs/types'
import { toJsx } from '@/gallery/jsx'
import planQuotaSource from '@/registry/ui/plan-quota.tsx?raw'
import source from '@/registry/ui/plan-badge.tsx?raw'

const TIERS = ['starter', 'business', 'enterprise', 'free'] as const satisfies readonly PlanTier[]
const QUOTAS = ['2', '10', 'unlimited', 'none'] as const

function maxOf(quota: PropValue): number | null | undefined {
  if (quota === 'none' || quota === undefined) return undefined
  if (quota === 'unlimited') return null
  return Number(quota)
}

/** The Wonder specimens: tier and quota for each card. */
const SPECIMENS: MatrixAxisItem[] = [
  { label: 'Starter', props: { tier: 'starter', max: 2 } },
  { label: 'Business', props: { tier: 'business', max: 10 } },
  { label: 'Enterprise unlimited', props: { tier: 'enterprise', max: 'unlimited' } },
  { label: 'Free', props: { tier: 'free', max: 0 } },
  { label: 'Suspended', props: { tier: 'starter', max: 0, suspended: true } },
  { label: 'With usage', props: { tier: 'business', max: 10, used: 7 }, codeOnly: true },
]

function badgeProps(props: Record<string, PropValue>) {
  return {
    tier: props.tier as PlanTier,
    max: props.max === 'unlimited' ? null : props.max === undefined ? undefined : Number(props.max),
    used: props.used === undefined ? undefined : Number(props.used),
    suspended: Boolean(props.suspended),
    layout: (props.layout ?? 'row') as 'row' | 'rail',
  }
}

function badgeCode(props: Record<string, PropValue>) {
  const p = badgeProps(props)
  const attrs: Record<string, PropValue> = {
    tier: p.tier,
    max: p.max ?? undefined,
    used: p.used,
    suspended: p.suspended,
    layout: p.layout,
  }
  const jsx = toJsx('PlanBadge', attrs, undefined, { layout: 'row' })
  return p.max === null ? jsx.replace('<PlanBadge', '<PlanBadge max={null}') : jsx
}

export const doc: ComponentDoc = {
  slug: 'plan-badge',
  name: 'Plan Badge',
  group: 'Patterns',
  description:
    'Names the account plan tier and its card quota next to a sparkles disc. A rail form for the collapsed sidebar and a chip for page headers.',
  spec: 'wonder',
  wonderRef: 'Mayar Card Dashboard › Dashboard › Plan Badge (Starter, Business, Enterprise Unlimited, Free, Suspended, Rail)',
  registry: 'plan-badge',
  baseUi: { name: 'useRender', url: 'https://base-ui.com/react/utils/use-render' },
  source: [
    { path: 'components/ui/plan-badge.tsx', code: source },
    { path: 'components/ui/plan-quota.tsx', code: planQuotaSource },
  ],
  playground: {
    controls: [
      { name: 'tier', type: 'select', options: TIERS, default: 'starter' },
      { name: 'quota', type: 'select', options: QUOTAS, default: '2' },
      { name: 'used', label: 'used (blank = unknown)', type: 'text', default: '' },
      { name: 'suspended', type: 'boolean', default: false },
      { name: 'layout', type: 'select', options: ['row', 'rail'], default: 'row' },
    ],
    render: (v) => {
      const max = maxOf(v.quota)
      const used = v.used === '' || v.used === undefined ? undefined : Number(v.used)
      return (
        <PlanBadge
          tier={v.tier as PlanTier}
          max={max}
          used={Number.isFinite(used) ? used : undefined}
          suspended={Boolean(v.suspended)}
          layout={v.layout as 'row' | 'rail'}
          className={v.layout === 'rail' ? 'w-19' : 'w-60'}
        />
      )
    },
    code: (v) => {
      const max = maxOf(v.quota)
      return badgeCode({
        tier: v.tier,
        max: max === null ? 'unlimited' : max,
        used: v.used === '' ? undefined : v.used,
        suspended: v.suspended,
        layout: v.layout,
      })
    },
  },
  matrices: [
    {
      title: 'Tier × layout',
      description: 'The six Wonder specimens: each tier as a row, and the rail disc.',
      rows: SPECIMENS,
      columns: [
        { label: 'Row', props: { layout: 'row' } },
        { label: 'Rail', props: { layout: 'rail' } },
        { label: 'Row as link · focus', props: { layout: 'row', link: true }, force: 'focus', codeOnly: true },
      ],
      cellWidth: 260,
      render: (props, force) => {
        const p = badgeProps(props)
        return (
          <PlanBadge
            {...p}
            data-force-state={force}
            render={props.link ? <a href="#settings" /> : undefined}
            className={p.layout === 'rail' ? 'w-19' : 'w-60'}
          />
        )
      },
      code: badgeCode,
    },
    {
      title: 'Chip × size (code-only)',
      description: 'The Tim header chip. Brand for a live plan, default for Free, warning once it has ended.',
      rows: [
        ...TIERS.map((t) => ({ label: t[0]?.toUpperCase() + t.slice(1), props: { tier: t }, codeOnly: true })),
        { label: 'Suspended', props: { tier: 'starter', suspended: true }, codeOnly: true },
      ],
      columns: [
        { label: 'SM', props: { size: 'sm' }, codeOnly: true },
        { label: 'MD', props: { size: 'md' }, codeOnly: true },
        { label: 'LG', props: { size: 'lg' }, codeOnly: true },
        { label: 'MD pill', props: { size: 'md', shape: 'pill' }, codeOnly: true },
      ],
      render: (props) => (
        <PlanBadgeChip
          tier={props.tier as PlanTier}
          suspended={Boolean(props.suspended)}
          size={props.size as 'sm' | 'md' | 'lg'}
          shape={props.shape as 'pill' | undefined}
        />
      ),
      code: (props) => toJsx('PlanBadgeChip', props, undefined, { size: 'md' }),
    },
  ],
  examples: [
    { id: 'plan-badge/tiers', title: 'Every tier', description: 'Starter, Business, Enterprise, Free and a lapsed plan.' },
    {
      id: 'plan-badge/rail',
      title: 'Rail and link',
      description: 'The rail keeps the tier and quota as screen-reader text and a title. Use render to link to the plan settings.',
    },
    { id: 'plan-badge/team-header', title: 'Chip in a page header', codeOnly: true },
  ],
  props: [
    { name: 'tier', type: '"free" | "starter" | "business" | "enterprise"', description: 'The plan tier. Printed as "Paket Starter".' },
    { name: 'max', type: 'number | null', description: 'Card quota. null = unlimited ("Kartu tanpa batas"). Leave it out to show the tier alone.' },
    { name: 'used', type: 'number | null', description: 'Cards in use. With max, the line reads "7 terpakai · 3 tersedia".' },
    { name: 'suspended', type: 'boolean', default: 'false', description: 'The plan has ended: "Paket berakhir" in warning ink.' },
    { name: 'layout', type: '"row" | "rail"', default: '"row"', description: 'Row: disc, tier, quota. Rail: the disc alone.' },
    { name: 'render', type: 'ReactElement', description: 'Render a link, e.g. <a href="/settings" />.' },
    { name: 'PlanBadgeChip', type: 'component', description: 'Badge chip: tier, suspended, prefix, size, shape.' },
  ],
  guidelines: {
    do: [
      'Check suspended before the quota: a lapsed account has a real quota of 0.',
      'Use the rail layout only on the collapsed sidebar, where the tier text cannot fit.',
      'Use PlanBadgeChip where the plan sits next to a page title (Tim).',
    ],
    dont: ['Do not colour tiers differently: every tier uses the primary disc and ink.', 'Do not show "0 kartu" for a lapsed plan; pass suspended.'],
  },
  notes: [
    'Wonder disc fill is #eef1ff and the ink #2d3dec. This port uses the nearest tokens: primary-light and primary.',
    'Wonder suspended ink is #b47908; this port uses warning-text (#8b5f10), the token the app uses for the same line.',
    'IconDisc has no 28px size, so the disc is built inside this file.',
    'The quota line comes from getPlanQuota in plan-quota.tsx, so the badge and the quota card always say the same thing.',
    'The shipped app has no row badge any more: its sidebar footer shows the Plan Quota card, and Tim uses a brand Badge. PlanBadgeChip ports that Badge (code-only).',
    'The "Row as link" focus state and the "With usage" line are code-only.',
  ],
}
