import { createFileRoute, notFound } from '@tanstack/react-router'

import { getFoundationDoc } from '@/docs'
import { DocPage, PageHeader } from '@/gallery/page'

export const Route = createFileRoute('/foundations/$slug')({
  loader: ({ params }) => {
    const doc = getFoundationDoc(params.slug)
    if (!doc) throw notFound()
    return { slug: doc.slug }
  },
  component: FoundationRoute,
})

function FoundationRoute() {
  const { slug } = Route.useLoaderData()
  const doc = getFoundationDoc(slug)
  if (!doc) return null
  const { Page } = doc
  return (
    <DocPage>
      <title>{`${doc.name} · Mayar Card DS v2`}</title>
      <PageHeader eyebrow={<span className="text-overline text-muted uppercase">Foundations</span>} title={doc.name} description={doc.description} />
      <Page />
    </DocPage>
  )
}
