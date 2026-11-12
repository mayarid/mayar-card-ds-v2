import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { expectNoAxeViolations } from '@/test/axe'

import { Button } from './button'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTrigger,
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPanel,
  DialogTitle,
  DialogTrigger,
  type DialogDismiss,
} from './dialog'

function Example({
  dismiss,
  busy,
  header,
  onOpenChange,
}: {
  dismiss?: DialogDismiss
  busy?: boolean
  header?: 'plain' | 'divided' | 'none'
  onOpenChange?: (open: boolean) => void
}) {
  return (
    <Dialog dismiss={dismiss} busy={busy} onOpenChange={onOpenChange}>
      <DialogTrigger render={<Button />}>Ubah saldo</DialogTrigger>
      <DialogContent header={header} aria-label={header === 'none' ? 'PIN' : undefined}>
        <DialogHeader>
          <DialogTitle>Atur saldo kartu</DialogTitle>
          <DialogDescription>Saldo dipindah dari akun utama.</DialogDescription>
        </DialogHeader>
        <DialogBody>
          <input aria-label="Jumlah" />
        </DialogBody>
        <DialogFooter>
          <DialogClose render={<Button variant="secondary" />}>Batal</DialogClose>
          <Button>Simpan</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

describe('Dialog', () => {
  it('opens from the trigger, is named by the title and described by the description', async () => {
    render(<Example />)
    await userEvent.click(screen.getByRole('button', { name: 'Ubah saldo' }))
    const dialog = await screen.findByRole('dialog', { name: 'Atur saldo kartu' })
    expect(dialog.getAttribute('aria-describedby')).toBeTruthy()
    expect(dialog.dataset.size).toBe('md')
    expect(dialog.dataset.header).toBe('plain')
  })

  it('closes with the close button and returns focus to the trigger', async () => {
    render(<Example />)
    const trigger = screen.getByRole('button', { name: 'Ubah saldo' })
    await userEvent.click(trigger)
    await userEvent.click(await screen.findByRole('button', { name: 'Tutup' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
    await waitFor(() => expect(document.activeElement).toBe(trigger))
  })

  it('closes with Escape and calls onOpenChange', async () => {
    const onOpenChange = vi.fn()
    render(<Example onOpenChange={onOpenChange} />)
    await userEvent.click(screen.getByRole('button', { name: 'Ubah saldo' }))
    await screen.findByRole('dialog')
    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
    expect(onOpenChange).toHaveBeenLastCalledWith(false, expect.anything())
  })

  it('dismiss="none": no close button and Escape does nothing, but a DialogClose still closes', async () => {
    render(<Example dismiss="none" />)
    await userEvent.click(screen.getByRole('button', { name: 'Ubah saldo' }))
    await screen.findByRole('dialog')
    expect(screen.queryByRole('button', { name: 'Tutup' })).toBeNull()
    await userEvent.keyboard('{Escape}')
    expect(screen.getByRole('dialog')).toBeTruthy()
    await userEvent.click(screen.getByRole('button', { name: 'Batal' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
  })

  it('dismiss="no-close-button": no close button, Escape still closes', async () => {
    render(<Example dismiss="no-close-button" />)
    await userEvent.click(screen.getByRole('button', { name: 'Ubah saldo' }))
    await screen.findByRole('dialog')
    expect(screen.queryByRole('button', { name: 'Tutup' })).toBeNull()
    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
  })

  it('busy: aria-busy, the close button is disabled and Escape does nothing', async () => {
    render(<Example busy />)
    await userEvent.click(screen.getByRole('button', { name: 'Ubah saldo' }))
    const dialog = await screen.findByRole('dialog')
    expect(dialog.getAttribute('aria-busy')).toBe('true')
    expect(screen.getByRole('button', { name: 'Tutup' })).toHaveProperty('disabled', true)
    await userEvent.keyboard('{Escape}')
    expect(screen.getByRole('dialog')).toBeTruthy()
  })

  it('header="none" renders the corner close and no header row', async () => {
    render(<Example header="none" />)
    await userEvent.click(screen.getByRole('button', { name: 'Ubah saldo' }))
    await screen.findByRole('dialog')
    expect(document.querySelector('[data-slot=dialog-header]')).toBeNull()
    expect(screen.getByRole('button', { name: 'Tutup' })).toBeTruthy()
  })

  it('works controlled', async () => {
    function Controlled() {
      const [open, setOpen] = useState(true)
      return (
        <>
          <p>{open ? 'buka' : 'tutup'}</p>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Judul</DialogTitle>
              </DialogHeader>
            </DialogContent>
          </Dialog>
        </>
      )
    }
    render(<Controlled />)
    expect(await screen.findByRole('dialog', { name: 'Judul' })).toBeTruthy()
    await userEvent.click(screen.getByRole('button', { name: 'Tutup' }))
    expect(await screen.findByText('tutup')).toBeTruthy()
  })

  it('drawer placement and size reach the popup', async () => {
    render(
      <Dialog defaultOpen>
        <DialogContent placement="drawer" size="lg" data-testid="d">
          <DialogHeader>
            <DialogTitle>Detail transaksi</DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>,
    )
    const dialog = await screen.findByTestId('d')
    expect(dialog.dataset.placement).toBe('drawer')
    expect(dialog.className).toContain('animate-drawer-in')
  })

  it('AlertDialog has role alertdialog and no close button', async () => {
    render(
      <AlertDialog>
        <AlertDialogTrigger render={<Button variant="danger" />}>Tutup kartu</AlertDialogTrigger>
        <AlertDialogContent>
          <DialogHeader>
            <DialogTitle>Tutup kartu ini?</DialogTitle>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="secondary" />}>Batal</DialogClose>
          </DialogFooter>
        </AlertDialogContent>
      </AlertDialog>,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Tutup kartu' }))
    expect(await screen.findByRole('alertdialog', { name: 'Tutup kartu ini?' })).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Tutup' })).toBeNull()
  })

  it('has no axe violations (open dialog and static panel)', async () => {
    const { baseElement } = render(
      <>
        <Dialog>
          <DialogPanel header="divided">
            <DialogHeader>
              <DialogTitle>Panel statis</DialogTitle>
            </DialogHeader>
            <DialogBody>Isi</DialogBody>
          </DialogPanel>
        </Dialog>
        <Example />
      </>,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Ubah saldo' }))
    await screen.findByRole('dialog')
    await expectNoAxeViolations(baseElement)
  })
})
