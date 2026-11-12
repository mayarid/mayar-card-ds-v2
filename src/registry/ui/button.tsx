import { mergeProps } from '@base-ui/react/merge-props'
import { useRender } from '@base-ui/react/use-render'
import { cva, type VariantProps } from 'class-variance-authority'

import { Spinner } from '@/components/ui/spinner'
import { cn } from '@/lib/utils'

/*
 * Mayar v2 Button. Wonder "Mayar Card Design System" › Button Guide Section.
 * Sizes: SM 28 / MD 32 / LG 36 (Wonder) and XL 40 (code-only). Radius: lg 8px, LG uses xl 10px.
 * States: default, hover, pressed, focus, open, disabled, loading.
 */
const buttonVariants = cva(
  [
    'relative hit-44 inline-flex min-w-0 shrink-0 items-center justify-center whitespace-nowrap',
    'font-sans text-body-sm font-medium no-underline outline-none select-none',
    'transition-[background-color,box-shadow,color] duration-(--motion-quick) ease-smooth-out',
    'focus-ring:outline-focus',
    '[&_svg]:pointer-events-none [&_svg]:shrink-0',
    // Disabled. Loading keeps the variant paint.
    'disabled:not-data-loading:bg-disabled disabled:not-data-loading:text-disabled-foreground disabled:not-data-loading:shadow-none',
    'aria-disabled:not-data-loading:cursor-not-allowed aria-disabled:not-data-loading:bg-disabled aria-disabled:not-data-loading:text-disabled-foreground aria-disabled:not-data-loading:shadow-none',
  ],
  {
    variants: {
      variant: {
        primary:
          'bg-primary text-on-primary inset-shadow-highlight hover-fine:bg-primary-hover opened:bg-primary-hover pressed:bg-primary-active pressed:inset-shadow-none',
        secondary:
          'bg-surface text-ink shadow-control hover-fine:bg-canvas opened:bg-canvas pressed:bg-sunken pressed:shadow-ring',
        tertiary:
          'bg-component text-ink-2 hover-fine:bg-component-hover hover-fine:text-ink opened:bg-component-hover opened:text-ink pressed:bg-component-active pressed:text-ink',
        ghost:
          'bg-transparent text-ink-2 hover-fine:bg-component hover-fine:text-ink opened:bg-component opened:text-ink pressed:bg-component-active pressed:text-ink',
        inverted:
          'bg-inverted text-on-inverted inset-shadow-highlight hover-fine:bg-inverted-hover opened:bg-inverted-hover pressed:bg-inverted-active pressed:inset-shadow-none',
        danger:
          'bg-danger text-on-danger inset-shadow-highlight hover-fine:bg-danger-hover opened:bg-danger-hover pressed:bg-danger-active pressed:inset-shadow-none',
        'danger-subtle':
          'bg-danger-subtle text-danger-text hover-fine:bg-danger-light-hover opened:bg-danger-light-hover pressed:bg-danger-light-active',
        'success-subtle': 'bg-success-light text-success-text shadow-ring',
        link: 'h-auto! rounded-sm! px-0! bg-transparent text-primary hover-fine:text-primary-hover pressed:text-primary-active disabled:bg-transparent! aria-disabled:bg-transparent!',
        'link-muted':
          'h-auto! rounded-sm! px-0! bg-transparent text-ink-2 hover-fine:text-ink pressed:text-ink disabled:bg-transparent! aria-disabled:bg-transparent!',
      },
      size: {
        sm: 'h-7 gap-1.5 rounded-lg px-2.5 [&_svg]:size-3.5',
        md: 'h-8 gap-1.5 rounded-lg px-3 [&_svg]:size-4',
        lg: 'h-9 gap-2 rounded-xl px-3.5 [&_svg]:size-4',
        xl: 'h-10 gap-2 rounded-lg px-5 [&_svg]:size-4',
        'icon-sm': 'size-7 rounded-lg [&_svg]:size-3.5',
        'icon-md': 'size-8 rounded-lg [&_svg]:size-4',
        'icon-lg': 'size-9 rounded-xl [&_svg]:size-4',
        'icon-xl': 'size-10 rounded-lg [&_svg]:size-4',
      },
      shape: {
        rounded: '',
        pill: 'rounded-pill',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md', shape: 'rounded' },
  },
)

type ButtonVariantProps = VariantProps<typeof buttonVariants>

interface ButtonProps extends useRender.ComponentProps<'button'>, ButtonVariantProps {
  /** Shows a spinner, keeps the width, and blocks clicks. The label stays as the accessible name. */
  loading?: boolean
  /** Text beside the spinner while `loading`. Keep it shorter than the label. */
  loadingLabel?: string
}

/**
 * The primary action control.
 *
 * Put icons in `children`: `<Button><Icon icon={Add01Icon} />Add card</Button>`.
 * Use `size="icon-md"` (and an `aria-label`) for an icon-only button.
 * Use `render={<a href="/x" />}` to render a link with the same look.
 */
function Button({
  className,
  variant,
  size,
  shape,
  loading = false,
  loadingLabel,
  disabled,
  render,
  children,
  ...props
}: ButtonProps) {
  const isNativeButton = render === undefined
  const content = (
    <>
      {loading ? (
        <span
          data-slot="button-spinner"
          aria-hidden={loadingLabel ? undefined : true}
          className="pointer-events-none absolute inset-0 flex items-center justify-center gap-[inherit]"
        >
          <Spinner className="size-4!" />
          {loadingLabel ? <span>{loadingLabel}</span> : null}
        </span>
      ) : null}
      <span
        data-slot="button-content"
        aria-hidden={loading && loadingLabel ? true : undefined}
        className={cn('inline-flex items-center gap-[inherit]', loading && 'opacity-0')}
      >
        {children}
      </span>
    </>
  )

  const defaultProps: useRender.ElementProps<'button'> = {
    'data-slot': 'button',
    ...(isNativeButton ? { type: 'button', disabled: disabled || loading } : {}),
    ...(!isNativeButton && (disabled || loading) ? { 'aria-disabled': true } : {}),
    'aria-busy': loading || undefined,
    'data-loading': loading ? '' : undefined,
    'data-variant': variant ?? 'primary',
    className: cn(buttonVariants({ variant, size, shape }), className),
    children: content,
  } as useRender.ElementProps<'button'>

  return useRender({
    defaultTagName: 'button',
    render,
    props: mergeProps<'button'>(defaultProps, props),
  })
}

export { Button, buttonVariants, type ButtonProps }
