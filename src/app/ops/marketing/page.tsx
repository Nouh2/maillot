import { redirect } from 'next/navigation'
import { OpsPageShell } from '@/components/ops/OpsPageShell'
import { getOpsSession } from '@/lib/opsAuth'
import { getOpsMarketingSummary, type OpsMarketingSourceSummary } from '@/lib/opsMarketing'
import { formatEuro } from '@/lib/cartPricing'

export const metadata = { title: 'Ops Marketing' }

function metricLabel(value: number) {
  return new Intl.NumberFormat('fr-FR').format(value)
}

function StatCard({ label, value, detail }: { label: string; value: string; detail?: string }) {
  return (
    <article className="rounded-[2rem] border border-[var(--cream-3)] bg-white p-5">
      <p className="font-condensed text-xs uppercase tracking-[0.18em] text-[var(--terra)]">{label}</p>
      <p className="mt-3 font-bebas text-4xl text-[var(--black)]">{value}</p>
      {detail ? <p className="mt-2 text-sm text-[var(--grey)]">{detail}</p> : null}
    </article>
  )
}

function SourceTable({ title, rows }: { title: string; rows: OpsMarketingSourceSummary[] }) {
  return (
    <section className="rounded-[2rem] border border-[var(--cream-3)] bg-white p-5">
      <h2 className="font-condensed text-lg font-bold uppercase tracking-[0.08em] text-[var(--black)]">{title}</h2>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[680px] text-left text-sm">
          <thead className="text-xs uppercase tracking-[0.14em] text-[var(--grey)]">
            <tr>
              <th className="py-3 pr-4">Source</th>
              <th className="py-3 pr-4">Events</th>
              <th className="py-3 pr-4">Checkouts</th>
              <th className="py-3 pr-4">Achats tracks</th>
              <th className="py-3 pr-4">Commandes</th>
              <th className="py-3">CA</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--cream-3)]">
            {rows.length > 0 ? rows.map((row) => (
              <tr key={row.source}>
                <td className="py-3 pr-4 font-medium text-[var(--black)]">{row.source}</td>
                <td className="py-3 pr-4">{metricLabel(row.events)}</td>
                <td className="py-3 pr-4">{metricLabel(row.checkouts)}</td>
                <td className="py-3 pr-4">{metricLabel(row.purchases)}</td>
                <td className="py-3 pr-4">{metricLabel(row.orders)}</td>
                <td className="py-3">{formatEuro(row.revenue)}</td>
              </tr>
            )) : (
              <tr>
                <td className="py-4 text-[var(--grey)]" colSpan={6}>Aucune donnee sur la periode.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default async function OpsMarketingPage() {
  const session = await getOpsSession()
  if (!session) {
    redirect('/ops/login')
  }

  const summary = await getOpsMarketingSummary()

  return (
    <OpsPageShell maxWidth="5xl">
      <div className="space-y-5">
        <section className="rounded-[2rem] border border-[var(--cream-3)] bg-white p-5">
          <p className="font-condensed text-xs uppercase tracking-[0.18em] text-[var(--terra)]">Marketing</p>
          <h1 className="mt-2 font-bebas text-4xl text-[var(--black)]">Tracking campagne</h1>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-[var(--grey)]">
            Vue interne des events envoyés vers GA4 et TikTok Pixel, plus les commandes et relances panier. Période: 7 derniers jours.
          </p>
        </section>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard label="CA commandes" value={formatEuro(summary.totals.revenue)} detail={`${summary.totals.orders} commande(s)`} />
          <StatCard label="Sessions trackees" value={metricLabel(summary.totals.sessions)} detail={`${summary.totals.events} event(s)`} />
          <StatCard label="Leads checkout" value={metricLabel(summary.totals.checkoutLeads)} detail={`${summary.totals.recoveredLeads} récupéré(s)`} />
          <StatCard label="Clic IDs" value={metricLabel(summary.totals.tiktokClicks)} detail={`TikTok. Google ${summary.totals.googleClicks}, Meta ${summary.totals.metaClicks}`} />
        </div>

        <section className="rounded-[2rem] border border-[var(--cream-3)] bg-white p-5">
          <h2 className="font-condensed text-lg font-bold uppercase tracking-[0.08em] text-[var(--black)]">Funnel</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-3 xl:grid-cols-6">
            {summary.funnel.map((step) => (
              <article key={step.eventName} className="rounded-2xl bg-[var(--cream)] p-4">
                <p className="text-xs text-[var(--grey)]">{step.label}</p>
                <p className="mt-2 font-bebas text-3xl text-[var(--black)]">{metricLabel(step.count)}</p>
              </article>
            ))}
          </div>
        </section>

        <div className="grid gap-4 xl:grid-cols-2">
          <StatCard
            label="Relances panier"
            value={`${summary.totals.abandoned30mSent}/${summary.totals.abandoned6hSent}/${summary.totals.abandoned24hSent}`}
            detail="Emails envoyés à 30 min, 6h et 24h."
          />
          <StatCard
            label="Dernière mise à jour"
            value={new Date(summary.generatedAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
            detail={new Date(summary.generatedAt).toLocaleDateString('fr-FR')}
          />
        </div>

        <SourceTable title="Sources" rows={summary.sources} />
        <SourceTable title="Campagnes UTM" rows={summary.campaigns} />

        <section className="rounded-[2rem] border border-[var(--cream-3)] bg-white p-5">
          <h2 className="font-condensed text-lg font-bold uppercase tracking-[0.08em] text-[var(--black)]">Events recents</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="text-xs uppercase tracking-[0.14em] text-[var(--grey)]">
                <tr>
                  <th className="py-3 pr-4">Heure</th>
                  <th className="py-3 pr-4">Event</th>
                  <th className="py-3 pr-4">Source</th>
                  <th className="py-3 pr-4">Page / produit</th>
                  <th className="py-3">Valeur</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--cream-3)]">
                {summary.recentEvents.length > 0 ? summary.recentEvents.map((event) => (
                  <tr key={event.id}>
                    <td className="py-3 pr-4 text-[var(--grey)]">{new Date(event.created_at).toLocaleString('fr-FR')}</td>
                    <td className="py-3 pr-4 font-medium text-[var(--black)]">{event.event_name}</td>
                    <td className="py-3 pr-4">{event.source_channel || 'direct'}</td>
                    <td className="py-3 pr-4">{event.product_name || event.page_path || '-'}</td>
                    <td className="py-3">{event.value ? formatEuro(event.value) : '-'}</td>
                  </tr>
                )) : (
                  <tr>
                    <td className="py-4 text-[var(--grey)]" colSpan={5}>Les nouveaux events apparaîtront après les prochaines visites avec consentement aux cookies.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </OpsPageShell>
  )
}
