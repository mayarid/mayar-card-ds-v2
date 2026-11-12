import { UsageBar } from '@/components/ui/usage-bar'

export default function UsageBarShare() {
  return (
    <div className="flex w-72 flex-col gap-3 rounded-2xl bg-well p-4">
      <UsageBar value={42} color="var(--color-chart-3)" height={8} track="well" aria-label="Porsi Perangkat lunak" />
      <UsageBar value={27} color="var(--color-chart-5)" height={8} track="well" aria-label="Porsi Perjalanan" />
    </div>
  )
}
