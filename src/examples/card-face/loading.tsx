import { CardFaceSkeleton } from '@/components/ui/card-face'
import { Skeleton } from '@/components/ui/skeleton'

export default function CardFaceLoading() {
  return (
    <div role="status" aria-busy="true" aria-label="Memuat kartu" className="grid w-full max-w-[560px] grid-cols-2 gap-4">
      {[0, 1].map((i) => (
        <div key={i} className="flex flex-col gap-3 rounded-2xl bg-surface p-2.5 shadow-control">
          <CardFaceSkeleton width="auto" />
          <div className="flex flex-col gap-3 px-1.5 pb-1.5">
            <Skeleton width="60%" height={14} />
            <Skeleton width="100%" height={12} />
            <Skeleton width="100%" height={6} radius="full" />
          </div>
        </div>
      ))}
    </div>
  )
}
