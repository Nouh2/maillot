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

const BESTSELLER_PRODUCT_PRIORITY = [
  { slug: 'france-maillot-exterieur-2026' },
  { slug: 'portugal-maillot-exterieur-version-joueur-2026' },
  { slug: 'espagne-maillot-exterieur-2026' },
  { club: 'Argentine' },
  { club: 'Angleterre' },
  { club: 'Maroc' },
  { club: 'Algérie' },
] as const

const BESTSELLER_CLUB_FALLBACK_ORDER = [
  'France',
  'Maroc',
  'Algérie',
  'Portugal',
  'Argentine',
  'Bresil',
  'Espagne',
  'Angleterre',
  'Allemagne',
  'Italie',
]

function normalizeRankValue(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

function matchesPriorityProduct(
  product: Product,
  priority: (typeof BESTSELLER_PRODUCT_PRIORITY)[number],
) {
  if ('slug' in priority) return product.slug === priority.slug
  if (normalizeRankValue(product.club) !== normalizeRankValue(priority.club)) return false
  return !('type' in priority) || product.type === priority.type
}

function getPriorityClubRank(product: Product) {
  const productRank = BESTSELLER_PRODUCT_PRIORITY.findIndex((priority) => matchesPriorityProduct(product, priority))
  if (productRank !== -1) return productRank

  const clubRank = BESTSELLER_CLUB_FALLBACK_ORDER.findIndex(
    (club) => normalizeRankValue(product.club) === normalizeRankValue(club),
  )
  return BESTSELLER_PRODUCT_PRIORITY.length + (clubRank === -1 ? BESTSELLER_CLUB_FALLBACK_ORDER.length : clubRank)
}

function getWorldCupSalesRank(product: Product) {
  const clubRank = getPriorityClubRank(product)
  const productKindRank = product.product_kind === 'jersey' ? 0 : 1
  const typeRank = product.type === 'domicile' ? 0 : product.type === 'exterieur' ? 1 : 2
  const fanRank = product.jersey_version === 'fan' ? 0 : 1

  return clubRank * 1000 + productKindRank * 100 + fanRank * 10 + typeRank
}

function sortWorldCupForAds(products: Product[]) {
  return [...products].sort((left, right) => {
    const rankDiff = getWorldCupSalesRank(left) - getWorldCupSalesRank(right)
    if (rankDiff !== 0) return rankDiff
    return left.name.localeCompare(right.name, 'fr-FR', { sensitivity: 'base' })
  })
}

function getWorldCupHighlightProducts(products: Product[]) {
  return BESTSELLER_PRODUCT_PRIORITY.flatMap((priority) => {
    const match =
      products.find(
        (product) =>
          matchesPriorityProduct(product, priority) &&
          product.product_kind === 'jersey' &&
          product.jersey_version === 'fan',
      ) ??
      products.find(
        (product) => matchesPriorityProduct(product, priority) && product.product_kind === 'jersey',
      ) ??
      products.find((product) => matchesPriorityProduct(product, priority))

    return match ? [match] : []
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
    highlightProducts: getWorldCupHighlightProducts(products),
    showConversionBreaks: true,
  }

  return (
    <>
      <Suspense fallback={<FilteredCollectionFallback {...collectionProps} />}>
        <FilteredCollectionClient {...collectionProps} />
      </Suspense>
      <a
        href="#worldcup-best-sellers"
        className="fixed inset-x-3 bottom-[calc(var(--ma-sticky-bottom-offset)+12px)] z-[80] flex min-h-[52px] items-center justify-center rounded-md bg-[var(--terra)] px-4 py-3 text-center font-condensed text-sm font-bold uppercase tracking-[0.16em] text-white shadow-[0_-8px_24px_rgba(0,0,0,0.08)] md:hidden"
      >
        Voir les best-sellers
      </a>
    </>
  )
}
