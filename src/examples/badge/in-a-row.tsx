import { Badge } from '@/components/ui/badge'

export default function BadgeInARow() {
  return (
    <div className="flex w-full max-w-sm items-center justify-between rounded-xl bg-surface px-4 py-3 shadow-control">
      <div className="flex flex-col">
        <span className="text-body-sm font-medium text-ink">Kartu Iklan Meta</span>
        <span className="text-caption-lg text-ink-2">•••• 4821</span>
      </div>
      <Badge variant="success" shape="pill">
        Aktif
      </Badge>
    </div>
  )
}
