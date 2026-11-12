import { createFileRoute } from '@tanstack/react-router'

import { CodeBlock } from '@/gallery/code-block'
import { DocPage, PageHeader, Section } from '@/gallery/page'
import themeSource from '@/registry/styles/theme.css?raw'
import utilsSource from '@/registry/lib/utils.ts?raw'
import { registryUrl } from '@/site'

export const Route = createFileRoute('/installation')({ component: Installation })

const STEPS = [
  { id: 'requirements', label: 'Requirements' },
  { id: 'theme', label: 'Theme' },
  { id: 'fonts', label: 'Fonts' },
  { id: 'components', label: 'Components' },
  { id: 'states', label: 'State variants' },
]

function Installation() {
  return (
    <DocPage toc={STEPS}>
      <title>Installation · Mayar Card DS v2</title>
      <PageHeader
        title="Installation"
        description="Add the Mayar v2 theme to a React + Tailwind v4 app once. Then add components with the shadcn CLI, or copy them by hand."
      />

      <Section id="requirements" title="Requirements">
        <ul className="flex list-disc flex-col gap-1 pl-5 text-body-base text-ink-2">
          <li>React 19 and TypeScript</li>
          <li>Tailwind CSS v4</li>
          <li>
            The shadcn path aliases: <code className="font-mono text-caption-lg">@/components/ui</code> and{' '}
            <code className="font-mono text-caption-lg">@/lib/utils</code> (a <code className="font-mono text-caption-lg">components.json</code> file)
          </li>
        </ul>
      </Section>

      <Section
        id="theme"
        title="Theme"
        description="The theme holds every token, the state variants and the focus and hit-area utilities. The CLI also installs the cn() helper."
      >
        <CodeBlock lang="bash" code={`npx shadcn@latest add ${registryUrl('theme')}`} />
        <p className="text-body-sm text-ink-2">Then import it after Tailwind in your main CSS file:</p>
        <CodeBlock lang="css" code={`@import "tailwindcss";\n@import "./styles/mayar-theme.css";`} />
        <CodeBlock title="lib/utils.ts" code={utilsSource} />
        <CodeBlock title="styles/mayar-theme.css" lang="css" code={themeSource} maxHeight={420} />
      </Section>

      <Section id="fonts" title="Fonts">
        <p className="text-body-base text-ink-2">
          Plus Jakarta Sans is the UI font. Paper Mono is for numbers, codes and labels in tables.
        </p>
        <CodeBlock lang="bash" code={`npm install @fontsource-variable/plus-jakarta-sans`} />
        <CodeBlock lang="css" code={`@import "@fontsource-variable/plus-jakarta-sans";`} />
        <p className="text-body-sm text-ink-2">
          Paper Mono is the only mono font, also for the card number. Download it (v1.000, SIL OFL 1.1) from{' '}
          <a className="text-primary underline underline-offset-2" href="https://paper.design/mono">
            paper.design/mono
          </a>{' '}
          and put <code className="font-mono text-caption-lg">PaperMono-wght.woff2</code> in{' '}
          <code className="font-mono text-caption-lg">public/fonts/paper-mono/</code>.
        </p>
      </Section>

      <Section id="components" title="Components">
        <p className="text-body-base text-ink-2">Each component page has its own command. For example:</p>
        <CodeBlock lang="bash" code={`npx shadcn@latest add ${registryUrl('button')}`} />
        <p className="text-body-sm text-ink-2">
          The CLI also installs the npm packages and the other registry items that a component needs (for example Icon and Spinner).
        </p>
      </Section>

      <Section
        id="states"
        title="State variants"
        description="The theme adds four variants. Use them instead of the plain Tailwind ones, so the states match Wonder."
      >
        <div className="overflow-x-auto rounded-2xl bg-surface shadow-ring">
          <table className="w-full min-w-[560px] text-left">
            <tbody className="text-body-sm text-ink-2">
              {[
                ['hover-fine:', 'Hover on devices with a mouse or trackpad only. Never on a disabled control.'],
                ['pressed:', ':active, not on a disabled control.'],
                ['focus-ring:', ':focus-visible. Pair with the outline-focus utility.'],
                ['opened:', 'A trigger whose popup is open, or a toggle that is on (aria-pressed).'],
              ].map(([name, text]) => (
                <tr key={name} className="border-b border-border-subtle last:border-b-0">
                  <td className="px-4 py-3 font-mono text-caption-lg text-primary-deep">{name}</td>
                  <td className="px-4 py-3">{text}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-body-sm text-ink-2">
          Each variant also matches <code className="font-mono text-caption-lg">data-force-state</code>. This gallery uses it to show a state
          without a pointer. Apps do not need it.
        </p>
      </Section>
    </DocPage>
  )
}
