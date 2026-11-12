import { Surface } from '@/components/ui/surface'

export default function SurfaceKinds() {
  return (
    <div className="grid w-full grid-cols-2 gap-3 sm:grid-cols-5">
      <Surface elevated className="text-body-sm">Container</Surface>
      <Surface variant="subtle" className="text-body-sm">Subtle</Surface>
      <Surface variant="strong" className="text-body-sm">Strong</Surface>
      <Surface variant="card" className="text-body-sm">Card</Surface>
      <Surface variant="transparent" className="text-body-sm">Transparent</Surface>
    </div>
  )
}
