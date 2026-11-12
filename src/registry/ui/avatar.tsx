import { Avatar as AvatarPrimitive } from '@base-ui/react/avatar'
import { cva } from 'class-variance-authority'

import { cn } from '@/lib/utils'

/*
 * Mayar v2 Avatar. Code-only: no specimen on the Wonder Design System page.
 * Source: the shipped app (foundations/Avatar.svelte, lib/initials.ts).
 * Sizes 24 / 28 / 32 / 36 / 40 / 48 / 56 with type caption-sm / caption-lg (28–36) / body-sm /
 * body-base / body-lg, all semibold. Tones: primary, tint, neutral.
 */
const avatarVariants = cva(
  'relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-pill font-semibold whitespace-nowrap select-none',
  {
    variants: {
      size: {
        '24': 'size-6 text-caption-sm',
        '28': 'size-7 text-caption-lg',
        '32': 'size-8 text-caption-lg',
        '36': 'size-9 text-caption-lg',
        '40': 'size-10 text-body-sm',
        '48': 'size-12 text-body-base',
        '56': 'size-14 text-body-lg',
      },
      tone: {
        primary: 'bg-primary-light text-primary',
        tint: 'bg-primary-tint text-primary',
        neutral: 'bg-component text-ink-2',
      },
    },
    defaultVariants: { size: '32', tone: 'primary' },
  },
)

type AvatarSize = 24 | 28 | 32 | 36 | 40 | 48 | 56
type AvatarTone = 'primary' | 'tint' | 'neutral'

/**
 * Initials for a name or an email: "Budi Santoso" → "BS", "Budi" → "BU",
 * "budi.s@mayar.id" → "BU", nothing usable → "?".
 */
function getInitials(nameOrEmail: string | null | undefined): string {
  let source = (nameOrEmail ?? '').trim()
  if (source === '') return '?'
  if (!/\s/u.test(source) && source.includes('@')) source = source.slice(0, source.indexOf('@'))
  const words = source
    .split(/\s+/u)
    .map((word) => word.replace(/[^\p{L}\p{N}]/gu, ''))
    .filter((word) => word !== '')
  if (words.length === 0) return '?'
  const [first = '', second = ''] = words
  const letters = second ? `${Array.from(first)[0] ?? ''}${Array.from(second)[0] ?? ''}` : Array.from(first).slice(0, 2).join('')
  return letters.toUpperCase()
}

interface AvatarProps extends AvatarPrimitive.Root.Props {
  /** Diameter in px. */
  size?: AvatarSize
  /** Fill and text colour of the initials. */
  tone?: AvatarTone
}

/**
 * A round picture or initials for a person.
 *
 * Compose it: `<Avatar><AvatarImage src={url} alt="" /><AvatarFallback name="Budi Santoso" /></Avatar>`.
 * The fallback shows while the image loads, when it fails, and when there is no image.
 * It is decorative (`aria-hidden`) by default, because the name next to it is the label.
 * When it stands alone, pass `aria-hidden={false}` and an `aria-label`, and give it `role="img"`.
 */
function Avatar({ className, size = 32, tone = 'primary', ...props }: AvatarProps) {
  return (
    <AvatarPrimitive.Root
      aria-hidden
      data-slot="avatar"
      data-size={size}
      data-tone={tone}
      {...props}
      className={(state) =>
        cn(
          avatarVariants({ size: String(size) as `${AvatarSize}`, tone }),
          typeof className === 'function' ? className(state) : className,
        )
      }
    />
  )
}

/** The picture. Hidden until it has loaded; the fallback shows in its place until then. */
function AvatarImage({ className, ...props }: AvatarPrimitive.Image.Props) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      {...props}
      className={(state) =>
        cn('size-full object-cover', typeof className === 'function' ? className(state) : className)
      }
    />
  )
}

interface AvatarFallbackProps extends AvatarPrimitive.Fallback.Props {
  /** A name or an email. Its initials show when there are no `children`. */
  name?: string | null
}

/** The initials (or any other content) that show when there is no picture. */
function AvatarFallback({ className, name, children, ...props }: AvatarFallbackProps) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      {...props}
      className={(state) =>
        cn('flex size-full items-center justify-center', typeof className === 'function' ? className(state) : className)
      }
    >
      {children ?? getInitials(name)}
    </AvatarPrimitive.Fallback>
  )
}

export {
  Avatar,
  AvatarFallback,
  AvatarImage,
  avatarVariants,
  getInitials,
  type AvatarFallbackProps,
  type AvatarProps,
  type AvatarSize,
  type AvatarTone,
}
