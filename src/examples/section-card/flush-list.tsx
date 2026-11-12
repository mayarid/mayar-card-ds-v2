import { Badge } from '@/components/ui/badge'
import {
  SectionCard,
  SectionCardBody,
  SectionCardFooter,
  SectionCardHeader,
  SectionCardTitle,
} from '@/components/ui/section-card'

const CARDS = [
  { name: 'Iklan Meta', last4: '4821', status: 'Aktif' },
  { name: 'Langganan SaaS', last4: '1190', status: 'Aktif' },
  { name: 'Perjalanan', last4: '7735', status: 'Dibekukan' },
]

export default function SectionCardFlushList() {
  return (
    <SectionCard className="w-full max-w-md">
      <SectionCardHeader>
        <SectionCardTitle>Kartu</SectionCardTitle>
        <span className="text-caption-lg text-ink-2">3 kartu</span>
      </SectionCardHeader>
      <SectionCardBody flush>
        <ul className="divide-y divide-border-subtle">
          {CARDS.map((card) => (
            <li key={card.last4} className="flex items-center justify-between px-5 py-3 text-body-sm">
              <span className="text-ink">
                {card.name} <span className="text-ink-2">•••• {card.last4}</span>
              </span>
              <Badge variant={card.status === 'Aktif' ? 'success' : 'default'}>{card.status}</Badge>
            </li>
          ))}
        </ul>
      </SectionCardBody>
      <SectionCardFooter className="border-t border-border-subtle text-caption-lg text-ink-2">
        Diperbarui 5 menit lalu
      </SectionCardFooter>
    </SectionCard>
  )
}
