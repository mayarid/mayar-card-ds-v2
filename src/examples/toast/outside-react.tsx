import { Button } from '@/components/ui/button'
import { ToastProvider, Toaster, createToaster } from '@/components/ui/toast'

// lib/toaster.ts — the app uses the exported `toast` from components/ui/toast the same way.
const toaster = createToaster()

// Any module can call it, e.g. an API client after a request.
async function copyCardNumber() {
  try {
    await navigator.clipboard.writeText('4821 0000 0000 4821')
    toaster('Nomor kartu disalin')
  } catch {
    toaster.error('Gagal menyalin nomor kartu')
  }
}

export default function ToastOutsideReact() {
  return (
    <ToastProvider toaster={toaster}>
      <Button variant="secondary" onClick={copyCardNumber}>
        Salin nomor kartu
      </Button>
      <Toaster />
    </ToastProvider>
  )
}
