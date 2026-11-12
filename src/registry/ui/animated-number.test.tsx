import { act, render } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { expectNoAxeViolations } from '@/test/axe'

import { AnimatedNumber } from './animated-number'

const visible = (c: HTMLElement) => c.querySelector('[aria-hidden="true"]')?.textContent
const spoken = (c: HTMLElement) => c.querySelector('.sr-only')?.textContent

describe('AnimatedNumber', () => {
  afterEach(() => vi.restoreAllMocks())

  it('shows the real value on mount (no count-up), formatted for id-ID', () => {
    const { container } = render(<AnimatedNumber value={48250000} prefix="Rp " />)
    expect(visible(container)).toBe('Rp 48.250.000')
    expect(spoken(container)).toBe('Rp 48.250.000')
    expect(container.firstElementChild?.className).toContain('tabular-nums')
    expect(container.firstElementChild?.className).toContain('font-mono')
  })

  it('tweens to a new value and speaks only the final value', async () => {
    const frames: FrameRequestCallback[] = []
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      frames.push(cb)
      return frames.length
    })
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {})
    const { container, rerender } = render(<AnimatedNumber value={0} suffix="%" />)
    rerender(<AnimatedNumber value={100} suffix="%" />)
    expect(spoken(container)).toBe('100%')
    act(() => frames.shift()?.(0))
    act(() => frames.shift()?.(100))
    const mid = visible(container)
    expect(mid).not.toBe('100%')
    expect(mid).not.toBe('0%')
    act(() => frames.shift()?.(1000))
    expect(visible(container)).toBe('100%')
  })

  it('snaps under reduced motion', () => {
    vi.spyOn(window, 'matchMedia').mockImplementation(
      (query: string) =>
        ({
          matches: query.includes('reduce'),
          media: query,
          addEventListener: () => {},
          removeEventListener: () => {},
        }) as unknown as MediaQueryList,
    )
    const raf = vi.spyOn(window, 'requestAnimationFrame')
    const { container, rerender } = render(<AnimatedNumber value={1} />)
    rerender(<AnimatedNumber value={2000} />)
    expect(visible(container)).toBe('2.000')
    expect(raf).not.toHaveBeenCalled()
  })

  it('masks a hidden value and speaks the hidden label', () => {
    const { container } = render(<AnimatedNumber value={5000} hidden hiddenLabel="Saldo disembunyikan" />)
    expect(container.textContent).not.toContain('5.000')
    expect(visible(container)).toBe('•••')
    expect(spoken(container)).toBe('Saldo disembunyikan')
  })

  it('passes format options and props through', () => {
    const { container } = render(
      <AnimatedNumber value={12.5} format={{ minimumFractionDigits: 2 }} data-testid="n" />,
    )
    expect(visible(container)).toBe('12,50')
    expect((container.firstElementChild as HTMLElement).dataset.testid).toBe('n')
  })

  it('has no axe violations', async () => {
    const { container } = render(<AnimatedNumber value={48250000} prefix="Rp " />)
    await expectNoAxeViolations(container)
  })
})
