declare module 'virtual:docs-manifest' {
  interface ManifestEntry {
    slug: string
    name: string
    group?: string
    spec?: string
    description: string
    order?: number
  }
  const manifest: { components: ManifestEntry[]; foundations: ManifestEntry[] }
  export default manifest
}
