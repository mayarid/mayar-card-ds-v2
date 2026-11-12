import { Textarea } from '@/components/ui/textarea'

export default function TextareaGhost() {
  return (
    <Textarea
      variant="ghost"
      aria-label="Deskripsi"
      rows={2}
      defaultValue="Kartu untuk langganan software tim produk."
      className="w-80"
    />
  )
}
