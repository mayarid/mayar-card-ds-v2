import { Notice } from '@/components/ui/notice'

export default function NoticeLines() {
  return (
    <div className="w-full max-w-xl">
      <Notice tone="neutral" title="Paket akan berubah">
        <p>Paket Business aktif mulai 1 Desember 2026.</p>
        <p>Batas kartu naik dari 10 ke 50.</p>
      </Notice>
    </div>
  )
}
