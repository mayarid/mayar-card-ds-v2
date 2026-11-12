import { Field, FieldLabel, FieldPair, FieldPairLegend } from '@/components/ui/field'
import { Input } from '@/components/ui/input'

export default function FieldPairExample() {
  return (
    <FieldPair aria-describedby="exp-help" className="w-80">
      <FieldPairLegend className="sr-only">Masa berlaku</FieldPairLegend>
      <Field>
        <FieldLabel required>Bulan</FieldLabel>
        <Input inputMode="numeric" placeholder="MM" maxLength={2} defaultValue="12" />
      </Field>
      <Field>
        <FieldLabel required>Tahun</FieldLabel>
        <Input inputMode="numeric" placeholder="YYYY" maxLength={4} defaultValue="2028" />
      </Field>
      <p id="exp-help" className="m-0 text-caption-lg text-ink-2">
        Sesuai yang tertera di kartu.
      </p>
    </FieldPair>
  )
}
