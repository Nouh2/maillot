import Link from 'next/link'
import { LegalPageLayout, LegalSection } from '@/components/legal/LegalPageLayout'
import { calculateShippingAmount, formatEuro } from '@/lib/cartPricing'

const SHIPPING_PRICE_ONE = formatEuro(calculateShippingAmount(1))
const SHIPPING_PRICE_TWO = formatEuro(calculateShippingAmount(2))
const SHIPPING_PRICE_THREE = formatEuro(calculateShippingAmount(3))

export const metadata = { title: 'Livraison' }

export default function LivraisonPage() {
  return (
    <LegalPageLayout
      currentPath="/legal/livraison"
      title="Livraison"
      intro="Cette page résume les conditions de livraison actuellement appliquées sur Maillot Addict: délais indicatifs, frais de port et suivi des commandes."
    >
      <LegalSection title="Délais indicatifs">
        <p>Les commandes sont généralement livrées dans un délai estimé de 7 à 12 jours ouvrés après traitement.</p>
        <p>Ces délais restent indicatifs et peuvent varier selon la période, la destination ou le transporteur.</p>
      </LegalSection>

      <LegalSection title="Frais de livraison">
        <p>Les frais de livraison sont calculés selon le nombre total de maillots commandés:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>1 maillot: {SHIPPING_PRICE_ONE}</li>
          <li>2 maillots: {SHIPPING_PRICE_TWO}</li>
          <li>3 maillots ou plus: {SHIPPING_PRICE_THREE}</li>
        </ul>
      </LegalSection>

      <LegalSection title="Suivi de commande">
        <p>
          Une fois la commande prise en charge, le client peut suivre son avancement via la{' '}
          <Link href="/suivi" className="font-semibold text-[var(--terra)] underline underline-offset-4">
            page de suivi
          </Link>{' '}
          du site.
        </p>
      </LegalSection>

      <LegalSection title="Adresse de livraison">
        <p>
          Le client doit vérifier l’exactitude des informations de livraison avant validation de la commande. Toute erreur d’adresse peut
          entraîner un retard ou empêcher la bonne réception du colis.
        </p>
      </LegalSection>

      <LegalSection title="Incident de livraison">
        <p>
          En cas de retard important, de colis non reçu ou de produit arrivé endommagé, le client est invité à contacter rapidement le
          service client via la{' '}
          <Link href="/contact" className="font-semibold text-[var(--terra)] underline underline-offset-4">
            page contact
          </Link>
          .
        </p>
      </LegalSection>
    </LegalPageLayout>
  )
}
