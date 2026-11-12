import { ChoiceCard, ChoiceCardGroup } from '@/components/ui/choice-card'

export default function ChoiceCardLeading() {
  return (
    <ChoiceCardGroup aria-label="Sesuaikan saldo" defaultValue="add" className="w-full max-w-sm">
      <ChoiceCard variant="leading" value="add" title="Tambah saldo" description="Pindahkan dana dari saldo utama." />
      <ChoiceCard variant="leading" value="withdraw" title="Tarik saldo" description="Kembalikan dana ke saldo utama." />
      <ChoiceCard variant="leading" value="reset" title="Atur ulang" description="Hanya untuk kartu yang dibekukan." disabled />
    </ChoiceCardGroup>
  )
}
