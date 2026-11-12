import { createFileRoute, Link } from '@tanstack/react-router'

import { componentDocs, componentsByGroup, foundationDocs } from '@/docs'
import { DocPage } from '@/gallery/page'

export const Route = createFileRoute('/')({ component: Overview })

function Overview() {
  const wonderCount = componentDocs.filter((d) => d.spec === 'wonder').length
  return (
    <DocPage>
      <title>Mayar Card Design System v2</title>
      <header className="flex flex-col gap-4">
        <p className="text-overline text-primary uppercase">Mayar Card · v2</p>
        <h1 className="max-w-[18ch] text-display text-ink">The design system behind Mayar Card</h1>
        <p className="max-w-[60ch] text-body-lg text-ink-2">
          Foundations and React components from the Wonder Design System page. See every variant and state, and copy the code for each one.
        </p>
        <dl className="mt-2 flex flex-wrap gap-x-8 gap-y-3">
          {[
            [String(foundationDocs.length), 'Foundations'],
            [String(componentDocs.length), 'Components'],
            [String(wonderCount), 'From the Wonder spec'],
          ].map(([value, label]) => (
            <div key={label} className="flex flex-col">
              <dt className="order-2 text-caption-lg text-muted">{label}</dt>
              <dd className="font-mono text-title-lg text-ink tabular-nums">{value}</dd>
            </div>
          ))}
        </dl>
      </header>

      <section aria-labelledby="foundations-title" className="flex flex-col gap-4">
        <h2 id="foundations-title" className="text-title-md text-ink">Foundations</h2>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {foundationDocs.map((doc) => (
            <li key={doc.slug}>
              <Link
                to="/foundations/$slug"
                params={{ slug: doc.slug }}
                className="flex h-full flex-col gap-1 rounded-2xl bg-surface p-4 shadow-control outline-none transition-shadow duration-(--motion-quick) hover-fine:shadow-raised focus-visible:outline-focus"
              >
                <span className="text-title-sm text-ink">{doc.name}</span>
                <span className="line-clamp-2 text-body-sm text-ink-2">{doc.description}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {componentsByGroup().map(({ group, items }) => (
        <section key={group} aria-labelledby={`group-${group}`} className="flex flex-col gap-4">
          <h2 id={`group-${group}`} className="text-title-md text-ink">{group}</h2>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((doc) => (
              <li key={doc.slug}>
                <Link
                  to="/components/$slug"
                  params={{ slug: doc.slug }}
                  className="flex h-full flex-col gap-1 rounded-2xl bg-surface p-4 shadow-control outline-none transition-shadow duration-(--motion-quick) hover-fine:shadow-raised focus-visible:outline-focus"
                >
                  <span className="flex items-center gap-2 text-title-sm text-ink">
                    {doc.name}
                    {doc.spec === 'code-only' ? (
                      <span className="rounded-sm bg-warning-light px-1.5 text-caption-sm text-warning-text">code-only</span>
                    ) : null}
                  </span>
                  <span className="line-clamp-2 text-body-sm text-ink-2">{doc.description}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </DocPage>
  )
}
