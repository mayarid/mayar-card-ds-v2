import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { expectNoAxeViolations } from '@/test/axe'

import { CardFreezeEffect } from './card-freeze-effect'

/*
 * jsdom has no WebGL: the setup file makes getContext return null, which is the fallback path. A few
 * tests put a fake context in its place (every GL call is a no-op, shader and link checks pass) to
 * cover the parts that do not draw: the snapshot, the frame loop, reduced motion and cleanup.
 */
vi.mock('html-to-image', () => ({
  getFontEmbedCSS: vi.fn(async () => ''),
  toCanvas: vi.fn(async () => document.createElement('canvas')),
}))

/** A stand-in object: every property is a no-op function that returns another stand-in. */
function fake(overrides: Record<string, unknown> = {}): unknown {
  return new Proxy(overrides, {
    get(target, prop) {
      if (prop === 'then') return undefined
      if (prop in target) return target[prop as string]
      return () => fake()
    },
  })
}

/** Gives every canvas a fake WebGL and 2D context, and runs animation frames by hand. */
function fakeWebGl() {
  const loseContext = vi.fn()
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(function (type: string) {
    if (type === '2d') return fake() as CanvasRenderingContext2D
    if (type === 'webgl') {
      return fake({
        getShaderParameter: () => true,
        getProgramParameter: () => true,
        getExtension: () => ({ loseContext }),
      }) as WebGLRenderingContext
    }
    return null
  } as typeof HTMLCanvasElement.prototype.getContext)
  const frames = new Map<number, FrameRequestCallback>()
  let id = 0
  vi.stubGlobal(
    'requestAnimationFrame',
    vi.fn((cb: FrameRequestCallback) => {
      frames.set(++id, cb)
      return id
    }),
  )
  vi.stubGlobal(
    'cancelAnimationFrame',
    vi.fn((n: number) => frames.delete(n)),
  )
  /** Runs the frames that are queued now. Returns how many ran. */
  const runFrames = () => {
    const queued = [...frames.entries()]
    frames.clear()
    act(() => queued.forEach(([, cb]) => cb(performance.now())))
    return queued.length
  }
  return { loseContext, frames, runFrames }
}

function mockReducedMotion(reduce: boolean) {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: reduce && query.includes('reduce'),
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  }))
}

/** Lets the mocked snapshot promise settle. */
const flush = () => act(() => new Promise((r) => setTimeout(r, 0)))

function Card(props: React.ComponentProps<typeof CardFreezeEffect>) {
  return (
    <div className="relative h-[264px] w-[420px] rounded-[20px]">
      <CardFreezeEffect pan="••••  ••••  ••••  4821" holder="RINA WULANDARI" expiry="••/••" {...props} />
    </div>
  )
}

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('CardFreezeEffect without WebGL', () => {
  it('mounts, calls onFail, hides its canvas and unmounts cleanly', () => {
    const onFail = vi.fn()
    const { container, unmount } = render(<Card frozen onFail={onFail} />)
    expect(onFail).toHaveBeenCalledTimes(1)
    const canvas = container.querySelector('canvas')
    expect(canvas?.hidden).toBe(true)
    expect(canvas?.getAttribute('aria-hidden')).toBe('true')
    expect(() => unmount()).not.toThrow()
  })

  it('look-only: falls back and has no control', () => {
    const onFail = vi.fn()
    render(<Card frozen interactive={false} onFail={onFail} />)
    expect(onFail).toHaveBeenCalledTimes(1)
    expect(screen.queryByRole('button')).toBeNull()
  })

  it('keyboard path: three hits on the control call onShatter once', async () => {
    const user = userEvent.setup()
    const onShatter = vi.fn()
    render(<Card frozen onShatter={onShatter} />)
    const hit = screen.getByRole('button', { name: 'Pecahkan es untuk membuka kartu' })
    hit.focus()
    await user.keyboard('{Enter}')
    expect(screen.getByRole('status').textContent).toBe('Es retak. 2 pukulan lagi.')
    await user.keyboard(' ')
    expect(onShatter).not.toHaveBeenCalled()
    await user.keyboard('{Enter}')
    expect(onShatter).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('status').textContent).toBe('Es pecah.')
    await user.keyboard('{Enter}')
    expect(onShatter).toHaveBeenCalledTimes(1)
  })

  it('has no control while the card is not frozen', () => {
    render(<Card frozen={false} />)
    expect(screen.queryByRole('button')).toBeNull()
  })

  it('has no axe violations', async () => {
    const { container } = render(
      <div>
        <Card frozen />
        <Card frozen interactive={false} />
      </div>,
    )
    await expectNoAxeViolations(container)
  })
})

