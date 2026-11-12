import { Search01Icon } from '@hugeicons/core-free-icons'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { expectNoAxeViolations } from '@/test/axe'

import { Button } from './button'
import {
  EmptyState,
  EmptyStateActions,
  EmptyStateDescription,
  EmptyStateIcon,
  EmptyStateText,
  EmptyStateTitle,
} from './empty-state'
import { Icon } from './icon'

function Example({ size }: { size?: 'sm' | 'md' }) {
  return (
    <EmptyState size={size}>
      <EmptyStateIcon>
        <Icon icon={Search01Icon} />
      </EmptyStateIcon>
      <EmptyStateText>
        <EmptyStateTitle render={<h2 />}>Belum ada transaksi</EmptyStateTitle>
        <EmptyStateDescription>Transaksi kartu akan muncul di sini.</EmptyStateDescription>
      </EmptyStateText>
      <EmptyStateActions>
        <Button variant="secondary">Buat kartu</Button>
      </EmptyStateActions>
    </EmptyState>
  )
}

describe('EmptyState', () => {
  it('renders the title as the element given in render', () => {
    render(<Example />)
    expect(screen.getByRole('heading', { level: 2, name: 'Belum ada transaksi' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Buat kartu' })).toBeTruthy()
  })

  it('the title is a <p> by default', () => {
    const { container } = render(
      <EmptyState>
        <EmptyStateTitle>Kosong</EmptyStateTitle>
      </EmptyState>,
    )
    expect(container.querySelector('[data-slot="empty-state-title"]')?.tagName).toBe('P')
  })

  it('the disc follows the size: md 48, sm 40', () => {
    const { container, rerender } = render(<Example />)
    expect((container.querySelector('[data-slot="empty-state-icon"]') as HTMLElement).dataset.size).toBe('48')
    rerender(<Example size="sm" />)
    expect((container.querySelector('[data-slot="empty-state-icon"]') as HTMLElement).dataset.size).toBe('40')
  })

  it('passes role="alert" and other props through', () => {
    render(
      <EmptyState role="alert" data-testid="e">
        <EmptyStateTitle>Gagal memuat</EmptyStateTitle>
      </EmptyState>,
    )
    expect(screen.getByRole('alert').dataset.testid).toBe('e')
  })

  it('has no axe violations', async () => {
    const { container } = render(<Example />)
    await expectNoAxeViolations(container)
  })
})
