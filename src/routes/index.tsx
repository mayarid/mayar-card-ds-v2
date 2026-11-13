import { createFileRoute, Link } from '@tanstack/react-router'

import { Button } from '@/components/ui/button'
import { componentsByGroup, foundationList } from '@/docs'
import { FoundationVisual } from '@/gallery/foundation-tile'
import { DocPage } from '@/gallery/page'
import { REPO_URL } from '@/site'

export const Route = createFileRoute('/')({ component: Overview })

const linkText =
  'rounded-sm text-ink outline-none underline decoration-border underline-offset-[3px] transition-colors duration-(--motion-quick) hover-fine:decoration-ink focus-visible:outline-focus'

function Overview() {
  return (
    <DocPage>
      <title>Mayar Card design system</title>
      <header className="flex flex-col gap-3">
        <h1 className="text-title-lg text-ink">Mayar Card design system</h1>
        <div className="flex max-w-[62ch] flex-col gap-3 text-body-lg text-pretty text-ink-2">
          <p>
            The foundations and React components behind Mayar Card. Each page shows the live component, its variants and
            states, and the code to copy.
          </p>
          <p>
            Add the theme once. Then add each component with the shadcn CLI, or copy its file.
          </p>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-3">
          <Button render={<Link to="/installation" />}>Install the theme</Button>
          <a href={REPO_URL} className={`text-body-sm font-medium pointer-coarse:py-3 ${linkText}`}>
            Source on GitHub
          </a>
        </div>
      </header>

      <section aria-labelledby="foundations-title" className="flex flex-col gap-5">
        <h2 id="foundations-title" className="text-title-md text-ink">
          Foundations
        </h2>
        <ul className="grid gap-x-5 gap-y-8 sm:grid-cols-2">
          {foundationList.map((doc) => (
            <li key={doc.slug}>
              <Link
                to="/foundations/$slug"
                params={{ slug: doc.slug }}
                className="group flex flex-col gap-3 rounded-xl outline-none focus-visible:outline-focus"
              >
                <FoundationVisual slug={doc.slug} />
                <span className="flex flex-col gap-1 px-0.5">
                  <span className="text-title-sm text-ink">{doc.name}</span>
                  <span className="text-body-sm text-pretty text-ink-2">{doc.description}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="components-title" className="flex flex-col gap-5">
        <h2 id="components-title" className="text-title-md text-ink">
          Components
        </h2>
        <div className="flex flex-col gap-8">
          {componentsByGroup().map(({ group, items }) => (
            <div key={group} className="grid gap-x-8 gap-y-2 md:grid-cols-[140px_minmax(0,1fr)]">
              <h3 id={`group-${group}`} className="pt-3 text-body-sm font-medium text-muted">
                {group}
              </h3>
              <ul aria-labelledby={`group-${group}`} className="flex flex-col">
                {items.map((doc) => (
                  <li key={doc.slug} className="border-t border-border-subtle first:border-t-0 md:first:border-t">
                    <Link
                      to="/components/$slug"
                      params={{ slug: doc.slug }}
                      className="group -mx-2 flex flex-col gap-0.5 rounded-lg px-2 py-3 outline-none focus-visible:outline-focus"
                    >
                      <span className="text-body-base font-medium text-ink underline decoration-transparent underline-offset-[3px] transition-colors duration-(--motion-quick) group-hover:decoration-border">
                        {doc.name}
                      </span>
                      <span className="text-body-sm text-pretty text-ink-2">{doc.description}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </DocPage>
  )
}
