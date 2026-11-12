import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { expectNoAxeViolations } from '@/test/axe'

import { ToastCard, ToastProvider, Toaster, createToaster, useToast, type ToastApi } from './toast'

function Harness({ run }: { run: (api: ToastApi) => void }) {
  const api = useToast()
  return (
    <button type="button" onClick={() => run(api)}>
      Picu
    </button>
  )
}

function setup(run: (api: ToastApi) => void) {
  const toaster = createToaster()
  const utils = render(
    <ToastProvider toaster={toaster}>
      <Harness run={run} />
      <Toaster />
    </ToastProvider>,
  )
  return { ...utils, toaster }
}

describe('Toast', () => {
  it('shows a toast in a labelled region with title and description', async () => {
    setup((t) => t.success({ title: 'Kartu dibuat', description: 'Kartu siap dipakai.' }))
    await userEvent.click(screen.getByRole('button', { name: 'Picu' }))
    expect(await screen.findByText('Kartu dibuat')).toBeTruthy()
    expect(screen.getByText('Kartu siap dipakai.')).toBeTruthy()
    expect(screen.getByRole('region', { name: 'Notifikasi' })).toBeTruthy()
    const root = document.querySelector('[data-slot=toast]')
    expect(root?.getAttribute('data-type')).toBe('success')
    expect(root?.querySelector('[data-slot=toast-icon]')).toBeTruthy()
  })

  it('default type has no icon', async () => {
    setup((t) => t('Disalin'))
    await userEvent.click(screen.getByRole('button', { name: 'Picu' }))
    await screen.findByText('Disalin')
    expect(document.querySelector('[data-slot=toast-icon]')).toBeNull()
  })

  it('action runs and keeps the toast; cancel runs and closes it', async () => {
    const onAction = vi.fn()
    const onCancel = vi.fn()
    setup((t) =>
      t.info({ title: 'Laporan siap', action: { label: 'Unduh', onClick: onAction }, cancel: { label: 'Nanti', onClick: onCancel } }),
    )
    await userEvent.click(screen.getByRole('button', { name: 'Picu' }))
    await userEvent.click(await screen.findByRole('button', { name: 'Unduh' }))
    expect(onAction).toHaveBeenCalledOnce()
    expect(screen.getByText('Laporan siap')).toBeTruthy()
    await userEvent.click(screen.getByRole('button', { name: 'Nanti' }))
    expect(onCancel).toHaveBeenCalledOnce()
    await waitFor(() => expect(screen.queryByText('Laporan siap')).toBeNull())
  })

  it('closable adds a close button that dismisses', async () => {
    setup((t) => t.warning({ title: 'Saldo rendah', closable: true }))
    await userEvent.click(screen.getByRole('button', { name: 'Picu' }))
    // Base UI hides the close button from assistive tech until the stack is expanded or focused.
    await screen.findByText('Saldo rendah')
    const close = document.querySelector<HTMLButtonElement>('[data-slot=toast-close]')
    expect(close?.getAttribute('aria-label')).toBe('Tutup notifikasi')
    await userEvent.click(close!)
    await waitFor(() => expect(screen.queryByText('Saldo rendah')).toBeNull())
  })

  it('promise: one loading toast that turns into success in place', async () => {
    let resolve: (v: string) => void = () => {}
    const work = new Promise<string>((r) => (resolve = r))
    setup((t) => void t.promise(work, { loading: 'Menutup kartu…', success: (v) => `Kartu ${v} ditutup`, error: 'Gagal' }))
    await userEvent.click(screen.getByRole('button', { name: 'Picu' }))
    expect(await screen.findByText('Menutup kartu…')).toBeTruthy()
    expect(document.querySelector('[data-slot=toast]')?.getAttribute('data-type')).toBe('loading')
    await act(async () => {
      resolve('4821')
      await work
    })
    expect(await screen.findByText('Kartu 4821 ditutup')).toBeTruthy()
    expect(document.querySelectorAll('[data-slot=toast]')).toHaveLength(1)
    expect(document.querySelector('[data-slot=toast]')?.getAttribute('data-type')).toBe('success')
  })

  it('auto-dismisses after 4s; dismiss() closes from outside React', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    try {
      const { toaster } = setup(() => {})
      act(() => void toaster.success('Tersimpan'))
      expect(await screen.findByText('Tersimpan')).toBeTruthy()
      await act(async () => {
        vi.advanceTimersByTime(4100)
      })
      await waitFor(() => expect(screen.queryByText('Tersimpan')).toBeNull())
      let id = ''
      act(() => void (id = toaster.loading('Memproses…')))
      expect(await screen.findByText('Memproses…')).toBeTruthy()
      await act(async () => {
        vi.advanceTimersByTime(10000)
      })
      expect(screen.getByText('Memproses…')).toBeTruthy()
      act(() => toaster.dismiss(id))
      await waitFor(() => expect(screen.queryByText('Memproses…')).toBeNull())
    } finally {
      vi.useRealTimers()
    }
  })

  it('update changes a toast in place', async () => {
    const { toaster } = setup(() => {})
    let id = ''
    act(() => void (id = toaster.loading('Mengunggah…')))
    await screen.findByText('Mengunggah…')
    act(() => toaster.update(id, { type: 'error', title: 'Gagal mengunggah' }))
    await waitFor(() =>
      expect(document.querySelector('[data-slot=toast-title]')?.textContent).toBe('Gagal mengunggah'),
    )
    expect(document.querySelector('[data-slot=toast]')?.getAttribute('data-type')).toBe('error')
  })

  it('ToastCard renders a static card', () => {
    render(<ToastCard type="error" title="Gagal" description="Coba lagi." action="Ulangi" cancel="Batal" closable />)
    expect(screen.getByText('Gagal')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Ulangi' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Batal' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Tutup notifikasi' })).toBeTruthy()
  })

  it('has no axe violations', async () => {
    const { baseElement } = setup((t) =>
      t.success({ title: 'Kartu dibuat', description: 'Siap dipakai.', action: { label: 'Lihat' }, closable: true }),
    )
    await userEvent.click(screen.getByRole('button', { name: 'Picu' }))
    await screen.findByText('Kartu dibuat')
    await expectNoAxeViolations(baseElement)
  })
})
