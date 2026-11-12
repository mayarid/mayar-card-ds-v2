import {
  Select,
  SelectContent,
  SelectGroup,
  SelectGroupLabel,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const categories = {
  transportasi: 'Transportasi',
  makan: 'Makan & minum',
  iklan: 'Iklan digital',
  event: 'Event',
}

export default function SelectGroups() {
  return (
    <Select items={categories}>
      <SelectTrigger aria-label="Kategori pengeluaran" className="w-64">
        <SelectValue placeholder="Pilih kategori" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectGroupLabel>Operasional</SelectGroupLabel>
          <SelectItem value="transportasi">Transportasi</SelectItem>
          <SelectItem value="makan">Makan & minum</SelectItem>
        </SelectGroup>
        <SelectSeparator />
        <SelectGroup>
          <SelectGroupLabel>Pemasaran</SelectGroupLabel>
          <SelectItem value="iklan">Iklan digital</SelectItem>
          <SelectItem value="event" disabled>
            Event
          </SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
