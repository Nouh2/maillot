import { Suspense } from 'react'
import type { Metadata } from 'next'
import { FilteredCollectionClient, FilteredCollectionFallback } from '@/components/products/FilteredCollectionClient'
import { getConceptProducts } from '@/lib/supabase/queries'

export const metadata: Metadata = {
  title: 'Maillots Concept',
  description: 'Selection manuelle de maillots concept et editions creatives.',
}
export const revalidate = 21600

export default async function ConceptPage() {
  const products = await getConceptProducts()
  const collectionProps = {
    title: 'MAILLOTS CONCEPT',
    breadcrumbLabel: 'Concept',
    products,
    emptyTitle: 'Selection concept en cours',
    emptyDescription: 'Les maillots concept sont desormais separes du retro et seront ajoutes manuellement.',
    showLeague: false,
    showType: false,
    showDate: false,
  }

  return (
    <Suspense fallback={<FilteredCollectionFallback {...collectionProps} />}>
      <FilteredCollectionClient {...collectionProps} />
    </Suspense>
  )
}
