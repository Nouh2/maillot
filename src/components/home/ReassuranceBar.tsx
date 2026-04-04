import { MessageCircle, RotateCcw, ShieldCheck, Shirt, Ticket, Truck } from 'lucide-react'
import { SHIPPING_DELAY_LABEL } from '@/lib/siteConfig'

const ITEMS = [
  {
    icon: ShieldCheck,
    label: 'Paiement sécurisé',
    sub: 'Checkout Stripe · Confirmation email immédiate',
  },
  {
    icon: Truck,
    label: SHIPPING_DELAY_LABEL,
    sub: 'Suivi partagé dès que disponible',
  },
  {
    icon: RotateCcw,
    label: 'Retour sous 14 jours',
    sub: 'Hors articles personnalisés sauf défaut',
  },
  {
    icon: MessageCircle,
    label: 'Support réactif',
    sub: 'Réponse rapide · Suivi commande centralisé',
  },
  {
    icon: Shirt,
    label: 'Flocage & patchs',
    sub: 'Nom, numéro et patchs selon le modèle',
  },
  {
    icon: Ticket,
    label: 'Lien de suivi unique',
    sub: 'Accessible aussi depuis votre espace compte',
  },
] as const

export function ReassuranceBar() {
  return (
    <div className="overflow-x-auto border-y border-[var(--black-2)] bg-[var(--black)]">
      <div
        className="flex divide-x divide-[var(--white)]/10 lg:grid lg:grid-cols-6"
        style={{ minWidth: 'max-content', width: '100%' }}
      >
        {ITEMS.map((item) => {
          const Icon = item.icon
          return (
            <div
              key={item.label}
              className="group flex flex-shrink-0 flex-col items-center gap-3 px-5 py-5 lg:flex-shrink lg:px-6"
              style={{ minWidth: 148 }}
            >
              <Icon
                strokeWidth={1}
                className="h-6 w-6 text-[var(--terra)] transition-transform duration-300 group-hover:scale-110"
              />
              <div className="text-center">
                <p className="mb-1 font-condensed text-[10px] font-bold uppercase tracking-[0.12em] text-white sm:text-xs">
                  {item.label}
                </p>
                <p className="text-[9px] tracking-wide text-[var(--grey)] sm:text-[10px]">{item.sub}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
