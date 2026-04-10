import { redirect } from 'next/navigation'
import { OpsDashboardClient } from '@/components/ops/OpsDashboardClient'
import { OpsPageShell } from '@/components/ops/OpsPageShell'
import { getOpsSession } from '@/lib/opsAuth'
import { getOpsOrders } from '@/lib/orders'
import type { Order } from '@/types/order'

export const metadata = { title: 'Ops Dashboard' }

export default async function OpsPage() {
  const session = await getOpsSession()
  if (!session) {
    redirect('/ops/login')
  }

  const { data } = await getOpsOrders({
    statuses: ['paid', 'shipped', 'delivered', 'cancelled'],
    limit: 60,
  })
  const orders = (data as Order[] | null) ?? []

  return (
    <OpsPageShell maxWidth="3xl">
      <OpsDashboardClient initialOrders={orders} />
    </OpsPageShell>
  )
}
