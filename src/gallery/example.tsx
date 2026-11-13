import type { ExampleDef } from '@/docs/types'

import { CodeBlock } from './code-block'
import { CopyButton } from './copy-button'
import { getExample } from './examples'
import { PreviewFrame } from './preview-frame'
import { ViewTabs } from './view-tabs'

export function Example({ def }: { def: ExampleDef }) {
  const example = getExample(def.id)
  if (!example) {
    return <p className="text-body-sm text-danger-text">Missing example: {def.id}</p>
  }
  const { Component, code } = example
  return (
    <ViewTabs
      actions={<CopyButton value={code} label={`Copy the code for ${def.title}`} />}
      items={[
        {
          value: 'preview',
          label: 'Preview',
          content: (
            <PreviewFrame>
              <Component />
            </PreviewFrame>
          ),
        },
        { value: 'code', label: 'Code', content: <CodeBlock bare copy={false} code={code} maxHeight={480} /> },
      ]}
    />
  )
}
