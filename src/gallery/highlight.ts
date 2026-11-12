import { createHighlighterCore, type HighlighterCore } from 'shiki/core'
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript'

export type CodeLang = 'tsx' | 'css' | 'bash' | 'json'

let highlighter: Promise<HighlighterCore> | undefined

/** One shared highlighter, loaded on first use, with only the languages the site needs. */
function getHighlighter() {
  highlighter ??= createHighlighterCore({
    themes: [import('shiki/themes/github-light-default.mjs')],
    langs: [
      import('shiki/langs/tsx.mjs'),
      import('shiki/langs/css.mjs'),
      import('shiki/langs/bash.mjs'),
      import('shiki/langs/json.mjs'),
    ],
    engine: createJavaScriptRegexEngine(),
  })
  return highlighter
}

const cache = new Map<string, string>()

export async function highlight(code: string, lang: CodeLang): Promise<string> {
  const key = `${lang}\u0000${code}`
  const hit = cache.get(key)
  if (hit) return hit
  const shiki = await getHighlighter()
  const html = shiki.codeToHtml(code, { lang, theme: 'github-light-default' })
  cache.set(key, html)
  return html
}

export function getCachedHighlight(code: string, lang: CodeLang): string | undefined {
  return cache.get(`${lang}\u0000${code}`)
}
