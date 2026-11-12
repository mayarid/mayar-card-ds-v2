// Builds registry.json from the files in src/registry. Run before `shadcn build`.
// A UI file joins the registry when it is added: its npm and registry dependencies come from its imports.
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { basename, join } from 'node:path'

const SITE_URL = 'https://mayarid.github.io/mayar-card-ds-v2'
const pkg = JSON.parse(readFileSync('package.json', 'utf8'))
const versions = { ...pkg.dependencies }

const url = (name) => `${SITE_URL}/r/${name}.json`

function npmDeps(source) {
  const deps = new Set()
  for (const [, spec] of source.matchAll(/from ['"]([^'"./][^'"]*)['"]/g)) {
    if (spec.startsWith('@/')) continue
    if (spec === 'react' || spec === 'react-dom' || spec.startsWith('react/')) continue
    const name = spec.startsWith('@') ? spec.split('/').slice(0, 2).join('/') : spec.split('/')[0]
    deps.add(name)
  }
  return [...deps].sort().map((name) => (versions[name] ? `${name}@${versions[name]}` : name))
}

function localDeps(source) {
  const deps = new Set()
  for (const [, name] of source.matchAll(/from ['"]@\/components\/ui\/([\w-]+)['"]/g)) deps.add(name)
  for (const [, name] of source.matchAll(/from ['"]@\/hooks\/([\w-]+)['"]/g)) deps.add(name)
  if (/from ['"]@\/lib\/utils['"]/.test(source)) deps.add('utils')
  return [...deps]
}

function describe(source, fallback) {
  // The first sentence of the JSDoc block directly above a top-level function.
  const blocks = [...source.matchAll(/\/\*\*((?:(?!\*\/)[\s\S])*)\*\/\s*\n(?:export\s+)?function\s+[A-Z]/g)]
  if (blocks.length === 0) return fallback
  const text = blocks[0][1]
    .split('\n')
    .map((line) => line.replace(/^\s*\*\s?/, '').trim())
    .filter((line) => line && !line.startsWith('@'))
    .join(' ')
  const sentence = text.match(/^.*?[.!?](\s|$)/)
  return (sentence ? sentence[0] : text).trim()
}

const title = (name) => name.replace(/(^|-)(\w)/g, (_, dash, c) => (dash ? ' ' : '') + c.toUpperCase())

const items = [
  {
    name: 'utils',
    type: 'registry:lib',
    title: 'Utils',
    description: 'cn() class helper that knows the Mayar type scale.',
    dependencies: npmDeps(readFileSync('src/registry/lib/utils.ts', 'utf8')),
    files: [{ path: 'src/registry/lib/utils.ts', type: 'registry:lib' }],
  },
  {
    name: 'theme',
    type: 'registry:item',
    title: 'Mayar Card v2 theme',
    description: 'All design tokens, state variants (hover-fine, pressed, focus-ring, opened) and utilities.',
    registryDependencies: [url('utils')],
    dependencies: [
      `@fontsource-variable/plus-jakarta-sans@${versions['@fontsource-variable/plus-jakarta-sans']}`,
      `@fontsource-variable/jetbrains-mono@${versions['@fontsource-variable/jetbrains-mono']}`,
    ],
    files: [{ path: 'src/registry/styles/theme.css', type: 'registry:file', target: '~/src/styles/mayar-theme.css' }],
  },
]

const hooksDir = 'src/registry/hooks'
let hookFiles = []
try {
  hookFiles = readdirSync(hooksDir).filter((f) => /\.tsx?$/.test(f) && !f.includes('.test.'))
} catch {
  // no hooks yet
}
for (const file of hookFiles) {
  const name = basename(file).replace(/\.tsx?$/, '')
  const source = readFileSync(join(hooksDir, file), 'utf8')
  items.push({
    name,
    type: 'registry:hook',
    title: title(name),
    description: describe(source, `${title(name)} hook.`),
    dependencies: npmDeps(source),
    registryDependencies: localDeps(source).map(url),
    files: [{ path: join(hooksDir, file), type: 'registry:hook' }],
  })
}

const uiDir = 'src/registry/ui'
for (const file of readdirSync(uiDir).filter((f) => f.endsWith('.tsx') && !f.includes('.test.')).sort()) {
  const name = basename(file, '.tsx')
  const source = readFileSync(join(uiDir, file), 'utf8')
  items.push({
    name,
    type: 'registry:ui',
    title: title(name),
    description: describe(source, `${title(name)} component.`),
    dependencies: npmDeps(source),
    registryDependencies: [url('theme'), ...localDeps(source).map(url)],
    files: [{ path: join(uiDir, file), type: 'registry:ui' }],
  })
}

const registry = {
  $schema: 'https://ui.shadcn.com/schema/registry.json',
  name: 'mayar-card-ds-v2',
  homepage: SITE_URL,
  items,
}

writeFileSync('registry.json', JSON.stringify(registry, null, 2) + '\n')
console.log(`gen-registry: ${items.length} items`)
