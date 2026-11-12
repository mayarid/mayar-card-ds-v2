import { Checkbox } from '@/components/ui/checkbox'

export default function CheckboxWithDescription() {
  return (
    <div className="flex flex-col">
      <Checkbox defaultChecked description="Struk dikirim setelah setiap transaksi.">
        Kirim struk ke email
      </Checkbox>
      <Checkbox description="Kami kabari saat saldo kartu di bawah Rp100.000.">Peringatan saldo rendah</Checkbox>
    </div>
  )
}
