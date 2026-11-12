import { act, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { expectNoAxeViolations } from '@/test/axe'

import { CARD_SKINS, CardFace, CardFaceSkeleton, cardFaceLabel, formatCardNumber } from './card-face'

const base = { last4: '4821', holder: 'RINA WULANDARI' }

describe('CardFace', () => {
  it('is one image named by the skin and the last four digits', () => {
    render(<CardFace skin="royal" {...base} />)
    const card = screen.getByRole('img', { name: 'Kartu Royal, berakhiran 4821' })
    expect(card.dataset.skin).toBe('royal')
    expect(card.dataset.status).toBe('active')
  })

  it('masked: shows the mask and never puts the full number in the name', () => {
    render(<CardFace {...base} />)
    const card = screen.getByRole('img')
    expect(card.getAttribute('aria-label')).not.toMatch(/\d{4} \d{4}/)
    expect(card.querySelector('[data-slot="card-face-number"]')?.textContent).toBe('••••  ••••  ••••  4821')
    expect(card.querySelector('[data-slot="card-face-art"]')?.getAttribute('aria-hidden')).toBe('true')
  })

  it('revealed: groups the number and puts it and the expiry in the name', () => {
    render(<CardFace {...base} number="5412751234564821" expiry="08/29" label="Langganan SaaS" />)
    const card = screen.getByRole('img', { name: 'Kartu Langganan SaaS, nomor 5412 7512 3456 4821, berlaku 08/29' })
    expect(card.dataset.revealed).toBe('')
    expect(card.querySelector('[data-slot="card-face-number"]')?.textContent).toBe('5412 7512 3456 4821')
  })

  it('adds the status to the name and shows the overlay', () => {
    const { rerender } = render(<CardFace {...base} status="frozen" />)
    expect(screen.getByRole('img', { name: 'Kartu Midnight, berakhiran 4821, dibekukan' })).toBeTruthy()
    expect(document.querySelector('[data-slot="card-face-overlay"]')?.textContent).toContain('Kartu dibekukan')

    rerender(<CardFace {...base} status="pending" />)
    expect(screen.getByRole('img').getAttribute('aria-label')).toContain('sedang diproses')

    rerender(<CardFace {...base} status="closed" closedLabel="28 Okt 2026, 14:20" />)
    expect(screen.getByRole('img').getAttribute('aria-label')).toBe('Kartu Midnight, berakhiran 4821, ditutup 28 Okt 2026, 14:20')
    expect(document.querySelector('[data-slot="card-face-overlay"]')?.textContent).toContain('28 Okt 2026, 14:20')
  })

  it('sizes from width and keeps the 420:264 ratio', () => {
    render(<CardFace {...base} width={250} />)
    const card = screen.getByRole('img')
    expect(card.style.width).toBe('250px')
    expect(parseFloat(card.style.height)).toBeCloseTo((250 * 264) / 420, 2)
    expect(card.dataset.density).toBe('compact')
  })

  it('a tile shows only the title; a thumbnail shows no text; a closed tile has no overlay', () => {
    const { rerender } = render(<CardFace {...base} width={250} status="frozen" />)
    expect(document.querySelector('[data-slot="card-face-overlay"]')?.textContent).toBe('Kartu dibekukan')
    rerender(<CardFace {...base} width={48} status="frozen" />)
    expect(document.querySelector('[data-slot="card-face-overlay"]')?.textContent).toBe('')
    rerender(<CardFace {...base} width={250} status="closed" />)
    expect(document.querySelector('[data-slot="card-face-overlay"]')).toBeNull()
  })

  it('width="auto" fills the parent', () => {
    render(<CardFace {...base} width="auto" />)
    const card = screen.getByRole('img')
    expect(card.className).toContain('w-full')
    expect(card.style.aspectRatio).toBe('420 / 264')
  })

  it('unfreezes at once without the animated flag', () => {
    const { rerender } = render(<CardFace {...base} status="frozen" />)
    rerender(<CardFace {...base} status="active" />)
    expect(document.querySelector('[data-slot="card-face-overlay"]')).toBeNull()
  })

  it('animated: keeps the veil while it thaws, then removes it', async () => {
    const { rerender } = render(<CardFace {...base} status="frozen" animated />)
    rerender(<CardFace {...base} status="active" animated />)
    expect(document.querySelector('[data-slot="card-face-overlay"]')).not.toBeNull()
    expect(screen.getByRole('img').getAttribute('aria-label')).not.toContain('dibekukan')
    await act(() => new Promise((r) => setTimeout(r, 10)))
    expect(document.querySelector('[data-slot="card-face-overlay"]')).toBeNull()
  })

  it('spreads props, forwards the ref and lets aria-label win', () => {
    let node: HTMLDivElement | null = null
    render(<CardFace {...base} ref={(el) => void (node = el)} data-testid="c" aria-label="Kartu utama" className="m-2" />)
    const card = screen.getByRole('img', { name: 'Kartu utama' })
    expect(node).toBe(card)
    expect(card.dataset.testid).toBe('c')
    expect(card.className).toContain('m-2')
  })

  it('renders every skin', () => {
    render(
      <div>
        {CARD_SKINS.map((skin) => (
          <CardFace key={skin} skin={skin} {...base} width={120} />
        ))}
      </div>,
    )
    expect(screen.getAllByRole('img')).toHaveLength(9)
  })

  it('has no axe violations', async () => {
    const { container } = render(
      <div>
        <CardFace {...base} skin="emerald" elevated />
        <CardFace {...base} status="frozen" width={250} />
        <CardFace {...base} status="closed" closedLabel="28 Okt 2026" />
        <CardFaceSkeleton width={250} />
      </div>,
    )
    await expectNoAxeViolations(container)
  })
})

describe('helpers', () => {
  it('formatCardNumber groups 16 digits', () => {
    expect(formatCardNumber('5412751234564821')).toBe('5412 7512 3456 4821')
    expect(formatCardNumber(' 5412 7512 3456 4821 ')).toBe('5412 7512 3456 4821')
  })

  it('cardFaceLabel hides a masked expiry', () => {
    expect(
      cardFaceLabel({ skin: 'gold', last4: '1907', number: '5412751234561907', expiry: '••/••', status: 'active' }),
    ).toBe('Kartu Gold, nomor 5412 7512 3456 1907')
  })

  it('CardFaceSkeleton is hidden from assistive tech', () => {
    const { container } = render(<CardFaceSkeleton width={250} />)
    const bone = container.querySelector('[data-slot="card-face-skeleton"]')
    expect(bone?.getAttribute('aria-hidden')).toBe('true')
  })
})
