/* Colour maths for the contrast tables. WCAG 2.2 relative luminance, alpha composited over the backdrop. */

export interface Rgba {
  r: number
  g: number
  b: number
  a: number
}

/** Parses `#rgb`, `#rrggbb` and `#rrggbbaa`. Returns null for anything else. */
export function parseHex(value: string): Rgba | null {
  const hex = value.trim().replace(/^#/, '')
  if (!/^([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(hex)) return null
  const full = hex.length === 3 ? [...hex].map((c) => c + c).join('') : hex
  const n = (i: number) => parseInt(full.slice(i, i + 2), 16)
  return { r: n(0), g: n(2), b: n(4), a: full.length === 8 ? n(6) / 255 : 1 }
}

/** Paints `top` over an opaque `bottom`. */
export function composite(top: Rgba, bottom: Rgba): Rgba {
  const mix = (t: number, b: number) => t * top.a + b * (1 - top.a)
  return { r: mix(top.r, bottom.r), g: mix(top.g, bottom.g), b: mix(top.b, bottom.b), a: 1 }
}

function luminance({ r, g, b }: Rgba) {
  const channel = (v: number) => {
    const s = v / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
}

const WHITE: Rgba = { r: 255, g: 255, b: 255, a: 1 }

/**
 * WCAG contrast ratio of `fg` on `bg`. A translucent `bg` is first painted on `base`
 * (white by default), then a translucent `fg` is painted on that result.
 */
export function contrastRatio(fg: string, bg: string, base: string = '#ffffff') {
  const f = parseHex(fg)
  const b = parseHex(bg)
  const under = parseHex(base) ?? WHITE
  if (!f || !b) return null
  const back = composite(b, under)
  const front = composite(f, back)
  const [hi, lo] = [luminance(front), luminance(back)].sort((x, y) => y - x) as [number, number]
  return (hi + 0.05) / (lo + 0.05)
}

/** The WCAG level a ratio meets for text. */
export function wcagLevel(ratio: number): 'AAA' | 'AA' | 'AA large' | 'Fail' {
  if (ratio >= 7) return 'AAA'
  if (ratio >= 4.5) return 'AA'
  if (ratio >= 3) return 'AA large'
  return 'Fail'
}
