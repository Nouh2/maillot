import { redirect } from 'next/navigation'
import { OpsHomepageCurationClient } from '@/components/ops/OpsHomepageCurationClient'
import { OpsPageShell } from '@/components/ops/OpsPageShell'
import {
  buildHomepageCatalogSource,
  buildHomepageCurationEditorSections,
  getHomepageCurationAssignmentsForOps,
  toHomepageCurationProductOptions,
} from '@/lib/homepageCuration'
import { getOpsSession } from '@/lib/opsAuth'
import { getOpsProductSummaries } from '@/lib/opsCatalog'
import { getLeagues, getProducts } from '@/lib/supabase/queries'

export const metadata = { title: 'Ops Landing' }

export default async function OpsLandingPage() {
  const session = await getOpsSession()
  if (!session) {
    redirect('/ops/login')
  }

  const [rawCatalogProducts, allLeagues, productOptions, assignments] = await Promise.all([
    getProducts(),
    getLeagues(),
    getOpsProductSummaries(),
    getHomepageCurationAssignmentsForOps(),
  ])

  const source = buildHomepageCatalogSource(allLeagues, rawCatalogProducts)
  const sections = buildHomepageCurationEditorSections(source, assignments)

  return (
    <OpsPageShell maxWidth="7xl">
      <OpsHomepageCurationClient
        initialSections={sections}
        productOptions={toHomepageCurationProductOptions(productOptions)}
      />
    </OpsPageShell>
  )
}
