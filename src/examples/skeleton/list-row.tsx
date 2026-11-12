import { Skeleton } from '@/components/ui/skeleton'

export default function SkeletonListRow() {
  return (
    <div role="status" aria-busy="true" aria-label="Memuat transaksi" className="flex w-80 flex-col gap-4">
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton width={36} height={36} radius="full" />
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton width="60%" height={12} />
            <Skeleton width="40%" height={10} />
          </div>
          <Skeleton width={64} height={14} />
        </div>
      ))}
    </div>
  )
}
