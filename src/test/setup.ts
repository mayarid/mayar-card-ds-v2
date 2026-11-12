import { cleanup, configure } from '@testing-library/react'
import { afterEach } from 'vitest'

// waitFor / findBy wait up to 5 s, so the suite stays stable when the machine is busy.
configure({ asyncUtilTimeout: 5000 })

afterEach(() => cleanup())

// jsdom lacks these browser APIs that Base UI and the gallery use.
// jsdom's matchMedia can be missing or return null; libraries such as NumberFlow read `.matches`.
if (!window.matchMedia || !window.matchMedia('(min-width: 0px)')) {
  window.matchMedia = (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList
}
class NoopObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return []
  }
}
globalThis.ResizeObserver ??= NoopObserver as unknown as typeof ResizeObserver
globalThis.IntersectionObserver ??= NoopObserver as unknown as typeof IntersectionObserver

// axe probes <canvas>; jsdom has no canvas. Return null quietly instead of logging an error.
HTMLCanvasElement.prototype.getContext = (() => null) as typeof HTMLCanvasElement.prototype.getContext
