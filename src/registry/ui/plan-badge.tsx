import { mergeProps } from '@base-ui/react/merge-props'
import { useRender } from '@base-ui/react/use-render'
import { SparklesIcon } from '@hugeicons/core-free-icons'

import { Badge, type BadgeProps } from '@/components/ui/badge'
import { Icon } from '@/components/ui/icon'
import { getPlanQuota } from '@/components/ui/plan-quota'
import { cn } from '@/lib/utils'

/*
 * Mayar v2 Plan Badge. Wonder Dashboard page › "Plan Badge" (Starter, Business, Enterprise Unlimited,
 * Free, Suspended, Rail). A 28px primary-light disc with a 15px sparkles glyph, then the tier
 * (caption-lg semibold, primary) over the quota line (caption-sm, muted; warning-text semibold once
 * the plan has ended). Row: padding 10/14, gap 10, a border-subtle hairline on top.
 * Rail: the disc alone, centred. Chip (code-only): the brand Badge "Paket Starter" of the Tim header.
 */

type PlanTier = 'free' | 'starter' | 'business' | 'enterprise'

/** Display name of each tier, as the app prints it after "Paket". */
const PLAN_TIER_LABELS: Record<PlanTier, string> = {
  free: 'Free',
  starter: 'Starter',
  business: 'Business',
  enterprise: 'Enterprise',
}

/** "Paket Starter", or "Starter" without the prefix. */
function getPlanLabel(tier: PlanTier, { prefix = true } = {}): string {
  return prefix ? `Paket ${PLAN_TIER_LABELS[tier]}` : PLAN_TIER_LABELS[tier]
}

interface PlanBadgeProps extends useRender.ComponentProps<'div'> {
  /** The account plan tier. */
  tier: PlanTier
  /** Card quota. `null` = unlimited. Omit it to show the tier alone. */
  max?: number | null
  /** Cards in use. With `max`, the quota line reads "7 terpakai · 3 tersedia". */
  used?: number | null
  /** The plan has lapsed: the quota line says "Paket berakhir" in warning ink. */
  suspended?: boolean
  /** `row` (default): disc, tier and quota. `rail`: the disc alone, for the collapsed sidebar. */
  layout?: 'row' | 'rail'
}

/**
 * The account plan: tier name and card quota next to a sparkles disc.
 *
 * `<PlanBadge tier="starter" max={2} />` reads "Paket Starter · 2 kartu".
 * Use `render={<a href="/settings" />}` to link it to the plan settings.
 */
function PlanBadge({
  tier,
  max,
  used = null,
  suspended = false,
  layout = 'row',
  className,
  render,
  ...props
}: PlanBadgeProps) {
  const label = getPlanLabel(tier)
  const quota = max === undefined && !suspended ? null : getPlanQuota({ max: max ?? null, used, suspended })
  const fullText = quota ? `${label} · ${quota.legend}` : label
  const isLink = render !== undefined

  const disc = (
    <span
      data-slot="plan-badge-icon"
      aria-hidden
      className="flex size-7 shrink-0 items-center justify-center rounded-pill bg-primary-light text-primary"
    >
      <Icon icon={SparklesIcon} size={15} strokeWidth={1.9} />
    </span>
  )

  const defaultProps: useRender.ElementProps<'div'> = {
    'data-slot': 'plan-badge',
    'data-tier': tier,
    'data-layout': layout,
    'data-suspended': suspended ? '' : undefined,
    title: layout === 'rail' ? fullText : undefined,
    className: cn(
      'flex items-center border-t border-border-subtle bg-surface py-2.5 font-sans no-underline',
      layout === 'rail' ? 'justify-center px-2' : 'gap-2.5 px-3.5',
      isLink && 'outline-none focus-ring:outline-focus focus-ring:-outline-offset-2',
      className,
    ),
    children:
      layout === 'rail' ? (
        <>
          {disc}
          <span className="sr-only">{fullText}</span>
        </>
      ) : (
        <>
          {disc}
          <span className="flex min-w-0 flex-1 flex-col">
            <span data-slot="plan-badge-tier" className="truncate text-caption-lg font-semibold text-primary">
              {label}
            </span>
            {quota ? (
              <span
                data-slot="plan-badge-quota"
                className={cn(
                  'truncate text-caption-sm font-normal tracking-normal text-muted tabular-nums',
                  suspended && 'font-semibold text-warning-text',
                )}
              >
                {quota.legend}
              </span>
            ) : null}
          </span>
        </>
      ),
  } as useRender.ElementProps<'div'>

  return useRender({ defaultTagName: 'div', render, props: mergeProps<'div'>(defaultProps, props) })
}

interface PlanBadgeChipProps extends Omit<BadgeProps, 'variant' | 'prefix'> {
  tier: PlanTier
  /** The plan has lapsed: warning paint and "berakhir". */
  suspended?: boolean
  /** Print "Paket" before the tier name. */
  prefix?: boolean
}

/**
 * The plan as a small chip, e.g. in the Tim page header: `<PlanBadgeChip tier="business" />`.
 * Brand for a live plan, default for Free, warning once it has ended.
 */
function PlanBadgeChip({ tier, suspended = false, prefix = true, size = 'md', children, ...props }: PlanBadgeChipProps) {
  const variant = suspended ? 'warning' : tier === 'free' ? 'default' : 'brand'
  const text = getPlanLabel(tier, { prefix })
  return (
    <Badge
      data-slot="plan-badge-chip"
      data-tier={tier}
      data-suspended={suspended ? '' : undefined}
      variant={variant}
      size={size}
      {...props}
    >
      {children ?? (suspended ? `${text} berakhir` : text)}
    </Badge>
  )
}

export {
  getPlanLabel,
  PLAN_TIER_LABELS,
  PlanBadge,
  PlanBadgeChip,
  type PlanBadgeChipProps,
  type PlanBadgeProps,
  type PlanTier,
}
