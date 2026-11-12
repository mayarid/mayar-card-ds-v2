import { createFileRoute, notFound } from '@tanstack/react-router'

import { getComponentDoc } from '@/docs'
import { ComponentPage } from '@/gallery/component-page'

export const Route = createFileRoute('/components/$slug')({
  loader: ({ params }) => {
    const doc = getComponentDoc(params.slug)
    if (!doc) throw notFound()
    return { slug: doc.slug, name: doc.name }
  },
  component: ComponentRoute,
})

function ComponentRoute() {
  const { slug } = Route.useLoaderData()
  const doc = getComponentDoc(slug)
  if (!doc) return null
  // Keyed by slug so the playground state resets between components.
  return (
    <>
      <title>{`${doc.name} · Mayar Card DS v2`}</title>
      <ComponentPage key={slug} doc={doc} />
    </>
  )
}
