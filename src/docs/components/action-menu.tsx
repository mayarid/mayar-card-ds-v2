import { Copy01Icon, Delete02Icon, Edit02Icon, MoreHorizontalIcon } from '@hugeicons/core-free-icons'

import {
  ActionMenu,
  ActionMenuContent,
  ActionMenuItem,
  ActionMenuPanel,
  ActionMenuSeparator,
  ActionMenuTrigger,
  actionMenuItemVariants,
} from '@/components/ui/action-menu'
import { Icon } from '@/components/ui/icon'
import type { ComponentDoc, MatrixAxisItem, PropValue } from '@/docs/types'
import { toJsx } from '@/gallery/jsx'
import actionMenuSource from '@/registry/ui/action-menu.tsx?raw'

type TriggerVariant = 'secondary' | 'icon' | 'icon-ghost'

const STATES: MatrixAxisItem[] = [
  { label: 'Default', codeOnly: true },
  { label: 'Hover', force: 'hover', codeOnly: true },
  { label: 'Pressed', force: 'pressed', codeOnly: true },
  { label: 'Focus', force: 'focus', codeOnly: true },
  { label: 'Open', force: 'open', codeOnly: true },
  { label: 'Disabled', props: { disabled: true }, codeOnly: true },
]

const ITEM_STATES: MatrixAxisItem[] = [
  { label: 'Default', codeOnly: true },
  { label: 'Hover', force: 'hover', codeOnly: true },
  { label: 'Pressed', force: 'pressed', codeOnly: true },
  { label: 'Highlighted', props: { highlighted: true }, codeOnly: true },
  { label: 'Disabled', props: { disabled: true }, codeOnly: true },
]

function Trigger({ variant, disabled, force }: { variant: TriggerVariant; disabled?: boolean; force?: string }) {
  return (
    <ActionMenuTrigger
      variant={variant}
      disabled={disabled}
      aria-label={variant === 'secondary' ? undefined : 'Aksi lain'}
      data-force-state={force}
    >
      {variant === 'secondary' ? 'Aksi lain' : <Icon icon={MoreHorizontalIcon} />}
    </ActionMenuTrigger>
  )
}

function triggerCode(props: Record<string, PropValue>) {
  const variant = (props.variant as TriggerVariant | undefined) ?? 'secondary'
  if (variant === 'secondary') return toJsx('ActionMenuTrigger', { disabled: props.disabled }, 'Aksi lain')
  return toJsx(
    'ActionMenuTrigger',
    { variant, 'aria-label': 'Aksi lain', disabled: props.disabled },
    '<Icon icon={MoreHorizontalIcon} />',
  )
}

function menuCode(props: Record<string, PropValue>) {
  const variant = (props.variant as TriggerVariant | undefined) ?? 'icon'
  const icon = (name: string) => (props.icons === false ? '' : `<Icon icon={${name}} />\n    `)
  return [
    '<ActionMenu>',
    '  ' + triggerCode({ variant }).split('\n').join('\n  '),
    '  <ActionMenuContent>',
    `    <ActionMenuItem>\n    ${icon('Edit02Icon')}Ubah nama\n    </ActionMenuItem>`,
    `    <ActionMenuItem>\n    ${icon('Copy01Icon')}Salin nomor kartu\n    </ActionMenuItem>`,
    '    <ActionMenuSeparator />',
    `    <ActionMenuItem tone="danger">\n    ${icon('Delete02Icon')}Tutup kartu\n    </ActionMenuItem>`,
    '  </ActionMenuContent>',
    '</ActionMenu>',
  ].join('\n')
}

function itemCode(props: Record<string, PropValue>) {
  const children = props.withIcon ? '<Icon icon={Edit02Icon} />\nUbah nama' : 'Ubah nama'
  return toJsx(
    'ActionMenuItem',
    {
      tone: props.tone === 'danger' ? 'danger' : undefined,
      description: props.withDescription ? 'Nama tampil di daftar kartu' : undefined,
      disabled: props.disabled,
    },
    children,
  )
}

