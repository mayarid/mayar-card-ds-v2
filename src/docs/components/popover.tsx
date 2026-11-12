import { FilterIcon, Notification03Icon } from '@hugeicons/core-free-icons'

import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import {
  Popover,
  PopoverContent,
  PopoverPanel,
  PopoverTrigger,
  type PopoverAlign,
  type PopoverSide,
} from '@/components/ui/popover'
import type { ComponentDoc, MatrixAxisItem, PropValue } from '@/docs/types'
import { cn } from '@/lib/utils'
import popoverSource from '@/registry/ui/popover.tsx?raw'

const STATUSES = ['Aktif', 'Dibekukan', 'Ditutup']

function FilterBody() {
  return (
    <div className="flex flex-col p-1.5">
      <p className="m-0 px-2.5 pt-1.5 pb-1 text-caption-lg font-medium text-ink-2">Status kartu</p>
      {STATUSES.map((s) => (
        <label key={s} className="flex min-h-9 items-center gap-2.5 rounded-lg px-2.5 text-body-sm">
          <input type="checkbox" defaultChecked={s === 'Aktif'} className="size-4 accent-primary" />
          {s}
        </label>
      ))}
    </div>
  )
}

function NotificationsBody() {
  return (
    <div className="flex flex-col">
      <p className="m-0 border-b border-border-subtle px-4 py-3 text-body-sm font-semibold">Notifikasi</p>
      {['Saldo kartu Marketing di bawah Rp 100.000', 'Permintaan akses baru dari Rina'].map((t) => (
        <p key={t} className="m-0 px-4 py-3 text-body-sm text-ink-2">
          {t}
        </p>
      ))}
    </div>
  )
}

function Body({ content }: { content: PropValue }) {
  if (content === 'notifications') return <NotificationsBody />
  if (content === 'empty') return <p className="m-0 p-4 text-body-sm text-ink-2">Belum ada hasil.</p>
  return <FilterBody />
}

const contentLabel = (content: PropValue) => (content === 'notifications' ? 'Notifikasi' : 'Filter status')

function code(props: Record<string, PropValue>) {
  const attrs = [
    props.side && props.side !== 'bottom' ? `side="${String(props.side)}"` : '',
    props.align && props.align !== 'end' ? `align="${String(props.align)}"` : '',
    `aria-label="${contentLabel(props.content)}"`,
  ]
    .filter(Boolean)
    .join(' ')
  return [
    '<Popover>',
    '  <PopoverTrigger render={<Button variant="secondary" />}>',
    '    <Icon icon={FilterIcon} />',
    '    Status',
    '  </PopoverTrigger>',
    `  <PopoverContent ${attrs} className="w-64">`,
    '    …',
    '  </PopoverContent>',
    '</Popover>',
  ].join('\n')
}

const STATES: MatrixAxisItem[] = [
  { label: 'Default', codeOnly: true },
  { label: 'Hover', force: 'hover', codeOnly: true },
  { label: 'Pressed', force: 'pressed', codeOnly: true },
  { label: 'Focus', force: 'focus', codeOnly: true },
  { label: 'Open', force: 'open', codeOnly: true },
]

function Placement({ side, align }: { side: PopoverSide; align: PopoverAlign }) {
  return (
    <div className={cn('flex w-64 gap-2', side === 'top' ? 'flex-col-reverse' : 'flex-col', align === 'end' ? 'items-end' : 'items-start')}>
      <Button variant="secondary" data-force-state="open">
        <Icon icon={FilterIcon} />
        Status
      </Button>
      <PopoverPanel className={cn('w-56', side === 'top' ? 'origin-bottom' : 'origin-top')}>
        <p className="m-0 p-4 text-body-sm text-ink-2">
          {side}-{align}
        </p>
      </PopoverPanel>
    </div>
  )
}

