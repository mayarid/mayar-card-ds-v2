import { StarIcon } from '@hugeicons/core-free-icons'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { expectNoAxeViolations } from '@/test/axe'

import { Notice } from './notice'

describe('Notice', () => {
  it('role follows the tone: danger is alert, others status', () => {
    render(
      <>
        <Notice tone="danger">Gagal menyimpan.</Notice>
        <Notice tone="success">Tersimpan.</Notice>
      </>,
    )
    expect(screen.getByRole('alert').textContent).toContain('Gagal menyimpan.')
    expect(screen.getByRole('status').textContent).toContain('Tersimpan.')
  })

  it('role can be overridden and props spread', () => {
    render(
      <Notice role="note" data-testid="n" tone="neutral">
        Info
      </Notice>,
    )
    const notice = screen.getByTestId('n')
    expect(notice.getAttribute('role')).toBe('note')
    expect(notice.dataset.tone).toBe('neutral')
    expect(notice.dataset.variant).toBe('banner')
  })

  it('banner icon is 20px, inline icon 16px; icon={false} hides it', () => {
    const { container, rerender } = render(<Notice>Isi</Notice>)
    expect(container.querySelector('[data-slot=notice-icon]')?.getAttribute('width')).toBe('20')
    rerender(<Notice variant="inline">Isi</Notice>)
    expect(container.querySelector('[data-slot=notice-icon]')?.getAttribute('width')).toBe('16')
    rerender(<Notice icon={false}>Isi</Notice>)
    expect(container.querySelector('[data-slot=notice-icon]')).toBeNull()
    rerender(<Notice icon={StarIcon}>Isi</Notice>)
    expect(container.querySelector('[data-slot=notice-icon]')).toBeTruthy()
  })

  it('renders title, body and action; bodyTone sets the body colour', () => {
    const { container } = render(
      <Notice title="Kartu diblokir" action={<button type="button">Buka blokir</button>} bodyTone="tone" tone="warning">
        <p>Baris satu</p>
      </Notice>,
    )
    expect(screen.getByText('Kartu diblokir').dataset.slot).toBe('notice-title')
    expect(screen.getByRole('button', { name: 'Buka blokir' })).toBeTruthy()
    expect(container.querySelector('[data-slot=notice-body]')?.className).toContain('text-(--notice-text)')
  })

  it('inline danger uses the subtle fill with a ring', () => {
    render(
      <Notice tone="danger" variant="inline" data-testid="n">
        Gagal
      </Notice>,
    )
    const cls = screen.getByTestId('n').className
    expect(cls).toContain('bg-danger-subtle')
    expect(cls).not.toContain('bg-danger-light')
  })

  it('has no axe violations', async () => {
    const { container } = render(
      <div>
        <Notice title="Judul">Isi</Notice>
        <Notice tone="danger" variant="inline">
          Gagal
        </Notice>
      </div>,
    )
    await expectNoAxeViolations(container)
  })
})
