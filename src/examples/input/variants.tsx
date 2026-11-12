import { Input } from '@/components/ui/input'

export default function InputVariants() {
  return (
    <div className="flex w-80 flex-col gap-3">
      <Input aria-label="Nama kartu" placeholder="Default" />
      <Input variant="ghost" aria-label="Judul" placeholder="Ghost" />
      <Input variant="inline" aria-label="Nama tim" defaultValue="Tim Keuangan" />
    </div>
  )
}
