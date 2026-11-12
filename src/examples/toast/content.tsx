import { Button } from '@/components/ui/button'
import { ToastProvider, Toaster, createToaster, useToast } from '@/components/ui/toast'

function Buttons() {
  const toast = useToast()
  return (
    <div className="flex flex-wrap justify-center gap-2">
      <Button
        variant="secondary"
        onClick={() => toast.success({ title: 'Kartu berhasil dibuat', description: 'Kartu siap dipakai untuk transaksi.' })}
      >
        Dengan deskripsi
      </Button>
      <Button
        variant="secondary"
        onClick={() =>
          toast.info({
            title: 'Laporan November siap',
            description: 'Unduh sekarang?',
            action: { label: 'Unduh', onClick: () => window.open('#laporan') },
            cancel: { label: 'Nanti' },
          })
        }
      >
        Dengan aksi
      </Button>
      <Button variant="secondary" onClick={() => toast.warning({ title: 'Saldo kartu hampir habis', closable: true })}>
        Dengan tombol tutup
      </Button>
    </div>
  )
}

const toaster = createToaster()

export default function ToastContent() {
  return (
    <ToastProvider toaster={toaster}>
      <Buttons />
      <Toaster />
    </ToastProvider>
  )
}
