import { Dialog } from '@base-ui/react/dialog'
import { Field } from '@base-ui/react/field'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { expectNoAxeViolations } from '@/test/axe'

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectGroupLabel,
  SelectItem,
  SelectLeading,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from './select'

const PERIODS = [
  { value: 'harian', label: 'Harian' },
  { value: 'bulanan', label: 'Bulanan' },
  { value: 'tahunan', label: 'Tahunan' },
]

/** Opens the menu from the trigger and picks the option named `label`. Port of select-test-helpers.ts. */
async function pickSelectOption(trigger: HTMLElement, label: string | RegExp) {
  await userEvent.click(trigger)
  const listbox = await waitFor(() => within(document.body).getByRole('listbox'))
  await userEvent.click(within(listbox).getByRole('option', { name: label }))
}

/** Opens the menu and reads its options in order, then closes it with Esc. */
async function readSelectOptions(trigger: HTMLElement) {
  await userEvent.click(trigger)
  const listbox = await waitFor(() => within(document.body).getByRole('listbox'))
  const options = within(listbox)
    .getAllByRole('option')
    .map((node) => ({ label: node.textContent?.trim() ?? '', disabled: node.hasAttribute('data-disabled') }))
  await userEvent.keyboard('{Escape}')
  return options
}

function Period(props: Omit<React.ComponentProps<typeof Select<string>>, 'children'> & { size?: 'sm' | 'md' | 'lg' | 'xl' }) {
  const { size, ...rest } = props
  return (
    <Select items={PERIODS} {...rest}>
      <SelectTrigger aria-label="Periode" size={size}>
        <SelectValue placeholder="Pilih periode" />
      </SelectTrigger>
      <SelectContent>
        {PERIODS.map((p) => (
          <SelectItem key={p.value} value={p.value} disabled={p.value === 'tahunan'}>
            {p.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

describe('Select', () => {
  it('shows the placeholder, then the picked label, and calls onValueChange', async () => {
    const onValueChange = vi.fn()
    render(<Period onValueChange={onValueChange} />)
    const trigger = screen.getByRole('combobox', { name: 'Periode' })
    expect(trigger.textContent).toContain('Pilih periode')
    expect(trigger.hasAttribute('data-placeholder')).toBe(true)
    await pickSelectOption(trigger, 'Bulanan')
    expect(onValueChange.mock.calls[0]?.[0]).toBe('bulanan')
    await waitFor(() => expect(trigger.textContent).toContain('Bulanan'))
  })

  it('lists options with their disabled state', async () => {
    render(<Period />)
    const options = await readSelectOptions(screen.getByRole('combobox'))
    expect(options).toEqual([
      { label: 'Harian', disabled: false },
      { label: 'Bulanan', disabled: false },
      { label: 'Tahunan', disabled: true },
    ])
  })

  it('marks the selected option and closes on Escape', async () => {
    render(<Period defaultValue="harian" />)
    await userEvent.click(screen.getByRole('combobox'))
    const listbox = await screen.findByRole('listbox')
    expect(within(listbox).getByRole('option', { name: 'Harian' }).getAttribute('aria-selected')).toBe('true')
    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(screen.queryByRole('listbox')).toBeNull())
  })

  it('works controlled', async () => {
    function Controlled() {
      const [value, setValue] = useState<string | null>('harian')
      return (
        <>
          <Period value={value} onValueChange={setValue} />
          <output>{value}</output>
        </>
      )
    }
    render(<Controlled />)
    await pickSelectOption(screen.getByRole('combobox'), 'Bulanan')
    expect(screen.getByRole('status').textContent).toBe('bulanan')
  })

  it('disabled does not open', async () => {
    render(<Period disabled />)
    const trigger = screen.getByRole('combobox')
    await userEvent.click(trigger)
    expect(screen.queryByRole('listbox')).toBeNull()
    expect(trigger.hasAttribute('data-disabled')).toBe(true)
  })

  it('submits its value with name', async () => {
    render(
      <form data-testid="f">
        <Period name="periode" defaultValue="bulanan" />
      </form>,
    )
    const data = new FormData(screen.getByTestId('f') as HTMLFormElement)
    expect(data.get('periode')).toBe('bulanan')
  })

  it('renders groups with labels and a separator', async () => {
    render(
      <Select>
        <SelectTrigger aria-label="Kategori">
          <SelectValue placeholder="Pilih" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectGroupLabel>Operasional</SelectGroupLabel>
            <SelectItem value="transport">Transportasi</SelectItem>
          </SelectGroup>
          <SelectSeparator />
          <SelectGroup>
            <SelectGroupLabel>Pemasaran</SelectGroupLabel>
            <SelectItem value="iklan">Iklan</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>,
    )
    await userEvent.click(screen.getByRole('combobox'))
    const listbox = await screen.findByRole('listbox')
    expect(within(listbox).getByRole('group', { name: 'Operasional' })).toBeTruthy()
    expect(listbox.querySelector('[data-slot=select-separator]')).not.toBeNull()
  })

  it('takes its label and invalid state from Field.Root', () => {
    render(
      <Field.Root invalid>
        <Field.Label>Kategori</Field.Label>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Pilih" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="a">A</SelectItem>
          </SelectContent>
        </Select>
      </Field.Root>,
    )
    const trigger = screen.getByRole('combobox', { name: 'Kategori' })
    expect(trigger.hasAttribute('data-invalid')).toBe(true)
  })

  it('works inside a Dialog: picks a value and Esc closes only the menu', async () => {
    function InDialog() {
      const [value, setValue] = useState<string | null>('bulanan')
      return (
        <Dialog.Root defaultOpen>
          <Dialog.Portal>
            <Dialog.Popup aria-label="Ubah batas">
              <Period value={value} onValueChange={setValue} />
              <p data-testid="value">{value}</p>
            </Dialog.Popup>
          </Dialog.Portal>
        </Dialog.Root>
      )
    }
    render(<InDialog />)
    const dialog = await screen.findByRole('dialog')
    const trigger = within(dialog).getByRole('combobox')
    await pickSelectOption(trigger, 'Harian')
    expect(screen.getByTestId('value').textContent).toBe('harian')
    await userEvent.click(trigger)
    await screen.findByRole('listbox')
    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(screen.queryByRole('listbox')).toBeNull())
    expect(screen.getByRole('dialog')).toBeTruthy()
  })

  it('a leading part is decorative and keeps the trigger name', () => {
    render(
      <Select items={PERIODS} defaultValue="harian">
        <SelectTrigger aria-label="Periode">
          <SelectLeading data-testid="lead">AP</SelectLeading>
          <SelectValue />
        </SelectTrigger>
      </Select>,
    )
    expect(screen.getByTestId('lead').getAttribute('aria-hidden')).toBe('true')
    expect(screen.getByRole('combobox', { name: 'Periode' }).textContent).toContain('Harian')
  })

  it('has no axe violations (closed and open)', async () => {
    const { container } = render(<Period defaultValue="harian" />)
    await expectNoAxeViolations(container)
    await userEvent.click(screen.getByRole('combobox'))
    await expectNoAxeViolations(await screen.findByRole('listbox'))
  })
})
