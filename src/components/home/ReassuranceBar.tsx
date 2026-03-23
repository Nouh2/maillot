// src/components/home/ReassuranceBar.tsx
const ITEMS = [
  { icon: '🔒', label: 'Paiement sécurisé', sub: 'Stripe certifié PCI' },
  { icon: '📦', label: 'Expédition 24/48h', sub: 'Suivi inclus' },
  { icon: '💬', label: 'SAV réactif', sub: 'Réponse sous 24h' },
  { icon: '🚚', label: 'Livraison offerte', sub: "Dès 60€ d'achats" },
] as const

export function ReassuranceBar() {
  return (
    <div className="bg-white border-y border-[var(--cream-3)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-2 md:grid-cols-4 divide-x divide-[var(--cream-3)]">
        {ITEMS.map((item) => (
          <div key={item.label} className="flex items-center gap-3 py-4 px-4 md:px-6">
            <span className="text-2xl">{item.icon}</span>
            <div>
              <p className="font-condensed text-sm tracking-wide font-semibold uppercase text-[var(--black)]">{item.label}</p>
              <p className="text-xs text-[var(--grey)]">{item.sub}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
