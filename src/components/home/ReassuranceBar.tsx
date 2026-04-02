import { MessageCircle, Package, RotateCcw, ShieldCheck, Shirt, Truck } from 'lucide-react'
import { SHIPPING_DELAY_LABEL } from '@/lib/siteConfig'

const ITEMS = [
  { icon: ShieldCheck, label: 'Paiement securise', sub: 'Stripe certifie PCI' },
  { icon: Truck, label: SHIPPING_DELAY_LABEL, sub: 'Livraison 6 EUR / 5 EUR / offerte des 3 maillots' },
  { icon: RotateCcw, label: 'Satisfait ou rembourse', sub: 'Retour sous 14 jours' },
  { icon: Package, label: '4.5/5 Avis clients', sub: '1 200+ commandes' },
  { icon: MessageCircle, label: 'SAV reactif', sub: 'Reponse sous 24h' },
  { icon: Shirt, label: 'Flocage disponible', sub: 'Nom + numero + patchs' },
] as const

export function ReassuranceBar() {
  return (
    <div className="overflow-x-auto border-y border-[var(--black-2)] bg-[var(--black)]">
      <div className="flex divide-x divide-[var(--white)]/10 lg:grid lg:grid-cols-6" style={{ minWidth: 'max-content', width: '100%' }}>
        {ITEMS.map((item) => {
          const Icon = item.icon
          return (
            <div key={item.label} className="group flex flex-shrink-0 flex-col items-center gap-3 px-5 py-5 lg:flex-shrink lg:px-6" style={{ minWidth: 140 }}>
              <Icon strokeWidth={1} className="h-6 w-6 text-[var(--terra)] transition-transform duration-300 group-hover:scale-110" />
              <div className="text-center">
                <p className="mb-1 font-condensed text-[10px] font-bold uppercase tracking-[0.12em] text-white sm:text-xs">{item.label}</p>
                <p className="text-[9px] tracking-wide text-[var(--grey)] sm:text-[10px]">{item.sub}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
