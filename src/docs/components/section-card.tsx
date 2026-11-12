import {
  SectionCard,
  SectionCardAside,
  SectionCardBody,
  SectionCardFooter,
  SectionCardHeader,
  SectionCardTitle,
} from '@/components/ui/section-card'
import type { ComponentDoc, PropValue } from '@/docs/types'
import sectionCardSource from '@/registry/ui/section-card.tsx?raw'

function render(props: Record<string, PropValue>) {
  return (
    <SectionCard className="w-full max-w-md">
      <SectionCardHeader>
        <SectionCardTitle>{String(props.title ?? 'Akun')}</SectionCardTitle>
        {props.aside ? <SectionCardAside className="text-caption-lg text-ink-2">2 tindakan</SectionCardAside> : null}
      </SectionCardHeader>
      <SectionCardBody flush={Boolean(props.flush)}>
        <p className="m-0 text-body-sm text-ink-2">Isi kartu.</p>
      </SectionCardBody>
      {props.foot ? <SectionCardFooter className="text-caption-lg text-ink-2">Catatan kaki</SectionCardFooter> : null}
    </SectionCard>
  )
}

function code(props: Record<string, PropValue>) {
  const lines = [
    '<SectionCard>',
    '  <SectionCardHeader>',
    `    <SectionCardTitle>${String(props.title ?? 'Akun')}</SectionCardTitle>`,
    ...(props.aside ? ['    <SectionCardAside>2 tindakan</SectionCardAside>'] : []),
    '  </SectionCardHeader>',
    `  <SectionCardBody${props.flush ? ' flush' : ''}>…</SectionCardBody>`,
    ...(props.foot ? ['  <SectionCardFooter>Catatan kaki</SectionCardFooter>'] : []),
    '</SectionCard>',
  ]
  return lines.join('\n')
}

export const doc: ComponentDoc = {
  slug: 'section-card',
  name: 'Section Card',
  group: 'Surfaces',
  description:
    'A titled card built on Surface: a 56px head with a title and an optional aside, a body and an optional foot.',
  spec: 'code-only',
  registry: 'section-card',
  source: [{ path: 'components/ui/section-card.tsx', code: sectionCardSource }],
  playground: {
    controls: [
      { name: 'title', type: 'text', default: 'Akun' },
      { name: 'aside', type: 'boolean', default: true },
      { name: 'foot', type: 'boolean', default: false },
      { name: 'flush', type: 'boolean', default: false },
    ],
    render,
    code,
  },
  matrices: [
    {
      title: 'Parts',
      rows: [
        { label: 'Title only', codeOnly: true },
        { label: 'With aside', props: { aside: true }, codeOnly: true },
        { label: 'With foot', props: { aside: true, foot: true }, codeOnly: true },
        { label: 'Flush body', props: { flush: true }, codeOnly: true },
      ],
      columns: [{ label: 'Specimen' }],
      render,
      code,
      cellWidth: 420,
    },
  ],
  examples: [
    { id: 'section-card/basic', title: 'Basic', description: 'Title and an aside action.', codeOnly: true },
    { id: 'section-card/flush-list', title: 'Flush list with foot', description: 'flush lets a list own its rows.', codeOnly: true },
  ],
  props: [
    { name: 'SectionCard', type: 'Surface props', description: 'Rest props and ref go on the Surface root (role="region").' },
    { name: 'elevated', type: 'boolean', default: 'true', description: 'The control shadow.' },
    { name: 'SectionCardTitle render', type: 'ReactElement', default: '<h2 />', description: 'Change the heading level: render={<h3 />}.' },
    { name: 'SectionCardBody flush', type: 'boolean', default: 'false', description: 'No padding and no gap, for tables and lists.' },
    { name: 'SectionCardAside / SectionCardFooter', type: 'div', description: 'Content at the end of the head; content under the body.' },
  ],
  guidelines: {
    do: ['Use it for every card that has a header row.', 'Keep the aside small: a hint, a link or one small action.'],
    dont: ['Do not hand-roll a head with its own border and height inside a Surface.'],
  },
  notes: [
    'Code-only: no specimen on the Wonder page. Source: the admin user detail cards in the shipped app.',
    'The app took title, aside and foot as props and snippets. This port uses compound parts; the title gives the region its name.',
  ],
}
