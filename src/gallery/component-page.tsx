import type { ComponentDoc } from '@/docs/types'
import { installCommand } from '@/site'

import { CodeBlock } from './code-block'
import { Example } from './example'
import { DocPage, PageHeader, Pill, Section, SubHeading } from './page'
import { Playground } from './playground'
import { StateMatrix } from './state-matrix'
import type { TocItem } from './toc'
import { ViewTabs } from './view-tabs'

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

export function ComponentPage({ doc }: { doc: ComponentDoc }) {
  const toc: TocItem[] = [
    { id: 'installation', label: 'Installation' },
    ...(doc.playground ? [{ id: 'playground', label: 'Playground' }] : []),
    ...(doc.matrices?.length ? [{ id: 'states', label: 'Variants and states' }] : []),
    ...(doc.examples?.length ? [{ id: 'examples', label: 'Examples' }] : []),
    ...(doc.props?.length ? [{ id: 'api', label: 'API' }] : []),
    ...(doc.guidelines ? [{ id: 'guidelines', label: 'Guidelines' }] : []),
    ...(doc.notes?.length ? [{ id: 'notes', label: 'Wonder vs code' }] : []),
    { id: 'source', label: 'Source' },
  ]

  return (
    <DocPage toc={toc}>
      <PageHeader
        title={doc.name}
        description={doc.description}
        eyebrow={
          <>
            <Pill>{doc.group}</Pill>
            {doc.spec === 'wonder' ? (
              <Pill tone="brand">Wonder spec</Pill>
            ) : (
              <Pill tone="warning">Code-only · not on the Wonder page yet</Pill>
            )}
            {doc.baseUi ? (
              <a
                href={doc.baseUi.url}
                className="rounded-pill text-caption-lg text-muted underline-offset-2 outline-none hover-fine:text-ink hover-fine:underline focus-visible:outline-focus"
              >
                Built on Base UI {doc.baseUi.name} ↗
              </a>
            ) : null}
          </>
        }
      >
        {doc.wonderRef ? <p className="text-caption-lg text-muted">Wonder: {doc.wonderRef}</p> : null}
      </PageHeader>

      <Section id="installation" title="Installation">
        <ViewTabs
          items={[
            { value: 'cli', label: 'CLI', content: <CodeBlock code={installCommand(doc.registry)} lang="bash" /> },
            {
              value: 'manual',
              label: 'Manual',
              content: (
                <div className="flex flex-col gap-3">
                  <p className="text-body-sm text-ink-2">
                    Set up the theme once (see Installation). Then copy the files below into your project.
                  </p>
                  {doc.source.map((file) => (
                    <CodeBlock key={file.path} title={file.path} code={file.code} maxHeight={360} />
                  ))}
                </div>
              ),
            },
          ]}
        />
      </Section>

      {doc.playground ? (
        <Section id="playground" title="Playground" description="Change the props. The code below follows.">
          <Playground def={doc.playground} />
        </Section>
      ) : null}

      {doc.matrices?.length ? (
        <Section
          id="states"
          title="Variants and states"
          description="Each cell is the real component. Hover, pressed, focus and open are forced, so you see all states at once. Hover a cell to copy its code."
        >
          <div className="flex flex-col gap-8">
            {doc.matrices.map((matrix) => (
              <div key={matrix.title} id={`states-${slugify(matrix.title)}`} className="flex flex-col gap-3">
                <SubHeading description={matrix.description}>{matrix.title}</SubHeading>
                <StateMatrix def={matrix} />
              </div>
            ))}
          </div>
        </Section>
      ) : null}

      {doc.examples?.length ? (
        <Section id="examples" title="Examples">
          <div className="flex flex-col gap-10">
            {doc.examples.map((example) => (
              <div key={example.id} id={`example-${slugify(example.id)}`} className="flex flex-col gap-3">
                <SubHeading description={example.description}>
                  {example.title}
                  {example.codeOnly ? (
                    <span className="ml-2 align-middle">
                      <Pill tone="warning">code-only</Pill>
                    </span>
                  ) : null}
                </SubHeading>
                <Example def={example} />
              </div>
            ))}
          </div>
        </Section>
      ) : null}

      {doc.props?.length ? (
        <Section id="api" title="API" description="Other props pass through to the rendered element.">
          <div className="overflow-x-auto rounded-2xl bg-surface shadow-ring">
            <table className="w-full min-w-[640px] border-collapse text-left">
              <thead>
                <tr className="border-b border-border-subtle bg-canvas text-caption-lg text-muted">
                  <th scope="col" className="h-10 px-4 font-medium">Prop</th>
                  <th scope="col" className="h-10 px-4 font-medium">Type</th>
                  <th scope="col" className="h-10 px-4 font-medium">Default</th>
                  <th scope="col" className="h-10 px-4 font-medium">Description</th>
                </tr>
              </thead>
              <tbody>
                {doc.props.map((p) => (
                  <tr key={p.name} className="border-b border-border-subtle align-top last:border-b-0">
                    <td className="px-4 py-3 font-mono text-caption-lg text-primary-deep">{p.name}</td>
                    <td className="max-w-[280px] px-4 py-3 font-mono text-caption-lg break-words text-ink-2">{p.type}</td>
                    <td className="px-4 py-3 font-mono text-caption-lg text-ink-2">{p.default ?? '—'}</td>
                    <td className="px-4 py-3 text-body-sm text-ink-2">{p.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      ) : null}

      {doc.guidelines ? (
        <Section id="guidelines" title="Guidelines">
          <div className="grid gap-4 md:grid-cols-2">
            <RuleList tone="do" items={doc.guidelines.do} />
            {doc.guidelines.dont?.length ? <RuleList tone="dont" items={doc.guidelines.dont} /> : null}
          </div>
        </Section>
      ) : null}

      {doc.notes?.length ? (
        <Section
          id="notes"
          title="Wonder vs code"
          description="Where the Wonder page and the shipped app differ, and what this port does."
        >
          <ul className="flex flex-col gap-2 rounded-2xl bg-surface p-5 shadow-ring">
            {doc.notes.map((note) => (
              <li key={note} className="flex gap-2.5 text-body-sm text-ink-2">
                <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-pill bg-primary-300" />
                {note}
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      <Section id="source" title="Source" description="The full component. This is the file the CLI installs.">
        <div className="flex flex-col gap-3">
          {doc.source.map((file) => (
            <CodeBlock key={file.path} title={file.path} code={file.code} maxHeight={560} />
          ))}
        </div>
      </Section>
    </DocPage>
  )
}

function RuleList({ tone, items }: { tone: 'do' | 'dont'; items: string[] }) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-surface p-5 shadow-ring">
      <p className={tone === 'do' ? 'text-title-sm text-success-text' : 'text-title-sm text-danger-text'}>
        {tone === 'do' ? 'Do' : 'Don’t'}
      </p>
      <ul className="flex flex-col gap-2">
        {items.map((item) => (
          <li key={item} className="flex gap-2.5 text-body-sm text-ink-2">
            <span
              aria-hidden
              className={tone === 'do' ? 'mt-2 size-1.5 shrink-0 rounded-pill bg-success' : 'mt-2 size-1.5 shrink-0 rounded-pill bg-danger'}
            />
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}
