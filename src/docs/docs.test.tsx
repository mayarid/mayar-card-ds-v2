import { render } from '@testing-library/react'
import { readdirSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

import { getExample } from '@/gallery/examples'
import { expectNoAxeViolations } from '@/test/axe'

import { componentList, foundationList } from '.'
import { componentDocs, foundationDocs } from './all'

describe('component docs', () => {
  it('every UI file in the registry has a doc page', () => {
    const files = readdirSync('src/registry/ui')
      .filter((f) => f.endsWith('.tsx') && !f.includes('.test.'))
      .map((f) => f.replace('.tsx', ''))
    // Building blocks that are documented inside other pages.
    const internal = new Set(['icon', 'spinner'])
    const documented = new Set(componentDocs.map((d) => d.registry))
    const missing = files.filter((f) => !internal.has(f) && !documented.has(f))
    expect(missing).toEqual([])
  })

  it('the manifest matches the doc files', () => {
    for (const doc of componentDocs) {
      const entry = componentList.find((e) => e.slug === doc.slug)
      expect(entry, doc.slug).toBeDefined()
      expect(entry?.name).toBe(doc.name)
      expect(entry?.group).toBe(doc.group)
      expect(entry?.spec).toBe(doc.spec)
      expect(entry?.description).toBe(doc.description)
    }
    for (const doc of foundationDocs) {
      const entry = foundationList.find((e) => e.slug === doc.slug)
      expect(entry?.name, doc.slug).toBe(doc.name)
      expect(entry?.order).toBe(doc.order)
    }
  })

  it('slugs are unique', () => {
    const slugs = componentDocs.map((d) => d.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
  })

  for (const doc of componentDocs) {
    describe(doc.name, () => {
      it('has source and a description', () => {
        expect(doc.source.length).toBeGreaterThan(0)
        expect(doc.description.length).toBeGreaterThan(10)
      })

      if (doc.playground) {
        const playground = doc.playground
        it('playground renders its default and its code is not empty', () => {
          const values = Object.fromEntries(playground.controls.map((c) => [c.name, c.default]))
          render(<>{playground.render(values)}</>)
          expect(playground.code(values).trim()).not.toBe('')
        })
      }

      for (const matrix of doc.matrices ?? []) {
        it(`matrix "${matrix.title}" renders every cell`, () => {
          const { container } = render(
            <div>
              {matrix.rows.flatMap((row) =>
                matrix.columns.map((col) => (
                  <div key={`${row.label}-${col.label}`}>{matrix.render({ ...row.props, ...col.props }, col.force ?? row.force)}</div>
                )),
              )}
            </div>,
          )
          expect(container.children[0]?.children.length).toBe(matrix.rows.length * matrix.columns.length)
          for (const row of matrix.rows) {
            for (const col of matrix.columns) {
              expect(matrix.code({ ...row.props, ...col.props }).trim()).not.toBe('')
            }
          }
        })
      }

      for (const example of doc.examples ?? []) {
        it(`example "${example.title}" renders with no axe violations`, async () => {
          const found = getExample(example.id)
          expect(found, `missing src/examples/${example.id}.tsx`).toBeDefined()
          if (!found) return
          const { Component } = found
          const { container } = render(
            <main>
              <Component />
            </main>,
          )
          await expectNoAxeViolations(container)
        })
      }
    })
  }
})

describe('foundation docs', () => {
  for (const doc of foundationDocs) {
    it(`${doc.name} renders with no axe violations`, async () => {
      const { container } = render(
        <main>
          <doc.Page />
        </main>,
      )
      await expectNoAxeViolations(container)
    })
  }
})
