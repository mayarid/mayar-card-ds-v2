import { Button } from '@/components/ui/button'
import { ToastProvider, Toaster, createToaster, useToast } from '@/components/ui/toast'

function Buttons() {
  const toast = useToast()
  return (
    <div className="flex flex-wrap justify-center gap-2">
      <Button variant="secondary" onClick={() => toast('Nomor kartu disalin')}>
        Default
      </Button>
      <Button variant="secondary" onClick={() => toast.success('Kartu berhasil dibuat')}>
        Success
      </Button>
      <Button variant="secondary" onClick={() => toast.error('Gagal menutup kartu')}>
        Error
      </Button>
      <Button variant="secondary" onClick={() => toast.warning('Saldo kartu hampir habis')}>
        Warning
      </Button>
      <Button variant="secondary" onClick={() => toast.info('Laporan sedang disiapkan')}>
        Info
      </Button>
      <Button variant="secondary" onClick={() => toast.loading('Memproses…')}>
        Loading
      </Button>
    </div>
  )
}

// In the app, wrap the root once: <ToastProvider><App /><Toaster /></ToastProvider>.
const toaster = createToaster()

export default function ToastTypes() {
  return (
    <ToastProvider toaster={toaster}>
      <Buttons />
      <Toaster />
    </ToastProvider>
  )
}
