import Link from 'next/link'
import { LegalPageLayout, LegalSection } from '@/components/legal/LegalPageLayout'
import { CONTACT_PAGE_PATH, LEGAL_INFRASTRUCTURE_ITEMS } from '@/lib/legal'

export const metadata = { title: 'Politique de confidentialité' }

export default function ConfidentialitePage() {
  return (
    <LegalPageLayout
      currentPath="/legal/confidentialite"
      title="Politique de confidentialité"
      intro="Cette page décrit les principales données traitées dans le cadre de l’utilisation du site Maillot Addict et des commandes passées sur la boutique."
    >
      <LegalSection title="1. Données collectées">
        <p>
          Maillot Addict peut collecter les informations nécessaires à la création de compte, au traitement des commandes, à la livraison, au suivi des demandes client et au bon fonctionnement du site.
        </p>
        <p>
          Cela inclut notamment les informations d’identité et de contact, l’adresse de livraison, le contenu de la commande, ainsi que des données techniques liées à la navigation et au panier.
        </p>
      </LegalSection>

      <LegalSection title="2. Utilisation des données">
        <p>Les données collectées sont utilisées pour :</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>traiter, confirmer et suivre les commandes,</li>
          <li>gérer les demandes du service client,</li>
          <li>permettre l’accès au compte client,</li>
          <li>sécuriser le site et prévenir les usages frauduleux.</li>
        </ul>
      </LegalSection>

      <LegalSection title="3. Paiement">
        <p>
          Les paiements sont traités par un prestataire sécurisé. Les données bancaires du client ne sont pas stockées directement par Maillot Addict.
        </p>
      </LegalSection>

      <LegalSection title="4. Destinataires des données">
        <p>
          Les données peuvent être transmises, dans la stricte limite du nécessaire, aux prestataires techniques impliqués dans le fonctionnement du site, au prestataire de paiement et aux partenaires chargés de la livraison et du suivi des commandes.
        </p>
        <ul className="list-disc space-y-2 pl-5">
          {LEGAL_INFRASTRUCTURE_ITEMS.map(([label, value]) => (
            <li key={label}>
              {label}: {value}
            </li>
          ))}
        </ul>
      </LegalSection>

      <LegalSection title="5. Conservation">
        <p>
          Les données sont conservées pendant la durée nécessaire au traitement de la commande, à la relation client et au respect des obligations légales et comptables applicables.
        </p>
      </LegalSection>

      <LegalSection title="6. Droits des utilisateurs">
        <p>
          Le client peut demander l’accès, la rectification ou la suppression de ses données en contactant Maillot Addict via la{' '}
          <Link href={CONTACT_PAGE_PATH} className="font-semibold text-[var(--terra)] underline underline-offset-4">
            page contact
          </Link>
          .
        </p>
      </LegalSection>

      <LegalSection title="7. Cookies">
        <p>
          Le site utilise les cookies strictement nécessaires au fonctionnement de la navigation, du panier et de l’espace client.
        </p>
        <p>
          Les cookies de mesure d’audience et d’attribution marketing ne sont activés qu’après acceptation via la bannière de consentement.
        </p>
      </LegalSection>
    </LegalPageLayout>
  )
}
