import { RadioGroup, RadioGroupItem } from '@/components/ui/radio'

export default function RadioWithDescription() {
  return (
    <div className="flex flex-col gap-1">
      <span id="pengiriman-label" className="text-body-sm font-medium text-ink">
        Pengiriman kartu fisik
      </span>
      <RadioGroup aria-labelledby="pengiriman-label" defaultValue="reguler">
        <RadioGroupItem value="reguler" description="3–5 hari kerja. Gratis.">
          Reguler
        </RadioGroupItem>
        <RadioGroupItem value="kilat" description="1–2 hari kerja. Rp25.000.">
          Kilat
        </RadioGroupItem>
        <RadioGroupItem value="ambil" disabled description="Belum tersedia di kota Anda.">
          Ambil di kantor
        </RadioGroupItem>
      </RadioGroup>
    </div>
  )
}
