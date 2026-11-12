import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Dialog, DialogBody, DialogDescription, DialogPanel, DialogTitle } from '@/components/ui/dialog'
import {
  PinGate,
  PinGateActionSeparator,
  PinGateActions,
  PinGateDescription,
  PinGateField,
  PinGateHeader,
  PinGateIcon,
  PinGateTitle,
  type PinGateStatus,
  type PinGateStep,
} from '@/components/ui/pin-gate'
import type { ComponentDoc, MatrixAxisItem, PropValue } from '@/docs/types'
import pinGateSource from '@/registry/ui/pin-gate.tsx?raw'

const TEXT = {
  verify: ['Masukkan PIN Anda', 'Masukkan 6 digit PIN Anda untuk melanjutkan'],
  create: ['Buat PIN kartu baru', 'Buat PIN 6 digit baru untuk mengamankan detail kartu Anda'],
  confirm: ['Konfirmasi PIN baru', 'Masukkan ulang PIN 6 digit untuk memastikan sama'],
} as const

/** Demo check for the playground: the right PIN is 246810. */
async function demoCheck(pin: string) {
  await new Promise((resolve) => window.setTimeout(resolve, 700))
  return pin === '246810'
}

interface SpecimenProps {
  status?: PinGateStatus
  value?: string
  message?: string
  step?: PinGateStep
  countdown?: boolean
  links?: boolean
}

function textFor(step?: PinGateStep) {
  return step ? TEXT[step] : TEXT.verify
}

function Specimen({ status, value, message, step, countdown, links = true, dialog }: SpecimenProps & { dialog: boolean }) {
  const [title, subtitle] = textFor(step)
  const [lockEnd] = useState(() => Date.now() + 59_000)
  const gate = (
    <PinGate
      onSubmit={() => false}
      autoFocus={false}
      defaultStatus={status}
      defaultValue={value}
      defaultMessage={message}
      confirm={Boolean(step)}
      defaultStep={step}
      lockedUntil={countdown ? lockEnd : undefined}
    >
      <PinGateHeader>
        <PinGateIcon />
        {dialog ? <DialogTitle>{title}</DialogTitle> : <PinGateTitle>{title}</PinGateTitle>}
        {dialog ? (
          <DialogDescription className="text-ink-2">{subtitle}</DialogDescription>
        ) : (
          <PinGateDescription>{subtitle}</PinGateDescription>
        )}
      </PinGateHeader>
      <PinGateField />
      {links && !step ? (
        <PinGateActions>
          <Button variant="link">Lupa PIN?</Button>
          {status !== 'locked' ? (
            <>
              <PinGateActionSeparator />
              <Button variant="link-muted">Atur PIN baru</Button>
            </>
          ) : null}
        </PinGateActions>
      ) : null}
    </PinGate>
  )

  if (!dialog) return <div className="w-[360px]">{gate}</div>
  return (
    <Dialog>
      <DialogPanel size="sm" header="none" className="shadow-drawer">
        <DialogBody>{gate}</DialogBody>
      </DialogPanel>
    </Dialog>
  )
}

const STATES: MatrixAxisItem[] = [
  { label: 'Empty', props: {} },
  { label: 'Typing', props: { value: '1234' } },
  { label: 'Checking', props: { status: 'checking', value: '123456', message: 'Memeriksa PIN…' }, codeOnly: true },
  { label: 'Wrong PIN', props: { status: 'error', message: 'PIN salah. Sisa 4 percobaan sebelum PIN terkunci.' } },
  { label: 'Locked', props: { status: 'locked' } },
  { label: 'Locked (countdown)', props: { countdown: true }, codeOnly: true },
  { label: 'Success', props: { status: 'success', value: '246810', message: 'PIN benar.' }, codeOnly: true },
  { label: 'Set: create', props: { step: 'create' } },
  { label: 'Set: confirm', props: { step: 'confirm', value: '12' } },
  { label: 'Set: mismatch', props: { step: 'create', status: 'error', message: 'PIN tidak sama, ulangi dari awal.' } },
]

function specimenProps(props: Record<string, PropValue>): SpecimenProps {
  return {
    status: props.status as PinGateStatus | undefined,
    value: props.value as string | undefined,
    message: props.message as string | undefined,
    step: props.step as PinGateStep | undefined,
    countdown: Boolean(props.countdown),
  }
}

