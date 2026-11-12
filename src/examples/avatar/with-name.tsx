import { Avatar, AvatarFallback } from '@/components/ui/avatar'

export default function AvatarWithName() {
  return (
    <div className="flex items-center gap-3">
      <Avatar size={36}>
        <AvatarFallback name="Budi Santoso" />
      </Avatar>
      <div className="flex min-w-0 flex-col">
        <span className="truncate text-body-sm font-medium text-ink">Budi Santoso</span>
        <span className="truncate text-caption-lg text-ink-2">budi@mayar.id</span>
      </div>
    </div>
  )
}
