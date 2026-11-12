import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogPanel,
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPanel,
  DialogTitle,
  DialogTrigger,
  type DialogDismiss,
  type DialogHeaderKind,
} from '@/components/ui/dialog'
import type { ComponentDoc, MatrixAxisItem, PropValue } from '@/docs/types'
import { indent } from '@/gallery/jsx'
import dialogSource from '@/registry/ui/dialog.tsx?raw'

type Size = 'sm' | 'md' | 'lg'
type Placement = 'center' | 'drawer'

const STATES: MatrixAxisItem[] = [
  { label: 'Default', codeOnly: true },
  { label: 'Hover', force: 'hover', codeOnly: true },
  { label: 'Pressed', force: 'pressed', codeOnly: true },
  { label: 'Focus', force: 'focus', codeOnly: true },
  { label: 'Open', force: 'open', codeOnly: true },
]

function Parts({ props }: { props: Record<string, PropValue> }) {
  const header = (props.header as DialogHeaderKind | undefined) ?? 'plain'
  const stacked = Boolean(props.stacked)
  return (
    <>
      {header === 'none' ? null : (
        <DialogHeader aside={stacked ? <span className="text-caption-lg text-ink-2">Langkah 1 dari 3</span> : undefined}>
          <DialogTitle>{stacked ? 'Verifikasi KYC' : 'Atur saldo kartu'}</DialogTitle>
          {props.description !== false ? <DialogDescription>Saldo dipindah dari akun utama.</DialogDescription> : null}
        </DialogHeader>
      )}
      <DialogBody>
        {header === 'none' ? (
          <div className="flex flex-col items-center gap-1 text-center">
            <DialogTitle>Masukkan PIN</DialogTitle>
            <DialogDescription>6 digit PIN akun Anda.</DialogDescription>
          </div>
        ) : (
          <p className="m-0 text-body-sm text-ink-2">Isi dialog. Formulir, ringkasan atau konfirmasi.</p>
        )}
      </DialogBody>
      {props.footer !== false ? (
        <DialogFooter>
          {props.footerStart ? (
            <Button variant="ghost" size="lg" className="mr-auto">
              Bekukan saja
            </Button>
          ) : null}
          <DialogClose render={<Button variant="secondary" size="lg" />}>Batal</DialogClose>
          <Button size="lg" loading={Boolean(props.busy)}>
            Simpan
          </Button>
        </DialogFooter>
      ) : null}
    </>
  )
}

function renderPanel(props: Record<string, PropValue>) {
  return (
    <Dialog dismiss={props.dismiss as DialogDismiss | undefined} busy={Boolean(props.busy)}>
      <DialogPanel
        size={props.size as Size | undefined}
        placement={props.placement as Placement | undefined}
        header={props.header as DialogHeaderKind | undefined}
        className={props.placement === 'drawer' ? 'h-[360px]' : undefined}
      >
        <Parts props={props} />
      </DialogPanel>
    </Dialog>
  )
}

function contentAttrs(props: Record<string, PropValue>) {
  const attrs: string[] = []
  if (props.size && props.size !== 'md') attrs.push(`size="${String(props.size)}"`)
  if (props.placement && props.placement !== 'center') attrs.push(`placement="${String(props.placement)}"`)
  if (props.header && props.header !== 'plain') attrs.push(`header="${String(props.header)}"`)
  if (props.header === 'none') attrs.push('aria-label="Masukkan PIN"')
  return attrs.length ? ' ' + attrs.join(' ') : ''
}

