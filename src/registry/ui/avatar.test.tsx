import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { expectNoAxeViolations } from '@/test/axe'

import { Avatar, AvatarFallback, AvatarImage, getInitials } from './avatar'

describe('getInitials', () => {
  it.each([
    ['Budi Santoso', 'BS'],
    ['Budi', 'BU'],
    ['budi.s@mayar.id', 'BU'],
    ['  ', '?'],
    [null, '?'],
    ['!!!', '?'],
    ['ani wijaya kusuma', 'AW'],
  ])('%s → %s', (input, expected) => {
    expect(getInitials(input)).toBe(expected)
  })
})

describe('Avatar', () => {
  it('shows the initials when there is no image and is decorative by default', () => {
    const { container } = render(
      <Avatar size={40} tone="neutral">
        <AvatarFallback name="Budi Santoso" />
      </Avatar>,
    )
    const root = container.querySelector('[data-slot="avatar"]') as HTMLElement
    expect(root.getAttribute('aria-hidden')).toBe('true')
    expect(root.dataset.size).toBe('40')
    expect(root.dataset.tone).toBe('neutral')
    expect(root.className).toContain('size-10')
    expect(root.textContent).toBe('BS')
  })

  it('children of the fallback replace the initials', () => {
    const { container } = render(
      <Avatar>
        <AvatarFallback name="Budi">M</AvatarFallback>
      </Avatar>,
    )
    expect(container.textContent).toBe('M')
  })

  it('keeps the fallback while the image has not loaded (jsdom never loads it)', () => {
    const { container } = render(
      <Avatar>
        <AvatarImage src="/budi.png" alt="" />
        <AvatarFallback name="Budi Santoso" />
      </Avatar>,
    )
    expect(container.textContent).toBe('BS')
    expect(container.querySelector('img')).toBeNull()
  })

  it('can stand alone with a label', () => {
    render(
      <Avatar aria-hidden={false} role="img" aria-label="Budi Santoso">
        <AvatarFallback name="Budi Santoso" />
      </Avatar>,
    )
    expect(screen.getByRole('img', { name: 'Budi Santoso' })).toBeTruthy()
  })

  it('forwards the ref and spreads props', () => {
    let node: HTMLSpanElement | null = null
    const { container } = render(<Avatar ref={(n) => void (node = n)} data-testid="a" />)
    expect(node).toBeInstanceOf(HTMLSpanElement)
    expect((container.firstElementChild as HTMLElement).dataset.testid).toBe('a')
  })

  it('has no axe violations', async () => {
    const { container } = render(
      <p>
        <Avatar>
          <AvatarFallback name="Budi Santoso" />
        </Avatar>
        Budi Santoso
      </p>,
    )
    await expectNoAxeViolations(container)
  })
})
