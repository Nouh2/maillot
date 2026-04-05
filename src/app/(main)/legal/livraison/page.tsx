import Link from 'next/link'
import { LegalPageLayout, LegalSection } from '@/components/legal/LegalPageLayout'
import { FREE_SHIPPING_THRESHOLD, STANDARD_SHIPPING_PRICE, formatEuro } from '@/lib/cartPricing'

const STANDARD_SHIPPING_LABEL = formatEuro(STANDARD_SHIPPING_PRICE)
const FREE_SHIPPING_LABEL = formatEuro(FREE_SHIPPING_THRESHOLD)

export const metadata = { title: 'Livraison' }

export default function LivraisonPage() {
  return (
    <LegalPageLayout
      currentPath="/legal/livraison"
      title="Livraison"
      intro="Cette page resume les conditions de livraison actuellement appliquees sur Maillot Addict: delais indicatifs, frais de port et suivi des commandes."
    >
      <LegalSection title="Delais indicatifs">
        <p>Les commandes sont generalement livrees dans un delai estime de 7 a 12 jours ouvres apres traitement.</p>
        <p>Ces delais restent indicatifs et peuvent varier selon la periode, la destination ou le transporteur.</p>
      </LegalSection>

      <LegalSection title="Frais de livraison">
        <p>Les frais de livraison sont calcules sur le montant du panier apres application des offres automatiques:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>Livraison standard: {STANDARD_SHIPPING_LABEL}</li>
          <li>Livraison offerte des {FREE_SHIPPING_LABEL} d&apos;achats</li>
          <li>Offre panier: pour 2 maillots achetes, le 3e le moins cher est offert automatiquement</li>
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
          Le client doit verifier l&apos;exactitude des informations de livraison avant validation de la commande. Toute erreur d&apos;adresse peut
          entrainer un retard ou empecher la bonne reception du colis.
        </p>
      </LegalSection>

      <LegalSection title="Incident de livraison">
        <p>
          En cas de retard important, de colis non recu ou de produit arrive endommage, le client est invite a contacter rapidement le
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
