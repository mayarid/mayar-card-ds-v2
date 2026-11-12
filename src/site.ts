/** Public URL of the deployed gallery. The registry lives at `${SITE_URL}/r/<name>.json`. */
export const SITE_URL = 'https://mayarid.github.io/mayar-card-ds-v2'
export const REPO_URL = 'https://github.com/mayarid/mayar-card-ds-v2'

export function registryUrl(name: string) {
  return `${SITE_URL}/r/${name}.json`
}

export function installCommand(name: string) {
  return `npx shadcn@latest add ${registryUrl(name)}`
}
