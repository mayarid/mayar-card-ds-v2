// Every doc, loaded at once. For tests only; the site loads pages on demand.
import type { ComponentDoc, FoundationDoc } from './types'

const components = import.meta.glob<{ doc: ComponentDoc }>('./components/*.tsx', { eager: true })
const foundations = import.meta.glob<{ doc: FoundationDoc }>('./foundations/*.tsx', { eager: true })

export const componentDocs = Object.values(components).map((m) => m.doc)
export const foundationDocs = Object.values(foundations)
  .map((m) => m.doc)
  .sort((a, b) => a.order - b.order)
