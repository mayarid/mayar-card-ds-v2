import { PlanBadge } from '@/components/ui/plan-badge'

export default function PlanBadgeTiers() {
  return (
    <div className="flex w-60 flex-col overflow-hidden rounded-xl shadow-ring">
      <PlanBadge tier="starter" max={2} />
      <PlanBadge tier="business" max={10} />
      <PlanBadge tier="enterprise" max={null} />
      <PlanBadge tier="free" max={0} />
      <PlanBadge tier="starter" max={0} suspended />
    </div>
  )
}
