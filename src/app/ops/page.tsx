import { redirect } from 'next/navigation'
import { OpsDashboardClient } from '@/components/ops/OpsDashboardClient'
import { OpsInstallPrompt } from '@/components/ops/OpsInstallPrompt'
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
    <div className="min-h-screen bg-[var(--cream)] px-4 py-6 sm:px-6">
      <div className="mx-auto max-w-3xl space-y-4">
        <OpsInstallPrompt />
        <OpsDashboardClient initialOrders={orders} />
      </div>
    </div>
  )
}
