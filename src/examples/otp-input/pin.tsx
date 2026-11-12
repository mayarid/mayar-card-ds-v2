import { Field, FieldLabel } from '@/components/ui/field'
import { OtpInput } from '@/components/ui/otp-input'

export default function OtpInputPin() {
  return (
    <Field className="w-auto items-center">
      <FieldLabel>Masukkan PIN kartu</FieldLabel>
      <OtpInput size="lg" length={6} mask autoComplete="off" defaultValue="12" />
    </Field>
  )
}
