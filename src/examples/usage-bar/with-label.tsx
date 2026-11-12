import { UsageBar, UsageBarLabel, UsageBarTrack, UsageBarValue } from '@/components/ui/usage-bar'

export default function UsageBarWithLabel() {
  return (
    <UsageBar value={7_200_000} max={10_000_000} className="w-72">
      <UsageBarLabel>Limit bulanan</UsageBarLabel>
      <UsageBarValue>
        {(_, value) => `Rp ${new Intl.NumberFormat('id-ID').format(value)}`}
      </UsageBarValue>
      <UsageBarTrack />
    </UsageBar>
  )
}
