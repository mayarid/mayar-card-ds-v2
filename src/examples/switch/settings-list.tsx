import { Switch } from '@/components/ui/switch'

export default function SwitchSettingsList() {
  return (
    <div className="flex w-full max-w-sm flex-col divide-y divide-border">
      <Switch defaultChecked description="Email setiap kartu dipakai." className="flex-row-reverse justify-between py-1">
        Notifikasi transaksi
      </Switch>
      <Switch description="Tolak transaksi di luar Indonesia." className="flex-row-reverse justify-between py-1">
        Blokir transaksi luar negeri
      </Switch>
      <Switch disabled description="Hanya untuk paket Business." className="flex-row-reverse justify-between py-1">
        Persetujuan berlapis
      </Switch>
    </div>
  )
}
