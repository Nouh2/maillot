import { Suspense } from 'react'
import type { Metadata } from 'next'
import { FilteredCollectionClient, FilteredCollectionFallback } from '@/components/products/FilteredCollectionClient'
import { getLeagues, getRetroProducts } from '@/lib/supabase/queries'

export const metadata: Metadata = {
  title: 'Maillots Retro',
  description: 'Collection de maillots de football retro et vintage.',
}
export const revalidate = 21600

export default async function RetroPage() {
  const [products, leagues] = await Promise.all([getRetroProducts(), getLeagues()])
  const collectionProps = {
    title: 'MAILLOTS RETRO',
    breadcrumbLabel: 'Retro',
    products,
    leagues,
  }

  return (
    <Suspense fallback={<FilteredCollectionFallback {...collectionProps} />}>
      <FilteredCollectionClient {...collectionProps} />
    </Suspense>
  )
}
