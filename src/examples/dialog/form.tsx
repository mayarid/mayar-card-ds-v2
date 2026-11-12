import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

export default function DialogForm() {
  return (
    <Dialog>
      <DialogTrigger render={<Button />}>Atur batas</DialogTrigger>
      <DialogContent header="divided">
        <DialogHeader>
          <DialogTitle>Batas pengeluaran</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <label className="flex flex-col gap-1.5 text-body-sm font-medium">
            Batas per bulan
            <input
              inputMode="numeric"
              defaultValue="5.000.000"
              className="h-9 rounded-lg bg-surface px-3 text-body-base shadow-control outline-none focus-ring:outline-focus"
            />
          </label>
        </DialogBody>
        <DialogFooter>
          <DialogClose render={<Button variant="secondary" size="lg" />}>Batal</DialogClose>
          <DialogClose render={<Button size="lg" />}>Simpan</DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
