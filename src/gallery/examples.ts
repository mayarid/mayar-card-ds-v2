import type { ComponentType } from 'react'

/* Every example is a real file; the preview renders it and the code tab shows its source. */
const modules = import.meta.glob<{ default: ComponentType }>('../examples/**/*.tsx', { eager: true })
const sources = import.meta.glob<string>('../examples/**/*.tsx', {
  eager: true,
  query: '?raw',
  import: 'default',
})

function key(path: string) {
  return path.replace('../examples/', '').replace(/\.tsx$/, '')
}

const components = new Map(Object.entries(modules).map(([path, mod]) => [key(path), mod.default]))
const codes = new Map(Object.entries(sources).map(([path, code]) => [key(path), code]))

export function getExample(id: string): { Component: ComponentType; code: string } | undefined {
  const Component = components.get(id)
  const code = codes.get(id)
  if (!Component || code === undefined) return undefined
  return { Component, code: code.trim() }
}

export function allExampleIds(): string[] {
  return [...components.keys()]
}
