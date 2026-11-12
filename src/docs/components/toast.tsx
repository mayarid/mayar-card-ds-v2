import { Button } from '@/components/ui/button'
import { ToastCard, ToastProvider, Toaster, createToaster, useToast, type ToastType } from '@/components/ui/toast'
import type { ComponentDoc, MatrixAxisItem, PropValue } from '@/docs/types'
import toastSource from '@/registry/ui/toast.tsx?raw'

const TYPES = ['default', 'success', 'error', 'warning', 'info', 'loading'] as const satisfies readonly ToastType[]

const TITLES: Record<ToastType, string> = {
  default: 'Nomor kartu disalin',
  success: 'Kartu berhasil dibuat',
  error: 'Gagal menutup kartu',
  warning: 'Saldo kartu hampir habis',
  info: 'Laporan sedang disiapkan',
  loading: 'Menutup kartu…',
}

const label = (v: string) => v.charAt(0).toUpperCase() + v.slice(1)

function cardProps(props: Record<string, PropValue>) {
  const type = (props.type as ToastType | undefined) ?? 'default'
  return {
    type,
    title: String(props.title ?? TITLES[type]),
    description: props.description ? String(props.description) : undefined,
    action: props.action ? String(props.action) : undefined,
    cancel: props.cancel ? String(props.cancel) : undefined,
    closable: Boolean(props.closable),
  }
}

function code(props: Record<string, PropValue>) {
  const p = cardProps(props)
  const method = p.type === 'default' ? 'toast' : `toast.${p.type}`
  const simple = !p.description && !p.action && !p.closable
  if (simple) return `${method}('${p.title}')`
  const lines = [`  title: '${p.title}',`]
  if (p.description) lines.push(`  description: '${p.description}',`)
  if (p.action) lines.push(`  action: { label: '${p.action}', onClick: () => {} },`)
  if (p.action && p.cancel) lines.push(`  cancel: { label: '${p.cancel}' },`)
  if (p.closable) lines.push('  closable: true,')
  return `${method}({\n${lines.join('\n')}\n})`
}

const CONTENT: MatrixAxisItem[] = [
  { label: 'Title' },
  { label: 'Title + description', props: { description: 'Kartu siap dipakai untuk transaksi.' } },
  { label: 'Action', props: { action: 'Lihat' } },
  { label: 'Action + cancel', props: { description: 'Unduh sekarang?', action: 'Unduh', cancel: 'Nanti' } },
  { label: 'Close button', props: { description: 'Kartu siap dipakai untuk transaksi.', closable: true } },
]

/* The doc keeps its own toaster, so the playground does not share toasts with the app. */
const docToaster = createToaster()

function PlaygroundButton({ values }: { values: Record<string, PropValue> }) {
  const toast = useToast()
  const p = cardProps(values)
  return (
    <Button
      variant="secondary"
      onClick={() =>
        toast({
          type: p.type,
          title: p.title,
          description: p.description,
          action: p.action ? { label: p.action } : undefined,
          cancel: p.cancel ? { label: p.cancel } : undefined,
          closable: p.closable,
        })
      }
    >
      Tampilkan toast
    </Button>
  )
}

function Stack({ expanded }: { expanded: boolean }) {
  const cards = [TITLES.success, TITLES.default, TITLES.info]
  return (
    <div className="relative h-[200px] w-[356px]">
      {cards.map((title, i) => (
        <ToastCard
          key={title}
          title={title}
          type={i === 0 ? 'success' : i === 2 ? 'info' : 'default'}
          className="absolute inset-x-0 bottom-0 origin-bottom"
          style={{
            zIndex: 3 - i,
            transform: expanded ? `translateY(${-i * (52 + 12)}px)` : `translateY(${-i * 12}px) scale(${1 - i * 0.05})`,
          }}
          aria-hidden={i > 0 && !expanded ? true : undefined}
        />
      ))}
    </div>
  )
}

