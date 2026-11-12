import axe from 'axe-core'
import { expect } from 'vitest'

/**
 * Runs axe on a rendered container and fails with a readable list of violations.
 * Colour contrast is off: jsdom does not compute styles.
 */
export async function expectNoAxeViolations(container: Element) {
  const result = await axe.run(container, {
    rules: { 'color-contrast': { enabled: false }, region: { enabled: false } },
  })
  const messages = result.violations.map(
    (v) => `${v.id}: ${v.help}\n  ${v.nodes.map((n) => n.html).slice(0, 3).join('\n  ')}`,
  )
  expect(messages, messages.join('\n\n')).toEqual([])
}
