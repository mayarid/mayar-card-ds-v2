import { PlanBadge } from '@/components/ui/plan-badge'

export default function PlanBadgeRail() {
  // On the collapsed rail the disc stands alone. The tier and quota stay as screen-reader text and a title.
  return (
    <div className="flex items-start gap-4">
      <PlanBadge tier="business" max={10} used={6} layout="rail" className="w-19" />
      <PlanBadge tier="business" max={10} used={6} render={<a href="#settings" />} className="w-60" />
    </div>
  )
}
