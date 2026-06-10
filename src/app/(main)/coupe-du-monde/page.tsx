import { Suspense } from 'react'
import type { Metadata } from 'next'
import { FilteredCollectionClient, FilteredCollectionFallback } from '@/components/products/FilteredCollectionClient'
import { dedupeCatalogProducts } from '@/lib/catalogPresentation'
import { getWorldCupProducts } from '@/lib/supabase/queries'

export const metadata: Metadata = {
  title: 'Maillots Coupe du Monde 2026',
  description: 'Selection de maillots des equipes qualifiees pour la Coupe du Monde 2026',
}
export const revalidate = 21600

export default async function CoupeDuMondePage() {
  const products = dedupeCatalogProducts(await getWorldCupProducts())
  const collectionProps = {
    title: 'COUPE DU MONDE',
    breadcrumbLabel: 'Coupe du Monde',
    products,
    showLeague: false,
    showClub: true,
    showType: false,
    showDate: false,
  }

  return (
    <Suspense fallback={<FilteredCollectionFallback {...collectionProps} />}>
      <FilteredCollectionClient {...collectionProps} />
    </Suspense>
  )
}
