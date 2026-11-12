import { Combobox as ComboboxPrimitive } from '@base-ui/react/combobox'
import { ArrowDown01Icon, Cancel01Icon, Search01Icon, Tick02Icon } from '@hugeicons/core-free-icons'
import type { VariantProps } from 'class-variance-authority'
import type { ComponentProps, ReactNode } from 'react'

import { Icon } from '@/components/ui/icon'
import {
  selectGroupLabelClassName,
  selectItemVariants,
  selectPopupClassName,
  selectSeparatorClassName,
  selectTriggerVariants,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

/*
 * Mayar v2 Combobox. Source: the app's Combobox.svelte (Wonder "Mayar Forms Inputs Guide" › Select /
 * Combobox is the visual reference).
 * A Select with a search row inside the popup. The trigger has the Select / Input chrome (sizes
 * SM–XL, default and ghost) and keeps the focus ring while the popup is open. Popup: 36px search
 * row with a 16px search icon, a separator, then the filtered list (32px rows, 44px on a coarse
 * pointer). Empty and loading are separate states; each fades in (opacity only). The popup is as
 * wide as the trigger and has its own shadow (drop colour, not the modal colour of shadow-popover).
 * Arrow keys stop at the ends of the list, and the first match is highlighted while you type.
 */

/**
 * A single-select list with a search row, for a list that is long enough that the user must type
 * to filter it. For a short list, use Select.
 *
 * Compose `Combobox` › `ComboboxTrigger` (› `ComboboxValue`) › `ComboboxContent` › `ComboboxInput`,
 * `ComboboxEmpty`, `ComboboxList` › `ComboboxItem`. Pass `items` to let it filter; it supports
 * `value`/`defaultValue`/`onValueChange`, `inputValue`/`onInputValueChange` (async search), `name`,
 * `disabled` and `required`, and it reads `Field.Root`.
 */
function Combobox<Value, Multiple extends boolean | undefined = false, Item = Value>({
  loopFocus = false,
  autoHighlight = true,
  ...props
}: ComboboxPrimitive.Root.Props<Value, Multiple, Item>) {
  return <ComboboxPrimitive.Root loopFocus={loopFocus} autoHighlight={autoHighlight} {...props} />
}

/** The popup's own shadow (the app: drop colour at 12/32/-8, not shadow-popover's modal colour). */
const comboboxPopupClassName =
  'overflow-hidden shadow-combobox'

/** Empty and loading fade in, opacity only, like the app's v2-combobox-swap. */
const comboboxSwapClassName = 'animate-[fade-in_var(--motion-state-swap)_ease-in-out_backwards]'

interface ComboboxTriggerProps
  extends Omit<ComboboxPrimitive.Trigger.Props, 'className'>,
    Omit<VariantProps<typeof selectTriggerVariants>, 'tone'> {
  className?: string
}

/** The closed control. The chevron is added at the end. */
function ComboboxTrigger({ className, variant, size, children, ...props }: ComboboxTriggerProps) {
  return (
    <ComboboxPrimitive.Trigger
      data-slot="combobox-trigger"
      data-variant={variant ?? 'default'}
      data-size={size ?? 'lg'}
      className={cn(
        selectTriggerVariants({ variant, size }),
        'group/combobox-trigger cursor-pointer',
        variant === 'ghost'
          ? 'opened:not-aria-invalid:not-data-invalid:shadow-[0_0_0_1px_var(--color-border-focus)]'
          : // No hover wash while open, like the app.
            'opened:not-aria-invalid:not-data-invalid:bg-surface opened:not-aria-invalid:not-data-invalid:shadow-[0_0_0_1px_var(--color-border-focus),0_1px_1px_-1px_var(--color-shadow-drop),0_1px_2px_var(--color-shadow-ambient)]',
        className,
      )}
      {...props}
    >
      {children}
      <span
        data-slot="combobox-icon"
        className={cn(
          'ml-auto flex text-ink-2 transition-transform duration-(--motion-quick) ease-smooth-out',
          'group-data-popup-open/combobox-trigger:rotate-180 group-data-[force-state~=open]/combobox-trigger:rotate-180',
          'group-data-disabled/combobox-trigger:text-disabled-foreground',
        )}
      >
        <Icon icon={ArrowDown01Icon} />
      </span>
    </ComboboxPrimitive.Trigger>
  )
}

interface ComboboxValueProps extends ComboboxPrimitive.Value.Props {
  className?: string
}

/** The selected label, or the `placeholder`. */
function ComboboxValue({ className, ...props }: ComboboxValueProps) {
  return (
    <span
      data-slot="combobox-value"
      className={cn('min-w-0 flex-1 truncate group-data-placeholder/combobox-trigger:text-placeholder', className)}
    >
      <ComboboxPrimitive.Value {...props} />
    </span>
  )
}

interface ComboboxContentProps extends Omit<ComboboxPrimitive.Popup.Props, 'className'> {
  className?: string
  side?: ComboboxPrimitive.Positioner.Props['side']
  align?: ComboboxPrimitive.Positioner.Props['align']
  sideOffset?: ComboboxPrimitive.Positioner.Props['sideOffset']
  /** Where the popup is portalled. Defaults to `<body>`. */
  container?: ComboboxPrimitive.Portal.Props['container']
}

/** The popup: portal, positioner and surface. Below the trigger, aligned to its start, 4px away. */
function ComboboxContent({
  className,
  side = 'bottom',
  align = 'start',
  sideOffset = 4,
  container,
  ...props
}: ComboboxContentProps) {
  return (
    <ComboboxPrimitive.Portal container={container}>
      <ComboboxPrimitive.Positioner
        data-slot="combobox-positioner"
        side={side}
        align={align}
        sideOffset={sideOffset}
        className="z-(--z-modal) outline-none"
      >
        <ComboboxPrimitive.Popup
          data-slot="combobox-content"
          className={cn(selectPopupClassName, comboboxPopupClassName, className)}
          {...props}
        />
      </ComboboxPrimitive.Positioner>
    </ComboboxPrimitive.Portal>
  )
}

interface ComboboxInputProps extends Omit<ComboboxPrimitive.Input.Props, 'className'> {
  className?: string
  /** Content at the end of the search row, e.g. `<ComboboxClear />`. */
  trailing?: ReactNode
}

/**
 * The search row at the top of the popup, with a separator under it. Its name defaults to "Cari";
 * pass `aria-label` for a more exact one ("Cari tim").
 */
function ComboboxInput({ className, trailing, ...props }: ComboboxInputProps) {
  return (
    <>
      <div
        data-slot="combobox-search"
        className="flex h-9 shrink-0 items-center gap-2 px-2.5 text-ink-2 pointer-coarse:h-11"
      >
        <Icon icon={Search01Icon} />
        <ComboboxPrimitive.Input
          data-slot="combobox-input"
          aria-label="Cari"
          autoComplete="off"
          spellCheck={false}
          className={cn(
            'h-full min-w-0 flex-1 border-0 bg-transparent p-0 font-sans text-body-sm font-normal text-ink outline-none',
            'placeholder:text-placeholder pointer-coarse:text-body-lg',
            className,
          )}
          {...props}
        />
        {trailing}
      </div>
      <div role="presentation" className={selectSeparatorClassName} />
    </>
  )
}

type ComboboxClearProps = Omit<ComboboxPrimitive.Clear.Props, 'className'> & { className?: string }

/** Clears the search text and the value. Shown only when there is something to clear. Code-only. */
function ComboboxClear({ className, ...props }: ComboboxClearProps) {
  return (
    <ComboboxPrimitive.Clear
      data-slot="combobox-clear"
      aria-label="Hapus"
      className={cn(
        'relative hit-44 flex size-5 shrink-0 cursor-pointer items-center justify-center rounded-sm text-ink-2 outline-none',
        'hover-fine:text-ink focus-ring:outline-focus',
        className,
      )}
      {...props}
    >
      <Icon icon={Cancel01Icon} size={14} />
    </ComboboxPrimitive.Clear>
  )
}

type ComboboxListProps = Omit<ComboboxPrimitive.List.Props, 'className'> & { className?: string }

/** The scrolling list of results. Pass a function child to render each filtered item. */
function ComboboxList({ className, ...props }: ComboboxListProps) {
  return (
    <ComboboxPrimitive.List
      data-slot="combobox-list"
      className={cn('flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain empty:hidden', className)}
      {...props}
    />
  )
}

interface ComboboxItemProps
  extends Omit<ComboboxPrimitive.Item.Props, 'className'>,
    VariantProps<typeof selectItemVariants> {
  className?: string
}

/** One result. The selected result shows a tick at the end. */
function ComboboxItem({ className, tone, children, ...props }: ComboboxItemProps) {
  return (
    <ComboboxPrimitive.Item data-slot="combobox-item" className={cn(selectItemVariants({ tone }), className)} {...props}>
      <span className="min-w-0 flex-1 truncate">{children}</span>
      <ComboboxPrimitive.ItemIndicator data-slot="combobox-item-indicator" className="flex text-ink">
        <Icon icon={Tick02Icon} />
      </ComboboxPrimitive.ItemIndicator>
    </ComboboxPrimitive.Item>
  )
}

type ComboboxGroupProps = Omit<ComboboxPrimitive.Group.Props, 'className'> & { className?: string }

function ComboboxGroup({ className, ...props }: ComboboxGroupProps) {
  return <ComboboxPrimitive.Group data-slot="combobox-group" className={cn('flex flex-col', className)} {...props} />
}

type ComboboxGroupLabelProps = Omit<ComboboxPrimitive.GroupLabel.Props, 'className'> & { className?: string }

function ComboboxGroupLabel({ className, ...props }: ComboboxGroupLabelProps) {
  return (
    <ComboboxPrimitive.GroupLabel
      data-slot="combobox-group-label"
      className={cn(selectGroupLabelClassName, className)}
      {...props}
    />
  )
}

type ComboboxSeparatorProps = Omit<ComboboxPrimitive.Separator.Props, 'className'> & { className?: string }

/** A line between sections. Put it only between groups. */
function ComboboxSeparator({ className, ...props }: ComboboxSeparatorProps) {
  return (
    <ComboboxPrimitive.Separator
      data-slot="combobox-separator"
      className={cn(selectSeparatorClassName, className)}
      {...props}
    />
  )
}

type ComboboxEmptyProps = Omit<ComboboxPrimitive.Empty.Props, 'className'> & { className?: string }

/**
 * Shown when no result matches. Put a `ComboboxEmptyTitle` and a `ComboboxEmptyDescription` in it.
 * Do not show it while results load: render `ComboboxStatus` then.
 */
function ComboboxEmpty({ className, ...props }: ComboboxEmptyProps) {
  return (
    <ComboboxPrimitive.Empty
      data-slot="combobox-empty"
      className={cn(
        'flex flex-col items-center gap-1 px-4 py-6 text-center empty:hidden',
        comboboxSwapClassName,
        className,
      )}
      {...props}
    />
  )
}

function ComboboxEmptyTitle({ className, ...props }: ComponentProps<'span'>) {
  return (
    <span
      data-slot="combobox-empty-title"
      className={cn('text-body-sm font-medium text-ink', className)}
      {...props}
    />
  )
}

function ComboboxEmptyDescription({ className, ...props }: ComponentProps<'span'>) {
  return (
    <span
      data-slot="combobox-empty-description"
      className={cn('text-caption-lg text-ink-2', className)}
      {...props}
    />
  )
}

type ComboboxStatusProps = Omit<ComboboxPrimitive.Status.Props, 'className'> & { className?: string }

/** A status line announced politely, e.g. "Memuat hasil…" while an async search runs. */
function ComboboxStatus({ className, ...props }: ComboboxStatusProps) {
  return (
    <ComboboxPrimitive.Status
      data-slot="combobox-status"
      className={cn('px-4 py-6 text-center text-body-sm text-ink-2 empty:hidden', comboboxSwapClassName, className)}
      {...props}
    />
  )
}

export {
  Combobox,
  comboboxPopupClassName,
  ComboboxClear,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxEmptyDescription,
  ComboboxEmptyTitle,
  ComboboxGroup,
  ComboboxGroupLabel,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxSeparator,
  ComboboxStatus,
  ComboboxTrigger,
  ComboboxValue,
  type ComboboxContentProps,
  type ComboboxInputProps,
  type ComboboxItemProps,
  type ComboboxTriggerProps,
}
