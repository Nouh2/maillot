// src/components/home/ReassuranceBar.tsx
import { ShieldCheck, Package, MessageCircle, Truck, RotateCcw, Shirt } from 'lucide-react'

const ITEMS = [
  { icon: ShieldCheck, label: 'Paiement sécurisé', sub: 'Stripe certifié PCI' },
  { icon: Truck, label: 'Livraison 24/48h', sub: 'Suivi inclus' },
  { icon: RotateCcw, label: 'Satisfait ou remboursé', sub: 'Retour sous 14 jours' },
  { icon: Package, label: '4.9/5 Avis clients', sub: '1 000+ commandes' },
  { icon: MessageCircle, label: 'SAV réactif', sub: 'Réponse sous 24h' },
  { icon: Shirt, label: 'Flocage disponible', sub: 'Nom + numéro + patchs' },
] as const

export function ReassuranceBar() {
  return (
    <div className="bg-[var(--black)] border-y border-[var(--black-2)] overflow-x-auto">
      <div
        className="flex lg:grid lg:grid-cols-6 divide-x divide-[var(--white)]/10"
        style={{ minWidth: 'max-content', width: '100%' }}
      >
        {ITEMS.map((item) => {
          const Icon = item.icon
          return (
            <div
              key={item.label}
              className="flex flex-col items-center gap-3 py-5 px-5 lg:px-6 group flex-shrink-0 lg:flex-shrink"
              style={{ minWidth: 140 }}
            >
              <Icon strokeWidth={1} className="w-6 h-6 text-[var(--terra)] group-hover:scale-110 transition-transform duration-300" />
              <div className="text-center">
                <p className="font-condensed text-[10px] sm:text-xs tracking-[0.12em] font-bold uppercase text-white mb-1">{item.label}</p>
                <p className="text-[9px] sm:text-[10px] text-[var(--grey)] tracking-wide">{item.sub}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
