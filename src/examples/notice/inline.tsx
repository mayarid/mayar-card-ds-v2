import { Button } from '@/components/ui/button'
import { Notice } from '@/components/ui/notice'

export default function NoticeInline() {
  return (
    <form className="flex w-full max-w-sm flex-col gap-4" onSubmit={(e) => e.preventDefault()}>
      <label className="flex flex-col gap-1.5 text-body-sm font-medium">
        Nama kartu
        <input
          defaultValue="Marketing"
          className="h-9 rounded-lg bg-surface px-3 text-body-base shadow-control outline-none focus-ring:outline-focus"
        />
      </label>
      <Notice tone="danger" variant="inline">
        Gagal menyimpan. Coba lagi.
      </Notice>
      <Notice tone="info" variant="inline">
        Nama tampil di daftar kartu dan laporan.
      </Notice>
      <Button type="submit" className="self-end">
        Simpan
      </Button>
    </form>
  )
}
