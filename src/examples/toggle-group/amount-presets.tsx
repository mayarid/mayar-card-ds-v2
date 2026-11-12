import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

export default function ToggleGroupAmountPresets() {
  return (
    <div className="w-full max-w-sm">
      <ToggleGroup aria-label="Nominal top up" variant="segmented" defaultValue="500000">
        <ToggleGroupItem value="100000">100rb</ToggleGroupItem>
        <ToggleGroupItem value="500000">500rb</ToggleGroupItem>
        <ToggleGroupItem value="1000000">1jt</ToggleGroupItem>
        <ToggleGroupItem value="5000000">5jt</ToggleGroupItem>
      </ToggleGroup>
    </div>
  )
}