function gateCode(props: Record<string, PropValue>, dialog: boolean) {
  const step = props.step as PinGateStep | undefined
  const [title, subtitle] = textFor(step)
  const attrs = [
    'onSubmit={checkPin}',
    step ? 'confirm' : '',
    props.status ? `defaultStatus="${String(props.status)}"` : '',
    props.value ? `defaultValue="${String(props.value)}"` : '',
    props.message ? `defaultMessage="${String(props.message)}"` : '',
    step === 'confirm' ? 'defaultStep="confirm"' : '',
    props.countdown ? 'lockedUntil={lockEnd}' : '',
  ].filter(Boolean)
  const open = `<PinGate ${attrs.join(' ')}>`
  const T = dialog ? 'DialogTitle' : 'PinGateTitle'
  const D = dialog ? 'DialogDescription' : 'PinGateDescription'
  const body = [
    open,
    '  <PinGateHeader>',
    '    <PinGateIcon />',
    `    <${T}>${title}</${T}>`,
    `    <${D}>${subtitle}</${D}>`,
    '  </PinGateHeader>',
    '  <PinGateField />',
    '</PinGate>',
  ].join('\n')
  if (!dialog) return body
  return ['<PinGateDialog open={open} onOpenChange={setOpen}>', ...body.split('\n').map((l) => '  ' + l), '</PinGateDialog>'].join('\n')
}

