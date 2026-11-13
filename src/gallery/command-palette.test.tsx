import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useCallback, useState } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { expectNoAxeViolations } from '@/test/axe'

import { CommandPalette, usePaletteShortcut } from './command-palette'

const navigate = vi.hoisted(() => vi.fn())
vi.mock('@tanstack/react-router', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@tanstack/react-router')>()),
  useNavigate: () => navigate,
}))

function Harness() {
  const [open, setOpen] = useState(false)
  const openPalette = useCallback(() => setOpen(true), [])
  usePaletteShortcut(openPalette)
  return (
    <>
      <button onClick={openPalette}>Search</button>
      <a href="#outside">Outside</a>
      <CommandPalette open={open} onOpenChange={setOpen} />
    </>
  )
}

beforeEach(() => {
  navigate.mockClear()
})

async function open() {
  const user = userEvent.setup()
  render(<Harness />)
  await user.click(screen.getByRole('button', { name: 'Search' }))
  const input = await screen.findByRole('combobox')
  await waitFor(() => expect(document.activeElement).toBe(input))
  return { user, input }
}

describe('command palette', () => {
  it('opens as a named dialog, focuses the input, traps focus and restores it on Escape', async () => {
    const { user, input } = await open()
    const dialog = screen.getByRole('dialog', { name: 'Search the design system' })
    await user.tab()
    expect(dialog.contains(document.activeElement)).toBe(true)
    await user.tab({ shift: true })
    expect(dialog.contains(document.activeElement)).toBe(true)
    await user.keyboard('{Escape}')
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
    await waitFor(() => expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Search' })))
    expect(input.isConnected).toBe(false)
  })

  it.each(['ctrlKey', 'metaKey'] as const)('opens with %s+K', async (key) => {
    render(<Harness />)
    fireEvent.keyDown(window, { key: 'k', [key]: true })
    expect(await screen.findByRole('dialog')).toBeDefined()
    expect(await screen.findByRole('combobox')).toBeDefined()
  })

  it('moves through matches in visual order, wraps, and Enter opens the active page', async () => {
    const { user, input } = await open()
    await user.type(input, 'se')
    const options = screen.getAllByRole('option')
    expect(options.map((o) => o.textContent)).toEqual(['Select', 'Section Card', 'Choice Card', 'Tabs', 'Toggle Group'])
    const active = () => input.getAttribute('aria-activedescendant')
    expect(active()).toBe(options[0].id)
    await user.keyboard('{ArrowUp}')
    expect(active()).toBe(options[options.length - 1].id)
    await user.keyboard('{ArrowDown}{ArrowDown}')
    expect(active()).toBe(options[1].id)
    await user.keyboard('{Enter}')
    expect(navigate).toHaveBeenCalledWith({ to: '/components/$slug', params: { slug: 'section-card' } })
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
  })

  it('opens a clicked result and clears the query on the next open', async () => {
    const { user, input } = await open()
    await user.type(input, 'Colors')
    await user.click(screen.getByRole('option', { name: 'Colors' }))
    expect(navigate).toHaveBeenCalledWith({ to: '/foundations/$slug', params: { slug: 'colors' } })
    await user.click(screen.getByRole('button', { name: 'Search' }))
    expect((await screen.findByRole('combobox') as HTMLInputElement).value).toBe('')
  })

  it('shows an empty state and ignores Enter with no match', async () => {
    const { user, input } = await open()
    await user.type(input, 'zzzzzz')
    expect(screen.queryAllByRole('option')).toHaveLength(0)
    expect(screen.getByRole('status').textContent).toContain('No match')
    expect(input.getAttribute('aria-activedescendant')).toBeNull()
    await user.keyboard('{ArrowDown}{ArrowUp}{Enter}')
    expect(navigate).not.toHaveBeenCalled()
    expect(screen.getByRole('dialog')).toBeDefined()
  })

  it('has no axe violations', async () => {
    await open()
    await expectNoAxeViolations(document.body)
  })
})
