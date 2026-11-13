import { createFileRoute, notFound } from '@tanstack/react-router'

import { loadComponentDoc } from '@/docs'
import { ComponentPage } from '@/gallery/component-page'

export const Route = createFileRoute('/components/$slug')({
  loader: async ({ params }) => {
    const doc = await loadComponentDoc(params.slug)
    if (!doc) throw notFound()
    return { doc }
  },
  component: ComponentRoute,
})

function ComponentRoute() {
  const { doc } = Route.useLoaderData()
  return (
    <>
      <title>{`${doc.name} · Mayar Card design system`}</title>
      {/* Keyed by slug so the playground state resets between components. */}
      <ComponentPage key={doc.slug} doc={doc} />
    </>
  )
}
