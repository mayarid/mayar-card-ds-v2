import { Button } from '@/components/ui/button'
import { Notice } from '@/components/ui/notice'

export default function NoticeBanner() {
  return (
    <div className="flex w-full max-w-xl flex-col gap-3">
      <Notice
        tone="danger"
        role="note"
        title="Akun diblokir"
        action={
          <Button variant="secondary" size="sm">
            Buka blokir
          </Button>
        }
      >
        Pengguna tidak bisa masuk sampai blokir dibuka.
      </Notice>
      <Notice tone="warning" role="note" bodyTone="tone">
        KYC belum lengkap. Lengkapi data untuk membuat kartu.
      </Notice>
    </div>
  )
}
