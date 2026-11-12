import { createFileRoute, notFound } from '@tanstack/react-router'

import { loadFoundationDoc } from '@/docs'
import { DocPage, PageHeader } from '@/gallery/page'

export const Route = createFileRoute('/foundations/$slug')({
  loader: async ({ params }) => {
    const doc = await loadFoundationDoc(params.slug)
    if (!doc) throw notFound()
    return { doc }
  },
  component: FoundationRoute,
})

function FoundationRoute() {
  const { doc } = Route.useLoaderData()
  const { Page } = doc
  return (
    <DocPage>
      <title>{`${doc.name} · Mayar Card DS v2`}</title>
      <PageHeader
        eyebrow={<span className="text-overline text-muted uppercase">Foundations</span>}
        title={doc.name}
        description={doc.description}
      />
      <Page key={doc.slug} />
    </DocPage>
  )
}
