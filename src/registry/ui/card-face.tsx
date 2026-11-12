import { CancelCircleIcon, Loading03Icon, SnowIcon } from '@hugeicons/core-free-icons'
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'

import { CardFreezeEffect } from '@/components/ui/card-freeze-effect'
import { Icon } from '@/components/ui/icon'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

/*
 * Mayar v2 Card Face. Wonder "Mayar Card Dashboard" › Dashboard page: "Card Face Master v2",
 * "Card Skin <Name> v2" (×8), "Kartu Owner Grid v2" (tile), "Detail Kartu * v2" (hero states).
 *
 * The art is drawn at the Wonder base size of 420×264 (radius 20) and scaled with a transform, so
 * every value in Wonder stays as it is at every size. The status overlay is NOT scaled: its text
 * stays readable on a small tile.
 *
 * Code-only (from the shipped app): the WebGL ice of a frozen card (`card-freeze-effect`), the CSS
 * frost that stands in for it, the freeze / thaw motion, the compact tile overlay for "closed", the
 * 48px thumbnail and the fluid `width="auto"`.
 */

/** The nine card designs, in the order of the app picker. */
const CARD_SKINS = ['midnight', 'royal', 'magenta', 'emerald', 'graphite', 'silver', 'chroma', 'gold', 'matrix'] as const

type CardSkin = (typeof CARD_SKINS)[number]
type CardStatus = 'active' | 'frozen' | 'pending' | 'closed'
type CardFreezeLook = 'webgl' | 'css'

const CARD_SKIN_LABELS: Record<CardSkin, string> = {
  midnight: 'Midnight',
  royal: 'Royal',
  magenta: 'Magenta',
  emerald: 'Emerald',
  graphite: 'Graphite',
  silver: 'Silver',
  chroma: 'Chroma',
  gold: 'Gold',
  matrix: 'Matrix',
}

/* Wonder skin/* gradients. Angle 140deg and the middle stop differ per skin; chroma has four stops. */
const SKIN_CLASSES: Record<CardSkin, string> = {
  midnight: 'bg-linear-140 from-skin-midnight-1 via-skin-midnight-2 via-55% to-skin-midnight-3',
  royal: 'bg-linear-140 from-skin-royal-1 via-skin-royal-2 via-60% to-skin-royal-3',
  magenta: 'bg-linear-140 from-skin-magenta-1 via-skin-magenta-2 via-58% to-skin-magenta-3',
  emerald: 'bg-linear-140 from-skin-emerald-1 via-skin-emerald-2 via-55% to-skin-emerald-3',
  graphite: 'bg-linear-140 from-skin-graphite-1 via-skin-graphite-2 via-60% to-skin-graphite-3',
  silver: 'bg-linear-140 from-skin-silver-1 via-skin-silver-2 via-52% to-skin-silver-3',
  chroma:
    'bg-[linear-gradient(135deg,var(--color-skin-chroma-1)_0%,var(--color-skin-chroma-2)_36%,var(--color-skin-chroma-3)_66%,var(--color-skin-chroma-4)_100%)]',
  gold: 'bg-linear-140 from-skin-gold-1 via-skin-gold-2 via-55% to-skin-gold-3',
  matrix: 'bg-linear-140 from-skin-matrix-1 via-skin-matrix-2 via-52% to-skin-matrix-3',
}

/* Wonder "Hero Face" shadow (ink-navy at .28 and .12), built from the overlay token (the same navy at .4). */
const HERO_SHADOW =
  'shadow-[0_6px_16px_-6px_color-mix(in_srgb,var(--color-overlay)_70%,transparent),0_1px_3px_color-mix(in_srgb,var(--color-overlay)_30%,transparent)]'

const BASE_WIDTH = 420
const BASE_HEIGHT = 264
const BASE_RADIUS = 20
/** Below this width the overlay shows only the icon and a one-line title (Wonder tile). */
const COMPACT_BELOW = 300
/** Below this width the overlay shows no text at all (thumbnails). */
const BARE_BELOW = 120

