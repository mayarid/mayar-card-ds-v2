import { Button } from '@/components/ui/button'
import {
  SectionCard,
  SectionCardAside,
  SectionCardBody,
  SectionCardHeader,
  SectionCardTitle,
} from '@/components/ui/section-card'

export default function SectionCardBasic() {
  return (
    <SectionCard className="w-full max-w-md">
      <SectionCardHeader>
        <SectionCardTitle>Akun</SectionCardTitle>
        <SectionCardAside>
          <Button variant="link-muted" size="sm">
            Ubah
          </Button>
        </SectionCardAside>
      </SectionCardHeader>
      <SectionCardBody>
        <div className="flex justify-between text-body-sm">
          <span className="text-ink-2">Nama</span>
          <span className="text-ink">Rina Wulandari</span>
        </div>
        <div className="flex justify-between text-body-sm">
          <span className="text-ink-2">Email</span>
          <span className="text-ink">rina@contoh.id</span>
        </div>
      </SectionCardBody>
    </SectionCard>
  )
}
