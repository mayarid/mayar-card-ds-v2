import { GridViewIcon, Menu01Icon } from '@hugeicons/core-free-icons'

import { Icon } from '@/components/ui/icon'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

export default function ToggleGroupViewSwitch() {
  return (
    <ToggleGroup aria-label="Tampilan kartu" variant="track" size="icon" defaultValue="grid">
      <ToggleGroupItem value="grid" aria-label="Grid" title="Grid">
        <Icon icon={GridViewIcon} />
      </ToggleGroupItem>
      <ToggleGroupItem value="list" aria-label="Daftar" title="Daftar">
        <Icon icon={Menu01Icon} />
      </ToggleGroupItem>
    </ToggleGroup>
  )
}
