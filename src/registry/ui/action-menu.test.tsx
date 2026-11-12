import { Edit02Icon, MoreHorizontalIcon } from '@hugeicons/core-free-icons'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { expectNoAxeViolations } from '@/test/axe'

import {
  ActionMenu,
  ActionMenuContent,
  ActionMenuItem,
  ActionMenuPanel,
  ActionMenuSeparator,
  ActionMenuTrigger,
  actionMenuItemVariants,
} from './action-menu'
import { Icon } from './icon'

function Example({ onRename = () => {}, onClose = () => {} }: { onRename?: () => void; onClose?: () => void }) {
  return (
    <ActionMenu>
      <ActionMenuTrigger variant="icon" aria-label="Aksi lain">
        <Icon icon={MoreHorizontalIcon} />
      </ActionMenuTrigger>
      <ActionMenuContent>
        <ActionMenuItem onClick={onRename}>
          <Icon icon={Edit02Icon} />
          Ubah nama
        </ActionMenuItem>
        <ActionMenuItem disabled title="Kartu sudah dibekukan">
          Bekukan kartu
        </ActionMenuItem>
        <ActionMenuSeparator />
        <ActionMenuItem tone="danger" onClick={onClose}>
          Tutup kartu
        </ActionMenuItem>
      </ActionMenuContent>
    </ActionMenu>
  )
}

describe('ActionMenu', () => {
  it('trigger is a menu button and opens a menu of items', async () => {
    render(<Example />)
    const trigger = screen.getByRole('button', { name: 'Aksi lain' })
    expect(trigger.getAttribute('aria-haspopup')).toBe('menu')
    await userEvent.click(trigger)
    expect(await screen.findByRole('menu')).toBeTruthy()
    expect(screen.getAllByRole('menuitem')).toHaveLength(3)
    expect(screen.getByRole('separator')).toBeTruthy()
    expect(trigger.hasAttribute('data-popup-open')).toBe(true)
  })

  it('choosing an item runs it, closes the menu and returns focus', async () => {
    const onRename = vi.fn()
    render(<Example onRename={onRename} />)
    const trigger = screen.getByRole('button', { name: 'Aksi lain' })
    await userEvent.click(trigger)
    await userEvent.click(await screen.findByRole('menuitem', { name: 'Ubah nama' }))
    expect(onRename).toHaveBeenCalledOnce()
    await waitFor(() => expect(screen.queryByRole('menu')).toBeNull())
    await waitFor(() => expect(document.activeElement).toBe(trigger))
  })

  it('keyboard: Enter opens, arrows move, Escape closes', async () => {
    const onClose = vi.fn()
    render(<Example onClose={onClose} />)
    screen.getByRole('button', { name: 'Aksi lain' }).focus()
    await userEvent.keyboard('{Enter}')
    await screen.findByRole('menu')
    await userEvent.keyboard('{End}')
    await waitFor(() =>
      expect(screen.getByRole('menuitem', { name: 'Tutup kartu' }).hasAttribute('data-highlighted')).toBe(true),
    )
    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(screen.queryByRole('menu')).toBeNull())
    expect(onClose).not.toHaveBeenCalled()
  })

  it('a disabled item is aria-disabled and does not run', async () => {
    render(<Example />)
    await userEvent.click(screen.getByRole('button', { name: 'Aksi lain' }))
    const item = await screen.findByRole('menuitem', { name: 'Bekukan kartu' })
    expect(item.getAttribute('aria-disabled')).toBe('true')
    await userEvent.click(item)
    expect(screen.getByRole('menu')).toBeTruthy()
  })

  it('danger tone and the text trigger chevron', () => {
    render(
      <ActionMenu>
        <ActionMenuTrigger>Aksi lain</ActionMenuTrigger>
      </ActionMenu>,
    )
    const trigger = screen.getByRole('button', { name: 'Aksi lain' })
    expect(trigger.querySelector('[data-slot=action-menu-chevron]')).toBeTruthy()
    expect(actionMenuItemVariants({ tone: 'danger' })).toContain('text-danger-text')
  })

  it('has no axe violations', async () => {
    const { baseElement } = render(
      <>
        <ActionMenuPanel>
          <div className={actionMenuItemVariants()}>Statis</div>
        </ActionMenuPanel>
        <Example />
      </>,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Aksi lain' }))
    await screen.findByRole('menu')
    await expectNoAxeViolations(baseElement)
  })
})
