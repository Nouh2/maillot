'use client'

import { useCartStore } from '@/store/cart'
import { LOYALTY_CODE } from '@/lib/siteConfig'

interface CheckoutContactFieldsProps {
  compact?: boolean
}

export function CheckoutContactFields({ compact = false }: CheckoutContactFieldsProps) {
  const customerEmail = useCartStore((state) => state.customerEmail)
  const marketingOptIn = useCartStore((state) => state.marketingOptIn)
  const promoCode = useCartStore((state) => state.promoCode)
  const setCustomerEmail = useCartStore((state) => state.setCustomerEmail)
  const setMarketingOptIn = useCartStore((state) => state.setMarketingOptIn)
  const setPromoCode = useCartStore((state) => state.setPromoCode)
  const isLoyaltyPreview = promoCode === LOYALTY_CODE

  return (
    <div className={`rounded-2xl border border-[var(--cream-3)] bg-white ${compact ? 'p-4' : 'p-5'}`}>
      <p className="font-condensed text-xs uppercase tracking-[0.18em] text-[var(--grey)]">Avant le paiement</p>
      <label className={`${compact ? 'mt-2.5' : 'mt-3'} block text-xs font-semibold uppercase tracking-[0.18em] text-[var(--black)]`}>
        Email de suivi
      </label>
      <input
        type="email"
        value={customerEmail}
        onChange={(event) => setCustomerEmail(event.target.value)}
        placeholder="vous@exemple.com"
        className={`mt-2 w-full rounded-xl border border-[var(--cream-3)] px-4 ${compact ? 'py-2.5' : 'py-3'} text-sm text-[var(--black)] outline-none transition-colors focus:border-[var(--terra)]`}
      />
      <p className="mt-2 text-xs leading-relaxed text-[var(--grey)]">
        Cet email sert a confirmer la commande, envoyer le lien de suivi et rattacher la commande a ton compte.
      </p>

      <label className={`${compact ? 'mt-3' : 'mt-4'} block text-xs font-semibold uppercase tracking-[0.18em] text-[var(--black)]`}>
        Code promo
      </label>
      <input
        type="text"
        value={promoCode}
        onChange={(event) => setPromoCode(event.target.value)}
        placeholder={LOYALTY_CODE}
        className={`mt-2 w-full rounded-xl border border-[var(--cream-3)] px-4 ${compact ? 'py-2.5' : 'py-3'} text-sm uppercase text-[var(--black)] outline-none transition-colors focus:border-[var(--terra)]`}
      />
      <p className={`mt-2 text-xs leading-relaxed ${isLoyaltyPreview ? 'text-[var(--terra)]' : 'text-[var(--grey)]'}`}>
        {isLoyaltyPreview
          ? 'Code premiere commande detecte. La reduction s applique une seule fois par email valide.'
          : `Code premiere commande: ${LOYALTY_CODE}. Il fonctionne une seule fois par email.`}
      </p>

      <label className={`${compact ? 'mt-3' : 'mt-4'} flex items-start gap-3 text-xs leading-relaxed text-[var(--grey)]`}>
        <input
          type="checkbox"
          checked={marketingOptIn}
          onChange={(event) => setMarketingOptIn(event.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-[var(--cream-3)] text-[var(--terra)] focus:ring-[var(--terra)]"
        />
        <span>J&apos;accepte de recevoir les emails de lancement, de relance panier et les offres Maillot Addict.</span>
      </label>
    </div>
  )
}
