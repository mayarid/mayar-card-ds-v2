import { CardFace } from '@/components/ui/card-face'
import type { ComponentDoc, PropValue } from '@/docs/types'
import cardFreezeEffectSource from '@/registry/ui/card-freeze-effect.tsx?raw'

const SAMPLE = { skin: 'royal', label: 'Langganan SaaS', last4: '4821', holder: 'RINA WULANDARI' } as const

function render(values: Record<string, PropValue>) {
  return (
    <CardFace
      {...SAMPLE}
      status={values.frozen ? 'frozen' : 'active'}
      width={360}
      animated
      onShatter={values.interactive ? () => {} : undefined}
    />
  )
}

function code(values: Record<string, PropValue>) {
  const frozen = values.frozen ? 'true' : 'false'
  return values.interactive
    ? `<div className="relative overflow-clip rounded-2xl">
  <div ref={faceRef}>{/* card face */}</div>
  <CardFreezeEffect frozen={${frozen}} targetRef={faceRef} onShatter={unfreeze} onFail={showCssFrost} />
</div>`
    : `<div className="relative overflow-clip rounded-2xl">
  <div ref={faceRef}>{/* card face */}</div>
  <CardFreezeEffect frozen={${frozen}} interactive={false} targetRef={faceRef} onFail={showCssFrost} />
</div>`
}

export const doc: ComponentDoc = {
  slug: 'card-freeze-effect',
  name: 'Card Freeze Effect',
  group: 'Patterns',
  description:
    'The WebGL ice over a frozen Mayar card: it refracts a snapshot of the face, grows in on freeze, melts on thaw, and can be hammered apart to unfreeze.',
  spec: 'code-only',
  registry: 'card-freeze-effect',
  source: [{ path: 'components/ui/card-freeze-effect.tsx', code: cardFreezeEffectSource }],
  playground: {
    controls: [
      { name: 'frozen', type: 'boolean', default: true },
      { name: 'interactive', type: 'boolean', default: false },
    ],
    render,
    code,
  },
  examples: [
    {
      id: 'card-face/hammer',
      title: 'Interactive: hammer to unfreeze',
      description: 'Through CardFace onShatter. Pointer: hit the ice. Keyboard: Enter or Space three times on the card.',
      codeOnly: true,
    },
    {
      id: 'card-freeze-effect/custom-surface',
      title: 'On your own surface (look only)',
      description:
        'targetRef picks the element to snapshot. The host shows its own frost when onFail fires. interactive={false} renders on a short-lived context and keeps the last frame.',
      codeOnly: true,
    },
  ],
  props: [
    { name: 'frozen', type: 'boolean', description: 'The card is frozen. A change plays the freeze or the thaw.' },
    {
      name: 'interactive',
      type: 'boolean',
      default: 'true',
      description:
        'Live ice with the hammer, cracks, shards, keyboard control and onShatter. false: look only, on a pooled context (at most 4 live) that is released when the ice settles. Set once.',
    },
    { name: 'appear', type: 'boolean', default: 'false', description: 'Play the freeze when it mounts frozen. Off: the ice is there at once.' },
    { name: 'renderScale', type: 'number', default: '1', description: 'Displayed size as a fraction of the 420×264 face. Sizes the look-only bitmap.' },
    { name: 'targetRef', type: 'RefObject<HTMLElement | null>', description: 'The element to snapshot. Default: the parent element of the effect.' },
    { name: 'gradient / pan / holder / expiry', type: 'string', description: 'Draw the placeholder texture that shows until the snapshot is ready.' },
    { name: 'hitLabel', type: 'string', default: '"Pecahkan es untuk membuka kartu"', description: 'Name of the keyboard control.' },
    { name: 'onShatter', type: '() => void', description: 'The ice has fully broken. Set the card active.' },
    { name: 'onFail', type: '() => void', description: 'WebGL cannot run (no context, shader error, context lost). Show a CSS frost.' },
    { name: 'onReady', type: '() => void', description: 'The first frame with the snapshot is on screen.' },
    { name: 'onThawEnd', type: '() => void', description: 'A thaw has finished and no ice is left.' },
  ],
  guidelines: {
    do: [
      'Use it through CardFace (freezeEffect="webgl", the default). Use it on its own only for a custom card surface.',
      'Always have a CSS frost ready for onFail. Many devices and test runners have no WebGL.',
      'Keep at most one interactive effect on a screen.',
    ],
    dont: [
      'Do not put it in a grid of dozens of cards with interactive on. A browser keeps only about 16 WebGL contexts.',
      'Do not use the break as the only way to unfreeze. Keep the freeze button next to the card.',
    ],
  },
  notes: [
    'Port of the app CardFreezeEffect.svelte: the same fragment shader (fbm noise, voronoi plates, droplets, bubbles, cracks, shards), freeze and thaw ramps with mid-flight inversion, hammer cursor, crack and knock-out rules, the 70% collapse cascade, the look-only context pool (4) and the html-to-image snapshot with a drawn placeholder.',
    'Not in the app: the keyboard control (three Enter / Space hits, with a status line), a pause while the card is off screen, and reduced motion that also stops the idle twinkle and breaks the ice at once instead of the cascade.',
    'The app does not cancel its frame loop on unmount; this port cancels requestAnimationFrame, removes every listener, frees the GL objects and loses the context.',
    'Colours of the placeholder texture come from the theme tokens (card-chip, card-mc, skin-midnight). The shader colours are the app values, as GLSL floats.',
  ],
}
