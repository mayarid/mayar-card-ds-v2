import { RadioGroup, RadioGroupItem } from '@/components/ui/radio'

export default function RadioBasic() {
  return (
    <RadioGroup aria-label="Periode limit" defaultValue="bulanan" name="periode">
      <RadioGroupItem value="harian">Harian</RadioGroupItem>
      <RadioGroupItem value="mingguan">Mingguan</RadioGroupItem>
      <RadioGroupItem value="bulanan">Bulanan</RadioGroupItem>
    </RadioGroup>
  )
}
