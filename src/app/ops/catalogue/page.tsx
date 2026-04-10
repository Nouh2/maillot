import { redirect } from 'next/navigation'
import { OpsCatalogClient } from '@/components/ops/OpsCatalogClient'
import { OpsPageShell } from '@/components/ops/OpsPageShell'
import { getOpsLeagueOptions, getOpsProductById, getOpsProductSummaries } from '@/lib/opsCatalog'
import { getOpsSession } from '@/lib/opsAuth'

export const metadata = { title: 'Ops Catalogue' }

export default async function OpsCataloguePage() {
  const session = await getOpsSession()
  if (!session) {
    redirect('/ops/login')
  }

  const [products, leagues] = await Promise.all([getOpsProductSummaries(), getOpsLeagueOptions()])
  const initialProduct = products[0] ? await getOpsProductById(products[0].id) : null

  return (
    <OpsPageShell maxWidth="7xl">
      <OpsCatalogClient initialProducts={products} initialProduct={initialProduct} leagues={leagues} />
    </OpsPageShell>
  )
}
