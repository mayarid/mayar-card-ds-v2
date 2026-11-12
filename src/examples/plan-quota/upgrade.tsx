import {
  PlanQuota,
  PlanQuotaAction,
  PlanQuotaBar,
  PlanQuotaBody,
  PlanQuotaDescription,
  PlanQuotaLegend,
  PlanQuotaTier,
  usePlanQuota,
} from '@/components/ui/plan-quota'

/** The upgrade button shows only when the quota is full or over. */
function UpgradeWhenFull() {
  const { status } = usePlanQuota()
  if (status !== 'at' && status !== 'over') return null
  return <PlanQuotaAction render={<a href="mailto:halo@mayar.id?subject=Upgrade%20Paket" />} />
}

const quotas = [
  { key: 'near', max: 10, used: 8 },
  { key: 'full', max: 10, used: 10 },
  { key: 'over', max: 10, used: 12 },
]

export default function PlanQuotaUpgrade() {
  return (
    <div className="flex flex-wrap items-start gap-4">
      {quotas.map((q) => (
        <PlanQuota key={q.key} max={q.max} used={q.used} className="w-60">
          <PlanQuotaTier>Paket Business</PlanQuotaTier>
          <PlanQuotaBody>
            <PlanQuotaDescription />
            <PlanQuotaBar />
            <PlanQuotaLegend />
            <UpgradeWhenFull />
          </PlanQuotaBody>
        </PlanQuota>
      ))}
    </div>
  )
}
