import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { FilteredCollectionClient, FilteredCollectionFallback } from '@/components/products/FilteredCollectionClient'
import { getLeagueBySlug, getLeagueNavigationOptions } from '@/lib/catalog'
import { dedupeCatalogProducts, filterStandardCatalogProducts, getClubFilterOptions } from '@/lib/catalogPresentation'
import { getLeagues, getProducts } from '@/lib/supabase/queries'

interface Props {
  params: Promise<{ slug: string }>
}

export const revalidate = 21600

export async function generateStaticParams() {
  const leagues = await getLeagues()
  return getLeagueNavigationOptions(leagues).map((league) => ({ slug: league.slug }))
}

export async function generateMetadata({ params }: Pick<Props, 'params'>): Promise<Metadata> {
  const { slug } = await params
  const leagues = await getLeagues()
  const league = getLeagueBySlug(slug, leagues)
  if (!league) return {}
  return { title: `Maillots ${league.name}` }
}

export default async function LeaguePage({ params }: Props) {
  const { slug } = await params
  const leagues = await getLeagues()
  const league = getLeagueBySlug(slug, leagues)
  if (!league) notFound()

  const products = await getProducts({ league: league.name })
  const visibleProducts = dedupeCatalogProducts(filterStandardCatalogProducts(products))
  const collectionProps = {
    title: league.name,
    breadcrumbLabel: league.name,
    products: visibleProducts,
    clubs: getClubFilterOptions(visibleProducts),
    showLeague: false,
    showClub: true,
    showType: false,
    showDate: false,
    emptyTitle: 'Aucun maillot disponible pour ce championnat.',
  }

  return (
    <Suspense fallback={<FilteredCollectionFallback {...collectionProps} />}>
      <FilteredCollectionClient {...collectionProps} />
    </Suspense>
  )
}
