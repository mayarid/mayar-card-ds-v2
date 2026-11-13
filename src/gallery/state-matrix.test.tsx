import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import type { MatrixDef } from '@/docs/types'

import { StateMatrix } from './state-matrix'

const def: MatrixDef = {
  title: 'Variants × states',
  rows: [{ label: 'Primary' }, { label: 'Ghost' }],
  columns: [{ label: 'Default' }, { label: 'Hover', force: 'hover' }, { label: 'Disabled' }],
  render: () => <span>Button</span>,
  code: () => '<Button />',
  cellWidth: 100,
}

function withFrameWidth(width: number) {
  vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(width)
}

afterEach(() => vi.restoreAllMocks())

describe('StateMatrix', () => {
  it('is a table when every column fits (label 120 + 3 × 100)', () => {
    withFrameWidth(420)
    const { container } = render(<StateMatrix def={def} />)
    expect(container.querySelector('[data-layout]')?.getAttribute('data-layout')).toBe('table')
    expect(screen.getByRole('table', { name: def.title })).toBeDefined()
    expect(screen.getAllByRole('columnheader').map((h) => h.textContent)).toEqual(['Variant', 'Default', 'Hover', 'Disabled'])
  })

  it('stacks one block per row when the frame is too narrow, with every cell labelled', () => {
    withFrameWidth(419)
    const { container } = render(<StateMatrix def={def} />)
    expect(container.querySelector('[data-layout]')?.getAttribute('data-layout')).toBe('stacked')
    expect(screen.queryByRole('table')).toBeNull()
    const primary = screen.getByRole('list', { name: 'Primary' })
    expect(primary.querySelectorAll('li')).toHaveLength(3)
    expect(primary.textContent).toContain('Hover')
    expect(screen.getAllByRole('button', { name: /^Copy code:/ })).toHaveLength(6)
  })
})
