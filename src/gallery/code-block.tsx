import { useEffect, useState } from 'react'

import { cn } from '@/lib/utils'

import { CopyButton } from './copy-button'
import { getCachedHighlight, highlight, type CodeLang } from './highlight'

interface CodeBlockProps {
  code: string
  lang?: CodeLang
  /** File name shown in the header bar. */
  title?: string
  className?: string
  /** Caps the height and scrolls. */
  maxHeight?: number
}

export function CodeBlock({ code, lang = 'tsx', title, className, maxHeight }: CodeBlockProps) {
  const [html, setHtml] = useState(() => getCachedHighlight(code, lang))

  useEffect(() => {
    let live = true
    void highlight(code, lang).then((result) => {
      if (live) setHtml(result)
    })
    return () => {
      live = false
    }
  }, [code, lang])

  return (
    <div
      data-slot="code-block"
      className={cn('group/code relative overflow-hidden rounded-2xl bg-surface shadow-ring', className)}
    >
      {title ? (
        <div className="flex h-10 items-center justify-between border-b border-border-subtle pr-1.5 pl-4">
          <span className="font-mono text-caption-lg text-ink-2">{title}</span>
          <CopyButton value={code} />
        </div>
      ) : (
        <CopyButton value={code} className="absolute top-1.5 right-1.5 z-(--z-raised) bg-surface" />
      )}
      <div
        className="code-scroll overflow-auto py-3 pr-12 pl-4 font-mono text-caption-lg [&_pre]:bg-transparent! [&_pre]:outline-none"
        style={maxHeight ? { maxHeight } : undefined}
        tabIndex={0}
        role="region"
        aria-label={title ? `${title} source` : 'Code'}
      >
        {html ? (
          // Shiki output is generated from our own source strings.
          <div dangerouslySetInnerHTML={{ __html: html }} />
        ) : (
          <pre className="text-ink">
            <code>{code}</code>
          </pre>
        )}
      </div>
    </div>
  )
}
