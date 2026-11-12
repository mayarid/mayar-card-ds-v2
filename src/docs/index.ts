import type { ComponentDoc, ComponentGroup, FoundationDoc } from './types'

/* Each file in ./components exports `doc`. Add a file to add a page. */
const modules = import.meta.glob<{ doc: ComponentDoc }>('./components/*.tsx', { eager: true })

export const componentDocs: ComponentDoc[] = Object.values(modules)
  .map((mod) => mod.doc)
  .sort((a, b) => a.name.localeCompare(b.name))

export const GROUP_ORDER: ComponentGroup[] = ['Actions', 'Forms', 'Selection', 'Surfaces', 'Feedback', 'Overlays', 'Display']

export function getComponentDoc(slug: string) {
  return componentDocs.find((doc) => doc.slug === slug)
}

export function componentsByGroup() {
  return GROUP_ORDER.map((group) => ({
    group,
    items: componentDocs.filter((doc) => doc.group === group),
  })).filter((g) => g.items.length > 0)
}

const foundationModules = import.meta.glob<{ doc: FoundationDoc }>('./foundations/*.tsx', { eager: true })

export const foundationDocs: FoundationDoc[] = Object.values(foundationModules)
  .map((mod) => mod.doc)
  .sort((a, b) => a.order - b.order)

export function getFoundationDoc(slug: string) {
  return foundationDocs.find((doc) => doc.slug === slug)
}
