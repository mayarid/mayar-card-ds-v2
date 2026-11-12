import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { expectNoAxeViolations } from '@/test/axe'

import { Step, Steps } from './steps'

function renderSteps(current: number) {
  return render(
    <Steps current={current}>
      <Step>Data diri</Step>
      <Step>Dokumen</Step>
      <Step>Paket</Step>
    </Steps>,
  )
}

describe('Steps', () => {
  it('is a labelled list with one item per step', () => {
    renderSteps(2)
    expect(screen.getByRole('list', { name: 'Langkah' })).toBeTruthy()
    expect(screen.getAllByRole('listitem')).toHaveLength(3)
  })

  it('marks done, current and todo steps and sets aria-current on the current one', () => {
    renderSteps(2)
    const [a, b, c] = screen.getAllByRole('listitem')
    expect(a?.dataset.state).toBe('done')
    expect(b?.dataset.state).toBe('current')
    expect(c?.dataset.state).toBe('todo')
    expect(b?.getAttribute('aria-current')).toBe('step')
    expect(a?.getAttribute('aria-current')).toBeNull()
  })

  it('all steps are done past the end', () => {
    renderSteps(4)
    expect(screen.getAllByRole('listitem').every((li) => li.dataset.state === 'done')).toBe(true)
  })

  it('takes a custom aria-label and spreads props', () => {
    render(
      <Steps current={1} aria-label="Verifikasi" data-testid="s">
        <Step>Satu</Step>
      </Steps>,
    )
    const list = screen.getByRole('list', { name: 'Verifikasi' })
    expect(list.dataset.testid).toBe('s')
  })

  it('has no axe violations', async () => {
    const { container } = renderSteps(2)
    await expectNoAxeViolations(container)
  })
})
