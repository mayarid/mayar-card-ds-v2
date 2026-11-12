import { Notification03Icon } from '@hugeicons/core-free-icons'

import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { Popover, PopoverContent, PopoverDescription, PopoverTitle, PopoverTrigger } from '@/components/ui/popover'

const items = ['Saldo kartu Marketing di bawah Rp 100.000', 'Permintaan akses baru dari Rina']

export default function PopoverNotifications() {
  return (
    <Popover>
      <PopoverTrigger render={<Button variant="ghost" size="icon-md" />} aria-label="Notifikasi">
        <Icon icon={Notification03Icon} />
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="border-b border-border-subtle px-4 py-3">
          <PopoverTitle>Notifikasi</PopoverTitle>
          <PopoverDescription>2 belum dibaca</PopoverDescription>
        </div>
        <ul className="m-0 list-none p-0">
          {items.map((item) => (
            <li key={item} className="px-4 py-3 text-body-sm text-ink-2">
              {item}
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  )
}
