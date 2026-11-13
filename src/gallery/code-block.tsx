import { useEffect, useState } from 'react'

import { cn } from '@/lib/utils'

import { CopyButton } from './copy-button'
import { getCachedHighlight, highlight, type CodeLang } from './highlight'
import { frameClass } from './preview-frame'

interface CodeBlockProps {
  code: string
  lang?: CodeLang
  /** File name shown in the header bar. Use it when the file name is the point. */
  title?: string
  className?: string
  /** Caps the height and scrolls. */
  maxHeight?: number
  /** Leaves out the frame, for code that sits inside another frame. */
  bare?: boolean
  /** Shows the copy button. Turn it off when the frame already has one. */
  copy?: boolean
}

export function CodeBlock({ code, lang = 'tsx', title, className, maxHeight, bare = false, copy = true }: CodeBlockProps) {
  const [html, setHtml] = useState(() => getCachedHighlight(code, lang))
  const multiline = code.trim().includes('\n')

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
    <div data-slot="code-block" className={cn('group/code relative', bare ? 'bg-surface' : frameClass, className)}>
      {title ? (
        <div className="flex h-10 items-center justify-between border-b border-border-subtle pr-1.5 pl-4">
          <span className="truncate font-mono text-caption-lg text-ink-2">{title}</span>
          {copy ? <CopyButton value={code} /> : null}
        </div>
      ) : copy ? (
        <CopyButton value={code} className="absolute top-2 right-2 z-(--z-raised) bg-surface" />
      ) : null}
      <div
        className={cn(
          'code-scroll overflow-auto py-4 pl-4 [&_pre]:bg-transparent! [&_pre]:outline-none',
          multiline && 'code-lines',
          copy && !title ? 'pr-14' : 'pr-4',
        )}
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
