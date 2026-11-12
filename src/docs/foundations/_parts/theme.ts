import raw from '@/registry/styles/theme.css?raw'

/*
 * Reads every custom property from theme.css at build time, so the foundation pages always show
 * the values the CSS ships. The first declaration wins: the reduced-motion block that zeroes the
 * motion tokens comes later in the file and is ignored here.
 */
function parseTheme(css: string) {
  const vars = new Map<string, string>()
  const clean = css.replace(/\/\*[\s\S]*?\*\//g, '')
  for (const match of clean.matchAll(/(--[\w-]+)\s*:\s*([^;{}]+);/g)) {
    const [, name, value] = match
    if (!name || value === undefined || vars.has(name)) continue
    vars.set(name, value.replace(/\s+/g, ' ').trim())
  }
  return vars
}

export const themeVars = parseTheme(raw)

/** The value of a theme variable, e.g. `themeValue('--color-primary')` → `#253ce2`. */
export function themeValue(name: string) {
  return themeVars.get(name) ?? ''
}

/** Every variable whose name starts with `prefix`, in source order. */
export function themeGroup(prefix: string) {
  return [...themeVars.entries()].filter(([name]) => name.startsWith(prefix))
}

/** The raw theme.css source. */
export const themeSource = raw
