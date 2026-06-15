import Link from 'next/link'
import { LegalPageLayout, LegalSection } from '@/components/legal/LegalPageLayout'

const CGV_SECTIONS = [
  {
    title: '1. Objet',
    paragraphs: [
      'Les présentes Conditions Générales de Vente régissent les ventes de produits effectuées sur le site Maillot Addict.',
      'Toute commande passée sur le site implique l’acceptation pleine et entière des présentes conditions par le client.',
    ],
  },
  {
    title: '2. Produits',
    paragraphs: [
      'Le site Maillot Addict propose à la vente des maillots de football, incluant des maillots actuels, rétro et concept.',
      'Les photos et descriptions des produits sont présentées à titre indicatif. De légères différences peuvent exister entre les visuels affichés et les produits livrés.',
    ],
  },
  {
    title: '3. Prix',
    paragraphs: [
      'Les prix des produits sont indiqués en euros (€) et sont affichés directement sur les pages produits du site.',
      'Maillot Addict se réserve le droit de modifier ses prix à tout moment. Le prix appliqué sera celui affiché au moment de la validation de la commande.',
      'La livraison est incluse dans le prix affiche. Le total avant paiement tient compte des remises automatiques applicables.',
      'Les offres pack sont calculées sur les maillots du panier uniquement : 2 maillots donnent -5 EUR, puis à partir de 3 maillots le moins cher par tranche de 3 passe à -50%.',
      'Les remises pack ne sont pas cumulables avec les codes promo. Si un code promo est disponible, le meilleur avantage entre le code et la remise pack est appliqué.',
    ],
  },
  {
    title: '4. Commande',
    paragraphs: [
      'Toute commande effectuée sur le site est considérée comme ferme et définitive après validation du paiement.',
      'Le client est responsable de l’exactitude des informations fournies lors de la commande, notamment l’adresse de livraison, le nom et les coordonnées de contact.',
    ],
  },
  {
    title: '5. Paiement',
    paragraphs: [
      'Le paiement est sécurisé et peut être effectué via les moyens de paiement proposés sur le site au moment de la commande.',
    ],
  },
  {
    title: '6. Livraison',
    paragraphs: [
      'Les commandes sont généralement livrées dans un délai estimé de 7 à 12 jours ouvrés après traitement de la commande.',
      'Ces délais sont indicatifs et peuvent varier selon la période, la destination ou le transporteur chargé de la livraison.',
    ],
  },
  {
    title: '7. Personnalisation (flocage)',
    paragraphs: [
      'Une option de personnalisation peut être proposée sur certains produits via le flocage.',
      'Les articles personnalisés ne peuvent pas être retournés ni remboursés, sauf en cas de défaut du produit ou d’erreur imputable au vendeur.',
    ],
  },
  {
    title: '8. Responsabilité',
    paragraphs: [
      'Maillot Addict ne pourra être tenu responsable des retards de livraison causés par le transporteur ou par des circonstances indépendantes de sa volonté.',
    ],
  },
] as const

export const metadata = { title: 'Conditions Générales de Vente' }

export default function CGVPage() {
  return (
    <LegalPageLayout
      currentPath="/legal/cgv"
      title="Conditions Générales de Vente"
      intro="Ces conditions encadrent les ventes réalisées sur Maillot Addict. Elles s’appliquent à l’ensemble des commandes passées sur le site."
    >
      {CGV_SECTIONS.map((section) => (
        <LegalSection key={section.title} title={section.title}>
          {section.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </LegalSection>
      ))}

      <LegalSection title="9. Service client">
        <p>
          Pour toute question, demande d’information ou réclamation, le client peut contacter le service client via la{' '}
          <Link href="/contact" className="font-semibold text-[var(--terra)] underline underline-offset-4">
            page contact
          </Link>{' '}
          du site.
        </p>
      </LegalSection>
    </LegalPageLayout>
  )
}