describe('CardFreezeEffect with WebGL', () => {
  it('shows the canvas once the snapshot is on the ice, and frees everything on unmount', async () => {
    const { loseContext, frames } = fakeWebGl()
    const onReady = vi.fn()
    const onFail = vi.fn()
    const removeWindow = vi.spyOn(window, 'removeEventListener')
    const { container, unmount } = render(<Card frozen onReady={onReady} onFail={onFail} />)
    const canvas = container.querySelector('canvas')!
    expect(canvas.dataset.ready).toBeUndefined()

    await flush()
    expect(onFail).not.toHaveBeenCalled()
    expect(onReady).toHaveBeenCalledTimes(1)
    expect(canvas.dataset.ready).toBe('')
    expect(canvas.style.cursor).toContain('data:image/svg+xml')
    expect(frames.size).toBe(1)

    const removeCanvas = vi.spyOn(canvas, 'removeEventListener')
    unmount()
    expect(frames.size).toBe(0)
    expect(loseContext).toHaveBeenCalled()
    expect(removeCanvas).toHaveBeenCalledWith('webglcontextlost', expect.any(Function))
    expect(removeCanvas).toHaveBeenCalledWith('pointerdown', expect.any(Function))
    expect(removeWindow).toHaveBeenCalledWith('pointerup', expect.any(Function))
  })

  it('a lost context falls back to onFail', async () => {
    fakeWebGl()
    const onFail = vi.fn()
    const { container } = render(<Card frozen onFail={onFail} />)
    await flush()
    container.querySelector('canvas')!.dispatchEvent(new Event('webglcontextlost'))
    expect(onFail).toHaveBeenCalledTimes(1)
    expect(container.querySelector('canvas')?.hidden).toBe(true)
  })

  it('keeps animating the idle ice by default', async () => {
    mockReducedMotion(false)
    const { runFrames, frames } = fakeWebGl()
    render(<Card frozen />)
    await flush()
    expect(runFrames()).toBe(1)
    expect(frames.size).toBe(1)
  })

  it('reduced motion: draws the frozen ice once and stops; three hits break it at once', async () => {
    mockReducedMotion(true)
    const { runFrames, frames } = fakeWebGl()
    const user = userEvent.setup()
    const onShatter = vi.fn()
    render(<Card frozen onShatter={onShatter} />)
    await flush()
    expect(runFrames()).toBe(1)
    expect(frames.size).toBe(0)

    screen.getByRole('button', { name: 'Pecahkan es untuk membuka kartu' }).focus()
    await user.keyboard('{Enter}{Enter}{Enter}')
    expect(onShatter).toHaveBeenCalledTimes(1)
  })

  it('a thaw ends with onThawEnd', async () => {
    mockReducedMotion(true)
    const { runFrames } = fakeWebGl()
    const onThawEnd = vi.fn()
    const { rerender } = render(<Card frozen onThawEnd={onThawEnd} />)
    await flush()
    runFrames()
    rerender(<Card frozen={false} onThawEnd={onThawEnd} />)
    runFrames()
    expect(onThawEnd).toHaveBeenCalledTimes(1)
  })
})
