import { Search01Icon } from '@hugeicons/core-free-icons'

import { Icon } from '@/components/ui/icon'
import { Input } from '@/components/ui/input'
import { Kbd } from '@/components/ui/kbd'

export default function InputSearch() {
  return (
    <Input
      type="search"
      aria-label="Cari transaksi"
      placeholder="Cari transaksi"
      leading={<Icon icon={Search01Icon} />}
      trailing={<Kbd aria-hidden>⌘K</Kbd>}
      className="w-80"
    />
  )
}
