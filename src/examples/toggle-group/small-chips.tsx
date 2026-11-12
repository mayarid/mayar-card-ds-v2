import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

export default function ToggleGroupSmallChips() {
  return (
    <ToggleGroup aria-label="Kategori" size="sm" defaultValue="all" className="max-w-xs">
      <ToggleGroupItem value="all">Semua</ToggleGroupItem>
      <ToggleGroupItem value="ads">Iklan</ToggleGroupItem>
      <ToggleGroupItem value="saas">Langganan</ToggleGroupItem>
      <ToggleGroupItem value="travel">Perjalanan</ToggleGroupItem>
      <ToggleGroupItem value="food">Makanan</ToggleGroupItem>
      <ToggleGroupItem value="other" disabled>
        Lainnya
      </ToggleGroupItem>
    </ToggleGroup>
  )
}
