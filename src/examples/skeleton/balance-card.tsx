import { Skeleton } from '@/components/ui/skeleton'

export default function SkeletonBalanceCard() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Memuat saldo"
      className="flex w-72 flex-col gap-3 rounded-card bg-surface p-5 shadow-ring"
    >
      <Skeleton width={80} height={12} shimmer />
      <Skeleton width={180} height={32} radius="lg" shimmer />
      <Skeleton width="100%" height={36} radius="xl" fill="component" shimmer />
    </div>
  )
}
