import {
  Alert02Icon,
  AlertCircleIcon,
  CheckmarkCircle02Icon,
  InformationCircleIcon,
} from '@hugeicons/core-free-icons'
import { cva, type VariantProps } from 'class-variance-authority'
import type { ReactNode } from 'react'

import { Icon, type IconProps } from '@/components/ui/icon'
import { cn } from '@/lib/utils'

/*
 * Mayar v2 Notice. Code-only: no specimen on the Wonder Design System page.
 * Source: the shipped app (foundations/Notice.svelte), from the admin StateBanner and the inline
 * error/notice copies in the modals and forms.
 * banner: 16px padding, 12px gap, 20px icon, radius 2xl, body in ink.
 * inline: 10px 12px padding, 8px gap, 16px icon, radius lg, body in the tone text colour.
 * Tones: info (primary-tint), neutral (well + subtle ring), success, warning, danger
 * (inline danger: danger-subtle + danger-light ring).
 */

const noticeVariants = cva('flex w-full items-start', {
  variants: {
    variant: {
      banner: 'gap-3 rounded-2xl p-4',
      inline: 'gap-2 rounded-lg px-3 py-2.5',
    },
    tone: {
      info: 'bg-primary-tint [--notice-text:var(--color-primary)]',
      neutral: 'bg-well inset-ring inset-ring-border-subtle [--notice-text:var(--color-ink)]',
      success: 'bg-success-light [--notice-text:var(--color-success-text)]',
      warning: 'bg-warning-light [--notice-text:var(--color-warning-text)]',
      danger: 'bg-danger-light [--notice-text:var(--color-danger-text)]',
    },
  },
  compoundVariants: [{ variant: 'inline', tone: 'danger', className: 'bg-danger-subtle inset-ring inset-ring-danger-light' }],
  defaultVariants: { variant: 'banner', tone: 'info' },
})

type NoticeTone = NonNullable<VariantProps<typeof noticeVariants>['tone']>
type NoticeVariant = NonNullable<VariantProps<typeof noticeVariants>['variant']>

const NOTICE_ICONS: Record<NoticeTone, IconProps['icon']> = {
  info: InformationCircleIcon,
  neutral: InformationCircleIcon,
  success: CheckmarkCircle02Icon,
  warning: Alert02Icon,
  danger: AlertCircleIcon,
}

interface NoticeProps extends Omit<React.ComponentProps<'div'>, 'title'>, VariantProps<typeof noticeVariants> {
  /** Icon override (a Hugeicons icon). Leave it out for the tone icon; `false` shows no icon. */
  icon?: IconProps['icon'] | false
  /** Body colour: `tone` (the tone text colour) or `ink`. Default: banner `ink`, inline `tone`. */
  bodyTone?: 'ink' | 'tone'
  /** A semibold first line in the tone text colour. */
  title?: ReactNode
  /** A Button or link at the end of the row, e.g. "Buka blokir". */
  action?: ReactNode
}

/**
 * A tinted message that stays on the page: a page state banner or an inline form message.
 *
 * `<Notice tone="danger" variant="inline">Gagal menyimpan. Coba lagi.</Notice>`.
 * The body is plain text or one `<p>` per line. `danger` is `role="alert"`, the other tones
 * `role="status"`; pass `role="note"` for a banner that is on the page from the first paint.
 */
function Notice({
  className,
  tone = 'info',
  variant = 'banner',
  bodyTone,
  icon,
  title,
  action,
  role,
  children,
  ...props
}: NoticeProps) {
  const glyph = icon === false ? null : (icon ?? NOTICE_ICONS[tone ?? 'info'])
  const body = bodyTone ?? (variant === 'inline' ? 'tone' : 'ink')
  return (
    <div
      data-slot="notice"
      data-tone={tone}
      data-variant={variant}
      role={role ?? (tone === 'danger' ? 'alert' : 'status')}
      className={cn(noticeVariants({ tone, variant }), className)}
      {...props}
    >
      {glyph ? (
        <Icon
          icon={glyph}
          size={variant === 'inline' ? 16 : 20}
          data-slot="notice-icon"
          className="mt-0.5 text-(--notice-text)"
        />
      ) : null}
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        {title ? (
          <p data-slot="notice-title" className="m-0 text-body-sm font-semibold text-(--notice-text)">
            {title}
          </p>
        ) : null}
        {children ? (
          <div
            data-slot="notice-body"
            className={cn(
              'flex flex-col gap-0.5 text-body-sm [&_p]:m-0',
              body === 'tone' ? 'text-(--notice-text)' : 'text-ink',
            )}
          >
            {children}
          </div>
        ) : null}
      </div>
      {action ? (
        <div data-slot="notice-action" className="flex shrink-0 items-center self-center">
          {action}
        </div>
      ) : null}
    </div>
  )
}

export { Notice, noticeVariants, type NoticeProps, type NoticeTone, type NoticeVariant }
