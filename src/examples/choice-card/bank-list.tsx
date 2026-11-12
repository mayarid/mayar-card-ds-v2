import { ChoiceCard, ChoiceCardGroup, ChoiceCardList } from '@/components/ui/choice-card'

const BANKS = [
  { value: 'bca', name: 'BCA' },
  { value: 'bni', name: 'BNI' },
  { value: 'bri', name: 'BRI' },
  { value: 'mandiri', name: 'Mandiri' },
]

export default function ChoiceCardBankList() {
  return (
    <ChoiceCardGroup aria-label="Bank tujuan" defaultValue="bca" className="w-full max-w-xs">
      <ChoiceCardList>
        {BANKS.map((bank) => (
          <ChoiceCard
            key={bank.value}
            variant="list"
            value={bank.value}
            title={bank.name}
            leading={
              <span className="flex size-7 items-center justify-center rounded-md bg-well text-caption-sm text-ink-2">
                {bank.name.slice(0, 2)}
              </span>
            }
          />
        ))}
      </ChoiceCardList>
    </ChoiceCardGroup>
  )
}
