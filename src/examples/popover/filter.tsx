import { FilterIcon } from '@hugeicons/core-free-icons'

import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { Popover, PopoverClose, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

const statuses = ['Aktif', 'Dibekukan', 'Ditutup']

export default function PopoverFilter() {
  return (
    <Popover>
      <PopoverTrigger render={<Button variant="secondary" />}>
        <Icon icon={FilterIcon} />
        Status
      </PopoverTrigger>
      <PopoverContent aria-label="Filter status" align="start" className="w-64">
        <fieldset className="m-0 flex flex-col border-0 p-1.5">
          <legend className="px-2.5 pt-1.5 pb-1 text-caption-lg font-medium text-ink-2">Status kartu</legend>
          {statuses.map((status) => (
            <label key={status} className="flex min-h-9 items-center gap-2.5 rounded-lg px-2.5 text-body-sm">
              <input type="checkbox" defaultChecked={status === 'Aktif'} className="size-4 accent-primary" />
              {status}
            </label>
          ))}
        </fieldset>
        <div className="flex justify-end gap-2 border-t border-border-subtle p-3">
          <PopoverClose render={<Button variant="ghost" size="sm" />}>Reset</PopoverClose>
          <PopoverClose render={<Button size="sm" />}>Terapkan</PopoverClose>
        </div>
      </PopoverContent>
    </Popover>
  )
}
