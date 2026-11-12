import { Select as SelectPrimitive } from '@base-ui/react/select'
import { ArrowDown01Icon, Tick02Icon } from '@hugeicons/core-free-icons'
import { cva, type VariantProps } from 'class-variance-authority'

import { Icon } from '@/components/ui/icon'
import { cn } from '@/lib/utils'

/*
 * Mayar v2 Select. Wonder "Mayar Forms Inputs Guide" › Select / Combobox.
 * The trigger has the Input chrome: SM 28 / MD 32 / LG 36 (default) / XL 40, radius lg (SM/MD) and
 * xl (LG/XL), text body-sm / body-sm / body-base / body-lg (body-lg on a coarse pointer, so iOS does
 * not zoom). Variants: default (surface + control shadow) and ghost. States: hover (canvas), focus
 * (1px border-focus ring), invalid (danger-subtle + danger ring), disabled, active filter tone.
 * Popup: radius xl, 4px padding, popover shadow, max 320px tall, 32px rows (44px on a coarse pointer),
 * a tick on the selected row. Motion: animate-menu-in on open, a 0.99 scale + fade on close.
 */
const selectTriggerVariants = cva(
  [
    'group/select-trigger relative hit-44 flex w-full min-w-0 cursor-pointer items-center text-left font-sans font-normal text-ink',
    'outline-none select-none touch-manipulation pointer-coarse:text-body-lg',
    'transition-[background-color,box-shadow] duration-(--motion-quick) ease-smooth-out',
    '[&_svg]:pointer-events-none [&_svg]:shrink-0',
    // Invalid: from aria-invalid or from Field.Root.
    'aria-invalid:bg-danger-subtle aria-invalid:shadow-[0_0_0_1px_var(--color-danger)]',
    'data-invalid:bg-danger-subtle data-invalid:shadow-[0_0_0_1px_var(--color-danger)]',
    'data-disabled:cursor-not-allowed data-disabled:bg-disabled data-disabled:text-disabled-foreground data-disabled:shadow-ring',
  ],
  {
    variants: {
      variant: {
        default: [
          'bg-surface shadow-control',
          'hover-fine:not-aria-invalid:not-data-invalid:not-focus:not-data-[tone=active]:bg-canvas',
          'focus-ring:not-aria-invalid:not-data-invalid:shadow-[0_0_0_1px_var(--color-border-focus),0_1px_1px_-1px_var(--color-shadow-drop),0_1px_2px_var(--color-shadow-ambient)]',
        ],
        ghost: [
          'bg-transparent shadow-none',
          'focus-ring:not-aria-invalid:not-data-invalid:shadow-[0_0_0_1px_var(--color-border-focus)]',
          'data-disabled:bg-transparent data-disabled:shadow-none',
        ],
      },
      size: {
        sm: 'h-7 gap-1.5 rounded-lg pr-2 pl-2.5 text-body-sm',
        md: 'h-8 gap-2 rounded-lg pr-2.5 pl-3 text-body-sm',
        lg: 'h-9 gap-2 rounded-xl pr-2.5 pl-3 text-body-base',
        xl: 'h-10 gap-2 rounded-xl pr-3 pl-3.5 text-body-lg',
      },
      tone: {
        default: '',
        // A filter that is set (code-only).
        active:
          'not-data-disabled:not-aria-invalid:bg-primary-tint not-data-disabled:not-aria-invalid:text-primary font-medium not-data-disabled:not-aria-invalid:shadow-[0_0_0_1px_var(--color-primary),0_1px_1px_-1px_var(--color-shadow-drop),0_1px_2px_var(--color-shadow-ambient)] not-data-disabled:[&_svg]:text-primary',
      },
    },
    defaultVariants: { variant: 'default', size: 'lg', tone: 'default' },
  },
)

/** Popup surface. Exported so a doc or test can draw the open menu without opening it. */
const selectPopupClassName = cn(
  'flex max-h-[min(320px,var(--available-height,320px))] min-w-(--anchor-width) flex-col overflow-y-auto overscroll-contain',
  'rounded-xl bg-surface p-1 font-sans text-ink shadow-popover outline-none',
  'origin-(--transform-origin) animate-menu-in',
  'transition-[opacity,scale] duration-(--motion-dropdown-close) ease-smooth-out data-ending-style:scale-[0.99] data-ending-style:opacity-0',
)

const selectItemVariants = cva(
  [
    'relative flex h-8 cursor-default items-center gap-2 rounded-lg px-2 text-body-sm outline-none select-none touch-manipulation',
    'pointer-coarse:h-11',
    'data-highlighted:bg-component',
    'data-disabled:text-disabled-foreground data-disabled:data-highlighted:bg-transparent',
  ],
  {
    variants: {
      tone: {
        default: 'text-ink',
        // A shortcut row, not a value ("+ Tambah pemegang kartu"). Code-only.
        action: 'font-medium text-primary',
      },
    },
    defaultVariants: { tone: 'default' },
  },
)

const selectGroupLabelClassName = 'px-2 pt-1.5 pb-1 text-left text-caption-lg font-medium text-muted'
const selectSeparatorClassName = 'm-1 h-px shrink-0 bg-border-subtle'

/**
 * A single-select listbox with the Input chrome. Use it when the list is short and the user does not
 * need to type to filter it; otherwise use Combobox. Never a native `<select>`.
 *
 * Compose `Select` › `SelectTrigger` (› `SelectValue`) › `SelectContent` › `SelectItem`.
 * It supports `value`/`defaultValue`/`onValueChange`, `items` (labels for `SelectValue`), `name`,
 * `disabled` and `required`, and it reads `Field.Root` for its label, invalid and disabled state.
 */
