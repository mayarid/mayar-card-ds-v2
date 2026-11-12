import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { expectNoAxeViolations } from '@/test/axe'

import { ChoiceCard, ChoiceCardGroup, ChoiceCardList, ChoiceCardPair } from './choice-card'

function Plan(props: React.ComponentProps<typeof ChoiceCardGroup>) {
  return (
    <ChoiceCardGroup aria-label="Jenis kartu" name="kartu" defaultValue="virtual" {...props}>
      <ChoiceCardPair>
        <ChoiceCard value="virtual" title="Kartu virtual" description="Langsung aktif" />
        <ChoiceCard value="fisik" title="Kartu fisik" description="Dikirim 3–5 hari" />
        <ChoiceCard value="metal" title="Kartu metal" disabled />
      </ChoiceCardPair>
    </ChoiceCardGroup>
  )
}

const radio = (name: string) => screen.getByRole('radio', { name })

describe('ChoiceCard', () => {
  it('each card is a radio named by its title and described by its description', () => {
    render(<Plan />)
    expect(screen.getByRole('radiogroup', { name: 'Jenis kartu' })).toBeTruthy()
    const card = radio('Kartu virtual')
    expect(card.getAttribute('aria-checked')).toBe('true')
    expect(card.getAttribute('aria-describedby')).toBeTruthy()
    expect(document.getElementById(card.getAttribute('aria-describedby') ?? '')?.textContent).toBe('Langsung aktif')
  })

  it('selects on click and calls onValueChange', async () => {
    const onValueChange = vi.fn()
    render(<Plan onValueChange={onValueChange} />)
    await userEvent.click(screen.getByText('Kartu fisik'))
    expect(onValueChange).toHaveBeenCalledWith('fisik', expect.anything())
    expect(radio('Kartu fisik').getAttribute('aria-checked')).toBe('true')
    expect(radio('Kartu virtual').getAttribute('aria-checked')).toBe('false')
  })

  it('arrow keys move and select, skipping the disabled card', async () => {
    render(<Plan />)
    await userEvent.tab()
    expect(document.activeElement).toBe(radio('Kartu virtual'))
    await userEvent.keyboard('{ArrowDown}')
    expect(document.activeElement).toBe(radio('Kartu fisik'))
    expect(radio('Kartu fisik').getAttribute('aria-checked')).toBe('true')
  })

  it('a disabled card cannot be selected', async () => {
    render(<Plan />)
    const card = radio('Kartu metal')
    expect(card.getAttribute('aria-disabled')).toBe('true')
    await userEvent.click(card)
    expect(card.getAttribute('aria-checked')).toBe('false')
  })

  it('works controlled', async () => {
    function Controlled() {
      const [value, setValue] = useState('fisik')
      return (
        <>
          <span data-testid="v">{value}</span>
          <Plan value={value} onValueChange={(v) => setValue(String(v))} />
        </>
      )
    }
    render(<Controlled />)
    expect(radio('Kartu fisik').getAttribute('aria-checked')).toBe('true')
    await userEvent.click(screen.getByText('Kartu virtual'))
    expect(screen.getByTestId('v').textContent).toBe('virtual')
  })

  it('list rows show a check only when selected', () => {
    const { container } = render(
      <ChoiceCardGroup aria-label="Bank tujuan" defaultValue="bca">
        <ChoiceCardList>
          <ChoiceCard variant="list" value="bca" title="BCA" />
          <ChoiceCard variant="list" value="bni" title="BNI" />
        </ChoiceCardList>
      </ChoiceCardGroup>,
    )
    expect(container.querySelectorAll('[data-slot="choice-card-check"]').length).toBe(2)
    expect(container.querySelector('[data-slot="choice-card-radio"]')).toBeNull()
  })

  it('has no axe violations', async () => {
    const { container } = render(<Plan />)
    await expectNoAxeViolations(container)
  })
})
