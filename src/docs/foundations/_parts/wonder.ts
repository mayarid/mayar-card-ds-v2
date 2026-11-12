/*
 * Wonder values that are not in theme.css. They are reference only: no utility is generated for them.
 * Source: Wonder file "Mayar Card Dashboard", tokens on page 791e4d7e-317a-53f9-8677-071f1e90bae3.
 */

export interface ReferenceToken {
  name: string
  value: string
  note?: string
}

/** Wonder `dark/*`. Not in use: the system is light only. */
export const DARK_TOKENS: ReferenceToken[] = [
  { name: 'dark/canvas', value: '#0b0d12' },
  { name: 'dark/surface', value: '#14171f', note: 'Same value as code-only surface-strong.' },
  { name: 'dark/raised', value: '#1a1e27' },
  { name: 'dark/well', value: '#20242e' },
  { name: 'dark/border', value: '#252a34' },
  { name: 'dark/ink', value: '#eceef3' },
  { name: 'dark/ink-2', value: '#a8aebc' },
  { name: 'dark/muted', value: '#868d9c' },
  { name: 'dark/primary', value: '#8f9cf2' },
  { name: 'dark/primary-soft', value: '#232a52' },
]

/**
 * Pattern tokens for phase 2 (card skins, card face, auth hero and story backgrounds).
 * Values from Wonder get_design_tokens, read on 2026-11-12.
 */
const t = (name: string, value: string, note?: string): ReferenceToken => ({ name, value, note })

export const PATTERN_TOKENS: ReferenceToken[] = [
  t('skin/royal-1', '#3a4bf0'), t('skin/royal-2', '#1e2db0'), t('skin/royal-3', '#16208a'),
  t('skin/midnight-1', '#1f2235'), t('skin/midnight-2', '#0e0f1a'), t('skin/midnight-3', '#15162a'),
  t('skin/emerald-1', '#16b57a'), t('skin/emerald-2', '#0e8f5e'), t('skin/emerald-3', '#0a6e49'),
  t('skin/gold-1', '#e8c66b'), t('skin/gold-2', '#b8923e'), t('skin/gold-3', '#7e601f'),
  t('skin/silver-1', '#aeb4c2'), t('skin/silver-2', '#7a8092'), t('skin/silver-3', '#565c6e'),
  t('skin/graphite-1', '#4a4f63'), t('skin/graphite-2', '#2a2d3c'), t('skin/graphite-3', '#1d1f2b'),
  t('skin/magenta-1', '#f0568f'), t('skin/magenta-2', '#c9156a'), t('skin/magenta-3', '#9e1457'),
  t('skin/chroma-1', '#6a5cf0'), t('skin/chroma-2', '#c13be0'), t('skin/chroma-3', '#f0568f'), t('skin/chroma-4', '#22b5c9'),
  t('skin/matrix-1', '#0f3322'), t('skin/matrix-2', '#06160e'), t('skin/matrix-3', '#0a2e1e'),
  t('card/chip-1', '#f6dc9a'), t('card/chip-2', '#d8b65e'), t('card/chip-3', '#b8923e', 'Alias of skin/gold-2.'),
  t('card/mc-red', '#eb001b'), t('card/mc-orange', '#f79e1b'),
  t('hero/g1', '#f6f7fe'), t('hero/g2', '#eff0fd', 'Auth page background, stop 2.'), t('hero/g3', '#cfd3fa', 'Auth page soft glow.'),
  t('hero/g4', '#9c9cf0'), t('hero/g5', '#5b4fd6'), t('hero/lead', '#3e4556'),
  t('story/g1', '#f8f9fc', 'Auth page background, stop 1.'), t('story/g2', '#f3f4fb'), t('story/g3', '#eeeff9', 'Auth page background, stop 3.'),
  t('story/g4', '#eae9f6'), t('story/g5', '#e7e5f4'),
  t('ui/demo-panel', '#0e1220', 'Dark demo panel behind specimens.'),
]

/** Pattern token families that are not colours. */
export const PATTERN_FAMILIES_PENDING = ['card/mono (font: JetBrains Mono)']

/**
 * Wonder token names where they differ from the theme name. Every other colour has the same
 * name in Wonder and in theme.css. "—" means the token is code-only.
 */
export const WONDER_NAME: Record<string, string> = {
  well: 'ui/well',
  'switch-off': 'ui/switch-off',
  'state-hover': 'state/hover',
  'state-pressed': 'state/pressed',
  'brand-blue': 'brand/blue',
  'brand-pink': 'brand/pink',
  'ghost-hover-bg': 'ui/ghost-hover-bg',
  'ghost-hover-border': 'ui/ghost-hover-border',
  'pink-light': 'ui/pink-light',
  'pink-text': 'ui/pink-text',
  'highlight-inset': 'highlight/inset',
  'shadow-ring': 'shadow/ring',
  'shadow-drop': 'shadow/drop',
  'shadow-ambient': 'shadow/ambient',
  'shadow-modal': 'shadow/modal',
  'on-primary': '— (Wonder uses on-brand)',
  'on-inverted': '—',
  'on-danger': '—',
  info: '—',
  container: '—',
  'surface-strong': '— (= dark/surface)',
}
