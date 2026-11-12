import { Alert02Icon } from '@hugeicons/core-free-icons'
import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { expectNoAxeViolations } from '@/test/axe'

import { Icon } from './icon'
import { IconDisc, iconDiscIconSize } from './icon-disc'

describe('IconDisc', () => {
  it('is decorative by default and sets size, tone and shape data', () => {
    const { container } = render(
      <IconDisc size={48} tone="danger" shape="square" data-testid="d">
        <Icon icon={Alert02Icon} />
      </IconDisc>,
    )
    const disc = container.querySelector('[data-slot="icon-disc"]') as HTMLElement
    expect(disc.getAttribute('aria-hidden')).toBe('true')
    expect(disc.dataset.size).toBe('48')
    expect(disc.dataset.tone).toBe('danger')
    expect(disc.dataset.shape).toBe('square')
    expect(disc.dataset.testid).toBe('d')
    expect(disc.className).toContain('size-12')
    expect(disc.querySelector('svg')).not.toBeNull()
  })

  it('uses 40 / neutral / circle by default', () => {
    const { container } = render(<IconDisc />)
    const disc = container.firstElementChild as HTMLElement
    expect(disc.dataset.size).toBe('40')
    expect(disc.dataset.tone).toBe('neutral')
    expect(disc.dataset.shape).toBe('circle')
  })

  it('can carry meaning with aria-hidden={false} and a label', () => {
    const { getByRole } = render(<IconDisc aria-hidden={false} role="img" aria-label="Gagal" />)
    expect(getByRole('img', { name: 'Gagal' })).toBeTruthy()
  })

  it('maps disc sizes to glyph sizes', () => {
    expect(iconDiscIconSize[24]).toBe(14)
    expect(iconDiscIconSize[28]).toBe(16)
    expect(iconDiscIconSize[56]).toBe(24)
  })

  it('has a 28px size with a 16px glyph and a radius md square', () => {
    const { getByTestId } = render(<IconDisc size={28} shape="square" data-testid="d" />)
    const disc = getByTestId('d')
    expect(disc.dataset.size).toBe('28')
    expect(disc.className).toContain('size-7')
    expect(disc.className).toContain('[&_svg]:size-4')
    expect(disc.className).toContain('data-[shape=square]:rounded-md')
  })

  it('forwards the ref', () => {
    let node: HTMLSpanElement | null = null
    render(<IconDisc ref={(n) => void (node = n)} />)
    expect(node).toBeInstanceOf(HTMLSpanElement)
  })

  it('has no axe violations', async () => {
    const { container } = render(
      <IconDisc tone="success">
        <Icon icon={Alert02Icon} />
      </IconDisc>,
    )
    await expectNoAxeViolations(container)
  })
})
