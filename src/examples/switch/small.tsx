import { Switch } from '@/components/ui/switch'

export default function SwitchSmall() {
  return (
    <div className="flex items-center gap-3 text-body-sm text-ink">
      <span>Kartu Marketing</span>
      <Switch size="sm" defaultChecked aria-label="Aktifkan Kartu Marketing" />
    </div>
  )
}
