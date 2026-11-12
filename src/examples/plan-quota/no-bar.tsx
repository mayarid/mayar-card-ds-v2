import {
  PlanQuota,
  PlanQuotaBar,
  PlanQuotaBody,
  PlanQuotaDescription,
  PlanQuotaLegend,
  PlanQuotaTier,
} from '@/components/ui/plan-quota'

export default function PlanQuotaNoBar() {
  return (
    <div className="flex flex-wrap gap-4">
      {/* Enterprise custom quota: nothing to measure. */}
      <PlanQuota max={null} used={48} className="w-60">
        <PlanQuotaTier>Paket Enterprise</PlanQuotaTier>
        <PlanQuotaBody>
          <PlanQuotaDescription />
          <PlanQuotaBar />
          <PlanQuotaLegend />
        </PlanQuotaBody>
      </PlanQuota>
      {/* Lapsed plan: the quota is a real zero, so the legend says why. */}
      <PlanQuota max={0} used={3} suspended className="w-60">
        <PlanQuotaTier>Paket Business</PlanQuotaTier>
        <PlanQuotaBody>
          <PlanQuotaDescription />
          <PlanQuotaBar />
          <PlanQuotaLegend />
        </PlanQuotaBody>
      </PlanQuota>
    </div>
  )
}
