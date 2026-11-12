import { Button } from '@/components/ui/button'
import { ToastProvider, Toaster, createToaster, useToast } from '@/components/ui/toast'

function closeCard(fail: boolean) {
  return new Promise<string>((resolve, reject) =>
    window.setTimeout(() => (fail ? reject(new Error('timeout')) : resolve('Marketing')), 1500),
  )
}

function Buttons() {
  const toast = useToast()

  function run(fail: boolean) {
    toast
      .promise(closeCard(fail), {
        loading: 'Menutup kartu…',
        success: (name) => `Kartu ${name} ditutup`,
        error: { title: 'Gagal menutup kartu', description: 'Coba lagi sebentar lagi.' },
      })
      .catch(() => {})
  }

  return (
    <div className="flex gap-2">
      <Button variant="secondary" onClick={() => run(false)}>
        Berhasil
      </Button>
      <Button variant="secondary" onClick={() => run(true)}>
        Gagal
      </Button>
    </div>
  )
}

const toaster = createToaster()

export default function ToastPromise() {
  return (
    <ToastProvider toaster={toaster}>
      <Buttons />
      <Toaster />
    </ToastProvider>
  )
}
