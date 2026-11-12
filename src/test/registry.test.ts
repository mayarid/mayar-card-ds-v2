import { execFileSync } from 'node:child_process'
import { readdirSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

describe('registry', () => {
  execFileSync('node', ['scripts/gen-registry.mjs'])
  const registry = JSON.parse(readFileSync('registry.json', 'utf8')) as {
    items: { name: string; description: string; registryDependencies?: string[]; files: { path: string }[] }[]
  }
  const names = new Set(registry.items.map((i) => i.name))

  it('has an item for every UI file', () => {
    const files = readdirSync('src/registry/ui')
      .filter((f) => f.endsWith('.tsx') && !f.includes('.test.'))
      .map((f) => f.replace('.tsx', ''))
    for (const file of files) expect(names.has(file), file).toBe(true)
  })

  it('every item has a description and only depends on items that exist', () => {
    for (const item of registry.items) {
      expect(item.description, item.name).toBeTruthy()
      for (const dep of item.registryDependencies ?? []) {
        const name = dep.split('/').pop()?.replace('.json', '')
        expect(names.has(name ?? ''), `${item.name} → ${dep}`).toBe(true)
      }
    }
  })

  it('registry source only imports registry aliases or npm packages', () => {
    for (const item of registry.items) {
      for (const file of item.files) {
        const source = readFileSync(file.path, 'utf8')
        const bad = [...source.matchAll(/from ['"](\.{1,2}\/[^'"]+|@\/(?!components\/ui\/|lib\/utils|hooks\/)[^'"]+)['"]/g)].map((m) => m[1])
        expect(bad, file.path).toEqual([])
      }
    }
  })
})