function StaticItem({ props, force }: { props: Record<string, PropValue>; force?: string }) {
  const label = props.tone === 'danger' ? 'Tutup kartu' : 'Ubah nama'
  return (
    <div
      className={actionMenuItemVariants({ tone: props.tone === 'danger' ? 'danger' : 'default' })}
      data-force-state={force}
      data-highlighted={props.highlighted ? '' : undefined}
      data-disabled={props.disabled ? '' : undefined}
    >
      {props.withIcon ? <Icon icon={props.tone === 'danger' ? Delete02Icon : Edit02Icon} /> : null}
      {props.withDescription ? (
        <span className="flex min-w-0 flex-col gap-0.5">
          <span>{label}</span>
          <span className="text-caption-lg font-normal text-ink-2">Nama tampil di daftar kartu</span>
        </span>
      ) : (
        label
      )}
    </div>
  )
}

export const doc: ComponentDoc = {
  slug: 'action-menu',
  name: 'Action Menu',
  group: 'Overlays',
  description: 'A menu of actions behind one button: the "…" on a row or tile, "Aksi lain" in a page header.',
  spec: 'code-only',
  registry: 'action-menu',
  baseUi: { name: 'Menu', url: 'https://base-ui.com/react/components/menu' },
  source: [{ path: 'components/ui/action-menu.tsx', code: actionMenuSource }],
  playground: {
    controls: [
      { name: 'variant', label: 'trigger', type: 'select', options: ['icon', 'icon-ghost', 'secondary'], default: 'icon' },
      { name: 'icons', type: 'boolean', default: true },
      { name: 'disabledItem', label: 'disabled item', type: 'boolean', default: false },
    ],
    render: (values) => (
      <ActionMenu>
        <Trigger variant={values.variant as TriggerVariant} />
        <ActionMenuContent>
          <ActionMenuItem>
            {values.icons ? <Icon icon={Edit02Icon} /> : null}
            Ubah nama
          </ActionMenuItem>
          <ActionMenuItem disabled={Boolean(values.disabledItem)} title={values.disabledItem ? 'Kartu dibekukan' : undefined}>
            {values.icons ? <Icon icon={Copy01Icon} /> : null}
            Salin nomor kartu
          </ActionMenuItem>
          <ActionMenuSeparator />
          <ActionMenuItem tone="danger">
            {values.icons ? <Icon icon={Delete02Icon} /> : null}
            Tutup kartu
          </ActionMenuItem>
        </ActionMenuContent>
      </ActionMenu>
    ),
    code: menuCode,
  },
  matrices: [
    {
      title: 'Trigger × states',
      description: 'Secondary (36px, label + chevron), icon (32px square) and ghost icon (no fill until hover or open).',
      rows: [
        { label: 'Secondary', props: { variant: 'secondary' }, codeOnly: true },
        { label: 'Icon', props: { variant: 'icon' }, codeOnly: true },
        { label: 'Icon ghost', props: { variant: 'icon-ghost' }, codeOnly: true },
      ],
      columns: STATES,
      render: (props, force) => (
        <ActionMenu>
          <Trigger variant={props.variant as TriggerVariant} disabled={Boolean(props.disabled)} force={force} />
        </ActionMenu>
      ),
      code: triggerCode,
    },
    {
      title: 'Items × states',
      description: 'Static items. Hover and keyboard highlight share state-hover; a disabled item stays focusable.',
      rows: [
        { label: 'Label', props: {}, codeOnly: true },
        { label: 'Icon + label', props: { withIcon: true }, codeOnly: true },
        { label: 'Label + description', props: { withDescription: true }, codeOnly: true },
        { label: 'Danger', props: { tone: 'danger', withIcon: true }, codeOnly: true },
      ],
      columns: ITEM_STATES,
      render: (props, force) => (
        <ActionMenuPanel className="w-[248px]">
          <StaticItem props={props} force={force} />
        </ActionMenuPanel>
      ),
      code: itemCode,
      cellWidth: 260,
    },
    {
      title: 'Open menu (static)',
      description: '260px, 6px padding, radius 10, shadow-popover. Separators group the items; danger goes last.',
      rows: [
        { label: 'With icons', props: { icons: true }, codeOnly: true },
        { label: 'Labels only', props: { icons: false }, codeOnly: true },
      ],
      columns: [{ label: 'Open', codeOnly: true }],
      render: (props) => (
        <ActionMenuPanel>
          <StaticItem props={{ withIcon: props.icons }} />
          <div className={actionMenuItemVariants()} data-disabled="">
            {props.icons ? <Icon icon={Copy01Icon} /> : null}
            Salin nomor kartu
          </div>
          <hr className="mx-1 my-1.5 h-px border-0 bg-border-subtle" />
          <StaticItem props={{ withIcon: props.icons, tone: 'danger' }} />
        </ActionMenuPanel>
      ),
      code: menuCode,
      cellWidth: 280,
    },
  ],
  examples: [
    { id: 'action-menu/row', title: 'Row menu', description: 'Ghost icon trigger on a list row.', codeOnly: true },
    { id: 'action-menu/header', title: 'Header menu', description: 'Text trigger with icons, a disabled item and a danger item.', codeOnly: true },
    { id: 'action-menu/with-descriptions', title: 'With descriptions', description: 'A caption line under each label.', codeOnly: true },
  ],
  props: [
    { name: 'ActionMenu · open / defaultOpen / onOpenChange', type: 'boolean / boolean / (open, details) => void', description: 'Controlled or uncontrolled, as in Base UI Menu.' },
    { name: 'ActionMenuTrigger · variant', type: '"secondary" | "icon" | "icon-ghost"', default: '"secondary"', description: 'secondary shows the label and a chevron. Icon variants need aria-label.' },
    { name: 'ActionMenuContent · side / align / sideOffset', type: 'Side / Align / number', default: '"bottom" / "end" / 6', description: 'Opens under the trigger, right edges aligned, and flips when there is no room.' },
    { name: 'ActionMenuItem · tone', type: '"default" | "danger"', default: '"default"', description: 'danger paints the label and icon in danger-text.' },
    { name: 'ActionMenuItem · description', type: 'ReactNode', description: 'A caption-lg line under the label.' },
    { name: 'ActionMenuItem · disabled', type: 'boolean', default: 'false', description: 'Stays focusable with aria-disabled. Put the reason in title.' },
    { name: 'ActionMenuItem · onClick / closeOnClick', type: '() => void / boolean', default: '— / true', description: 'Runs the action; the menu closes and focus goes back to the trigger.' },
    { name: 'ActionMenuLinkItem', type: 'Base UI Menu.LinkItem props', description: 'An item that is a link (href).' },
    { name: 'ActionMenuSeparator / ActionMenuHeader', type: 'element props', description: 'A hairline between groups / a block above the items.' },
    { name: 'ActionMenuPanel / actionMenuItemVariants', type: 'div props / cva', description: 'Static surface and item classes for specimens.' },
  ],
  guidelines: {
    do: [
      'Start each label with a verb: "Ubah nama", "Bekukan kartu".',
      'Put the danger item last, after a separator, and confirm it with an AlertDialog.',
      'Keep a disabled item in the list and tell why in title.',
    ],
    dont: [
      'Do not put more than about 7 items in one menu.',
      'Do not use an Action Menu for navigation between pages or for a filter. Use links or a Popover.',
    ],
  },
  notes: [
    'Code-only: no Action Menu specimen on the Wonder Design System page. Values come from the shipped app (ActionMenu.svelte).',
    'The app takes an items array (label, icon, tone, separated, href). This port composes items as children: ActionMenuItem, ActionMenuLinkItem, ActionMenuSeparator, ActionMenuHeader.',
    'Keyboard, focus and outside press come from Base UI Menu. Base UI highlights items (data-highlighted) and keeps focus on the menu, where the app moves DOM focus to each item; the paint is the same.',
    'The app positions a fixed menu by hand and closes it on scroll. Base UI positions it with Floating UI (flip, shift) and keeps it open on scroll.',
    'z-index: --z-dropdown (40) in every case. The app uses --z-sticky for its in-flow (absolute) menu, which a portal does not need.',
    'The app menu enters with its own keyframe at --motion-quick. This port uses the theme menu-in at --motion-quick.',
  ],
}
