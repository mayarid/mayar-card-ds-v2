import { SnowIcon, Tick02Icon } from '@hugeicons/core-free-icons'

import { Badge } from '@/components/ui/badge'
import { CardFace, type CardSkin, type CardStatus } from '@/components/ui/card-face'
import { Icon } from '@/components/ui/icon'
import { UsageBar } from '@/components/ui/usage-bar'

const rupiahFormat = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })
const rupiah = (value: number) => rupiahFormat.format(value)

// Fake data.
const cards: { id: string; name: string; holder: string; skin: CardSkin; status: CardStatus; last4: string; balance: number; spent: number; limit: number }[] = [
  { id: 'c1', name: 'Iklan Meta', holder: 'Budi Santoso', skin: 'magenta', status: 'active', last4: '1907', balance: 2_350_000, spent: 1_650_000, limit: 4_000_000 },
  { id: 'c2', name: 'Konsumsi Kantor', holder: 'Siti Rahma', skin: 'midnight', status: 'frozen', last4: '7730', balance: 500_000, spent: 300_000, limit: 1_000_000 },
]

export default function CardFaceGridTile() {
  return (
    <ul className="grid w-full max-w-[560px] grid-cols-2 gap-4">
      {cards.map((card) => {
        const pct = Math.round((card.spent / card.limit) * 100)
        return (
          <li key={card.id} className="relative flex flex-col gap-3 rounded-2xl bg-surface p-2.5 shadow-control">
            <CardFace
              skin={card.skin}
              label={card.name}
              last4={card.last4}
              holder={card.holder.toUpperCase()}
              status={card.status}
              width="auto"
            />
            <div className="flex flex-col gap-3 px-1.5 pb-1.5">
              <div className="flex items-start justify-between gap-2">
                <div className="flex min-w-0 flex-col">
                  {/* The name is the link; its ::after stretches over the whole tile. */}
                  <a
                    href={`#kartu-${card.id}`}
                    className="truncate text-body-sm font-medium text-ink no-underline outline-none after:absolute after:inset-0 after:rounded-2xl focus-visible:after:outline-focus"
                  >
                    {card.name}
                  </a>
                  <span className="truncate text-caption-lg text-muted">{card.holder}</span>
                </div>
                {card.status === 'frozen' ? (
                  <Badge variant="brand" size="lg">
                    <Icon icon={SnowIcon} size={14} />
                    Dibekukan
                  </Badge>
                ) : (
                  <Badge variant="success" size="lg">
                    <Icon icon={Tick02Icon} size={14} />
                    Aktif
                  </Badge>
                )}
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-caption-lg text-muted">Saldo</span>
                <span className="text-body-sm font-semibold text-ink tabular-nums">{rupiah(card.balance)}</span>
              </div>
              <div className="flex flex-col gap-1.5">
                <UsageBar value={pct} />
                <div className="flex justify-between text-caption-lg tabular-nums">
                  <span className="text-muted">
                    {rupiah(card.spent)} / {card.limit.toLocaleString('id-ID')}
                  </span>
                  <span className="text-ink-2">{pct}%</span>
                </div>
              </div>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
