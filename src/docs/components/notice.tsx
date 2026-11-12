import { Button } from '@/components/ui/button'
import { Notice, type NoticeTone, type NoticeVariant } from '@/components/ui/notice'
import type { ComponentDoc, MatrixAxisItem, PropValue } from '@/docs/types'
import { toJsx } from '@/gallery/jsx'
import noticeSource from '@/registry/ui/notice.tsx?raw'

const TONES = ['info', 'neutral', 'success', 'warning', 'danger'] as const satisfies readonly NoticeTone[]
const VARIANTS = ['banner', 'inline'] as const satisfies readonly NoticeVariant[]

const BODY: Record<NoticeTone, string> = {
  info: 'Paket diubah ke Business mulai 1 Desember.',
  neutral: 'Kartu ini dibuat oleh admin lain.',
  success: 'KYC disetujui. Semua fitur sudah aktif.',
  warning: 'Saldo akun utama di bawah Rp 1.000.000.',
  danger: 'Gagal menyimpan. Coba lagi.',
}

const label = (v: string) => v.charAt(0).toUpperCase() + v.slice(1)

function render(props: Record<string, PropValue>) {
  const tone = (props.tone as NoticeTone | undefined) ?? 'info'
  return (
    <Notice
      tone={tone}
      variant={props.variant as NoticeVariant | undefined}
      bodyTone={props.bodyTone === 'tone' || props.bodyTone === 'ink' ? props.bodyTone : undefined}
      icon={props.noIcon ? false : undefined}
      title={props.title ? String(props.title) : undefined}
      action={
        props.action ? (
          <Button variant="secondary" size="sm">
            {String(props.action)}
          </Button>
        ) : undefined
      }
    >
      {String(props.children ?? BODY[tone])}
    </Notice>
  )
}

function code(props: Record<string, PropValue>) {
  const tone = (props.tone as NoticeTone | undefined) ?? 'info'
  const { children, action, noIcon, ...rest } = props
  const attrs: Record<string, PropValue> = {
    ...rest,
    bodyTone: props.bodyTone === 'default' ? undefined : props.bodyTone,
    title: props.title || undefined,
  }
  let jsx = toJsx('Notice', attrs, String(children ?? BODY[tone]), { tone: 'info', variant: 'banner' })
  if (noIcon) jsx = jsx.replace('<Notice', '<Notice icon={false}')
  if (action) jsx = jsx.replace('<Notice', `<Notice action={<Button variant="secondary" size="sm">${String(action)}</Button>}`)
  return jsx
}

const OPTIONS: MatrixAxisItem[] = [
  { label: 'Title + action', props: { title: 'Kartu diblokir', action: 'Buka blokir' }, codeOnly: true },
  { label: 'bodyTone tone', props: { bodyTone: 'tone' }, codeOnly: true },
  { label: 'No icon', props: { noIcon: true }, codeOnly: true },
]

export const doc: ComponentDoc = {
  slug: 'notice',
  name: 'Notice',
  group: 'Feedback',
  description:
    'A tinted message that stays on the page: a page state banner, or an inline message in a form or dialog.',
  spec: 'code-only',
  registry: 'notice',
  source: [{ path: 'components/ui/notice.tsx', code: noticeSource }],
  playground: {
    controls: [
      { name: 'tone', type: 'select', options: TONES, default: 'info' },
      { name: 'variant', type: 'select', options: VARIANTS, default: 'banner' },
      { name: 'bodyTone', type: 'select', options: ['default', 'ink', 'tone'], default: 'default' },
      { name: 'title', type: 'text', default: '' },
      { name: 'children', label: 'body', type: 'text', default: 'Paket diubah ke Business mulai 1 Desember.' },
      { name: 'action', type: 'text', default: '' },
      { name: 'noIcon', label: 'no icon', type: 'boolean', default: false },
    ],
    render: (values) => <div className="w-full max-w-xl">{render(values)}</div>,
    code,
  },
  matrices: [
    {
      title: 'Tones × variants',
      description: 'Banner: 16px padding, 20px icon, radius 12, body in ink. Inline: 10px 12px, 16px icon, radius 8, body in the tone colour.',
      rows: TONES.map((t) => ({ label: label(t), props: { tone: t }, codeOnly: true })),
      columns: VARIANTS.map((v) => ({ label: label(v), props: { variant: v }, codeOnly: true })),
      render,
      code,
      cellWidth: 360,
    },
    {
      title: 'Options (banner)',
      rows: TONES.map((t) => ({ label: label(t), props: { tone: t }, codeOnly: true })),
      columns: OPTIONS,
      render,
      code,
      cellWidth: 360,
    },
  ],
  examples: [
    { id: 'notice/banner', title: 'Page banner', description: 'A page state between the head and the content, with an action.', codeOnly: true },
    { id: 'notice/inline', title: 'Inline in a form', description: 'A submit error next to the form.', codeOnly: true },
    { id: 'notice/lines', title: 'Several lines', description: 'One <p> per line in the body.', codeOnly: true },
  ],
  props: [
    { name: 'tone', type: TONES.map((t) => `"${t}"`).join(' | '), default: '"info"', description: 'Fill, icon and text colour.' },
    { name: 'variant', type: '"banner" | "inline"', default: '"banner"', description: 'Page banner or a message inside a form or dialog.' },
    { name: 'bodyTone', type: '"ink" | "tone"', description: 'Body colour override. Default: banner ink, inline tone.' },
    { name: 'title', type: 'ReactNode', description: 'A semibold first line in the tone colour.' },
    { name: 'icon', type: 'IconSvgElement | false', description: 'Another Hugeicons icon, or false for none. Default: the tone icon.' },
    { name: 'action', type: 'ReactNode', description: 'A Button or link at the end of the row.' },
    { name: 'role', type: 'string', default: '"alert" (danger) / "status"', description: 'Pass "note" for a banner that is on the page from the first paint.' },
  ],
  guidelines: {
    do: [
      'Use a Notice for a state that stays: a blocked account, a pending KYC, a form submit error.',
      'Say what happened and what to do next: "Gagal menyimpan. Coba lagi."',
      'Use role="note" for a banner that is there when the page loads, so it is not announced as news.',
    ],
    dont: [
      'Do not use a Notice for a short result that can go away. Use a toast.',
      'Do not use a Notice for a field error. Use the Field error under the control.',
    ],
  },
  notes: [
    'Code-only: no Notice specimen on the Wonder Design System page. It comes from the shipped app (Notice.svelte), built from the admin StateBanner and the inline notice copies.',
    'Icons: info and neutral use information-circle, success checkmark-circle-02, warning alert-02 (triangle), danger alert-circle, as in the app.',
    'The app takes an icon name; this port takes a Hugeicons icon object (or false).',
  ],
}
