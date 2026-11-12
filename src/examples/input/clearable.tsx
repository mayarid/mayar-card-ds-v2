import { Search01Icon } from '@hugeicons/core-free-icons'
import { useState } from 'react'

import { Icon } from '@/components/ui/icon'
import { Input } from '@/components/ui/input'

export default function InputClearable() {
  const [query, setQuery] = useState('Budi Santoso')

  return (
    <Input
      type="search"
      size="md"
      aria-label="Cari pengguna"
      placeholder="Cari nama atau email"
      leading={<Icon icon={Search01Icon} />}
      value={query}
      onValueChange={setQuery}
      onClear={() => setQuery('')}
      className="w-72"
    />
  )
}
