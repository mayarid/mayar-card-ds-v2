import { Field } from '@base-ui/react/field'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { expectNoAxeViolations } from '@/test/axe'

import {
  Combobox,
  ComboboxClear,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxEmptyDescription,
  ComboboxEmptyTitle,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxStatus,
  ComboboxTrigger,
  ComboboxValue,
} from './combobox'

interface Team {
  value: string
  label: string
  disabled?: boolean
}

const TEAMS: Team[] = [
  { value: 'marketing', label: 'Marketing' },
  { value: 'marketplace', label: 'Marketplace' },
  { value: 'merchandising', label: 'Merchandising' },
  { value: 'finance', label: 'Finance' },
  { value: 'legal', label: 'Legal', disabled: true },
]

function Teams({
  loading = false,
  ...props
}: Omit<React.ComponentProps<typeof Combobox<Team>>, 'children' | 'items'> & { loading?: boolean }) {
  return (
    <Combobox items={TEAMS} {...props}>
      <ComboboxTrigger aria-label="Tim">
        <ComboboxValue placeholder="Pilih tim" />
      </ComboboxTrigger>
      <ComboboxContent>
        <ComboboxInput aria-label="Cari tim" trailing={<ComboboxClear />} />
        {loading ? (
          <ComboboxStatus>Memuat hasil…</ComboboxStatus>
        ) : (
          <ComboboxEmpty>
            <ComboboxEmptyTitle>Tim tidak ditemukan</ComboboxEmptyTitle>
            <ComboboxEmptyDescription>Periksa ejaan atau buat tim baru.</ComboboxEmptyDescription>
          </ComboboxEmpty>
        )}
        <ComboboxList>
          {(team: Team) => (
            <ComboboxItem key={team.value} value={team} disabled={team.disabled}>
              {team.label}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}

async function open() {
  const trigger = screen.getByRole('combobox', { name: 'Tim' })
  await userEvent.click(trigger)
  const input = await screen.findByRole('combobox', { name: 'Cari tim' })
  return { trigger, input }
}

describe('Combobox', () => {
  it('opens with the search row focused and lists every item', async () => {
    render(<Teams />)
    const { input } = await open()
    await waitFor(() => expect(document.activeElement).toBe(input))
    expect(screen.getAllByRole('option')).toHaveLength(5)
  })

  it('filters by label, case-insensitive', async () => {
    render(<Teams />)
    await open()
    await userEvent.keyboard('mar')
    await waitFor(() =>
      expect(screen.getAllByRole('option').map((o) => o.textContent)).toEqual(['Marketing', 'Marketplace']),
    )
  })

  it('shows the empty state when nothing matches', async () => {
    render(<Teams />)
    await open()
    await userEvent.keyboard('zzz')
    expect(await screen.findByText('Tim tidak ditemukan')).toBeTruthy()
    expect(screen.queryAllByRole('option')).toHaveLength(0)
  })

  it('shows the loading status instead of the empty state', async () => {
    render(<Teams loading />)
    await open()
    expect(await screen.findByText('Memuat hasil…')).toBeTruthy()
    expect(screen.queryByText('Tim tidak ditemukan')).toBeNull()
  })

  it('picks with the keyboard, closes and shows the label', async () => {
    const onValueChange = vi.fn()
    render(<Teams onValueChange={onValueChange} />)
    const { trigger } = await open()
    await userEvent.keyboard('fin')
    await userEvent.keyboard('{ArrowDown}{Enter}')
    expect(onValueChange.mock.calls[0]?.[0]).toEqual(TEAMS[3])
    await waitFor(() => expect(screen.queryByRole('listbox')).toBeNull())
    expect(trigger.textContent).toContain('Finance')
  })

  it('highlights the first match while typing, and Enter picks it', async () => {
    const onValueChange = vi.fn()
    render(<Teams onValueChange={onValueChange} />)
    await open()
    await userEvent.keyboard('mar')
    await userEvent.keyboard('{Enter}')
    expect(onValueChange.mock.calls[0]?.[0]).toEqual(TEAMS[0])
  })

  it('arrow keys stop at the last match (no loop)', async () => {
    const onValueChange = vi.fn()
    render(<Teams onValueChange={onValueChange} />)
    await open()
    await userEvent.keyboard('mar')
    await userEvent.keyboard('{ArrowDown}{ArrowDown}{ArrowDown}{Enter}')
    expect(onValueChange.mock.calls[0]?.[0]).toEqual(TEAMS[1])
  })

  it('picks with a click and works controlled', async () => {
    function Controlled() {
      const [value, setValue] = useState<Team | null>(null)
      return (
        <>
          <Teams value={value} onValueChange={setValue} />
          <output>{value?.value ?? ''}</output>
        </>
      )
    }
    render(<Controlled />)
    await open()
    await userEvent.click(screen.getByRole('option', { name: 'Marketplace' }))
    expect(screen.getByRole('status').textContent).toBe('marketplace')
  })

  it('a disabled item is not picked', async () => {
    const onValueChange = vi.fn()
    render(<Teams onValueChange={onValueChange} />)
    await open()
    await userEvent.click(screen.getByRole('option', { name: 'Legal' }))
    expect(onValueChange).not.toHaveBeenCalled()
  })

  it('Escape closes and returns focus to the trigger', async () => {
    render(<Teams />)
    const { trigger } = await open()
    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(screen.queryByRole('listbox')).toBeNull())
    await waitFor(() => expect(document.activeElement).toBe(trigger))
  })

  it('disabled does not open', async () => {
    render(<Teams disabled />)
    await userEvent.click(screen.getByRole('combobox', { name: 'Tim' }))
    expect(screen.queryByRole('listbox')).toBeNull()
  })

  it('takes its label from Field.Root', () => {
    render(
      <Field.Root>
        <Field.Label>Tim</Field.Label>
        <Combobox items={TEAMS}>
          <ComboboxTrigger>
            <ComboboxValue placeholder="Pilih tim" />
          </ComboboxTrigger>
        </Combobox>
      </Field.Root>,
    )
    expect(screen.getByRole('combobox', { name: 'Tim' })).toBeTruthy()
  })

  it('has no axe violations (closed and open)', async () => {
    const { container } = render(<Teams />)
    await expectNoAxeViolations(container)
    await open()
    await expectNoAxeViolations(await screen.findByRole('listbox'))
  })
})
