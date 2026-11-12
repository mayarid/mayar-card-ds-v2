import {
  PlanQuota,
  PlanQuotaBar,
  PlanQuotaBody,
  PlanQuotaDescription,
  PlanQuotaLegend,
  PlanQuotaTier,
} from '@/components/ui/plan-quota'

export default function PlanQuotaSidebarCard() {
  return (
    <PlanQuota max={10} used={3} render={<a href="#settings" />} className="w-60">
      <PlanQuotaTier>Paket Business</PlanQuotaTier>
      <PlanQuotaBody>
        <PlanQuotaDescription />
        <PlanQuotaBar />
        <PlanQuotaLegend />
      </PlanQuotaBody>
    </PlanQuota>
  )
}
