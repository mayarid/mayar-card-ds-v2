import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { expectNoAxeViolations } from '@/test/axe'

import {
  SectionCard,
  SectionCardAside,
  SectionCardBody,
  SectionCardFooter,
  SectionCardHeader,
  SectionCardTitle,
} from './section-card'

function Example() {
  return (
    <SectionCard data-testid="card">
      <SectionCardHeader>
        <SectionCardTitle>Akun</SectionCardTitle>
        <SectionCardAside>2 tindakan</SectionCardAside>
      </SectionCardHeader>
      <SectionCardBody>Isi</SectionCardBody>
      <SectionCardFooter>Catatan</SectionCardFooter>
    </SectionCard>
  )
}

describe('SectionCard', () => {
  it('is a region named by its title (h2 by default)', () => {
    render(<Example />)
    expect(screen.getByRole('region', { name: 'Akun' })).toBeTruthy()
    expect(screen.getByRole('heading', { level: 2, name: 'Akun' })).toBeTruthy()
  })

  it('title level changes with render', () => {
    render(
      <SectionCard>
        <SectionCardHeader>
          <SectionCardTitle render={<h3 />}>Limit</SectionCardTitle>
        </SectionCardHeader>
      </SectionCard>,
    )
    expect(screen.getByRole('heading', { level: 3, name: 'Limit' })).toBeTruthy()
  })

  it('flush removes the body padding', () => {
    render(
      <SectionCard>
        <SectionCardHeader>
          <SectionCardTitle>T</SectionCardTitle>
        </SectionCardHeader>
        <SectionCardBody flush data-testid="body" />
      </SectionCard>,
    )
    expect(screen.getByTestId('body').className).toContain('p-0')
  })

  it('spreads props on the surface root', () => {
    render(<Example />)
    expect(screen.getByTestId('card').dataset.slot).toBe('section-card')
  })

  it('has no axe violations', async () => {
    const { container } = render(<Example />)
    await expectNoAxeViolations(container)
  })
})