export const doc: ComponentDoc = {
  slug: 'popover',
  name: 'Popover',
  group: 'Overlays',
  description: 'An anchored panel that opens from a trigger: filters, search results and notifications. The content owns its layout.',
  spec: 'code-only',
  registry: 'popover',
  baseUi: { name: 'Popover', url: 'https://base-ui.com/react/components/popover' },
  source: [{ path: 'components/ui/popover.tsx', code: popoverSource }],
  playground: {
    controls: [
      { name: 'side', type: 'select', options: ['bottom', 'top', 'left', 'right'], default: 'bottom' },
      { name: 'align', type: 'select', options: ['end', 'start', 'center'], default: 'end' },
      { name: 'content', type: 'select', options: ['filter', 'notifications', 'empty'], default: 'filter' },
    ],
    render: (values) => (
      <Popover>
        <PopoverTrigger render={<Button variant="secondary" />}>
          <Icon icon={FilterIcon} />
          Status
        </PopoverTrigger>
        <PopoverContent
          side={values.side as PopoverSide}
          align={values.align as PopoverAlign}
          aria-label={contentLabel(values.content)}
          className="w-64"
        >
          <Body content={values.content} />
        </PopoverContent>
      </Popover>
    ),
    code,
  },
  matrices: [
    {
      title: 'Trigger × states',
      description: 'The trigger is any Button. While the panel is open it gets data-popup-open (the opened: variant).',
      rows: [
        { label: 'Secondary', props: { variant: 'secondary' }, codeOnly: true },
        { label: 'Ghost icon', props: { variant: 'ghost', iconOnly: true }, codeOnly: true },
      ],
      columns: STATES,
      render: (props, force) => (
        <Popover>
          {props.iconOnly ? (
            <PopoverTrigger
              render={<Button variant="ghost" size="icon-md" />}
              aria-label="Notifikasi"
              data-force-state={force}
            >
              <Icon icon={Notification03Icon} />
            </PopoverTrigger>
          ) : (
            <PopoverTrigger render={<Button variant="secondary" />} data-force-state={force}>
              <Icon icon={FilterIcon} />
              Status
            </PopoverTrigger>
          )}
        </Popover>
      ),
      code: (props) =>
        props.iconOnly
          ? '<PopoverTrigger render={<Button variant="ghost" size="icon-md" />} aria-label="Notifikasi">\n  <Icon icon={Notification03Icon} />\n</PopoverTrigger>'
          : '<PopoverTrigger render={<Button variant="secondary" />}>\n  <Icon icon={FilterIcon} />\n  Status\n</PopoverTrigger>',
    },
    {
      title: 'Open panel (static)',
      description: 'The panel as a static surface: radius 12, shadow-popover, no padding. The content sets its own spacing.',
      rows: [
        { label: 'Filter', props: { content: 'filter' }, codeOnly: true },
        { label: 'Notifications', props: { content: 'notifications' }, codeOnly: true },
        { label: 'Empty result', props: { content: 'empty' }, codeOnly: true },
      ],
      columns: [{ label: 'Open', codeOnly: true }],
      render: (props) => (
        <PopoverPanel className="w-72">
          <Body content={props.content} />
        </PopoverPanel>
      ),
      code,
      cellWidth: 300,
    },
    {
      title: 'Placement',
      description: 'side + align. The panel sits 8px from the trigger and flips when there is no room.',
      rows: [
        { label: 'Bottom', props: { side: 'bottom' }, codeOnly: true },
        { label: 'Top', props: { side: 'top' }, codeOnly: true },
      ],
      columns: [
        { label: 'align start', props: { align: 'start' }, codeOnly: true },
        { label: 'align end', props: { align: 'end' }, codeOnly: true },
      ],
      render: (props) => <Placement side={props.side as PopoverSide} align={props.align as PopoverAlign} />,
      code,
      cellWidth: 280,
    },
  ],
  examples: [
    { id: 'popover/filter', title: 'Filter panel', description: 'Checkboxes and a footer that closes the panel.', codeOnly: true },
    { id: 'popover/notifications', title: 'Notifications', description: 'An icon trigger with a titled panel.', codeOnly: true },
    { id: 'popover/controlled', title: 'Controlled', description: 'open + onOpenChange, with the reason of each change.', codeOnly: true },
  ],
  props: [
    { name: 'Popover · open / defaultOpen / onOpenChange', type: 'boolean / boolean / (open, details) => void', description: 'Controlled or uncontrolled. details.reason: trigger-press, outside-press, escape-key, …' },
    { name: 'PopoverContent · side', type: '"bottom" | "top" | "left" | "right"', default: '"bottom"', description: 'Side of the anchor. Flips when there is no room.' },
    { name: 'PopoverContent · align', type: '"start" | "center" | "end"', default: '"end"', description: 'Edge of the anchor the panel lines up with.' },
    { name: 'PopoverContent · sideOffset', type: 'number', default: '8', description: 'Gap to the anchor in px.' },
    { name: 'PopoverContent · positionMethod', type: '"absolute" | "fixed"', default: '"absolute"', description: 'fixed for a trigger inside a scroll container or a transformed canvas.' },
    { name: 'PopoverContent · anchor', type: 'Element | RefObject | VirtualElement', description: 'An external anchor instead of the trigger.' },
    { name: 'PopoverTitle / PopoverDescription / PopoverClose', type: 'Base UI part props', description: 'Name, describe and close the panel.' },
    { name: 'PopoverPanel', type: 'div props', description: 'Static surface for specimens. Not portalled, not anchored.' },
  ],
  guidelines: {
    do: [
      'Name the panel: an aria-label on PopoverContent or a PopoverTitle inside.',
      'Set the panel width with className (w-64, w-72). Max width is the viewport minus 32px.',
      'Use a Popover for filters and lists that the user reads or changes in place.',
    ],
    dont: [
      'Do not use a Popover for a list of actions. Use Action Menu.',
      'Do not put a long form in a Popover. Use a Dialog.',
    ],
  },
  notes: [
    'Code-only: no Popover specimen on the Wonder Design System page. The shipped app code is the source of truth (decision, 12 Nov 2026); every value comes from Popover.svelte.',
    'The app takes a `width` prop in px (capped at the viewport minus 32px). Here, set className="w-[280px]" on PopoverContent; the max-w-[calc(100vw-32px)] cap stays.',
    'The app requires a `label` (the panel is role="dialog" with aria-label). Here, give PopoverContent an aria-label or render a PopoverTitle.',
    'The app positions the panel by hand (absolute / fixed strategy, flip, nudge into the viewport) and closes a fixed panel on scroll. Base UI Popover positions it with Floating UI: it flips, shifts and follows scroll, so it does not close on scroll.',
    'canvas-anchor.ts in the app turns a control on a CSS-scaled canvas into a virtual anchor. Base UI measures the real client rect, which includes CSS transforms; pass anchor= (an element or a virtual element) if you need another anchor.',
    'placement="bottom-end" in the app is side="bottom" align="end" here (the default).',
    'The app panel enters with menu-in at --motion-quick (150ms). The theme menu-in animation uses --motion-dropdown-open (250ms), so the panel sets the animation duration back to --motion-quick.',
    'z-index: the positioner uses --z-popover (50), as in the app.',
  ],
}