function Select<Value, Multiple extends boolean | undefined = false>(props: SelectPrimitive.Root.Props<Value, Multiple>) {
  return <SelectPrimitive.Root {...props} />
}

interface SelectTriggerProps
  extends Omit<SelectPrimitive.Trigger.Props, 'className'>,
    VariantProps<typeof selectTriggerVariants> {
  className?: string
}

/** The closed control. Put a leading icon before `SelectValue`; the chevron is added at the end. */
function SelectTrigger({ className, variant, size, tone, children, ...props }: SelectTriggerProps) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      data-variant={variant ?? 'default'}
      data-size={size ?? 'lg'}
      data-tone={tone === 'active' ? 'active' : undefined}
      className={cn(selectTriggerVariants({ variant, size, tone }), className)}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon
        data-slot="select-icon"
        className={cn(
          'ml-auto flex text-ink-2 transition-transform duration-(--motion-quick) ease-smooth-out',
          'data-popup-open:rotate-180 group-data-[force-state~=open]/select-trigger:rotate-180',
          'group-data-disabled/select-trigger:text-disabled-foreground',
        )}
      >
        <Icon icon={ArrowDown01Icon} />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  )
}

type SelectValueProps = Omit<SelectPrimitive.Value.Props, 'className'> & { className?: string }

/**
 * The selected label, or the `placeholder`. Pass `children` to show other text in the closed control
 * ("Paket: Business"); the options keep their own labels.
 */
function SelectValue({ className, ...props }: SelectValueProps) {
  return (
    <SelectPrimitive.Value
      data-slot="select-value"
      className={cn('min-w-0 flex-1 truncate data-placeholder:text-placeholder', className)}
      {...props}
    />
  )
}

interface SelectContentProps extends Omit<SelectPrimitive.Popup.Props, 'className'> {
  className?: string
  side?: SelectPrimitive.Positioner.Props['side']
  align?: SelectPrimitive.Positioner.Props['align']
  sideOffset?: SelectPrimitive.Positioner.Props['sideOffset']
  /** Overlap the trigger so the selected row lines up with the value (mouse only). Off by default. */
  alignItemWithTrigger?: boolean
  /** Where the popup is portalled. Defaults to `<body>`. */
  container?: SelectPrimitive.Portal.Props['container']
}

/** The popup: portal, positioner and list. Below the trigger, aligned to its start, 4px away. */
function SelectContent({
  className,
  side = 'bottom',
  align = 'start',
  sideOffset = 4,
  alignItemWithTrigger = false,
  container,
  children,
  ...props
}: SelectContentProps) {
  return (
    <SelectPrimitive.Portal container={container}>
      <SelectPrimitive.Positioner
        data-slot="select-positioner"
        side={side}
        align={align}
        sideOffset={sideOffset}
        alignItemWithTrigger={alignItemWithTrigger}
        className="z-(--z-modal) outline-none"
      >
        <SelectPrimitive.Popup data-slot="select-content" className={cn(selectPopupClassName, className)} {...props}>
          <SelectPrimitive.List data-slot="select-list" className="flex flex-col">
            {children}
          </SelectPrimitive.List>
        </SelectPrimitive.Popup>
      </SelectPrimitive.Positioner>
    </SelectPrimitive.Portal>
  )
}

interface SelectItemProps extends Omit<SelectPrimitive.Item.Props, 'className'>, VariantProps<typeof selectItemVariants> {
  className?: string
}

/** One option. The selected option shows a tick at the end. */
function SelectItem({ className, tone, children, ...props }: SelectItemProps) {
  return (
    <SelectPrimitive.Item data-slot="select-item" className={cn(selectItemVariants({ tone }), className)} {...props}>
      <SelectPrimitive.ItemText className="min-w-0 flex-1 truncate">{children}</SelectPrimitive.ItemText>
      <SelectPrimitive.ItemIndicator data-slot="select-item-indicator" className="flex text-ink">
        <Icon icon={Tick02Icon} />
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  )
}

type SelectGroupProps = Omit<SelectPrimitive.Group.Props, 'className'> & { className?: string }

function SelectGroup({ className, ...props }: SelectGroupProps) {
  return <SelectPrimitive.Group data-slot="select-group" className={cn('flex flex-col', className)} {...props} />
}

type SelectGroupLabelProps = Omit<SelectPrimitive.GroupLabel.Props, 'className'> & { className?: string }

function SelectGroupLabel({ className, ...props }: SelectGroupLabelProps) {
  return (
    <SelectPrimitive.GroupLabel
      data-slot="select-group-label"
      className={cn(selectGroupLabelClassName, className)}
      {...props}
    />
  )
}

type SelectSeparatorProps = Omit<SelectPrimitive.Separator.Props, 'className'> & { className?: string }

/** A line between sections. Put it only between groups, never after the last one. */
function SelectSeparator({ className, ...props }: SelectSeparatorProps) {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={cn(selectSeparatorClassName, className)}
      {...props}
    />
  )
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectGroupLabel,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
  selectGroupLabelClassName,
  selectItemVariants,
  selectPopupClassName,
  selectSeparatorClassName,
  selectTriggerVariants,
  type SelectContentProps,
  type SelectItemProps,
  type SelectTriggerProps,
}
