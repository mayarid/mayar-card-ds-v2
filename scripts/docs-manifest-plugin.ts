import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import type { Plugin } from 'vite'

/*
 * `virtual:docs-manifest` — the names, groups and descriptions of every doc page, read from the
 * doc files as text. The sidebar and overview use it, so they do not load every page up front.
 */
const ID = 'virtual:docs-manifest'
const RESOLVED = '\0' + ID

function field(source: string, key: string): string | undefined {
  const match = source.match(new RegExp(`\\n  ${key}:\\s*(['"])((?:\\\\.|(?!\\1)[^\\\\])*)\\1`))
  return match?.[2].replace(/\\(['"\\])/g, '$1')
}

function readDocs(dir: string) {
  return readdirSync(dir)
    .filter((f) => f.endsWith('.tsx') && !f.includes('.test.'))
    .map((file) => {
      const source = readFileSync(join(dir, file), 'utf8')
      const order = source.match(/\n {2}order:\s*(\d+)/)?.[1]
      return {
        slug: file.replace(/\.tsx$/, ''),
        name: field(source, 'name') ?? file,
        group: field(source, 'group'),
        spec: field(source, 'spec'),
        description: field(source, 'description') ?? '',
        order: order ? Number(order) : undefined,
      }
    })
}

export function docsManifest(root: string): Plugin {
  const components = join(root, 'src/docs/components')
  const foundations = join(root, 'src/docs/foundations')
  return {
    name: 'docs-manifest',
    resolveId: (id) => (id === ID ? RESOLVED : undefined),
    load(id) {
      if (id !== RESOLVED) return
      const data = { components: readDocs(components), foundations: readDocs(foundations) }
      return `export default ${JSON.stringify(data)}`
    },
    handleHotUpdate({ file, server }) {
      if (file.startsWith(components) || file.startsWith(foundations)) {
        const mod = server.moduleGraph.getModuleById(RESOLVED)
        if (mod) server.moduleGraph.invalidateModule(mod)
      }
    },
  }
}
