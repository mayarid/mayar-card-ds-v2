import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { expectNoAxeViolations } from '@/test/axe'

import {
  PinGate,
  PinGateDescription,
  PinGateDialog,
  PinGateField,
  PinGateHeader,
  PinGateIcon,
  PinGateTitle,
  usePinGate,
  type PinGateProps,
} from './pin-gate'

function Gate(props: Partial<PinGateProps>) {
  return (
    <PinGate onSubmit={() => true} {...props}>
      <PinGateHeader>
        <PinGateIcon />
        <PinGateTitle>Masukkan PIN Anda</PinGateTitle>
        <PinGateDescription>Masukkan 6 digit PIN Anda untuk melanjutkan</PinGateDescription>
      </PinGateHeader>
      <PinGateField />
    </PinGate>
  )
}

const slots = () => [...document.querySelectorAll<HTMLInputElement>('input[data-slot=otp-input-slot]')]
const root = () => document.querySelector('[data-slot=pin-gate]') as HTMLElement
const line = () => document.querySelector('[data-slot=pin-gate-message]') as HTMLElement

async function typePin(pin: string) {
  await userEvent.click(slots()[0]!)
  await userEvent.keyboard(pin)
}

afterEach(() => {
  vi.useRealTimers()
})

describe('PinGate', () => {
  it('renders 6 masked, labelled boxes and starts empty', () => {
    render(<Gate />)
    expect(slots()).toHaveLength(6)
    expect(screen.getAllByLabelText('PIN')).toContain(slots()[0])
    expect(slots()[0]?.type).toBe('password')
    expect(screen.getByLabelText('Digit PIN ke-2')).toBe(slots()[1])
    expect(slots()[0]?.getAttribute('autocomplete')).toBe('off')
    expect(root().dataset.state).toBe('empty')
  })

  it('moves to typing, then submits the full PIN once', async () => {
    const onSubmit = vi.fn(() => true)
    const onSuccess = vi.fn()
    render(<Gate onSubmit={onSubmit} onSuccess={onSuccess} />)
    await typePin('12')
    expect(root().dataset.state).toBe('typing')
    await userEvent.keyboard('3456')
    await waitFor(() => expect(root().dataset.state).toBe('success'))
    expect(onSubmit).toHaveBeenCalledExactlyOnceWith('123456')
    expect(onSuccess).toHaveBeenCalledWith('123456')
    expect(line().textContent).toBe('PIN benar.')
    expect(slots().every((s) => s.disabled)).toBe(true)
  })

  it('shows checking while onSubmit runs: busy and disabled', async () => {
    let resolve: (ok: boolean) => void = () => {}
    const onSubmit = () => new Promise<boolean>((r) => (resolve = r))
    render(<Gate onSubmit={onSubmit} />)
    await typePin('123456')
    expect(root().dataset.state).toBe('checking')
    expect(root().getAttribute('aria-busy')).toBe('true')
    expect(slots().every((s) => s.disabled)).toBe(true)
    expect(line().textContent).toBe('Memeriksa PIN…')
    await act(async () => resolve(true))
    expect(root().dataset.state).toBe('success')
  })

  it('wrong PIN: error line, invalid boxes, cleared, refocused; typing clears the error', async () => {
    render(<Gate onSubmit={() => false} />)
    await typePin('111111')
    await waitFor(() => expect(root().dataset.state).toBe('error'))
    expect(line().textContent).toBe('PIN salah, coba lagi.')
    expect(slots().every((s) => s.value === '')).toBe(true)
    expect(slots()[0]?.getAttribute('aria-invalid')).toBe('true')
    await waitFor(() => expect(document.activeElement).toBe(slots()[0]))
    await userEvent.keyboard('1')
    expect(root().dataset.state).toBe('typing')
    expect(line().textContent).toBe('')
  })

  it('uses the error and attemptsLeft from onSubmit; a throw counts as wrong', async () => {
    const onSubmit = vi
      .fn<PinGateProps['onSubmit']>()
      .mockResolvedValueOnce({ attemptsLeft: 4 })
      .mockRejectedValueOnce(new Error('Server sibuk'))
    render(<Gate onSubmit={onSubmit} />)
    await typePin('111111')
    await waitFor(() => expect(line().textContent).toBe('PIN salah. Sisa 4 percobaan sebelum PIN terkunci.'))
    await typePin('222222')
    await waitFor(() => expect(line().textContent).toBe('Server sibuk'))
  })

  it('locks after maxAttempts with a countdown, then unlocks', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    const { unmount } = render(<Gate onSubmit={() => false} maxAttempts={2} lockoutSeconds={3} />)
    await user.click(slots()[0]!)
    await user.keyboard('111111')
    await waitFor(() => expect(line().textContent).toBe('PIN salah. Sisa 1 percobaan sebelum PIN terkunci.'))
    await user.keyboard('222222')
    await waitFor(() => expect(root().dataset.state).toBe('locked'))
    expect(line().textContent).toBe('PIN terkunci. Coba lagi dalam 0:03.')
    expect(slots().every((s) => s.disabled)).toBe(true)
    await act(async () => {
      vi.advanceTimersByTime(3100)
    })
    expect(root().dataset.state).toBe('empty')
    expect(slots()[0]?.disabled).toBe(false)
    unmount()
    vi.useRealTimers()
  })

  it('locks from the result with retryAfter, and from lockedUntil', async () => {
    const { unmount } = render(<Gate onSubmit={() => ({ locked: true, retryAfter: 90 })} />)
    await typePin('123456')
    await waitFor(() => expect(line().textContent).toBe('PIN terkunci. Coba lagi dalam 1:30.'))
    unmount()
    render(<Gate lockedUntil={Date.now() + 59_500} />)
    expect(root().dataset.state).toBe('locked')
    expect(line().textContent).toBe('PIN terkunci. Coba lagi dalam 1:00.')
  })

  it('locked without a time shows the open-ended notice', () => {
    render(<Gate defaultStatus="locked" />)
    expect(line().textContent).toBe('PIN terkunci sementara. Coba beberapa saat lagi.')
  })

  it('confirm: asks twice, restarts on a mismatch, submits the matched PIN', async () => {
    const onSubmit = vi.fn(() => true)
    function Steps() {
      const { step } = usePinGate()
      return <output>{step}</output>
    }
    render(
      <PinGate onSubmit={onSubmit} confirm>
        <Steps />
        <PinGateField />
      </PinGate>,
    )
    expect(screen.getByRole('status').textContent).toBe('create')
    await typePin('123456')
    expect(screen.getByRole('status').textContent).toBe('confirm')
    expect(onSubmit).not.toHaveBeenCalled()
    await typePin('654321')
    expect(line().textContent).toBe('PIN tidak sama, ulangi dari awal.')
    expect(screen.getByRole('status').textContent).toBe('create')
    await typePin('123456')
    await typePin('123456')
    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith('123456'))
  })

  it('works controlled', async () => {
    function Controlled() {
      const [value, setValue] = useState('')
      return (
        <>
          <Gate value={value} onValueChange={setValue} />
          <output>{value}</output>
        </>
      )
    }
    render(<Controlled />)
    await typePin('98')
    expect(screen.getByRole('status').textContent).toBe('98')
  })

  it('reports status changes and spreads props', async () => {
    const onStatusChange = vi.fn()
    render(<Gate data-testid="g" onSubmit={() => false} onStatusChange={onStatusChange} />)
    expect(root().dataset.testid).toBe('g')
    await typePin('123456')
    await waitFor(() => expect(onStatusChange).toHaveBeenLastCalledWith('error'))
    expect(onStatusChange).toHaveBeenCalledWith('checking')
  })

  it('PinGateDialog: named by DialogTitle, cannot close while checking', async () => {
    let resolve: (ok: boolean) => void = () => {}
    const onOpenChange = vi.fn()
    render(
      <PinGateDialog defaultOpen onOpenChange={onOpenChange}>
        <PinGate onSubmit={() => new Promise<boolean>((r) => (resolve = r))}>
          <PinGateHeader>
            <PinGateIcon />
            <DialogTitle>Masukkan PIN Anda</DialogTitle>
            <DialogDescription>Masukkan 6 digit PIN Anda untuk melanjutkan</DialogDescription>
          </PinGateHeader>
          <PinGateField />
        </PinGate>
      </PinGateDialog>,
    )
    expect(screen.getByRole('dialog', { name: 'Masukkan PIN Anda' })).toBeTruthy()
    await typePin('123456')
    await userEvent.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeNull()
    expect((screen.getByRole('button', { name: 'Tutup' }) as HTMLButtonElement).disabled).toBe(true)
    await act(async () => resolve(false))
    await userEvent.keyboard('{Escape}')
    expect(onOpenChange).toHaveBeenCalledWith(false, expect.anything())
  })

  it('has no axe violations', async () => {
    const { container } = render(
      <div>
        <Gate />
        <Gate defaultStatus="error" defaultMessage="PIN salah, coba lagi." />
        <Gate defaultStatus="locked" />
      </div>,
    )
    await expectNoAxeViolations(container)
  })
})
