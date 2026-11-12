import { PlanBadgeChip } from '@/components/ui/plan-badge'
import { UsageBar } from '@/components/ui/usage-bar'

export default function PlanBadgeTeamHeader() {
  const seats = { used: 4, max: 5 }
  return (
    <div className="flex w-full max-w-lg flex-wrap items-center justify-between gap-3">
      <PlanBadgeChip tier="business" />
      <div className="flex w-48 flex-col gap-1.5">
        <span className="text-body-sm text-ink-2 tabular-nums">
          {seats.used} dari {seats.max} anggota
        </span>
        <UsageBar value={seats.used} max={seats.max} />
      </div>
    </div>
  )
}
