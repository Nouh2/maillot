import Link from 'next/link'
import { LegalPageLayout, LegalSection } from '@/components/legal/LegalPageLayout'

export const metadata = { title: 'Livraison' }

export default function LivraisonPage() {
  return (
    <LegalPageLayout
      currentPath="/legal/livraison"
      title="Livraison"
      intro="Cette page resume les conditions de livraison appliquees sur Maillot Addict: livraison incluse, delais indicatifs et suivi des commandes."
    >
      <LegalSection title="Delais indicatifs">
        <p>Les commandes sont generalement livrees dans un delai estime de 7 a 12 jours ouvres apres traitement.</p>
        <p>Ces delais restent indicatifs et peuvent varier selon la periode, la destination ou le transporteur.</p>
      </LegalSection>

      <LegalSection title="Livraison incluse">
        <p>La livraison est incluse dans le prix affiche des maillots. Le panier et le paiement Stripe affichent uniquement les articles et le total final.</p>
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
          Le client doit verifier les informations de livraison avant validation de la commande. Toute erreur dans l adresse peut
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