const MAYAR_M =
  'm93.1 98.8l4.7-30.6c1.4-9.2 3.3-20.7 6-34.8h-0.4c-5 12.7-10.3 25-14.4 33.7l-13.6 29.9h-16.5l-1.4-29.8c-0.4-8.3-1-20.9-1.2-33.8h-0.3c-2.7 13.2-5.2 25.7-7.3 34.8l-7.1 30.6h-19.4l22.2-88.7h27.4l1 29.9c0.3 7.9 1 18.7 0.9 28.4h0.4c3.2-9.7 7.9-20.8 11.3-28.6l12.6-29.7h27.5l-12.1 88.7z'
const MAYAR_SWOOSH = 'm71.8 9.9h-64.1c0 0 53.8 15.7 65.3 35.8z'

const FROST_EASE = 'cubic-bezier(0.16, 1, 0.3, 1)'

function prefersReducedMotion() {
  return typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false
}

/** Runs a Web Animation if the platform has it (jsdom does not). */
function play(el: Element | null | undefined, keyframes: Keyframe[], options: KeyframeAnimationOptions) {
  if (!el || typeof (el as HTMLElement).animate !== 'function') return undefined
  return (el as HTMLElement).animate(keyframes, options)
}

/** Groups 16 digits as `4929 7642 1108 4821`. Other input is returned trimmed. */
function formatCardNumber(value: string) {
  const digits = value.replace(/\D/g, '')
  return digits.length === 16 ? digits.replace(/(\d{4})(?=\d)/g, '$1 ') : value.trim()
}

function cardFaceLabel({
  skin,
  label,
  last4,
  number,
  expiry,
  status,
  closedLabel,
}: {
  skin: CardSkin
  label?: string
  last4: string
  number?: string | null
  expiry: string
  status: CardStatus
  closedLabel?: string | null
}) {
  const parts = [`Kartu ${label ?? CARD_SKIN_LABELS[skin]}`]
  // Never put the full number in the name while the card is masked.
  if (number) {
    parts.push(`nomor ${formatCardNumber(number)}`)
    if (!expiry.includes('•')) parts.push(`berlaku ${expiry}`)
  } else {
    parts.push(`berakhiran ${last4}`)
  }
  if (status === 'frozen') parts.push('dibekukan')
  if (status === 'pending') parts.push('sedang diproses')
  if (status === 'closed') parts.push(closedLabel ? `ditutup ${closedLabel}` : 'ditutup')
  return parts.join(', ')
}

