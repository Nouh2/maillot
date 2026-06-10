import { Suspense } from 'react'
import type { Metadata } from 'next'
import { FilteredCollectionClient, FilteredCollectionFallback } from '@/components/products/FilteredCollectionClient'
import { dedupeCatalogProducts } from '@/lib/catalogPresentation'
import { getWorldCupProducts } from '@/lib/supabase/queries'
import type { Product } from '@/types/product'

export const metadata: Metadata = {
  title: 'Maillots Coupe du Monde 2026',
  description: 'Selection de maillots des equipes qualifiees pour la Coupe du Monde 2026',
}
export const revalidate = 21600

const BESTSELLER_CLUB_ORDER = [
  'France',
  'Maroc',
  'Algérie',
  'Portugal',
  'Argentine',
  'Brésil',
  'Espagne',
  'Angleterre',
  'Allemagne',
  'Italie',
]

function getWorldCupSalesRank(product: Product) {
  const clubRank = BESTSELLER_CLUB_ORDER.findIndex((club) => product.club.toLowerCase() === club.toLowerCase())
  const normalizedClubRank = clubRank === -1 ? BESTSELLER_CLUB_ORDER.length : clubRank
  const typeRank = product.type === 'domicile' ? 0 : product.type === 'exterieur' ? 1 : 2
  const fanRank = product.jersey_version === 'fan' ? 0 : 1

  return normalizedClubRank * 100 + typeRank * 10 + fanRank
}

function sortWorldCupForAds(products: Product[]) {
  return [...products].sort((left, right) => {
    const rankDiff = getWorldCupSalesRank(left) - getWorldCupSalesRank(right)
    if (rankDiff !== 0) return rankDiff
    return left.name.localeCompare(right.name, 'fr-FR', { sensitivity: 'base' })
  })
}

export default async function CoupeDuMondePage() {
  const products = sortWorldCupForAds(dedupeCatalogProducts(await getWorldCupProducts()))
  const collectionProps = {
    title: 'COUPE DU MONDE',
    breadcrumbLabel: 'Coupe du Monde',
    products,
    showLeague: false,
    showClub: true,
    showType: false,
    showDate: false,
    showAlpha: false,
    compactHeader: true,
    showHeaderTrust: true,
    highlightProducts: products.slice(0, 4),
    showConversionBreaks: true,
  }

  return (
    <>
      <Suspense fallback={<FilteredCollectionFallback {...collectionProps} />}>
        <FilteredCollectionClient {...collectionProps} />
      </Suspense>
      <a
        href="#worldcup-best-sellers"
        className="fixed inset-x-3 bottom-3 z-[80] flex min-h-[52px] items-center justify-center rounded-md bg-[var(--terra)] px-4 py-3 text-center font-condensed text-sm font-bold uppercase tracking-[0.16em] text-white shadow-[0_-8px_24px_rgba(0,0,0,0.08)] md:hidden"
      >
        Voir les best-sellers
      </a>
    </>
  )
}
