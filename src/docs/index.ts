import manifest from 'virtual:docs-manifest'

import type { ComponentDoc, ComponentGroup, FoundationDoc, SpecSource } from './types'

/* Each file in ./components and ./foundations exports `doc`. Add a file to add a page. Pages load on demand. */
const componentLoaders = import.meta.glob<{ doc: ComponentDoc }>('./components/*.tsx')
const foundationLoaders = import.meta.glob<{ doc: FoundationDoc }>(['./foundations/*.tsx', '!./foundations/*.test.tsx'])

export interface ComponentEntry {
  slug: string
  name: string
  group: ComponentGroup
  spec: SpecSource
  description: string
}

export interface FoundationEntry {
  slug: string
  name: string
  description: string
  order: number
}

export const GROUP_ORDER: ComponentGroup[] = ['Actions', 'Forms', 'Selection', 'Surfaces', 'Feedback', 'Overlays', 'Display']

export const componentList: ComponentEntry[] = manifest.components
  .map((c) => ({ ...c, group: (c.group ?? 'Display') as ComponentGroup, spec: (c.spec ?? 'wonder') as SpecSource }))
  .sort((a, b) => a.name.localeCompare(b.name))

export const foundationList: FoundationEntry[] = manifest.foundations
  .map((f) => ({ ...f, order: f.order ?? 99 }))
  .sort((a, b) => a.order - b.order)

export function componentsByGroup() {
  return GROUP_ORDER.map((group) => ({
    group,
    items: componentList.filter((doc) => doc.group === group),
  })).filter((g) => g.items.length > 0)
}

export async function loadComponentDoc(slug: string): Promise<ComponentDoc | undefined> {
  const load = componentLoaders[`./components/${slug}.tsx`]
  return load ? (await load()).doc : undefined
}

export async function loadFoundationDoc(slug: string): Promise<FoundationDoc | undefined> {
  const load = foundationLoaders[`./foundations/${slug}.tsx`]
  return load ? (await load()).doc : undefined
}
