import type { PropValue } from '@/docs/types'

/**
 * Serialises a component call to JSX source.
 * Booleans: `true` → `prop`, `false`/`undefined` → omitted. Strings → `prop="x"`. Numbers → `prop={1}`.
 * Pass `defaults` to drop props that equal the component default.
 */
export function toJsx(
  name: string,
  props: Record<string, PropValue>,
  children?: string,
  defaults: Record<string, PropValue> = {},
): string {
  const attrs = Object.entries(props)
    .filter(([key, value]) => value !== undefined && value !== false && defaults[key] !== value)
    .map(([key, value]) => {
      if (value === true) return key
      if (typeof value === 'number') return `${key}={${value}}`
      return `${key}="${String(value).replace(/"/g, '&quot;')}"`
    })

  const open = attrs.length === 0 ? `<${name}` : `<${name} ${attrs.join(' ')}`
  const oneLine = open.length + (children?.length ?? 0) < 88

  if (children === undefined || children === '') return `${open} />`
  if (!children.includes('\n') && oneLine) return `${open}>${children}</${name}>`
  return `${open}>\n${indent(children)}\n</${name}>`
}

export function indent(code: string, spaces = 2): string {
  const pad = ' '.repeat(spaces)
  return code
    .split('\n')
    .map((line) => (line ? pad + line : line))
    .join('\n')
}
