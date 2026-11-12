import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { expectNoAxeViolations } from '@/test/axe'

import { AnimatedNumber, moneyPrefix } from './animated-number'

const root = (c: HTMLElement) => c.firstElementChild as HTMLElement
/** The number as text, without NumberFlow's inline <style>. */
const shown = (c: HTMLElement) => {
  const clone = root(c).cloneNode(true) as HTMLElement
  clone.querySelectorAll('style').forEach((el) => el.remove())
  return clone.textContent
}

describe('AnimatedNumber', () => {
  it('shows the real value on mount, formatted for id-ID', () => {
    const { container } = render(<AnimatedNumber value={48250000} prefix={moneyPrefix('IDR')} />)
    expect(shown(container)).toBe('Rp 48.250.000')
    expect(root(container).className).toContain('tabular-nums')
  })

  it('updates to a new value', () => {
    const { container, rerender } = render(<AnimatedNumber value={0} suffix="%" />)
    rerender(<AnimatedNumber value={100} suffix="%" />)
    expect(shown(container)).toBe('100%')
  })

  it('masks a hidden value and speaks the hidden label', () => {
    const { container } = render(<AnimatedNumber value={5000} hidden hiddenLabel="Saldo disembunyikan" />)
    expect(container.textContent).not.toContain('5.000')
    expect(container.querySelector('[aria-hidden="true"]')?.textContent).toBe('•••')
    expect(container.querySelector('.sr-only')?.textContent).toBe('Saldo disembunyikan')
  })

  it('passes format options and props through', () => {
    const { container } = render(<AnimatedNumber value={12.5} format={{ minimumFractionDigits: 2 }} data-testid="n" />)
    expect(shown(container)).toBe('12,50')
    expect(root(container).dataset.testid).toBe('n')
  })

  it('uses the currency code when it is not IDR', () => {
    expect(moneyPrefix('USD')).toBe('USD ')
  })

  it('has no axe violations', async () => {
    const { container } = render(<AnimatedNumber value={48250000} prefix="Rp " />)
    await expectNoAxeViolations(container)
  })
})
