import { ArrowDown01Icon, ArrowUp01Icon } from '@hugeicons/core-free-icons'

import { Button } from '@/components/ui/button'
import { Dialog, DialogBody, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Icon } from '@/components/ui/icon'

const rows = [
  ['Merchant', 'Tokopedia'],
  ['Kartu', 'Marketing •••• 4821'],
  ['Tanggal', '12 Nov 2026, 14.20'],
  ['Status', 'Berhasil'],
]

export default function DialogDrawer() {
  return (
    <Dialog>
      <DialogTrigger render={<Button variant="secondary" />}>Lihat detail</DialogTrigger>
      <DialogContent
        placement="drawer"
        header="none"
        aria-label="Detail transaksi"
        toolbar={
          <>
            <Button variant="ghost" size="icon-md" aria-label="Transaksi sebelumnya">
              <Icon icon={ArrowUp01Icon} />
            </Button>
            <Button variant="ghost" size="icon-md" aria-label="Transaksi berikutnya">
              <Icon icon={ArrowDown01Icon} />
            </Button>
          </>
        }
      >
        <DialogBody className="pt-16">
          <DialogTitle className="text-title-md">Rp 1.250.000</DialogTitle>
          <dl className="mt-6 flex flex-col gap-3">
            {rows.map(([term, value]) => (
              <div key={term} className="flex justify-between gap-4 text-body-sm">
                <dt className="text-ink-2">{term}</dt>
                <dd className="m-0 font-medium">{value}</dd>
              </div>
            ))}
          </dl>
        </DialogBody>
      </DialogContent>
    </Dialog>
  )
}
