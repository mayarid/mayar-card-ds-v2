import { CARD_SKIN_LABELS, CARD_SKINS, CardFace } from '@/components/ui/card-face'

export default function CardFaceSkins() {
  return (
    <ul className="grid grid-cols-3 gap-4">
      {CARD_SKINS.map((skin) => (
        <li key={skin} className="flex flex-col gap-2">
          <CardFace skin={skin} last4="1907" holder="BUDI SANTOSO" width={180} />
          <span className="text-caption-lg text-ink-2">{CARD_SKIN_LABELS[skin]}</span>
        </li>
      ))}
    </ul>
  )
}