function code(props: Record<string, PropValue>) {
  const rootAttrs = [
    props.dismiss && props.dismiss !== 'auto' ? `dismiss="${String(props.dismiss)}"` : '',
    props.busy ? 'busy' : '',
  ]
    .filter(Boolean)
    .join(' ')
  const header =
    props.header === 'none'
      ? ''
      : [
          props.stacked ? '<DialogHeader aside={<span>Langkah 1 dari 3</span>}>' : '<DialogHeader>',
          '  <DialogTitle>Atur saldo kartu</DialogTitle>',
          props.description !== false ? '  <DialogDescription>Saldo dipindah dari akun utama.</DialogDescription>' : '',
          '</DialogHeader>',
        ]
          .filter(Boolean)
          .join('\n') + '\n'
  const footer =
    props.footer !== false
      ? [
          '<DialogFooter>',
          props.footerStart ? '  <Button variant="ghost" size="lg" className="mr-auto">Bekukan saja</Button>' : '',
          '  <DialogClose render={<Button variant="secondary" size="lg" />}>Batal</DialogClose>',
          `  <Button size="lg"${props.busy ? ' loading' : ''}>Simpan</Button>`,
          '</DialogFooter>',
        ]
          .filter(Boolean)
          .join('\n')
      : ''
  const content = `${header}<DialogBody>…</DialogBody>${footer ? '\n' + footer : ''}`
  return [
    `<Dialog${rootAttrs ? ' ' + rootAttrs : ''}>`,
    '  <DialogTrigger render={<Button />}>Atur saldo</DialogTrigger>',
    `  <DialogContent${contentAttrs(props)}>`,
    indent(content, 4),
    '  </DialogContent>',
    '</Dialog>',
  ].join('\n')
}

function Playground({ values }: { values: Record<string, PropValue> }) {
  return (
    <Dialog dismiss={values.dismiss as DialogDismiss} busy={Boolean(values.busy)}>
      <DialogTrigger render={<Button />}>Atur saldo</DialogTrigger>
      <DialogContent
        size={values.size as Size}
        placement={values.placement as Placement}
        header={values.header as DialogHeaderKind}
        aria-label={values.header === 'none' ? 'Masukkan PIN' : undefined}
      >
        <Parts props={values} />
      </DialogContent>
    </Dialog>
  )
}

const HEADER_ROWS: MatrixAxisItem[] = [
  { label: 'Plain', props: { header: 'plain' }, codeOnly: true },
  { label: 'Divided', props: { header: 'divided' }, codeOnly: true },
  { label: 'None', props: { header: 'none' }, codeOnly: true },
  { label: 'Stacked', props: { header: 'plain', stacked: true }, codeOnly: true },
]

