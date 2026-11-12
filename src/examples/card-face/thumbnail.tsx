import { CardFace } from '@/components/ui/card-face'

const rupiahFormat = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })
const rupiah = (value: number) => rupiahFormat.format(value)

export default function CardFaceThumbnail() {
  return (
    <div className="flex w-80 flex-col gap-3 rounded-xl bg-well p-3">
      <div className="flex items-center gap-3">
        <CardFace skin="graphite" label="Iklan Google" last4="5512" holder="DEWI LESTARI" width={48} />
        <div className="flex min-w-0 flex-col">
          <span className="truncate text-body-sm font-semibold text-ink">Iklan Google</span>
          <span className="text-caption-lg text-ink-2 tabular-nums">•••• 5512 · Virtual · Mastercard</span>
        </div>
      </div>
      <div className="flex justify-between text-caption-lg">
        <span className="text-ink-2">Sisa saldo ke akun perusahaan</span>
        <span className="font-semibold text-ink tabular-nums">{rupiah(1_250_000)}</span>
      </div>
    </div>
  )
}
