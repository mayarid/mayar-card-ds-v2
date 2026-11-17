import { Select as SelectPrimitive } from '@base-ui/react/select'
import { ArrowDown01Icon } from '@hugeicons/core-free-icons'
import { cva, type VariantProps } from 'class-variance-authority'
import type { ComponentProps } from 'react'

import { Icon } from '@/components/ui/icon'
import { cn } from '@/lib/utils'

/*
 * Mayar v2 Select. Source: the app's Select.svelte (Wonder "Mayar Forms Inputs Guide" › Select / Combobox is the visual reference).
 * The trigger has the Input chrome: SM 28 / MD 32 / LG 36 (default) / XL 40, radius lg (SM/MD) and
 * xl (LG/XL), text body-sm / body-sm / body-base / body-lg (body-lg on a coarse pointer, so iOS does
 * not zoom; 44px tall). Variants: default (surface + control shadow: the trigger stays raised, as it acts
 * as a button) and ghost. States: hover (canvas), focus (2px border-focus ring on any focus), invalid
 * (danger-subtle + danger ring), disabled, active filter tone.
 * Popup: as wide as the trigger, radius xl, 4px padding, popover shadow, max 320px tall, 36px rows radius md
 * with a 2px gap (44px on a coarse pointer). The selected row has a component-active fill (no tick).
 * Motion: a transition from a --motion-dropdown-pre-scale scale + fade (--motion-dropdown-open in,
 * --motion-dropdown-close out), from the trigger side.
 */
const selectTriggerVariants = cva(
  [
    'group/select-trigger relative hit-44 flex w-full min-w-0 items-center text-left font-sans font-normal text-ink',
    'outline-none select-none touch-manipulation pointer-coarse:h-11 pointer-coarse:text-body-lg',
    '[&_svg]:pointer-events-none [&_svg]:shrink-0',
    // A leading part (icon, initials disc) pulls the start padding in to 8px, like the app.
    'has-data-[slot=select-leading]:pl-2',
    // Invalid: from aria-invalid or from Field.Root.
    'aria-invalid:bg-danger-subtle aria-invalid:shadow-[0_0_0_1px_var(--color-danger)]',
    'data-invalid:bg-danger-subtle data-invalid:shadow-[0_0_0_1px_var(--color-danger)]',
    'data-disabled:bg-disabled data-disabled:text-disabled-foreground data-disabled:shadow-ring',
  ],
  {
    variants: {
      variant: {
        default: [
          'bg-surface shadow-control',
          'hover-fine:not-aria-invalid:not-data-invalid:not-focus:not-data-[tone=active]:bg-canvas',
          // The app rings the control on any focus (:focus-within), not only keyboard focus.
          'focus:not-aria-invalid:not-data-invalid:shadow-[0_0_0_2px_var(--color-border-focus),0_1px_1px_-1px_var(--color-shadow-drop),0_1px_2px_var(--color-shadow-ambient)]',
          'focus-ring:not-aria-invalid:not-data-invalid:shadow-[0_0_0_2px_var(--color-border-focus),0_1px_1px_-1px_var(--color-shadow-drop),0_1px_2px_var(--color-shadow-ambient)]',
        ],
        ghost: [
          'bg-transparent shadow-none',
          'focus:not-aria-invalid:not-data-invalid:shadow-focus',
          'focus-ring:not-aria-invalid:not-data-invalid:shadow-focus',
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
          'not-data-disabled:not-aria-invalid:bg-primary-tint not-data-disabled:not-aria-invalid:text-primary not-data-disabled:not-aria-invalid:shadow-[0_0_0_1px_var(--color-primary),0_1px_1px_-1px_var(--color-shadow-drop),0_1px_2px_var(--color-shadow-ambient)] not-data-disabled:[&_svg]:text-primary not-data-disabled:[&_[data-slot=select-leading]]:text-primary',
      },
    },
    defaultVariants: { variant: 'default', size: 'lg', tone: 'default' },
  },
)

/** Popup surface. Exported so a doc or test can draw the open menu without opening it. */
const selectPopupClassName = cn(
  'flex max-h-[min(320px,var(--available-height,320px))] w-(--anchor-width) min-w-0 flex-col overflow-y-auto overscroll-contain',
  'rounded-xl bg-surface p-1 font-sans text-ink shadow-popover outline-none',
  'origin-(--transform-origin)',
  'transition-[opacity,scale] duration-(--motion-dropdown-open) ease-smooth-out',
  'data-starting-style:scale-(--motion-dropdown-pre-scale) data-starting-style:opacity-0',
  'data-ending-style:scale-(--motion-dropdown-pre-scale) data-ending-style:opacity-0 data-ending-style:duration-(--motion-dropdown-close)',
)

const selectItemVariants = cva(
  [
    'relative flex h-9 shrink-0 cursor-default items-center gap-2 rounded-md px-2 text-body-sm outline-none select-none touch-manipulation',
    'pointer-coarse:h-11',
    'data-highlighted:bg-component',
    // The selected row: one step above the highlight, also while highlighted.
    'data-selected:bg-component-active data-selected:text-ink data-highlighted:data-selected:bg-component-active',
    'data-disabled:text-disabled-foreground data-disabled:data-highlighted:bg-transparent',
  ],
  {
    variants: {
      tone: {
        default: 'text-ink',
        // A shortcut row, not a value ("+ Tambah pemegang kartu"). Code-only.
        action: 'text-primary',
      },
    },
    defaultVariants: { tone: 'default' },
  },
)

const selectGroupLabelClassName = 'px-2 pt-1.5 pb-1 text-left text-caption-lg font-medium text-muted'
/** Edge to edge across the 4px popup padding, 0.5px. */
const selectSeparatorClassName = '-mx-1 my-1 h-[0.5px] shrink-0 bg-border-subtle'

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

/** The closed control. Put a `SelectLeading` before `SelectValue`; the chevron is added at the end. */
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

/**
 * Content before the value in the closed control: an icon, or the picked member's initials disc.
 * Decorative (hidden from assistive tech); the trigger keeps its own name. Code-only.
 */
function SelectLeading({ className, ...props }: ComponentProps<'span'>) {
  return (
    <span
      data-slot="select-leading"
      aria-hidden
      className={cn('pointer-events-none inline-flex shrink-0 items-center text-ink-2', className)}
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
          <SelectPrimitive.List data-slot="select-list" className="flex flex-col gap-0.5">
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

/** One option. The selected option has a component-active fill. */
function SelectItem({ className, tone, children, ...props }: SelectItemProps) {
  return (
    <SelectPrimitive.Item data-slot="select-item" className={cn(selectItemVariants({ tone }), className)} {...props}>
      <SelectPrimitive.ItemText className="min-w-0 flex-1 truncate">{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  )
}

type SelectGroupProps = Omit<SelectPrimitive.Group.Props, 'className'> & { className?: string }

function SelectGroup({ className, ...props }: SelectGroupProps) {
  return <SelectPrimitive.Group data-slot="select-group" className={cn('flex flex-col gap-0.5', className)} {...props} />
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
  SelectLeading,
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
