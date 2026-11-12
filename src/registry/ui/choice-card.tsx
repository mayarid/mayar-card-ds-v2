import { Tick02Icon } from '@hugeicons/core-free-icons'
import { Radio } from '@base-ui/react/radio'
import { RadioGroup } from '@base-ui/react/radio-group'
import { cva } from 'class-variance-authority'
import { useId, type ComponentProps, type ReactNode } from 'react'

import { Icon } from '@/components/ui/icon'
import { cn } from '@/lib/utils'

/*
 * Mayar v2 Choice Card. Wonder "Mayar Card Design System" › Selection › Choice Card.
 * default: 14px padding, 12px gap, radius xl, hairline ring; selected = primary tint + 1px primary
 *   ring, the radio dot pops in with `--motion-choice-pop`. Title stays 600 in every state.
 * leading (code-only): radio first, radius 2xl, control shadow, 1.5px ring when selected.
 * icon (code-only): a 32px icon disc first, no radio dot.
 * method (code-only): a 32px icon tile first, the radio at the end; disabled = dashed and muted.
 * list (code-only): a 44px row in a `ChoiceCardList`; selected = component fill and a check.
 * Behaviour: Base UI RadioGroup + Radio, so arrows move and select, and Tab enters on the
 * selected card.
 */
type ChoiceCardVariant = 'default' | 'leading' | 'icon' | 'method' | 'list'

const cardVariants = cva(
  [
    'group/choice relative flex w-full min-w-0 cursor-pointer items-start bg-surface text-start outline-none select-none touch-manipulation',
    'transition-[background-color,box-shadow] duration-(--motion-quick) ease-smooth-out',
    'focus-ring:outline-focus',
    'data-disabled:cursor-not-allowed',
  ],
  {
    variants: {
      variant: {
        default: [
          'gap-3 rounded-xl p-3.5 shadow-ring',
          'hover-fine:not-data-checked:bg-canvas',
          'data-checked:not-data-disabled:bg-primary-tint data-checked:not-data-disabled:shadow-[0_0_0_1px_var(--color-primary)]',
        ],
        leading: [
          'gap-2.5 rounded-2xl p-3 shadow-control',
          'hover-fine:not-data-checked:bg-canvas',
          'data-checked:not-data-disabled:bg-primary-tint data-checked:not-data-disabled:shadow-[0_0_0_1.5px_var(--color-primary)]',
          'data-disabled:bg-disabled data-disabled:shadow-none',
        ],
        icon: [
          'gap-3 rounded-xl p-3.5 shadow-[0_0_0_1px_var(--color-shadow-ring),0_1px_2px_var(--color-shadow-ambient)]',
          'hover-fine:not-data-checked:bg-canvas',
          'data-checked:not-data-disabled:bg-primary-tint data-checked:not-data-disabled:shadow-[0_0_0_1.5px_var(--color-primary)]',
        ],
        method: [
          'items-center gap-3 rounded-xl px-3.5 py-3 shadow-ring',
          'hover-fine:not-data-checked:bg-canvas',
          'data-checked:not-data-disabled:bg-primary-tint data-checked:not-data-disabled:shadow-[0_0_0_1.5px_var(--color-primary)]',
          'data-disabled:bg-transparent data-disabled:shadow-none data-disabled:outline-1 data-disabled:outline-dashed data-disabled:-outline-offset-1 data-disabled:outline-border',
        ],
        list: [
          'min-h-11 items-center gap-3 rounded-lg bg-transparent px-2.5 py-1.5 text-ink-2 shadow-none',
          'hover-fine:not-data-checked:bg-state-hover',
          'data-checked:bg-component data-checked:text-ink',
        ],
      },
    },
    defaultVariants: { variant: 'default' },
  },
)

const titleVariants = cva(`font-sans font-semibold text-ink group-data-disabled/choice:text-disabled-foreground`, {
  variants: {
    variant: {
      default: 'text-body-base',
      leading: 'text-body-sm',
      icon: 'text-body-sm',
      method: `text-body-sm group-data-disabled/choice:text-ink-2`,
      list: 'text-body-sm font-medium wrap-anywhere text-inherit',
    },
  },
})

const descriptionVariants = cva(`font-sans text-caption-lg text-ink-2 group-data-disabled/choice:text-disabled-foreground`, {
  variants: {
    variant: {
      default: '',
      leading: '',
      icon: '',
      method: `text-muted group-data-disabled/choice:text-placeholder`,
      list: '',
    },
  },
})

const iconVariants = cva(
  [
    'pointer-events-none inline-flex size-8 shrink-0 items-center justify-center text-ink-2',
    'transition-[background-color,color,box-shadow] duration-(--motion-quick) ease-smooth-out',
    `group-data-checked/choice:bg-surface group-data-checked/choice:text-primary`,
  ],
  {
    variants: {
      variant: {
        default: 'rounded-pill bg-well',
        leading: 'rounded-pill bg-well',
        icon: 'rounded-pill bg-well',
        method: `rounded-lg bg-component group-data-checked/choice:shadow-ring group-data-disabled/choice:bg-component group-data-disabled/choice:text-placeholder group-data-disabled/choice:shadow-none`,
        list: 'rounded-pill bg-well',
      },
    },
  },
)

