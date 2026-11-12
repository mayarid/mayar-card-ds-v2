import type { ComponentType, ReactNode } from 'react'

export type ComponentGroup =
  | 'Actions'
  | 'Forms'
  | 'Selection'
  | 'Surfaces'
  | 'Feedback'
  | 'Overlays'
  | 'Display'
  /** Mayar product parts built from the primitives. */
  | 'Patterns'

/** "wonder": specified on the Wonder Design System page. "code-only": comes from the shipped app. */
export type SpecSource = 'wonder' | 'code-only'

export type PropValue = string | number | boolean | undefined

export type ControlDef =
  | { name: string; label?: string; type: 'select'; options: readonly string[]; default: string }
  | { name: string; label?: string; type: 'boolean'; default: boolean }
  | { name: string; label?: string; type: 'text'; default: string }

export interface PlaygroundDef {
  controls: ControlDef[]
  /** Renders the live preview from the control values. */
  render: (values: Record<string, PropValue>) => ReactNode
  /** Returns the usage snippet for the same values. */
  code: (values: Record<string, PropValue>) => string
}

export interface MatrixAxisItem {
  label: string
  props?: Record<string, PropValue>
  /** Forces an interaction state with `data-force-state` (hover, pressed, focus, open). */
  force?: 'hover' | 'pressed' | 'focus' | 'open'
  /** This variant or state is not on the Wonder page; it comes from the shipped app. */
  codeOnly?: boolean
}

export interface MatrixDef {
  title: string
  description?: string
  rows: MatrixAxisItem[]
  columns: MatrixAxisItem[]
  /** Renders one cell. `props` already merges row and column props. */
  render: (props: Record<string, PropValue>, force: MatrixAxisItem['force']) => ReactNode
  /** The usage snippet for one cell (without the forced state). */
  code: (props: Record<string, PropValue>) => string
  /** Minimum cell width in px. */
  cellWidth?: number
}

export interface ExampleDef {
  /** Path under src/examples without the extension, e.g. "button/with-icon". */
  id: string
  title: string
  description?: string
  codeOnly?: boolean
}

export interface PropRow {
  name: string
  type: string
  default?: string
  description: string
}

export interface SourceFile {
  /** Path in a consumer project, e.g. "components/ui/button.tsx". */
  path: string
  code: string
}

export interface ComponentDoc {
  slug: string
  name: string
  group: ComponentGroup
  description: string
  spec: SpecSource
  /** Where the specimen lives in Wonder. */
  wonderRef?: string
  /** Name of the registry item. */
  registry: string
  /** Base UI part this component is built on, if any. */
  baseUi?: { name: string; url: string }
  source: SourceFile[]
  playground?: PlaygroundDef
  matrices?: MatrixDef[]
  examples?: ExampleDef[]
  props?: PropRow[]
  guidelines?: { do: string[]; dont?: string[] }
  /** Differences between Wonder and the shipped app, and how this port resolves them. */
  notes?: string[]
}

export interface FoundationDoc {
  order: number
  slug: string
  name: string
  description: string
  Page: ComponentType
}
