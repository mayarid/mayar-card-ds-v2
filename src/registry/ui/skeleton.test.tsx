import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { expectNoAxeViolations } from '@/test/axe'

import { Skeleton } from './skeleton'

describe('Skeleton', () => {
  it('is always aria-hidden, even when the caller passes aria-hidden={false}', () => {
    const { container } = render(<Skeleton aria-hidden={false} />)
    expect(container.firstElementChild?.getAttribute('aria-hidden')).toBe('true')
  })

  it('numbers are px, strings are CSS lengths; default 100% × 12px', () => {
    const { container } = render(
      <>
        <Skeleton />
        <Skeleton width={36} height="2rem" radius="full" fill="component" />
      </>,
    )
    const [a, b] = Array.from(container.children) as HTMLElement[]
    expect(a?.style.width).toBe('100%')
    expect(a?.style.height).toBe('12px')
    expect(b?.style.width).toBe('36px')
    expect(b?.style.height).toBe('2rem')
    expect(b?.dataset.radius).toBe('full')
    expect(b?.dataset.fill).toBe('component')
    expect(b?.className).toContain('rounded-pill')
    expect(b?.className).toContain('bg-component')
  })

  it('shimmer only animates for motion-safe users', () => {
    const { container } = render(<Skeleton shimmer />)
    const bone = container.firstElementChild as HTMLElement
    expect(bone.className).toContain('motion-safe:animate-shimmer')
    expect(bone.className).not.toMatch(/(^|\s)animate-shimmer/)
  })

  it('has no axe violations inside a status region', async () => {
    const { container } = render(
      <div role="status" aria-busy="true" aria-label="Memuat transaksi">
        <Skeleton width="60%" />
        <Skeleton width={36} height={36} radius="full" />
      </div>,
    )
    await expectNoAxeViolations(container)
  })
})