export const doc: ComponentDoc = {
  slug: 'pin-gate',
  name: 'PIN Gate',
  group: 'Patterns',
  description: 'A PIN prompt before a sensitive action. It submits when every box is filled, and shows checking, wrong PIN, locked and success states.',
  spec: 'wonder',
  wonderRef: 'Dashboard › Kartu Action PIN A Verify / Wrong PIN / Locked / Set Create / Set Confirm v2',
  registry: 'pin-gate',
  baseUi: { name: 'OTPField + Dialog', url: 'https://base-ui.com/react/components/otp-field' },
  source: [{ path: 'components/ui/pin-gate.tsx', code: pinGateSource }],
  playground: {
    controls: [
      { name: 'form', type: 'select', options: ['inline', 'dialog panel'], default: 'inline' },
      { name: 'confirm', type: 'boolean', default: false },
      { name: 'maxAttempts', label: 'lock after 3 tries', type: 'boolean', default: true },
      { name: 'links', type: 'boolean', default: true },
    ],
    render: (values) => {
      const dialog = values.form === 'dialog panel'
      const confirm = Boolean(values.confirm)
      const [title, subtitle] = TEXT[confirm ? 'create' : 'verify']
      const gate = (
        <PinGate
          key={`${String(values.confirm)}-${String(values.maxAttempts)}`}
          onSubmit={demoCheck}
          confirm={confirm}
          maxAttempts={values.maxAttempts ? 3 : undefined}
          lockoutSeconds={20}
          autoFocus={false}
        >
          <PinGateHeader>
            <PinGateIcon />
            {dialog ? <DialogTitle>{title}</DialogTitle> : <PinGateTitle>{title}</PinGateTitle>}
            {dialog ? (
              <DialogDescription className="text-ink-2">{subtitle}</DialogDescription>
            ) : (
              <PinGateDescription>{subtitle}</PinGateDescription>
            )}
          </PinGateHeader>
          <PinGateField />
          {values.links && !confirm ? (
            <PinGateActions>
              <Button variant="link">Lupa PIN?</Button>
              <PinGateActionSeparator />
              <Button variant="link-muted">Atur PIN baru</Button>
            </PinGateActions>
          ) : null}
        </PinGate>
      )
      if (!dialog) return <div className="w-[360px]">{gate}</div>
      return (
        <Dialog>
          <DialogPanel size="sm" header="none" className="shadow-drawer">
            <DialogBody>{gate}</DialogBody>
          </DialogPanel>
        </Dialog>
      )
    },
    code: (values) => {
      const base = gateCode({ step: values.confirm ? 'create' : undefined }, values.form === 'dialog panel')
      return values.maxAttempts ? base.replace('onSubmit={checkPin}', 'onSubmit={checkPin} maxAttempts={3}') : base
    },
  },
  matrices: [
    {
      title: 'States × form',
      description:
        'Every state of the gate, inline and in the dialog panel (Dialog SM, header none). The playground PIN is 246810.',
      rows: STATES,
      columns: [
        { label: 'Dialog', props: { dialog: true } },
        { label: 'Inline', props: { dialog: false }, codeOnly: true },
      ],
      render: (props) => <Specimen {...specimenProps(props)} dialog={Boolean(props.dialog)} />,
      code: (props) => gateCode(props, Boolean(props.dialog)),
      cellWidth: 420,
    },
  ],
  examples: [
    {
      id: 'pin-gate/dialog',
      title: 'Show card details',
      description: 'PinGateDialog with the links. The right PIN is 246810. Esc and the close button do nothing while the PIN is checked.',
    },
    { id: 'pin-gate/set-pin', title: 'Create a PIN', description: 'confirm asks twice; usePinGate() switches the title for each step.' },
    {
      id: 'pin-gate/inline',
      title: 'Inline, client-side lock',
      description: 'maxAttempts={3} locks the boxes for lockoutSeconds with a countdown. The right PIN is 246810.',
      codeOnly: true,
    },
    {
      id: 'pin-gate/server-lock',
      title: 'Server tries and lock',
      description: 'onSubmit returns { attemptsLeft } and then { locked, retryAfter }.',
      codeOnly: true,
    },
  ],
  props: [
    { name: 'onSubmit', type: '(pin: string) => Promise<PinGateResult> | PinGateResult', description: 'Checks the PIN. true: match. false or { error?, attemptsLeft?, locked?, retryAfter? }: wrong or locked. A throw counts as wrong (its message becomes the line).' },
    { name: 'onSuccess', type: '(pin: string) => void', description: 'After a match. Close the dialog or continue the action.' },
    { name: 'onStatusChange', type: '(status: PinGateStatus) => void', description: 'idle, checking, error, locked, success.' },
    { name: 'length', type: '4 | 6', default: '6', description: 'Number of boxes.' },
    { name: 'value / defaultValue / onValueChange', type: 'string', description: 'The typed digits, controlled or uncontrolled. The gate clears them after a wrong PIN.' },
    { name: 'maxAttempts', type: 'number', description: 'Client-side lock after this many wrong tries in a row.' },
    { name: 'lockoutSeconds', type: 'number', default: '30', description: 'Length of the client-side lock.' },
    { name: 'lockedUntil', type: 'number | Date', description: 'A lock end from your server. Shows the countdown until then.' },
    { name: 'confirm', type: 'boolean', default: 'false', description: 'Create + confirm: asks twice, restarts on a mismatch, submits the matched PIN.' },
    { name: 'errorMessage / mismatchMessage / checkingMessage / successMessage', type: 'string', description: 'The line under the boxes for each case.' },
    { name: 'defaultStatus / defaultMessage / defaultStep', type: 'PinGateStatus / string / "create" | "confirm"', description: 'Start state. For a gate that opens locked, and for docs and QA pages.' },
    { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables the boxes.' },
    { name: 'autoFocus', type: 'boolean', default: 'true', description: 'Focus the first box on mount. PinGateDialog focuses it on open.' },
    { name: 'PinGateField label', type: 'string', default: '"PIN"', description: 'Accessible name of the first box (visually hidden).' },
    { name: 'PinGateDialog', type: 'Dialog props (open, defaultOpen, onOpenChange, dismiss) + closeLabel', description: 'The modal form. Blocks every close path while checking.' },
  ],
  guidelines: {
    do: [
      'Check the PIN on the server. Return attemptsLeft and retryAfter so the user knows what happens next.',
      'Use DialogTitle and DialogDescription in the header of PinGateDialog, so the dialog has a name.',
      'Close the dialog or continue the action in onSuccess, after a short pause so the success line is seen.',
      'Use confirm when the user creates or changes a PIN.',
    ],
    dont: [
      'Do not show a demo PIN or a hint on the gate.',
      'Do not add a submit button: the gate submits when the last box is filled.',
      'Do not hide "Atur PIN baru" behind the lock: hide it, as the gate does on the Locked specimen.',
    ],
  },
  notes: [
    'Wonder specifies Verify (empty), Wrong PIN, Locked, Set Create and Set Confirm in the dialog. Checking, Success, the lock countdown and the inline form are code-only.',
    'Wonder locked line: "PIN terkunci sementara. Coba beberapa saat lagi." with no time. The countdown ("Coba lagi dalam 0:59") is code-only and shows only when the end time is known.',
    'Wonder wrong-PIN line: "PIN salah. Sisa 4 percobaan sebelum PIN terkunci." The app shows "PIN salah, coba lagi". This port writes the Wonder line when attemptsLeft is known and the app line otherwise.',
    'Wonder panel shadow is 0 24px 48px shadow-modal, not the dialog elevation; PinGateDialog uses shadow-drawer (the same drop plus the 1px ring).',
    'Wonder subtitle is ink-2; DialogDescription is muted by default, so the examples pass className="text-ink-2".',
    'The step dots of confirm (6px, the active one 16px wide) come from the app; the Set Confirm specimen has the same shape.',
    'The Dashboard page id in the brief was the Auth page; the specimens were read from the Dashboard page.',
  ],
}