export const doc: ComponentDoc = {
  slug: 'toast',
  name: 'Toast',
  group: 'Feedback',
  description:
    'A short, non-blocking result of an action that goes away by itself. Six types; the tone lives only on the icon.',
  spec: 'wonder',
  wonderRef: 'Mayar Toast Guide',
  registry: 'toast',
  baseUi: { name: 'Toast', url: 'https://base-ui.com/react/components/toast' },
  source: [{ path: 'components/ui/toast.tsx', code: toastSource }],
  playground: {
    controls: [
      { name: 'type', type: 'select', options: TYPES, default: 'success' },
      { name: 'title', type: 'text', default: 'Kartu berhasil dibuat' },
      { name: 'description', type: 'text', default: '' },
      { name: 'action', type: 'text', default: '' },
      { name: 'cancel', type: 'text', default: '' },
      { name: 'closable', type: 'boolean', default: false },
    ],
    render: (values) => (
      <ToastProvider toaster={docToaster}>
        <div className="flex flex-col items-center gap-4">
          <ToastCard {...cardProps(values)} />
          <PlaygroundButton values={values} />
        </div>
        <Toaster />
      </ToastProvider>
    ),
    code,
  },
  matrices: [
    {
      title: 'Types × content',
      description: 'Static cards. Card, title and description stay neutral; only the 18px icon carries the tone. Default has no icon.',
      rows: TYPES.map((t) => ({ label: label(t), props: { type: t } })),
      columns: CONTENT,
      render: (props) => <ToastCard {...cardProps(props)} />,
      code,
      cellWidth: 372,
    },
    {
      title: 'Promise flow',
      description: 'One loading toast (never auto-dismisses) that turns into success or error in place, with the same id.',
      rows: [
        { label: 'Resolves', props: { result: 'success' } },
        { label: 'Rejects', props: { result: 'error' } },
      ],
      columns: [
        { label: 'Loading', props: { step: 'loading' } },
        { label: 'Result', props: { step: 'result' } },
      ],
      render: (props) =>
        props.step === 'loading' ? (
          <ToastCard type="loading" title="Menutup kartu…" />
        ) : props.result === 'success' ? (
          <ToastCard type="success" title="Kartu ditutup" />
        ) : (
          <ToastCard type="error" title="Gagal menutup kartu" description="Coba lagi sebentar lagi." />
        ),
      code: () =>
        "toast.promise(closeCard(id), {\n  loading: 'Menutup kartu…',\n  success: 'Kartu ditutup',\n  error: { title: 'Gagal menutup kartu', description: 'Coba lagi sebentar lagi.' },\n})",
      cellWidth: 372,
    },
    {
      title: 'Placement and stack',
      description:
        'Bottom centre, 28px above the safe area. Max 3. Older cards step back 12px and scale to 95% / 90%; hover or focus expands the stack.',
      rows: [{ label: 'Bottom centre' }],
      columns: [
        { label: 'Collapsed', props: { expanded: false } },
        { label: 'Expanded (hover)', props: { expanded: true } },
      ],
      render: (props) => <Stack expanded={Boolean(props.expanded)} />,
      code: () => '<ToastProvider>\n  <App />\n  <Toaster />\n</ToastProvider>',
      cellWidth: 372,
    },
  ],
  examples: [
    { id: 'toast/types', title: 'Types', description: 'One button for each type.' },
    { id: 'toast/content', title: 'Description, action and close', description: 'An action keeps the toast open; cancel closes it.' },
    { id: 'toast/promise', title: 'Promise', description: 'Loading, then success or error in the same toast.' },
    {
      id: 'toast/outside-react',
      title: 'Outside React',
      description: 'createToaster() gives an API you can call from any module (the app uses the exported toast).',
      codeOnly: true,
    },
  ],
  props: [
    { name: 'toast(input) / toast.success … loading', type: '(string | ToastInput) => id', description: 'Shows a toast. A string is the title.' },
    { name: 'ToastInput', type: '{ id?, type?, title, description?, action?, cancel?, closable?, duration? }', description: 'action / cancel: { label, onClick? }. cancel renders only with action.' },
    { name: 'duration', type: 'number', default: '4000 / 6000 / ∞', description: '4s; 6s with an action or a description; loading never. Infinity never closes.' },
    { name: 'toast.promise(promise, { loading, success, error })', type: 'Promise<T>', description: 'success / error take a string, a ToastInput or a function of the value / reason. Returns the original promise.' },
    { name: 'toast.update(id, patch) / toast.dismiss(id?)', type: 'void', description: 'Change a toast in place / close one, or all without an id.' },
    { name: 'useToast()', type: 'ToastApi', description: 'The same API for the nearest ToastProvider, inside components.' },
    { name: 'createToaster()', type: 'ToastApi & { manager }', description: 'An isolated toaster. Pass it to <ToastProvider toaster={…}>.' },
    { name: 'ToastProvider · toaster / limit', type: 'Toaster / number', default: 'toast / 3', description: 'The toaster it shows and the max visible cards.' },
    { name: 'Toaster · contained', type: 'boolean', default: 'false', description: 'Position inside the nearest positioned parent, without a portal (mocks).' },
    { name: 'Toast · swipeDirection', type: "Array<'up' | 'down' | 'left' | 'right'>", default: '[]', description: 'Swipe-to-dismiss directions for a custom viewport. Off by default, as in the app.' },
    { name: 'ToastCard', type: '{ type, title, description?, action?, cancel?, closable? }', description: 'Static card for specimens. No timer, no live region.' },
  ],
  guidelines: {
    do: [
      'Use a toast for a short result the user does not have to act on: "Kartu berhasil dibuat".',
      'Use toast.promise for work that takes a moment, so the same toast shows the result.',
      'Keep the title to one line. Put detail in the description.',
    ],
    dont: [
      'Do not show an error that the user fixes in a field as a toast. Use the Field error.',
      'Do not put a destroying action in a toast.',
      'Do not use a toast for a message that must stay. Use a Notice.',
    ],
  },
  notes: [
    'The shipped app code is the source of truth (decision, 12 Nov 2026); values come from Toast.svelte, ToastViewport.svelte and toast.ts, built from the Wonder Mayar Toast Guide.',
    'Built on Base UI Toast: timers, pause on hover and focus, the stack and the live region come from Base UI. Swipe to dismiss is off by default, as in the app; pass swipeDirection to <Toast> to turn it on.',
    'Stack as in the app: each card sits on the bottom edge at its own height, lifts 12px per step and scales 1 / 0.95 / 0.9. Hover or focus sets the scale back to 1 at the same 12px step (the cards still overlap); it does not spread them apart.',
    'Roles: Base UI renders each toast as role="dialog" in a polite region named "Notifikasi". An error toast has priority "high", which Base UI announces through an assertive region. The app puts role="status" / role="alert" on the card.',
    'Base UI hides the close and cancel buttons from assistive tech until the stack is expanded or focused.',
    'Motion: open 350 / close 250 smooth-out, rise --motion-toast-distance, scale --motion-toast-scale, blur --motion-toast-blur. The loading icon is the shared Spinner (Hugeicons loading-03, 1s linear), as in the app.',
    'The theme reduced-motion block does not zero --motion-toast-open/close; the toast uses motion-reduce:transition-none and drops the blur instead, as the app does.',
    'The app card is a fixed 356px; this port caps it at the viewport width (max-w-full) so it does not overflow a 320px phone.',
    'Info uses help-circle (a question mark), as in Wonder and the app. It reads as help, not info: flagged, not changed.',
  ],
}
