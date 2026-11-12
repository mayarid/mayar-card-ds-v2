import { OtpInput } from '@/components/ui/otp-input'
import type { ComponentDoc, MatrixAxisItem, PropValue } from '@/docs/types'
import { toJsx } from '@/gallery/jsx'
import otpSource from '@/registry/ui/otp-input.tsx?raw'

type OtpSize = 'md' | 'lg'

const STATES: MatrixAxisItem[] = [
  { label: 'Empty' },
  { label: 'Active', force: 'focus', props: { defaultValue: '12' } },
  { label: 'Filled', props: { defaultValue: '123456' } },
  { label: 'Masked', props: { defaultValue: '1234', mask: true } },
  { label: 'Invalid', props: { defaultValue: '123456', invalid: true } },
  { label: 'Disabled', props: { disabled: true } },
]

const DEFAULTS = { size: 'md', length: 6 }

function render(props: Record<string, PropValue>, force?: string) {
  const length = props.length === 4 ? 4 : 6
  const id = `otp-${String(props.size ?? 'md')}-${length}-${String(props.defaultValue ?? '')}-${force ?? ''}-${props.mask ? 'm' : ''}${props.invalid ? 'i' : ''}${props.disabled ? 'd' : ''}`
  return (
    <div>
      <label htmlFor={id} className="sr-only">
        Kode verifikasi
      </label>
      <OtpInput
        key={String(props.defaultValue ?? '')}
        id={id}
        size={props.size as OtpSize}
        length={length}
        mask={Boolean(props.mask)}
        invalid={Boolean(props.invalid)}
        disabled={Boolean(props.disabled)}
        defaultValue={props.defaultValue === undefined ? undefined : String(props.defaultValue).slice(0, length)}
        data-force-state={force}
      />
    </div>
  )
}

function code(props: Record<string, PropValue>) {
  return toJsx('OtpInput', props, undefined, DEFAULTS)
}

export const doc: ComponentDoc = {
  slug: 'otp-input',
  name: 'OTP / PIN input',
  group: 'Forms',
  description: 'One slot for each digit of a one-time code or a PIN. Paste fills every slot; arrows and Backspace move between slots.',
  spec: 'wonder',
  wonderRef: 'Mayar Forms Inputs Guide › OTP',
  registry: 'otp-input',
  baseUi: { name: 'OTP Field', url: 'https://base-ui.com/react/components/otp-field' },
  source: [{ path: 'components/ui/otp-input.tsx', code: otpSource }],
  playground: {
    controls: [
      { name: 'size', type: 'select', options: ['md', 'lg'], default: 'md' },
      { name: 'length', type: 'select', options: ['6', '4'], default: '6' },
      { name: 'mask', type: 'boolean', default: false },
      { name: 'invalid', type: 'boolean', default: false },
      { name: 'disabled', type: 'boolean', default: false },
    ],
    render: (values) => render({ ...values, length: Number(values.length) }),
    code: (values) => code({ ...values, length: Number(values.length) }),
  },
  matrices: [
    {
      title: 'Sizes × states',
      description: 'Active forces focus on the next empty slot. LG is the PIN gate box and shows a dot when masked.',
      rows: [
        { label: 'MD', props: { size: 'md' } },
        { label: 'MD · 4 digits', props: { size: 'md', length: 4 }, codeOnly: true },
        { label: 'LG', props: { size: 'lg' }, codeOnly: true },
      ],
      columns: STATES,
      render,
      code,
      cellWidth: 340,
    },
  ],
  examples: [
    { id: 'otp-input/verification', title: 'Verification code', description: 'In a Field with a label and a description.' },
    { id: 'otp-input/wrong-code', title: 'Wrong code', description: 'Set invalid on the Field when the code is wrong. The slots shake once. Try 123456.' },
    { id: 'otp-input/pin', title: 'PIN', description: 'LG, masked, autoComplete="off" so password managers do not offer a code.', codeOnly: true },
  ],
  props: [
    { name: 'length', type: '4 | 6', default: '6', description: 'Number of slots. 6 at MD shows two groups of 3.' },
    { name: 'size', type: '"md" | "lg"', default: '"md"', description: 'MD 40×40; LG 44×52 (PIN gate).' },
    { name: 'mask', type: 'boolean', default: 'false', description: 'Hides the digits. LG shows a 10px dot in each filled slot.' },
    { name: 'invalid', type: 'boolean', default: 'false', description: 'Invalid paint and aria-invalid on every slot; shakes once when it turns true. Inside a Field, set invalid on the Field.' },
    { name: 'value / defaultValue', type: 'string', description: 'Controlled or uncontrolled digits.' },
    { name: 'onValueChange', type: '(value: string, details) => void', description: 'Called with the joined digits.' },
    { name: 'onValueComplete', type: '(value: string, details) => void', description: 'Called when every slot is filled.' },
    { name: 'autoComplete', type: 'string', default: '"one-time-code"', description: 'On the first slot. Use "off" for a PIN.' },
    { name: 'slotLabel', type: '(index, length) => string', default: '"Digit n dari N"', description: 'Accessible name of slots 2…n. The first slot takes the field label.' },
    { name: 'autoSubmit, name, required, disabled, readOnly', type: 'Base UI OTPField.Root', description: 'Passed to Base UI.' },
  ],
  guidelines: {
    do: [
      'Label it with a Field + FieldLabel, and say where the code was sent in the description.',
      'Check the code in onValueComplete; there is no need for a submit button.',
      'Clear the value after a wrong PIN so the user can type again.',
    ],
    dont: ['Do not mask a one-time code. Mask only a PIN.', 'Do not show a wrong code as a toast.'],
  },
  notes: [
    'The Wonder canvas could not be read while this port was made (the Wonder tools did not answer). Values come from OtpInput.svelte. Check them again against the canvas.',
    'LG (44×52, focus halo, dot) is the PIN gate from the shipped app (Kartu Actions v2) and is code-only, as is the 4-digit length.',
    'Built on Base UI OTPField (it exists in Base UI 1.9), which gives digit-only input, paste, arrow keys, Backspace and autocomplete="one-time-code". The Svelte version used one native input per slot with its own key handling.',
    'Slot names are Indonesian here ("Digit 2 dari 6"); the Svelte default was English ("Digit 2 of 6"). The first slot takes the field label, as Base UI requires.',
    'The Svelte "autofocus" prop (focus the first slot when the value clears) is not ported. Focus the first slot yourself after a wrong PIN.',
  ],
}
