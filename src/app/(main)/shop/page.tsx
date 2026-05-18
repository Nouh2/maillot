import type { Metadata } from 'next'
import { Suspense } from 'react'
import { ShopCatalogClient, ShopCatalogFallback } from '@/components/products/ShopCatalogClient'
import { getLeagues, getProducts } from '@/lib/supabase/queries'

export const metadata: Metadata = { title: 'Tous les Maillots' }
export const revalidate = 21600

export default async function ShopPage() {
  const [products, leagues] = await Promise.all([getProducts(), getLeagues()])

  return (
    <Suspense fallback={<ShopCatalogFallback products={products} />}>
      <ShopCatalogClient products={products} leagues={leagues} />
    </Suspense>
  )
}