const radioVariants = cva(
  [
    'pointer-events-none inline-flex size-4 items-center justify-center rounded-pill bg-surface',
    'transition-[background-color,box-shadow] duration-(--motion-quick) ease-smooth-out',
    `group-data-checked/choice:bg-primary group-data-checked/choice:shadow-none`,
  ],
  {
    variants: {
      variant: {
        default: `shadow-[inset_0_0_0_1.5px_var(--color-border-subtle)] group-data-disabled/choice:bg-disabled group-data-disabled/choice:shadow-none`,
        leading: `shadow-[inset_0_0_0_1px_var(--color-switch-off)] group-data-disabled/choice:bg-surface! group-data-disabled/choice:shadow-[inset_0_0_0_1px_var(--color-switch-off)]!`,
        icon: '',
        method: `shadow-[inset_0_0_0_1.5px_var(--color-border-subtle)] group-data-disabled/choice:bg-disabled group-data-disabled/choice:shadow-none`,
        list: '',
      },
    },
  },
)

interface ChoiceCardProps extends Omit<ComponentProps<typeof Radio.Root>, 'title' | 'className' | 'children'> {
  className?: string
  variant?: ChoiceCardVariant
  /** Names the option. */
  title: ReactNode
  /** One short line under the title. Read as the description. */
  description?: ReactNode
  /** The glyph in the disc (`icon`) or tile (`method`): `<Icon icon={…} />`. */
  icon?: ReactNode
  /** Decorative content before the text, e.g. a bank logo with `alt=""`. */
  leading?: ReactNode
  /** Extra content at the end of the text block. */
  children?: ReactNode
}

/**
 * An exclusive option with a title and an optional description; the whole card is the radio.
 *
 * Put cards in a `ChoiceCardGroup` (the radio group), laid out with `ChoiceCardPair` or
 * `ChoiceCardList`.
 */
function ChoiceCard({
  className,
  variant = 'default',
  title,
  description,
  icon,
  leading,
  children,
  ...props
}: ChoiceCardProps) {
  const id = useId()
  const titleId = `${id}-title`
  const descriptionId = description ? `${id}-description` : undefined
  const hasIcon = (variant === 'icon' || variant === 'method') && icon !== undefined
  const hasRadio = variant !== 'icon' && variant !== 'list'

  const radio = hasRadio ? (
    <span
      data-slot="choice-card-radio"
      aria-hidden
      className={cn('flex shrink-0', variant === 'method' ? `group-data-disabled/choice:hidden` : 'pt-0.5')}
    >
      <span className={cn(radioVariants({ variant }))}>
        <span
          className={cn(
            'size-1.5 scale-0 rounded-pill bg-on-brand opacity-0',
            'transition-[scale,opacity] duration-(--motion-choice-pop) ease-smooth-out',
            `group-data-checked/choice:scale-100 group-data-checked/choice:opacity-100`,
            variant === 'leading' && `group-data-disabled/choice:opacity-0!`,
          )}
        />
      </span>
    </span>
  ) : null

  return (
    <Radio.Root
      data-slot="choice-card"
      data-variant={variant}
      render={<div />}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      className={cn(cardVariants({ variant }), className)}
      {...props}
    >
      {variant === 'leading' ? radio : null}
      {hasIcon ? (
        <span data-slot="choice-card-icon" aria-hidden className={cn(iconVariants({ variant }))}>
          {icon}
        </span>
      ) : null}
      {leading ? (
        <span data-slot="choice-card-leading" className="pointer-events-none flex shrink-0 items-center">
          {leading}
        </span>
      ) : null}
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span id={titleId} data-slot="choice-card-title" className={cn(titleVariants({ variant }))}>
          {title}
        </span>
        {description ? (
          <span id={descriptionId} data-slot="choice-card-description" className={cn(descriptionVariants({ variant }))}>
            {description}
          </span>
        ) : null}
        {children}
      </span>
      {variant !== 'leading' ? radio : null}
      {variant === 'list' ? (
        <Icon
          icon={Tick02Icon}
          data-slot="choice-card-check"
          className={cn('pointer-events-none hidden text-primary', `group-data-checked/choice:block`)}
        />
      ) : null}
    </Radio.Root>
  )
}

type ChoiceCardGroupProps = Omit<ComponentProps<typeof RadioGroup>, 'className'> & { className?: string }

/**
 * The radio group for Choice Cards. Name it with `aria-label` or `aria-labelledby`.
 * It holds `value` / `defaultValue`, `name`, `required` and `disabled`.
 */
function ChoiceCardGroup({ className, ...props }: ChoiceCardGroupProps) {
  return <RadioGroup data-slot="choice-card-group" className={cn('flex min-w-0 flex-col gap-2.5', className)} {...props} />
}

/** Two columns when its container is at least 639px wide, one column below. */
function ChoiceCardPair({ className, children, ...props }: ComponentProps<'div'>) {
  return (
    <div data-slot="choice-card-pair" className={cn('@container min-w-0', className)} {...props}>
      <div className="grid w-full grid-cols-1 gap-2.5 @min-[639px]:grid-cols-2">{children}</div>
    </div>
  )
}

/** The shared panel for `variant="list"` rows: surface, control shadow, radius xl, 4px padding. */
function ChoiceCardList({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="choice-card-list"
      className={cn('flex flex-col gap-0.5 rounded-xl bg-surface p-1 shadow-control', className)}
      {...props}
    />
  )
}

export {
  ChoiceCard,
  ChoiceCardGroup,
  ChoiceCardPair,
  ChoiceCardList,
  type ChoiceCardProps,
  type ChoiceCardGroupProps,
  type ChoiceCardVariant,
}