export const doc: ComponentDoc = {
  slug: 'dialog',
  name: 'Dialog',
  group: 'Overlays',
  description:
    'A modal window for a task that needs focus: a centred panel or a drawer from the right edge. AlertDialog asks for a confirm.',
  spec: 'code-only',
  registry: 'dialog',
  baseUi: { name: 'Dialog', url: 'https://base-ui.com/react/components/dialog' },
  source: [{ path: 'components/ui/dialog.tsx', code: dialogSource }],
  playground: {
    controls: [
      { name: 'size', type: 'select', options: ['sm', 'md', 'lg'], default: 'md' },
      { name: 'placement', type: 'select', options: ['center', 'drawer'], default: 'center' },
      { name: 'header', type: 'select', options: ['plain', 'divided', 'none'], default: 'plain' },
      { name: 'dismiss', type: 'select', options: ['auto', 'no-close-button', 'none'], default: 'auto' },
      { name: 'description', type: 'boolean', default: true },
      { name: 'footer', type: 'boolean', default: true },
      { name: 'busy', type: 'boolean', default: false },
    ],
    render: (values) => <Playground values={values} />,
    code,
  },
  matrices: [
    {
      title: 'Header × close paths (MD)',
      description:
        'Static panels, not modal. Plain: 36px close, no hairline. Divided: hairline and 32px close. None: corner close. Stacked: an aside or media in the header.',
      rows: HEADER_ROWS,
      columns: [
        { label: 'dismiss auto', props: { dismiss: 'auto' }, codeOnly: true },
        { label: 'no-close-button', props: { dismiss: 'no-close-button' }, codeOnly: true },
        { label: 'Busy', props: { busy: true }, codeOnly: true },
      ],
      render: (props) => renderPanel(props),
      code,
      cellWidth: 480,
    },
    {
      title: 'Sizes',
      description: 'Max width 400 / 480 / 880. The panel shrinks to the viewport minus 32px.',
      rows: (['sm', 'md', 'lg'] as const).map((s) => ({ label: s.toUpperCase(), props: { size: s }, codeOnly: true })),
      columns: [{ label: 'Plain header', codeOnly: true }],
      render: (props) => renderPanel(props),
      code,
      cellWidth: 880,
    },
    {
      title: 'Placement × footer',
      description: 'Drawer: full height, 8px from the right edge, 430px wide (set --drawer-width for another width).',
      rows: [
        { label: 'Center', props: { placement: 'center' }, codeOnly: true },
        { label: 'Drawer', props: { placement: 'drawer', header: 'divided' }, codeOnly: true },
      ],
      columns: [
        { label: 'Actions', codeOnly: true },
        { label: 'Start control + actions', props: { footerStart: true }, codeOnly: true },
        { label: 'No footer', props: { footer: false }, codeOnly: true },
      ],
      render: (props) => renderPanel(props),
      code,
      cellWidth: 480,
    },
    {
      title: 'Trigger × states',
      description: 'The trigger is a Button. While the dialog is open it gets data-popup-open (the opened: variant).',
      rows: [
        { label: 'Primary', props: { variant: 'primary' }, codeOnly: true },
        { label: 'Secondary', props: { variant: 'secondary' }, codeOnly: true },
        { label: 'Danger', props: { variant: 'danger' }, codeOnly: true },
      ],
      columns: STATES,
      render: (props, force) => (
        <Dialog>
          <DialogTrigger
            render={<Button variant={props.variant as 'primary' | 'secondary' | 'danger'} />}
            data-force-state={force}
          >
            Atur saldo
          </DialogTrigger>
        </Dialog>
      ),
      code: (props) => `<DialogTrigger render={<Button variant="${String(props.variant)}" />}>Atur saldo</DialogTrigger>`,
    },
    {
      title: 'Alert dialog',
      description: 'No close button and no overlay dismiss: the user picks one of the footer actions.',
      rows: [
        { label: 'Danger confirm', props: { tone: 'danger' }, codeOnly: true },
        { label: 'Primary confirm', props: { tone: 'primary' }, codeOnly: true },
      ],
      columns: [{ label: 'SM', codeOnly: true }],
      render: (props) => (
        <AlertDialog>
          <AlertDialogPanel>
            <DialogHeader className="pt-6">
              <DialogTitle>{props.tone === 'danger' ? 'Tutup kartu ini?' : 'Aktifkan kartu?'}</DialogTitle>
              <DialogDescription>
                {props.tone === 'danger'
                  ? 'Kartu tidak bisa dipakai lagi. Sisa saldo kembali ke akun utama.'
                  : 'Kartu bisa langsung dipakai untuk transaksi.'}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="mt-4">
              <DialogClose render={<Button variant="secondary" size="lg" />}>Batal</DialogClose>
              <Button variant={props.tone === 'danger' ? 'danger' : 'primary'} size="lg">
                {props.tone === 'danger' ? 'Tutup kartu' : 'Aktifkan'}
              </Button>
            </DialogFooter>
          </AlertDialogPanel>
        </AlertDialog>
      ),
      code: (props) =>
        [
          '<AlertDialog>',
          '  <AlertDialogTrigger render={<Button variant="danger" />}>Tutup kartu</AlertDialogTrigger>',
          '  <AlertDialogContent>',
          '    <DialogHeader>',
          '      <DialogTitle>Tutup kartu ini?</DialogTitle>',
          '      <DialogDescription>…</DialogDescription>',
          '    </DialogHeader>',
          '    <DialogFooter>',
          '      <DialogClose render={<Button variant="secondary" size="lg" />}>Batal</DialogClose>',
          `      <Button variant="${props.tone === 'danger' ? 'danger' : 'primary'}" size="lg">…</Button>`,
          '    </DialogFooter>',
          '  </AlertDialogContent>',
          '</AlertDialog>',
        ].join('\n'),
      cellWidth: 400,
    },
  ],
  examples: [
    { id: 'dialog/form', title: 'Form dialog', description: 'Divided header, a form body and LG footer buttons.', codeOnly: true },
    { id: 'dialog/drawer', title: 'Drawer', description: 'The Transaksi detail: full height on the right edge.', codeOnly: true },
    { id: 'dialog/confirm', title: 'Confirm (AlertDialog)', description: 'A destroying action asks first.', codeOnly: true },
    {
      id: 'dialog/gate',
      title: 'Mandatory gate',
      description: 'dismiss="none": Esc and the overlay do nothing. The footer gives the way out.',
      codeOnly: true,
    },
    { id: 'dialog/busy', title: 'Busy while saving', description: 'busy locks every close path while the request runs.', codeOnly: true },
  ],
  props: [
    { name: 'Dialog · dismiss', type: '"auto" | "no-close-button" | "none"', default: '"auto"', description: 'Close paths. auto: close button, Esc, overlay. no-close-button: Esc and overlay. none: nothing (a DialogClose you render still closes).' },
    { name: 'Dialog · busy', type: 'boolean', default: 'false', description: 'While a request runs: nothing closes the dialog, the close button is disabled, aria-busy.' },
    { name: 'Dialog · open / defaultOpen / onOpenChange', type: 'boolean / boolean / (open, details) => void', description: 'Controlled or uncontrolled, as in Base UI.' },
    { name: 'DialogContent · size', type: '"sm" | "md" | "lg"', default: '"md"', description: 'Max width 400 / 480 / 880.' },
    { name: 'DialogContent · placement', type: '"center" | "drawer"', default: '"center"', description: 'Drawer: full-height panel on the right edge.' },
    { name: 'DialogContent · header', type: '"plain" | "divided" | "none"', default: '"plain"', description: 'Header shape. Sets the body padding. none puts the close button in the corner.' },
    { name: 'DialogContent · closeLabel', type: 'string', default: '"Tutup"', description: 'Accessible name of the close button.' },
    { name: 'DialogContent · mobileSheet', type: 'boolean', default: 'false', description: 'Under 640px the centre panel fills the viewport.' },
    { name: 'DialogContent · toolbar', type: 'ReactNode', description: 'Controls top-left of a header="none" panel (prev/next).' },
    { name: 'DialogHeader · media / aside / below', type: 'ReactNode', description: 'Stacked header: a disc above the title, content at the end of the title row, content under it.' },
    { name: 'DialogBody · flush', type: 'boolean', default: 'false', description: 'No padding, for a body that lays out its own <form> and footer.' },
    { name: 'DialogPanel / AlertDialogPanel', type: 'div props + size, placement, header', description: 'Static surface for specimens. Put it inside <Dialog> / <AlertDialog>.' },
  ],
  guidelines: {
    do: [
      'Start the title with what the user does: "Atur saldo kartu", "Tutup kartu ini?".',
      'Put the secondary "Batal" first and the primary or danger action last in the footer. Use LG buttons.',
      'Use AlertDialog to confirm an action that destroys data.',
      'Use busy while the save request runs, and loading on the footer button.',
    ],
    dont: [
      'Do not use dismiss="none" without a way out in the footer.',
      'Do not open a dialog for a short result. Use a toast.',
      'Do not put a second primary action in the footer.',
    ],
  },
  notes: [
    'Code-only: the Wonder Design System page has no Dialog specimen. The shipped app code is the source of truth (decision, 12 Nov 2026); every value comes from Dialog.svelte + DialogFooter.svelte.',
    'Header padding: plain 12 12 12 24 (16 12 4 24 with a description, close aligned to the top); divided 14 16 14 24 with or without a description; stacked 20 24 16 (24 24 20 with media). Close button: 36px on plain, 32px on divided, stacked and corner.',
    'The app uses a native <dialog> with showModal(). This port uses Base UI Dialog: focus trap, Esc, outside press and focus return come from Base UI. The overlay is a Backdrop element at z --z-modal instead of ::backdrop in the top layer.',
    'Base UI already ignores a press that starts inside the panel and ends on the overlay, as the app does by hand.',
    'The app takes title, description and footer as props. This port composes them as parts (DialogHeader, DialogTitle, DialogDescription, DialogBody, DialogFooter). The footer "start" slot is a control with className="mr-auto".',
    'The app has a width prop (e.g. 440 for QRIS activation). Here, set className="max-w-[440px]" on DialogContent.',
    'Shadows as in the app: shadow-dialog (ring + 0 24px 64px -12px modal) on the centre panel, shadow-drawer (ring + 0 24px 48px modal) on the drawer.',
    'The app puts an IconDisc (40, tint, 20px glyph) above the title with an `icon` prop. Here, pass `<IconDisc size={40} tone="tint">` to DialogHeader `media`.',
    'Motion is entrance only, as in the app: dialog-in / drawer-in on the panel and fade-in on the overlay at --motion-dialog-open. No exit motion.',
    'AlertDialog is new in this port (the app confirms with a Dialog). It reuses the Dialog parts.',
  ],
}
