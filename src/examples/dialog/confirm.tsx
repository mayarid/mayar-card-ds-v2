import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTrigger,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export default function DialogConfirm() {
  return (
    <AlertDialog>
      <AlertDialogTrigger render={<Button variant="danger-subtle" />}>Tutup kartu</AlertDialogTrigger>
      <AlertDialogContent>
        <DialogHeader className="pt-6">
          <DialogTitle>Tutup kartu ini?</DialogTitle>
          <DialogDescription>Kartu tidak bisa dipakai lagi. Sisa saldo kembali ke akun utama.</DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4">
          <DialogClose render={<Button variant="secondary" size="lg" />}>Batal</DialogClose>
          <DialogClose render={<Button variant="danger" size="lg" />}>Tutup kartu</DialogClose>
        </DialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
