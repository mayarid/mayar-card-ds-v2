import { Surface } from '@/components/ui/surface'

const ROWS = [
  { label: 'Limit harian', value: 'Rp5.000.000' },
  { label: 'Limit bulanan', value: 'Rp50.000.000' },
  { label: 'Transaksi luar negeri', value: 'Aktif' },
]

export default function SurfaceDivided() {
  return (
    <Surface elevated divided className="w-full max-w-sm">
      {ROWS.map((row) => (
        <div key={row.label} className="flex items-center justify-between px-4 py-3 text-body-sm">
          <span className="text-ink-2">{row.label}</span>
          <span className="font-medium text-ink">{row.value}</span>
        </div>
      ))}
    </Surface>
  )
}
