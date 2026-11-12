import { Surface } from '@/components/ui/surface'

export default function SurfaceElevated() {
  return (
    <Surface elevated className="w-full max-w-xs">
      <span className="text-caption-lg text-ink-2">Saldo kartu</span>
      <span className="text-title-md text-ink tabular-nums">Rp12.500.000</span>
    </Surface>
  )
}
