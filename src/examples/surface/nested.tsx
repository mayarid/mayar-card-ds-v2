import { Surface } from '@/components/ui/surface'

export default function SurfaceNested() {
  return (
    <Surface variant="card" radius="3xl" padding={4} className="w-full max-w-xs">
      <Surface elevated padding={12} nested={{ outerRadius: '3xl', padding: 4, ring: 'subtle' }}>
        <span className="text-body-sm font-medium text-ink">3 dari 10 kartu</span>
        <span className="text-caption-lg text-ink-2">Kuota kartu virtual</span>
      </Surface>
      <span className="px-3 py-2 text-caption-lg text-ink-2">Naikkan paket untuk kartu lebih banyak.</span>
    </Surface>
  )
}
