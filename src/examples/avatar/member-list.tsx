import { Avatar, AvatarFallback } from '@/components/ui/avatar'

const members = [
  { name: 'Budi Santoso', email: 'budi@mayar.id', role: 'Admin', active: true },
  { name: '', email: 'rina.w@mayar.id', role: 'Anggota', active: true },
  { name: 'Dewi Lestari', email: 'dewi@mayar.id', role: 'Nonaktif', active: false },
]

export default function AvatarMemberList() {
  return (
    <ul className="flex w-72 flex-col gap-3">
      {members.map((m) => (
        <li key={m.email} className="flex items-center gap-3">
          <Avatar size={32} tone={m.active ? 'primary' : 'neutral'}>
            <AvatarFallback name={m.name || m.email} />
          </Avatar>
          <span className="min-w-0 flex-1 truncate text-body-sm text-ink">{m.name || m.email}</span>
          <span className="text-caption-lg text-ink-2">{m.role}</span>
        </li>
      ))}
    </ul>
  )
}
