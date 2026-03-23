// src/components/home/ReassuranceBar.tsx
import { ShieldCheck, Package, MessageCircle, Truck } from 'lucide-react'

const ITEMS = [
  { icon: ShieldCheck, label: 'Paiement sécurisé', sub: 'Stripe certifié PCI' },
  { icon: Package, label: 'Expédition 24/48h', sub: 'Suivi inclus' },
  { icon: MessageCircle, label: 'SAV réactif', sub: 'Réponse sous 24h' },
  { icon: Truck, label: 'Livraison offerte', sub: "Dès 60€ d'achats" },
] as const

export function ReassuranceBar() {
  return (
    <div className="bg-[var(--black)] border-y border-[var(--black-2)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-[var(--white)]/10">
        {ITEMS.map((item) => {
          const Icon = item.icon
          return (
            <div key={item.label} className="flex flex-col lg:flex-row items-center lg:items-start gap-4 py-5 px-4 lg:px-8 group">
              <Icon strokeWidth={1} className="w-8 h-8 text-[var(--terra)] group-hover:scale-110 transition-transform duration-300" />
              <div className="text-center lg:text-left">
                <p className="font-condensed text-xs sm:text-sm tracking-[0.15em] font-bold uppercase text-white mb-1.5">{item.label}</p>
                <p className="text-[10px] sm:text-xs text-[var(--grey)] tracking-wide">{item.sub}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
