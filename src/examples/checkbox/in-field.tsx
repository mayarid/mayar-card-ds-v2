import { Field } from '@base-ui/react/field'

import { Checkbox } from '@/components/ui/checkbox'

export default function CheckboxInField() {
  return (
    <Field.Root invalid className="flex flex-col gap-1">
      <Field.Label className="inline-flex min-h-11 cursor-pointer items-start gap-2 text-body-sm font-medium text-ink">
        <Checkbox name="syarat" required className="mt-0.5" />
        Saya setuju dengan syarat penggunaan kartu
      </Field.Label>
      <Field.Error match className="text-caption-lg text-danger-text">
        Centang dulu untuk melanjutkan.
      </Field.Error>
    </Field.Root>
  )
}