function useMeasuredWidth(enabled: boolean) {
  const [width, setWidth] = useState(0)
  const [node, setNode] = useState<HTMLDivElement | null>(null)

  useLayoutEffect(() => {
    if (!enabled || !node) return
    const update = () => setWidth(node.clientWidth)
    update()
    if (typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(update)
    observer.observe(node)
    return () => observer.disconnect()
  }, [enabled, node])

  return [width, setNode] as const
}

interface CardFaceProps extends Omit<React.ComponentProps<'div'>, 'children'> {
  /** Card design. Default `midnight`. */
  skin?: CardSkin
  /** Last four digits. Shown as `••••  ••••  ••••  4821` while the number is masked. */
  last4: string
  /** The full number once the holder reveals it. Its presence is the revealed state. */
  number?: string | null
  /** Holder line, as printed (the app stores it in capitals). */
  holder: string
  /** BERLAKU value: `MM/YY` when revealed, `••/••` while masked. */
  expiry?: string
  /** Card status. Every status except `active` puts a veil over the face. */
  status?: CardStatus
  /** Second line of the closed overlay, e.g. the close date `28 Okt 2026, 14:20`. */
  closedLabel?: string | null
  /** Card nickname for the accessible name ("Kartu Langganan SaaS, …"). Default: the skin name. */
  label?: string
  /** Width in px; the height follows 420:264. `"auto"` fills the parent width. Default 420. */
  width?: number | 'auto'
  /** The floating hero shadow (Detail Kartu). Off for tiles and thumbnails. */
  elevated?: boolean
  /** Play the freeze / thaw motion when `status` changes after mount. Off, so a grid never animates on load. */
  animated?: boolean
  /**
   * How a frozen card looks. `webgl` (default): the app's WebGL ice that refracts the face. The CSS
   * frost shows until the ice is ready and when WebGL is not available. `css`: the CSS frost only
   * (use it in long lists and static grids). Thumbnails below 120px always use the CSS frost.
   */
  freezeEffect?: CardFreezeLook
  /**
   * Makes the frozen WebGL ice breakable: the holder hammers it apart (pointer, or Enter / Space on
   * the "Pecahkan es untuk membuka kartu" control, three hits). Called once the ice has broken. Set
   * the card active here. Use it with `animated`, so the ice melts away after the break.
   */
  onShatter?: () => void
}

/**
 * The Mayar virtual card: skin gradient, Mayar mark, contactless glyph, chip, card number,
 * holder, expiry and the Mastercard mark, with a veil for frozen, pending and closed cards.
 *
 * It is one image for assistive tech (`role="img"`) with a name such as
 * "Kartu Royal, berakhiran 4821". The full number is in the name only when `number` is set.
 * Put the reveal control, and copy buttons for the number, next to the card, not on it.
 */
function CardFace({
  skin = 'midnight',
  last4,
  number = null,
  holder,
  expiry = '••/••',
  status = 'active',
  closedLabel = null,
  label,
  width = BASE_WIDTH,
  elevated = false,
  animated = false,
  freezeEffect = 'webgl',
  onShatter,
  className,
  style,
  ref,
  ...props
}: CardFaceProps) {
  const auto = width === 'auto'
  const [measured, setMeasureNode] = useMeasuredWidth(auto)
  const renderWidth = auto ? measured || BASE_WIDTH : width
  const scale = renderWidth / BASE_WIDTH
  const density = renderWidth < BARE_BELOW ? 'bare' : renderWidth < COMPACT_BELOW ? 'compact' : 'full'

  const setRef = useCallback(
    (node: HTMLDivElement | null) => {
      setMeasureNode(node)
      if (typeof ref === 'function') return ref(node)
      if (ref) ref.current = node
    },
    [ref, setMeasureNode],
  )

  const frozen = status === 'frozen'
  const overlayRef = useRef<HTMLDivElement>(null)
  const artRef = useRef<HTMLDivElement>(null)

  // WebGL ice. `glFailed` sticks: once WebGL has failed on this card, the CSS frost takes over.
  const wantsGl = freezeEffect === 'webgl' && density !== 'bare'
  const breakable = wantsGl && onShatter !== undefined
  const [glFailed, setGlFailed] = useState(false)
  const [glReady, setGlReady] = useState(false)
  const [glThawing, setGlThawing] = useState(false)
  const [glAppear, setGlAppear] = useState(false)
  const glPath = wantsGl && !glFailed

  // Track status flips during render (not on mount), so a thawing veil never unmounts for a frame.
  const [lastFrozen, setLastFrozen] = useState(frozen)
  const [freezing, setFreezing] = useState(false)
  const [thawing, setThawing] = useState(false)
  if (lastFrozen !== frozen) {
    setLastFrozen(frozen)
    const motion = animated && !prefersReducedMotion()
    const glOnScreen = glPath && glReady
    if (frozen) {
      // Mid-thaw the ice is still mounted and ready; else it starts again from a fresh snapshot.
      if (!glThawing) {
        setGlReady(false)
        setGlAppear(motion)
      }
      setGlThawing(false)
      setFreezing(motion)
      setThawing(false)
    } else {
      // The ice melts itself; the CSS veil thaws only when it is what the holder sees.
      setGlThawing(motion && glOnScreen)
      if (!(motion && glOnScreen)) setGlReady(false)
      setFreezing(false)
      setThawing(motion && !glOnScreen)
    }
  }

  const effectMounted = wantsGl && (frozen || glThawing) && (glPath || breakable)
  const glShowing = glPath && effectMounted && glReady
  // While the ice grows in from a status flip, no frost covers the card until it is ready.
  const glWaitingToAppear = glPath && effectMounted && frozen && glAppear && !glReady
  const cssFrost = (frozen || thawing) && !glShowing && !glWaitingToAppear

  // Freeze: the veil fades in, the frost settles and creeps in from the corners, a sheen crosses it.
  useEffect(() => {
    const overlay = overlayRef.current
    if (!freezing || !overlay) return
    const animations = [
      play(overlay, [{ opacity: 0 }, { opacity: 1 }], { duration: 420, easing: FROST_EASE }),
      play(overlay.querySelector('[data-frost]'), [{ opacity: 0, transform: 'scale(1.06)' }, { opacity: 1, transform: 'scale(1)' }], {
        duration: 420,
        easing: FROST_EASE,
      }),
      ...Array.from(overlay.querySelectorAll('[data-frost-corner]'), (corner, i) =>
        play(corner, [{ transform: 'scale(0)' }, { transform: 'scale(1)' }], {
          duration: 900,
          delay: [0, 80, 140, 200][i] ?? 0,
          easing: FROST_EASE,
          fill: 'backwards',
        }),
      ),
      play(
        overlay.querySelector('[data-frost-sheen]'),
        [
          { transform: 'translateX(-120%) skewX(-18deg)', opacity: 0 },
          { opacity: 0.9, offset: 0.3 },
          { transform: 'translateX(240%) skewX(-18deg)', opacity: 0 },
        ],
        { duration: 1100, delay: 350, easing: 'ease-out', fill: 'both' },
      ),
    ]
    return () => animations.forEach((a) => a?.cancel())
  }, [freezing, cssFrost])

  // Thaw: the veil stays mounted while it fades out, then unmounts.
  useEffect(() => {
    if (!thawing) return
    const animation = play(overlayRef.current, [{ opacity: 1 }, { opacity: 0 }], { duration: 450, easing: 'ease', fill: 'forwards' })
    const done = () => setThawing(false)
    if (!animation) {
      const id = window.setTimeout(done, 0)
      return () => window.clearTimeout(id)
    }
    animation.onfinish = done
    return () => animation.cancel()
  }, [thawing])

  const overlayStatus: CardStatus = frozen || thawing ? (cssFrost ? 'frozen' : 'active') : status
  const name = cardFaceLabel({ skin, label, last4, number, expiry, status, closedLabel })
  const pan = number ? formatCardNumber(number) : `••••  ••••  ••••  ${last4}`

  return (
    <div
      ref={setRef}
      // With the hammer control inside, the card is a named group (an image cannot hold a control).
      role={breakable && effectMounted ? 'group' : 'img'}
      aria-label={name}
      data-slot="card-face"
      data-skin={skin}
      data-status={status}
      data-revealed={number ? '' : undefined}
      data-density={density}
      {...props}
      className={cn('relative isolate shrink-0 overflow-clip', auto && 'w-full', elevated && HERO_SHADOW, className)}
      style={{
        width: auto ? undefined : renderWidth,
        height: auto ? undefined : (renderWidth * BASE_HEIGHT) / BASE_WIDTH,
        aspectRatio: auto ? `${BASE_WIDTH} / ${BASE_HEIGHT}` : undefined,
        borderRadius: BASE_RADIUS * scale,
        ...style,
      }}
    >
      <div
        ref={artRef}
        data-slot="card-face-art"
        aria-hidden
        className={cn(
          'absolute top-0 left-0 flex h-[264px] w-[420px] origin-top-left overflow-clip rounded-media font-sans leading-normal select-none',
          SKIN_CLASSES[skin],
          status === 'closed' && 'grayscale',
          status === 'closed' && density !== 'full' && 'opacity-70',
        )}
        style={{ transform: `scale(${scale})` }}
      >
        {/* Watermark: the Mayar M bleeding past the bottom-right corner. */}
        <svg viewBox="0 0 133.95 108" className="absolute -right-[72px] -bottom-[92px] h-[355px] w-[440px] text-on-brand">
          <path d={MAYAR_M} fill="currentColor" fillOpacity={0.11} />
          <path d={MAYAR_SWOOSH} fill="currentColor" fillOpacity={0.14} />
        </svg>
        {/* Gloss sweep. */}
        <div className="absolute inset-0 bg-[linear-gradient(118deg,color-mix(in_srgb,var(--color-on-brand)_12%,transparent)_0%,transparent_26%,transparent_68%,color-mix(in_srgb,var(--color-on-brand)_7%,transparent)_100%)]" />

        <div className="relative flex size-full flex-col justify-between px-[26px] py-6">
          <div className="flex items-start justify-between">
            <svg data-slot="card-face-mark" viewBox="0 0 133.95 108" className="h-[19px] w-6">
              <path d={MAYAR_M} className="fill-on-brand" />
              <path d={MAYAR_SWOOSH} className="fill-brand-pink" />
            </svg>
            {/* Contactless: lucide `wifi`, turned 90°. Card art, not a UI icon. */}
            <svg
              data-slot="card-face-contactless"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="size-[22px] rotate-90 text-on-brand/70"
            >
              <path d="M12 20h.01" />
              <path d="M2 8.82a15 15 0 0 1 20 0" />
              <path d="M5 12.859a10 10 0 0 1 14 0" />
              <path d="M8.5 16.429a5 5 0 0 1 7 0" />
            </svg>
          </div>

          <div
            data-slot="card-face-chip"
            className="relative h-[34px] w-[46px] shrink-0 overflow-clip rounded-md bg-linear-135 from-card-chip-1 via-card-chip-2 via-48% to-card-chip-3 inset-ring inset-ring-on-brand/30"
          >
            <div className="absolute inset-y-0 left-1/2 w-px bg-skin-gold-3/60" />
            <div className="absolute inset-x-0 top-[33%] h-px bg-skin-gold-3/60" />
            <div className="absolute inset-x-0 top-[66%] h-px bg-skin-gold-3/60" />
          </div>

          <div className="flex flex-col">
            <span
              data-slot="card-face-number"
              className="font-mono text-[21px] leading-[1.33333] font-medium tracking-[0.1em] whitespace-pre text-on-brand text-shadow-[0_1px_2px_color-mix(in_srgb,var(--color-ink)_30%,transparent)]"
            >
              {pan}
            </span>
            <div className="mt-3.5 flex items-end justify-between">
              <div className="flex flex-col gap-0.5">
                <span className="text-[8px] leading-snug font-semibold tracking-[0.12em] text-on-brand/50">PEMEGANG KARTU</span>
                <span
                  data-slot="card-face-holder"
                  className="max-w-[190px] truncate text-[13px] leading-[1.30769] font-semibold tracking-[0.04em] text-on-brand"
                >
                  {holder}
                </span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[8px] leading-snug font-semibold tracking-[0.12em] text-on-brand/50">BERLAKU</span>
                <span
                  data-slot="card-face-expiry"
                  className="font-mono text-[13px] leading-[1.30769] font-semibold tracking-[0.04em] text-on-brand"
                >
                  {expiry}
                </span>
              </div>
              <div data-slot="card-face-network" className="flex shrink-0 items-center">
                <span className="size-[30px] rounded-full bg-card-mc-red" />
                <span className="-ml-3 size-[30px] rounded-full bg-card-mc-orange/90" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {overlayStatus !== 'active' && !(overlayStatus === 'closed' && density !== 'full') ? (
        <CardFaceOverlay ref={overlayRef} status={overlayStatus} density={density} closedLabel={closedLabel} />
      ) : null}

      {effectMounted ? (
        <CardFreezeEffect
          frozen={frozen}
          interactive={breakable}
          appear={glAppear}
          renderScale={scale}
          targetRef={artRef}
          pan={pan}
          holder={holder}
          expiry={expiry}
          onShatter={onShatter}
          onReady={() => setGlReady(true)}
          onFail={() => setGlFailed(true)}
          onThawEnd={() => {
            setGlThawing(false)
            setGlReady(false)
          }}
        />
      ) : null}
    </div>
  )
}

const OVERLAY_COPY: Record<Exclude<CardStatus, 'active'>, { title: string; body: string }> = {
  frozen: { title: 'Kartu dibekukan', body: 'Transaksi baru ditolak sampai kartu dibuka' },
  pending: { title: 'Sedang diproses', body: 'Kartu sedang diaktifkan' },
  closed: { title: 'Kartu ditutup', body: '' },
}

function CardFaceOverlay({
  status,
  density,
  closedLabel,
  ref,
}: {
  status: Exclude<CardStatus, 'active'>
  density: 'bare' | 'compact' | 'full'
  closedLabel: string | null
  ref: React.Ref<HTMLDivElement>
}) {
  const copy = OVERLAY_COPY[status]
  const body = status === 'closed' ? closedLabel : copy.body
  const icon = status === 'frozen' ? SnowIcon : status === 'pending' ? Loading03Icon : CancelCircleIcon
  const iconSize = density === 'full' ? 36 : 24

  return (
    <div
      ref={ref}
      aria-hidden
      data-slot="card-face-overlay"
      data-freeze-ignore=""
      data-status={status}
      className={cn(
        'absolute inset-0 z-10 flex flex-col items-center justify-center gap-1.5 backdrop-blur-[3px]',
        status === 'frozen' && 'bg-skin-midnight-1/62',
        status === 'pending' && 'bg-skin-royal-3/55',
        status === 'closed' && 'bg-ink/55',
      )}
    >
      {status === 'frozen' ? <CardFaceFrost /> : null}
      {density !== 'bare' ? (
        <>
          <Icon
            icon={icon}
            size={iconSize}
            className={cn(
              status === 'frozen' ? 'text-primary-300' : 'text-on-brand',
              status === 'pending' && 'motion-safe:animate-spin',
            )}
          />
          <span
            className={cn(
              'px-3 text-center font-semibold text-on-brand',
              density === 'full' ? 'text-body-base' : 'text-caption-lg',
            )}
          >
            {copy.title}
          </span>
          {density === 'full' && body ? (
            <span
              className={cn(
                'px-3 text-center text-caption-lg tabular-nums',
                status === 'frozen' ? 'text-on-brand/72' : 'text-on-brand/75',
              )}
            >
              {body}
            </span>
          ) : null}
        </>
      ) : null}
    </div>
  )
}

/* Code-only: the CSS frost of the shipped app (its fallback when WebGL is off), behind the label. */
function CardFaceFrost() {
  const corner = 'absolute size-[78%] from-on-brand/80 via-on-brand/28 via-44% to-transparent to-66%'
  return (
    <div
      data-frost=""
      className="pointer-events-none absolute inset-0 -z-10 overflow-clip bg-linear-135 from-on-brand/26 to-primary-300/12 inset-ring-[1.5px] inset-ring-on-brand/50"
    >
      <div className="absolute inset-0 bg-linear-150 from-primary-300/28 to-primary-300/14" />
      <div data-frost-corner="" className={cn(corner, 'top-0 left-0 origin-top-left bg-radial-[circle_at_top_left]')} />
      <div data-frost-corner="" className={cn(corner, 'top-0 right-0 origin-top-right bg-radial-[circle_at_top_right]')} />
      <div data-frost-corner="" className={cn(corner, 'bottom-0 left-0 origin-bottom-left bg-radial-[circle_at_bottom_left]')} />
      <div data-frost-corner="" className={cn(corner, 'right-0 bottom-0 origin-bottom-right bg-radial-[circle_at_bottom_right]')} />
      <div
        data-frost-sheen=""
        className="absolute inset-y-0 left-0 w-[55%] bg-linear-105 from-transparent via-on-brand/50 to-transparent opacity-0"
      />
    </div>
  )
}

interface CardFaceSkeletonProps extends Omit<React.ComponentProps<'span'>, 'children'> {
  /** Width in px, or `"auto"` to fill the parent. Default 420. */
  width?: number | 'auto'
}

/** The loading placeholder for a card face: the same size and corner, `bg-component`. Always `aria-hidden`. */
function CardFaceSkeleton({ width = BASE_WIDTH, className, style, ...props }: CardFaceSkeletonProps) {
  const auto = width === 'auto'
  return (
    <Skeleton
      data-slot="card-face-skeleton"
      fill="component"
      radius="2xl"
      width={auto ? '100%' : width}
      height={auto ? 'auto' : (width * BASE_HEIGHT) / BASE_WIDTH}
      {...props}
      className={className}
      style={{
        aspectRatio: `${BASE_WIDTH} / ${BASE_HEIGHT}`,
        ...(auto ? {} : { borderRadius: Math.max(4, BASE_RADIUS * (width / BASE_WIDTH)) }),
        ...style,
      }}
    />
  )
}

export {
  CARD_SKIN_LABELS,
  CARD_SKINS,
  CardFace,
  CardFaceSkeleton,
  cardFaceLabel,
  formatCardNumber,
  type CardFaceProps,
  type CardFreezeLook,
  type CardFaceSkeletonProps,
  type CardSkin,
  type CardStatus,
}
